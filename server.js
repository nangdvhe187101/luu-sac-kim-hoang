'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        let v = trimmed.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (process.env[k] === undefined) {
          process.env[k] = v;
        }
      }
    }
  } catch (err) {}
})();

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wishes.json');

const MAX_BODY_BYTES = 8 * 1024;
const LIMITS = { name: 60, email: 120, wish: 500 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PUBLIC_LIST_SIZE = 50;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

const BLOCKED_PREFIXES = ['/server.js', '/data', '/plans', '/docs', '/node_modules'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function readWishes() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

let writeChain = Promise.resolve();
function appendWish(entry) {
  writeChain = writeChain.then(async () => {
    const all = readWishes();
    all.unshift(entry);
    const tmp = DATA_FILE + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(all, null, 2), 'utf8');
    await fs.promises.rename(tmp, DATA_FILE);
  });
  return writeChain;
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

const TRUST_PROXY = process.env.TRUST_PROXY === '1';
function clientIp(req) {
  if (TRUST_PROXY) {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function clean(value, max) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

const SHEET_URL = process.env.SHEET_URL || '';
const SHEET_TOKEN = process.env.SHEET_TOKEN || '';
const SHEET_TIMEOUT_MS = 15000;

async function pushToSheet(entry) {
  if (!SHEET_URL) return;
  try {
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: SHEET_TOKEN, name: entry.name, email: entry.email, wish: entry.wish }),
      redirect: 'follow',
      signal: AbortSignal.timeout(SHEET_TIMEOUT_MS),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || (result && result.ok === false)) {
      console.error('Google Sheet error:', res.status, result && result.error ? result.error : '');
    } else {
      console.log(`Đã đồng bộ lời chúc của "${entry.name}" lên Google Sheet.`);
    }
  } catch (e) {
    console.error('Google Sheet push error:', e.message);
  }
}

async function handleCreateWish(req, res) {
  if (!(req.headers['content-type'] || '').includes('application/json')) {
    return sendJson(res, 415, { error: 'Dữ liệu gửi lên phải là JSON.' });
  }
  if (isRateLimited(clientIp(req))) {
    return sendJson(res, 429, { error: 'Bạn gửi hơi nhiều lần, vui lòng thử lại sau ít phút.' });
  }

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, e.status || 400, { error: 'Dữ liệu không hợp lệ.' });
  }

  const name = clean(data.name, LIMITS.name);
  const email = clean(data.email, LIMITS.email).toLowerCase();
  const wish = clean(data.wish, LIMITS.wish);

  if (!name) return sendJson(res, 400, { error: 'Vui lòng nhập họ tên.' });
  if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Email chưa đúng định dạng.' });
  if (!wish) return sendJson(res, 400, { error: 'Vui lòng nhập lời nhắn.' });

  const entry = { id: Date.now().toString(36), name, email, wish, time: Date.now() };
  try {
    await appendWish(entry);
  } catch (e) {
    return sendJson(res, 500, { error: 'Máy chủ chưa lưu được lời chúc, vui lòng thử lại.' });
  }

  pushToSheet(entry);
  return sendJson(res, 201, { name: entry.name, wish: entry.wish, time: entry.time });
}

function handleListWishes(res) {
  const list = readWishes()
    .slice(0, PUBLIC_LIST_SIZE)
    .map(({ name, wish, time }) => ({ name, wish, time }));
  sendJson(res, 200, list);
}

function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (e) {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (decoded === '/') decoded = '/index.html';

  const filePath = path.normalize(path.join(ROOT, decoded));
  const rel = '/' + path.relative(ROOT, filePath).split(path.sep).join('/');
  const hidden = rel.split('/').some((seg) => seg.startsWith('.'));

  if (!filePath.startsWith(ROOT + path.sep) || hidden ||
      BLOCKED_PREFIXES.some((p) => rel === p || rel.startsWith(p + '/'))) {
    res.writeHead(404);
    return res.end('Not found');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/wishes') {
    if (req.method === 'POST') return handleCreateWish(req, res);
    if (req.method === 'GET') return handleListWishes(res);
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Phương thức không được hỗ trợ.' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end('Method not allowed');
  }
  serveStatic(req, res, pathname);
});

let currentPort = PORT;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    currentPort += 1;
    server.listen(currentPort, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});

server.listen(currentPort, '0.0.0.0', () => {
  console.log(`Server: http://localhost:${currentPort}`);
});

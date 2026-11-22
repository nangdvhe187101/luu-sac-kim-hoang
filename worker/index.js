// Kim Hoàng Gallery API — Cloudflare Worker + R2 (bản có kiểm soát lạm dụng)
//
// Giữ nguyên "giao kèo" với trang web:
//   GET  /api/paintings  -> { items: [{ id, url, sigName, uploadedAt }] }
//   POST /api/paintings  (multipart: file, sigName) -> { ok: true, item }
//
// Binding bắt buộc:  GALLERY_BUCKET (R2)
// Biến tuỳ chọn:     PUBLIC_R2_URL, ALLOWED_ORIGINS (cách nhau bằng dấu phẩy),
//                    UPLOADS_DISABLED=1 (khoá tạm thời việc gửi ảnh), UPLOAD_LIMITER (Rate Limiting binding)

const DEFAULT_PUBLIC_R2 = 'https://pub-9b97462424734d4ea99aef65be6faff0.r2.dev';
const DEFAULT_ORIGINS = ['https://www.luusackimhoang.com', 'https://luusackimhoang.com'];

const MAX_FILE_BYTES = 1024 * 1024;               // 1MB / ảnh (ảnh tranh thực tế chỉ vài chục KB)
const MIN_FILE_BYTES = 200;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;
const MAX_SIG_LEN = 40;
const MAX_ITEMS = 150;                            // số ảnh tối đa trả về cho mosaic
const RATE_MAX = 6;                               // tối đa 6 lần gửi...
const RATE_WINDOW_MS = 10 * 60 * 1000;            // ...mỗi 10 phút cho mỗi địa chỉ IP
const LIST_TTL_MS = 10 * 1000;                    // nhớ danh sách 10 giây để đỡ tốn lượt đọc R2

// Chỉ coi là ảnh tranh hợp lệ nếu khoá đúng dạng do chính Worker tạo ra
const KEY_RE = /^paintings\/\d{10,}_[a-z0-9]{1,8}\.(webp|png|jpg)$/;

let listCache = { at: 0, body: null };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = allowedOrigins(env);
    const cors = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const publicBase = (env.PUBLIC_R2_URL || DEFAULT_PUBLIC_R2).replace(/\/$/, '');

    // ---------- GET: danh sách tranh ----------
    if (request.method === 'GET' && url.pathname === '/api/paintings') {
      const now = Date.now();
      if (!listCache.body || now - listCache.at > LIST_TTL_MS) {
        listCache = { at: now, body: JSON.stringify({ items: await listPaintings(env, publicBase) }) };
      }
      return new Response(listCache.body, {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
      });
    }

    // ---------- POST: nhận ảnh ----------
    if (request.method === 'POST' && url.pathname === '/api/paintings') {
      if (env.UPLOADS_DISABLED === '1') {
        return json({ error: 'Tạm thời đóng chức năng gửi tranh' }, 503, cors);
      }

      // 1) Chỉ nhận từ chính trang web của mình
      if (!origin || !allowed.includes(origin)) {
        return json({ error: 'Nguồn gửi không được phép' }, 403, cors);
      }

      // 2) Phải là multipart và có khai báo dung lượng hợp lý (chặn trước khi đọc dữ liệu)
      const ctype = request.headers.get('Content-Type') || '';
      if (!ctype.toLowerCase().startsWith('multipart/form-data')) {
        return json({ error: 'Định dạng yêu cầu không hợp lệ' }, 415, cors);
      }
      const len = parseInt(request.headers.get('Content-Length') || '', 10);
      if (!Number.isFinite(len)) return json({ error: 'Thiếu Content-Length' }, 411, cors);
      if (len > MAX_REQUEST_BYTES) return json({ error: 'Ảnh quá lớn' }, 413, cors);

      // 3) Giới hạn tần suất theo IP
      if (await rateLimited(env, request)) {
        return json({ error: 'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút' }, 429, { ...cors, 'Retry-After': '600' });
      }

      // 4) Đọc và kiểm tra file
      let form;
      try { form = await request.formData(); } catch (_) {
        return json({ error: 'Không đọc được dữ liệu gửi lên' }, 400, cors);
      }
      const file = form.get('file');
      if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
        return json({ error: 'Thiếu file ảnh' }, 400, cors);
      }
      if (file.size > MAX_FILE_BYTES) return json({ error: 'Ảnh vượt quá 1MB' }, 413, cors);
      if (file.size < MIN_FILE_BYTES) return json({ error: 'Ảnh không hợp lệ' }, 400, cors);

      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = sniffImage(bytes);   // dựa vào nội dung thật, không tin tên/loại file người dùng khai
      if (!kind) return json({ error: 'Chỉ chấp nhận ảnh WebP, PNG hoặc JPEG' }, 415, cors);

      // 5) Tên ký: làm sạch, loại link
      const sigName = cleanName(form.get('sigName'));

      // 6) Khoá và địa chỉ do Worker tự tạo, không lấy gì từ dữ liệu người dùng
      const key = `paintings/${Date.now()}_${randomId(6)}.${kind.ext}`;
      await env.GALLERY_BUCKET.put(key, bytes, {
        httpMetadata: { contentType: kind.type, cacheControl: 'public, max-age=31536000, immutable' },
        customMetadata: { sigName }
      });
      listCache = { at: 0, body: null };

      const item = { id: key, url: `${publicBase}/${key}`, sigName, uploadedAt: new Date().toISOString() };
      return json({ ok: true, item }, 200, cors);
    }

    return new Response('Kim Hoang Gallery API OK', { status: 200, headers: cors });
  }
};

// ======================= Hàm hỗ trợ =======================

function allowedOrigins(env) {
  const extra = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

function corsHeaders(origin, allowed) {
  const h = { Vary: 'Origin' };
  if (origin && allowed.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }
  });
}

function randomId(n) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => chars[b % 36]).join('');
}

// Nhận diện ảnh bằng "chữ ký" ở đầu file. Chặn HTML/SVG/script/file thực thi giả làm ảnh.
function sniffImage(b) {
  if (b.length < 16) return null;
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  // WebP: "RIFF" + kích thước + "WEBP"
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') {
    const riffSize = (b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24)) >>> 0;
    if (riffSize + 8 !== b.length) return null;     // phần đuôi lạ → từ chối
    return { type: 'image/webp', ext: 'webp' };
  }
  // PNG
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((v, i) => b[i] === v)) return { type: 'image/png', ext: 'png' };
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  return null;
}

// Làm sạch tên ký: bỏ ký tự điều khiển, thẻ HTML, mọi thứ giống đường link / tên miền
function cleanName(raw) {
  let s = String(raw || '');
  try { s = s.normalize('NFC'); } catch (_) {}
  s = s
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, '')
    .replace(/(https?:\/\/|ftp:\/\/|www\.)\S*/gi, '')
    .replace(/\b[\w-]+(\.[\w-]+)*\.(com|net|org|vn|io|xyz|top|info|biz|me|co|link|site|online|shop|app|dev|ru|cn|tk|ml|ga|cf|gq)\b\S*/gi, '')
    .replace(/<[^>]*>/g, '')                 // bỏ cả thẻ HTML nguyên khối
    .replace(/[<>"'`\\{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.slice(0, MAX_SIG_LEN).trim();
}

async function listPaintings(env, publicBase) {
  const all = [];
  let cursor;
  for (let page = 0; page < 5; page++) {
    const r = await env.GALLERY_BUCKET.list({ prefix: 'paintings/', limit: 500, cursor, include: ['customMetadata'] });
    all.push(...r.objects);
    if (!r.truncated) break;
    cursor = r.cursor;
  }
  return all
    .filter((o) => KEY_RE.test(o.key))
    .sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime())
    .slice(0, MAX_ITEMS)
    .map((o) => ({
      id: o.key,
      url: `${publicBase}/${o.key}`,
      sigName: cleanName(o.customMetadata && o.customMetadata.sigName),   // làm sạch cả dữ liệu cũ
      uploadedAt: o.uploaded
    }));
}

async function sha16(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d)).slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Giới hạn tần suất. Ưu tiên Rate Limiting binding nếu bạn có gắn (UPLOAD_LIMITER);
// nếu không, dùng chính R2 để đếm nên chạy được cả trên địa chỉ workers.dev, không cần dịch vụ thêm.
async function rateLimited(env, request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.UPLOAD_LIMITER && typeof env.UPLOAD_LIMITER.limit === 'function') {
    const { success } = await env.UPLOAD_LIMITER.limit({ key: ip });
    return !success;
  }
  const prefix = `ratelimit/${await sha16(ip)}/`;     // chỉ lưu bản băm, không lưu IP thật
  const now = Date.now();
  const list = await env.GALLERY_BUCKET.list({ prefix, limit: 100 });
  const recent = [];
  const stale = [];
  for (const o of list.objects) {
    const ts = parseInt(o.key.slice(prefix.length), 10);
    (now - ts < RATE_WINDOW_MS ? recent : stale).push(o.key);
  }
  if (stale.length) await env.GALLERY_BUCKET.delete(stale);
  if (recent.length >= RATE_MAX) return true;
  await env.GALLERY_BUCKET.put(prefix + now, '');
  return false;
}

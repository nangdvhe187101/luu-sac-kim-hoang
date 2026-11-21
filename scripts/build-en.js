#!/usr/bin/env node
/**
 * scripts/build-en.js
 * Sinh bản tiếng Anh tĩnh (/en/...) từ các trang tiếng Việt + js/i18n-en.json.
 *
 *   node scripts/build-en.js            # ghi các file vào /en
 *   node scripts/build-en.js --report   # chỉ liệt kê chuỗi tiếng Việt chưa có bản dịch
 *
 * Quy tắc dịch giống hệt phần dịch trong js/main.js (cùng từ điển, cùng mẫu động).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.luusackimhoang.com';
const REPORT = process.argv.includes('--report');
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'js/i18n-en.json'), 'utf8'));

// ---------------------------------------------------------------- pages
// [nguồn VI, đích EN, URL VI, URL EN]
const PAGES = [
  ['index.html', 'en/index.html', '/', '/en/'],
  ['footer.html', 'en/footer.html', null, null],
];
(function walk(dir) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = path.join(dir, f);
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel);
    else if (f === 'index.html' && rel !== path.join('vi', 'visit', '3d', 'index.html')) { // trang 3D chỉ là trang chuyển hướng
      const sub = path.dirname(rel).replace(/^vi\/?/, '');
      PAGES.push([rel, path.join('en', sub, 'index.html'), '/' + path.dirname(rel), '/en/' + sub]);
    }
  }
})('vi');

// ---------------------------------------------------------------- dịch
const norm = s => s.replace(/\s+/g, ' ').trim();
function translateString(text) {
  if (!text) return null;
  const n = norm(text);
  if (!n) return null;
  if (Object.prototype.hasOwnProperty.call(dict, n)) return dict[n];
  let m = n.match(/^Hình ảnh tư liệu \((\d+) ảnh\)$/);
  if (m) return `Archival Photos (${m[1]} ${m[1] === '1' ? 'photo' : 'photos'})`;
  m = n.match(/^Giai đoạn (\d+) \/ (\d+)$/);
  if (m) return `Stage ${m[1]} / ${m[2]}`;
  m = n.match(/^Giai đoạn (\d+):\s*(.+)$/);
  if (m) return `Stage ${m[1]}: ${dict[m[2].trim()] || m[2].trim()}`;
  m = n.match(/^(\d+)\.\s*(.+)$/);
  if (m && dict[m[2].trim()]) return `${m[1]}. ${dict[m[2].trim()]}`;
  m = n.match(/^Tranh dân gian Kim Hoàng #(\d+)$/);
  if (m) return `Kim Hoàng Folk Painting #${m[1]}`;
  m = n.match(/^Xem tranh Kim Hoàng #(\d+)$/);
  if (m) return `View Kim Hoàng painting #${m[1]}`;
  if (n === 'Tìm kiếm...') return 'Search...';
  return null;
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', larr: '\u2190', rarr: '\u2192', nearr: '\u2197',
  ldquo: '\u201c', rdquo: '\u201d', lsquo: '\u2018', rsquo: '\u2019', mdash: '\u2014', ndash: '\u2013',
  hellip: '\u2026', middot: '\u00b7', copy: '\u00a9', times: '\u00d7', bull: '\u2022' };
const decode = s => s.replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m))
  .replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(+c));
const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => escText(s).replace(/"/g, '&quot;');
const HAS_VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const missing = new Map(); // chuỗi -> số trang
let curPage = '';
function noteMissing(s) {
  const n = norm(s);
  if (n && HAS_VI.test(n)) missing.set(n, (missing.get(n) || new Set()).add(curPage));
}

// ---------------------------------------------------------------- link
const ALIASES = {
  '/gioi-thieu': '/vi/introduction', '/nghe-nhan': '/vi/introduction/nghe-nhan',
  '/doi-tac': '/vi/introduction/doi-tac', '/tham-quan': '/vi/visit', '/tranh': '/vi/visit/tranh',
  '/hanh-trinh': '/vi/visit/hanh-trinh', '/san-pham-sang-tao': '/vi/services', '/san-pham': '/vi/services',
  '/qua-tang': '/vi/services/souvenirs', '/su-kien': '/vi/events', '/events': '/vi/events',
  '/tin-tuc': '/vi/posts', '/news': '/vi/posts', '/tim-kiem': '/vi/search',
};
function toEnHref(href) {
  const m = href.match(/^([^?#]*)([?#].*)?$/);
  let p = m[1], rest = m[2] || '';
  if (!p.startsWith('/') || p.startsWith('//')) return href;
  p = ALIASES[p] || p;
  if (p === '/') return '/en/' + rest;
  if (p === '/vi' || p === '/vi/') return '/en/' + rest;
  if (p.startsWith('/vi/')) return '/en/' + p.slice(4) + rest;
  if (p === '/3d' || p.startsWith('/trien-lam-3d/threejs-3d-room')) {
    return p + (rest.startsWith('?') ? rest + '&lang=en' : '?lang=en' + rest);
  }
  if (p === '/footer.html') return '/en/footer.html' + rest;
  return href;
}

// ---------------------------------------------------------------- xử lý 1 trang
const TRANSLATE_ATTRS = ['placeholder', 'alt', 'title', 'aria-label', 'data-alt', 'data-title', 'data-desc', 'data-author', 'data-caption', 'data-label'];
const META_CONTENT = /^(description|author|og:site_name|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)$/;

function processTag(tag, ctx) {
  if (/^<\/|^<!/.test(tag)) return tag;
  const name = (tag.match(/^<([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase();
  let out = tag;

  const attrRe = /(\s)([a-zA-Z_:][-a-zA-Z0-9_:.]*)(\s*=\s*)("([^"]*)"|'([^']*)')/g;
  out = out.replace(attrRe, (full, sp, an, eq, q, dq, sq) => {
    const val = dq !== undefined ? dq : sq;
    const lname = an.toLowerCase();
    // link nội bộ
    if (lname === 'href' && name === 'a' || (lname === 'action' && name === 'form')) {
      return `${sp}${an}${eq}"${escAttr(toEnHref(decode(val)))}"`;
    }
    if (name === 'link' && lname === 'href' && /rel="canonical"/.test(tag)) {
      return `${sp}${an}${eq}"${SITE}${ctx.enUrl}"`;
    }
    if (lname === 'lang' && name === 'html') return `${sp}${an}${eq}"en"`;
    if (TRANSLATE_ATTRS.includes(lname)) {
      const t = translateString(decode(val));
      if (t !== null) return `${sp}${an}${eq}"${escAttr(t)}"`;
      noteMissing(decode(val));
      return full;
    }
    if (lname === 'content' && name === 'meta') {
      const key = (tag.match(/(?:name|property)\s*=\s*"([^"]+)"/) || [])[1] || '';
      if (key === 'og:url') return `${sp}${an}${eq}"${SITE}${ctx.enUrl}"`;
      if (key === 'og:locale') return `${sp}${an}${eq}"en_US"`;
      if (META_CONTENT.test(key)) {
        const t = translateString(decode(val));
        if (t !== null) return `${sp}${an}${eq}"${escAttr(t)}"`;
        noteMissing(decode(val));
      }
    }
    return full;
  });
  return out;
}

function hreflangBlock(viUrl, enUrl) {
  return [
    `<link rel="alternate" hreflang="vi" href="${SITE}${viUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${SITE}${enUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}${viUrl}" />`,
  ].map(l => '    ' + l).join('\n');
}

const LD_TEXT_KEYS = new Set(['name', 'description', 'headline', 'caption']);
function processJsonLd(seg, viUrl, enUrl) {
  const m = seg.match(/^(<script[^>]*>)([\s\S]*)(<\/script>)$/);
  if (!m) return seg;
  let data;
  try { data = JSON.parse(m[2]); } catch (e) { return seg; }
  const fixUrl = u => {
    if (typeof u !== 'string' || !u.startsWith(SITE)) return u;
    let p = u.slice(SITE.length) || '/';
    if (p === '/' ) return SITE + '/en/';
    const out = toEnHref(p);
    return SITE + out;
  };
  (function walk(o, key) {
    if (Array.isArray(o)) return o.forEach(x => walk(x, key));
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (typeof v === 'string') {
          if (['url', 'item', '@id'].includes(k)) o[k] = fixUrl(v);
          else if (LD_TEXT_KEYS.has(k)) {
            const t = translateString(v);
            if (t !== null) o[k] = t; else noteMissing(v);
          }
        } else walk(v, k);
      }
    }
  })(data);
  return m[1] + JSON.stringify(data) + m[3];
}

function build(srcRel, dstRel, viUrl, enUrl) {
  curPage = srcRel;
  // bỏ hreflang cũ của bản VI để tránh bị nhân đôi trong bản EN
  const html = fs.readFileSync(path.join(ROOT, srcRel), 'utf8').replace(/\n?[ \t]*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '');
  const ctx = { enUrl };
  const parts = html.split(/(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/);
  const out = parts.map((seg, i) => {
    if (i % 2 === 1) {
      if (/^<(script|style)/i.test(seg)) {
        // JSON-LD: chỉ đổi URL trang
        if (/application\/ld\+json/.test(seg)) return processJsonLd(seg, viUrl, enUrl);
        return seg;
      }
      if (seg.startsWith('<!--')) return seg;
      return processTag(seg, ctx);
    }
    // văn bản
    if (!seg.trim()) return seg;
    const dec = decode(seg);
    const t = translateString(dec);
    if (t !== null) {
      const lead = seg.match(/^\s*/)[0], trail = seg.match(/\s*$/)[0];
      return lead + escText(t) + trail;
    }
    noteMissing(dec);
    return seg;
  }).join('');

  if (REPORT) return;
  let final = out;
  if (viUrl) {
    // hreflang (đặt sau canonical) cho cả bản EN; bản VI được chèn bởi --patch-vi
    final = final.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${hreflangBlock(viUrl, enUrl)}`);
  }
  const dst = path.join(ROOT, dstRel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, final);
}

// ---------------------------------------------------------------- chèn hreflang vào bản VI
function patchVi(srcRel, viUrl, enUrl) {
  const p = path.join(ROOT, srcRel);
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/\n?\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '');
  if (!/<link rel="canonical"/.test(html)) return false;
  html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${hreflangBlock(viUrl, enUrl)}`);
  fs.writeFileSync(p, html);
  return true;
}

for (const [src, dst, vi, en] of PAGES) build(src, dst, vi, en);

if (REPORT) {
  const arr = [...missing.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  fs.writeFileSync(path.join(ROOT, '.en-missing.json'), JSON.stringify(arr.map(([k, v]) => ({ vi: k, pages: [...v] })), null, 1));
  console.log(`Chưa dịch: ${arr.length} chuỗi (ghi ở .en-missing.json)`);
} else {
  let patched = 0;
  for (const [src, , vi, en] of PAGES) if (vi && patchVi(src, vi, en)) patched++;
  console.log(`Đã sinh ${PAGES.length} trang EN, gắn hreflang cho ${patched} trang VI.`);
  const left = [...missing.keys()].length;
  if (left) console.log(`Cảnh báo: còn ${left} chuỗi tiếng Việt chưa dịch (chạy với --report để xem).`);
}

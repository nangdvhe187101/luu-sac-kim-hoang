#!/usr/bin/env node
/**
 * Tự host three.js trong dự án thay vì tải từ unpkg.com (giảm rủi ro chuỗi cung ứng).
 *
 * Cách dùng (chạy 1 lần trên máy có internet và có npm):
 *     node scripts/vendor-three.js
 *
 * Việc script làm:
 *   1) npm pack three@VERSION → giải nén vào thư mục tạm
 *   2) chép three.module.js và các addons đang dùng (cùng mọi file chúng import) vào vendor/three/
 *   3) đổi importmap trong trien-lam-3d/threejs-3d-room.html sang đường dẫn nội bộ
 *   4) thu hẹp CSP trong vercel.json (bỏ unpkg.com)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const VERSION = '0.170.0';
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'vendor', 'three');
// Các addon trang đang import (kiểm tra bằng: grep -r "three/addons" trien-lam-3d)
const ENTRY_ADDONS = ['loaders/GLTFLoader.js', 'environments/RoomEnvironment.js'];

function getPackageDir() {
  if (process.env.THREE_PKG_DIR) return process.env.THREE_PKG_DIR; // dùng cho kiểm thử
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'three-'));
  console.log(`Đang tải three@${VERSION} từ npm...`);
  execSync(`npm pack three@${VERSION} --silent`, { cwd: tmp, stdio: ['ignore', 'pipe', 'inherit'] });
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  if (!tgz) throw new Error('Không tải được gói three từ npm');
  execSync(`tar -xzf "${tgz}"`, { cwd: tmp });
  return path.join(tmp, 'package');
}

function copyFile(pkg, rel) {
  const from = path.join(pkg, rel);
  const to = path.join(OUT, rel);
  if (!fs.existsSync(from)) throw new Error('Thiếu file trong gói three: ' + rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return fs.readFileSync(from, 'utf8');
}

// Chép file và lần theo mọi import tương đối ('./x.js', '../utils/y.js')
function copyWithDeps(pkg, rel, seen) {
  if (seen.has(rel)) return;
  seen.add(rel);
  const src = copyFile(pkg, rel);
  const re = /(?:import|export)[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const dep = path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1] || m[2]));
    copyWithDeps(pkg, dep, seen);
  }
}

function main() {
  const pkg = getPackageDir();
  fs.rmSync(OUT, { recursive: true, force: true });
  const seen = new Set();

  // three.module.js (và three.core.js nếu bản three có tách lõi)
  copyWithDeps(pkg, 'build/three.module.js', seen);
  for (const e of ENTRY_ADDONS) copyWithDeps(pkg, 'examples/jsm/' + e, seen);
  fs.copyFileSync(path.join(pkg, 'LICENSE'), path.join(OUT, 'LICENSE'));
  console.log(`Đã chép ${seen.size} file vào vendor/three/`);

  // importmap
  const htmlPath = path.join(ROOT, 'trien-lam-3d', 'threejs-3d-room.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const from1 = `https://unpkg.com/three@${VERSION}/build/three.module.js`;
  const from2 = `https://unpkg.com/three@${VERSION}/examples/jsm/`;
  if (html.includes(from1) && html.includes(from2)) {
    html = html.replace(from1, '/vendor/three/build/three.module.js').replace(from2, '/vendor/three/examples/jsm/');
    fs.writeFileSync(htmlPath, html);
    console.log('Đã đổi importmap sang /vendor/three/');
  } else {
    console.log('importmap đã được đổi từ trước (bỏ qua).');
  }

  // CSP: bỏ unpkg
  const vp = path.join(ROOT, 'vercel.json');
  let v = fs.readFileSync(vp, 'utf8');
  v = v.replace(/\s+https:\/\/unpkg\.com/g, '');
  fs.writeFileSync(vp, v);
  console.log('Đã bỏ unpkg.com khỏi CSP. Hoàn tất.');
}

main();

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const W = 600;
const H = 800;
export const TOP_Y = 0.34;
export const BW = 0.30;
export const BD = 0.40;
export const BT = 0.035;
export const BX = -0.12;
export const BZ = 0.07;
export const BLOCK_TOP = TOP_Y + BT;
export const SHW = 0.34;
export const SHD = 0.4533;
export const STK = { x: 0.31, z: 0.07, h: 0.016 };
export const TRAY = { x: -0.43, z: 0.07, w: 0.20, d: 0.16 };

const PXM = W / BW;
const CELL = 6;
const COLS = W / CELL;
const ROWS = H / CELL;
const SPW = 816;
const SPH = 1088;
const OFX = 48;
const OFY = 64;
const MAT_Y = 0.006;
const REST_A = Math.atan2(0.15, 0.22);
const INK_T = 0.93;
const Q_T = 0.93;

export const KIND = {
  ink: { item: 'inkRoller', len: 0.13, rad: 0.022, thk: 0.03, rest: { x: -0.36, z: 0.39 } },
  press: { item: 'pressRoller', len: 0.15, rad: 0.026, thk: 0.034, rest: { x: 0.10, z: 0.39 } }
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

function mk(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function ct(canvas, srgb = true, maxAnisotropy = 8) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAnisotropy;
  return t;
}

function barMesh(a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  m.castShadow = true;
  return m;
}

function lashTexture(maxAnisotropy) {
  const c = mk(16, 64);
  const x = c.getContext('2d');
  x.fillStyle = '#d6a21c';
  x.fillRect(0, 0, 16, 64);
  x.strokeStyle = '#8a6410';
  x.lineWidth = 2;
  for (let i = -16; i < 80; i += 8) {
    x.beginPath();
    x.moveTo(0, i);
    x.lineTo(16, i + 12);
    x.stroke();
  }
  const t = ct(c, true, maxAnisotropy);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function rugTexture(maxAnisotropy) {
  const c = mk(512, 400);
  const x = c.getContext('2d');
  x.fillStyle = '#3e1812';
  x.fillRect(0, 0, 512, 400);
  for (let i = 0; i < 512; i += 8) {
    x.fillStyle = i % 16 ? '#4a1e16' : '#341410';
    x.fillRect(i, 0, 4, 400);
  }
  x.strokeStyle = '#7a5a28';
  x.lineWidth = 6;
  x.strokeRect(18, 18, 476, 364);
  x.strokeStyle = '#2a1408';
  x.lineWidth = 4;
  x.strokeRect(36, 36, 440, 328);
  return ct(c, true, maxAnisotropy);
}

function stripesTex(maxAnisotropy) {
  const stripes = mk(64, 8);
  const sx = stripes.getContext('2d');
  sx.fillStyle = '#ffffff';
  sx.fillRect(0, 0, 64, 8);
  sx.fillStyle = '#c9c9c9';
  for (let i = 0; i < 64; i += 16) sx.fillRect(i, 0, 8, 8);
  const t = ct(stripes, true, maxAnisotropy);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

function drawPig(c) {
  c.beginPath();
  c.ellipse(300, 420, 190, 130, 0, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(130, 380);
  c.quadraticCurveTo(70, 390, 75, 435);
  c.quadraticCurveTo(80, 470, 140, 465);
  c.stroke();
  c.beginPath();
  c.ellipse(175, 330, 35, 52, -0.5, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.arc(145, 395, 10, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(190, 535);
  c.lineTo(185, 600);
  c.moveTo(235, 540);
  c.lineTo(235, 600);
  c.moveTo(370, 540);
  c.lineTo(370, 600);
  c.moveTo(415, 530);
  c.lineTo(420, 600);
  c.stroke();
  c.beginPath();
  c.moveTo(485, 395);
  c.quadraticCurveTo(545, 360, 520, 325);
  c.quadraticCurveTo(495, 300, 535, 280);
  c.stroke();
  c.beginPath();
  c.arc(310, 410, 58, 0.9 * Math.PI, 2.9 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(310, 410, 28, 0.9 * Math.PI, 2.9 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(310, 440, 50, 0, 1.6 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(310, 440, 24, 0, 1.6 * Math.PI);
  c.stroke();
}

function drawCarp(c) {
  c.beginPath();
  c.ellipse(285, 410, 175, 95, -0.15, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(450, 385);
  c.lineTo(545, 300);
  c.quadraticCurveTo(515, 405, 548, 505);
  c.lineTo(450, 430);
  c.stroke();
  c.beginPath();
  c.arc(185, 385, 11, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.arc(185, 385, 3, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(250, 325);
  c.quadraticCurveTo(310, 230, 400, 315);
  c.stroke();
  c.beginPath();
  c.moveTo(280, 485);
  c.quadraticCurveTo(300, 560, 360, 520);
  c.stroke();
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 4 - (r === 1 ? 0 : 1); i++) {
      c.beginPath();
      c.arc(260 + i * 42 + (r % 2) * 20, 380 + r * 30, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      c.stroke();
    }
  }
  c.beginPath();
  c.moveTo(105, 405);
  c.quadraticCurveTo(160, 430, 205, 430);
  c.stroke();
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(80 - i * 6, 340 - i * 40, 12 + i * 4, 0, Math.PI * 2);
    c.stroke();
  }
}

function drawWood(x) {
  x.fillStyle = '#8e877b';
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 320; i++) {
    const px = Math.random() * W;
    const w = 1 + Math.random() * 3;
    x.strokeStyle =
      Math.random() < 0.55
        ? `rgba(60,50,40,${0.05 + Math.random() * 0.1})`
        : `rgba(190,180,165,${0.05 + Math.random() * 0.1})`;
    x.lineWidth = w;
    x.beginPath();
    x.moveTo(px, 0);
    x.bezierCurveTo(
      px + (Math.random() - 0.5) * 30,
      H * 0.3,
      px + (Math.random() - 0.5) * 30,
      H * 0.7,
      px + (Math.random() - 0.5) * 20,
      H
    );
    x.stroke();
  }
  for (let k = 0; k < 3; k++) {
    const kx = 80 + Math.random() * (W - 160);
    const ky = 100 + Math.random() * (H - 200);
    for (let r = 4; r < 22; r += 4) {
      x.strokeStyle = 'rgba(50,40,30,0.12)';
      x.lineWidth = 2;
      x.beginPath();
      x.ellipse(kx, ky, r * 0.8, r * 1.6, 0, 0, Math.PI * 2);
      x.stroke();
    }
  }
  const e = x.createLinearGradient(0, 0, W, 0);
  e.addColorStop(0, 'rgba(0,0,0,0.25)');
  e.addColorStop(0.06, 'rgba(0,0,0,0)');
  e.addColorStop(0.94, 'rgba(0,0,0,0)');
  e.addColorStop(1, 'rgba(0,0,0,0.25)');
  x.fillStyle = e;
  x.fillRect(0, 0, W, H);
}

function buildTable(maxAnisotropy) {
  const g = new THREE.Group();
  const TW = 1.14;
  const TD = 1.02;
  const n = 64;
  const sd = TD / n;
  const geo = new THREE.BoxGeometry(TW, 0.012, sd * 0.84);
  for (let i = 0; i < n; i++) {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        `hsl(${10 + Math.random() * 10}, ${42 + Math.random() * 18}%, ${12 + Math.random() * 9}%)`
      ),
      roughness: 0.5,
      metalness: 0.02
    });
    const s = new THREE.Mesh(geo, m);
    s.position.set(0, TOP_Y - 0.006, -TD / 2 + sd * (i + 0.5));
    s.castShadow = true;
    s.receiveShadow = true;
    g.add(s);
  }
  const lt = lashTexture(maxAnisotropy);
  lt.repeat.set(1, TD / 0.03);
  const lashMat = new THREE.MeshStandardMaterial({ map: lt, roughness: 0.6 });
  [-0.38, 0, 0.38].forEach((x) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, TD), lashMat);
    b.position.set(x, TOP_Y + 0.0015, 0);
    b.receiveShadow = true;
    g.add(b);
  });
  const bam = new THREE.MeshStandardMaterial({ color: '#3d1b10', roughness: 0.45 });
  const cap = new THREE.MeshStandardMaterial({ color: '#b98f5a', roughness: 0.8 });
  [-1, 1].forEach((sz) => {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, TW - 0.02, 14), bam);
    r.rotation.z = Math.PI / 2;
    r.position.set(0, TOP_Y - 0.03, sz * (TD / 2 - 0.015));
    r.castShadow = true;
    g.add(r);
  });
  [-1, 1].forEach((sx) => {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, TD - 0.02, 14), bam);
    r.rotation.x = Math.PI / 2;
    r.position.set(sx * (TW / 2 - 0.015), TOP_Y - 0.03, 0);
    r.castShadow = true;
    g.add(r);
  });
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ].forEach(([sx, sz]) => {
    const h = TOP_Y + 0.012;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.032, h, 18), [bam, cap, cap]);
    leg.position.set(sx * (TW / 2 - 0.03), h / 2, sz * (TD / 2 - 0.03));
    leg.castShadow = true;
    leg.receiveShadow = true;
    g.add(leg);
  });
  const matM = new THREE.MeshStandardMaterial({ color: '#5a1e18', roughness: 0.95 });
  Object.values(KIND).forEach((K) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, MAT_Y, 0.16), matM);
    m.position.set(K.rest.x + 0.125, TOP_Y + MAT_Y / 2, K.rest.z);
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

function buildRoller(kind, maxAnisotropy) {
  const K = KIND[kind];
  const g = new THREE.Group();
  const drumMat = new THREE.MeshStandardMaterial(
    kind === 'ink'
      ? { color: '#b07a42', map: stripesTex(maxAnisotropy), roughness: 0.55 }
      : { color: '#dcc38e', roughness: 0.38 }
  );
  const spin = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(K.rad, K.rad, K.len, 28), drumMat);
  drum.rotation.z = Math.PI / 2;
  drum.castShadow = true;
  spin.add(drum);
  g.add(spin);

  const metal = new THREE.MeshStandardMaterial({ color: '#9a9fa6', metalness: 0.6, roughness: 0.35 });
  const wood = new THREE.MeshStandardMaterial({
    color: kind === 'ink' ? '#7a4a24' : '#a63a22',
    roughness: 0.55
  });
  const handle = new THREE.Group();
  g.add(handle);
  [-1, 1].forEach((s) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(K.rad + 0.002, K.rad + 0.002, 0.008, 20), metal);
    c.rotation.z = Math.PI / 2;
    c.position.x = s * (K.len / 2 + 0.004);
    g.add(c);
    handle.add(
      barMesh(
        new THREE.Vector3(s * (K.len / 2 + 0.014), 0, 0),
        new THREE.Vector3(s * 0.006, 0.075, 0.11),
        0.0038,
        metal
      )
    );
  });
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, K.len + 0.045, 10), metal);
  axle.rotation.z = Math.PI / 2;
  g.add(axle);
  // Metal ferrule collar connecting the two fork arms solidly into the wooden handle
  handle.add(barMesh(new THREE.Vector3(-0.011, 0.075, 0.11), new THREE.Vector3(0.011, 0.075, 0.11), 0.0055, metal));
  handle.add(barMesh(new THREE.Vector3(0, 0.066, 0.097), new THREE.Vector3(0, 0.086, 0.126), 0.013, metal));
  handle.add(barMesh(new THREE.Vector3(0, 0.075, 0.11), new THREE.Vector3(0, 0.15, 0.22), 0.011, wood));

  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(K.len + 0.07, 0.09, 0.34),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  proxy.position.set(0, 0.01, 0.12);
  g.add(proxy);

  g.userData = { item: kind === 'ink' ? 'inkRoller' : 'pressRoller' };
  const mats = new Set();
  g.traverse((o) => {
    if (o.isMesh && o !== proxy) mats.add(o.material);
  });
  return { g, spin, drumMat, handle, mats: [...mats] };
}

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

function hslToHex(hh, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + hh / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (v) =>
    Math.round(255 * v)
      .toString(16)
      .padStart(2, '0');
  return '#' + to(f(0)) + to(f(8)) + to(f(4));
}

export async function createKimHoangStation({
  camera,
  domElement,
  maxAnisotropy = 8,
  basePath = '.',
  onHangPainting
}) {
  const $ = (id) => document.getElementById(id);
  const root = new THREE.Group();

  // Load extracted Kim Hoàng assets (real woodblocks only)
  const [
    horseImg,
    roosterImg,
    roosterReg,
    roosterFace,
    cuoihoImg,
    haiduaImg,
    cuoiphuongImg,
    lonImg,
    meoImg,
    dauvatImg,
    trauImg
  ] = await Promise.all([
    loadImage(`${basePath}/kim-hoang-assets/horseImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/roosterImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/roosterReg.png`),
    loadImage(`${basePath}/kim-hoang-assets/roosterFace.webp`),
    loadImage(`${basePath}/kim-hoang-assets/cuoihoImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/haiduaImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/cuoiphuongImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/lonImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/meoImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/dauvatImg.png`),
    loadImage(`${basePath}/kim-hoang-assets/trauImg.png`)
  ]);

  const samples = [
    { id: 'ngua', name: 'Ngựa', img: horseImg, regionGap: 0, block: `${basePath}/kim-hoang-assets/blockPhoto.jpg` },
    {
      id: 'ga',
      name: 'Gà',
      img: roosterImg,
      regionImg: roosterReg,
      face: roosterFace,
      block: `${basePath}/kim-hoang-assets/roosterPhoto.jpg`
    },
    { id: 'cuoiho', name: 'Tiên đồng cưỡi hổ', img: cuoihoImg, block: `${basePath}/kim-hoang-assets/cuoihoPhoto.jpg` },
    { id: 'haidua', name: 'Hái dừa', img: haiduaImg, block: `${basePath}/kim-hoang-assets/haiduaPhoto.jpg` },
    { id: 'cuoiphuong', name: 'Tiên đồng cưỡi phượng', img: cuoiphuongImg, block: `${basePath}/kim-hoang-assets/cuoiphuongPhoto.jpg` },
    { id: 'lon', name: 'Lợn Kim Hoàng', img: lonImg, block: `${basePath}/kim-hoang-assets/lonPhoto.jpg` },
    { id: 'meo', name: 'Mèo & Bướm', img: meoImg, block: `${basePath}/kim-hoang-assets/meoPhoto.jpg` },
    { id: 'dauvat', name: 'Đấu vật', img: dauvatImg, block: `${basePath}/kim-hoang-assets/dauvatPhoto.jpg` },
    { id: 'trau', name: 'Trâu mẹ & nghé', img: trauImg, block: `${basePath}/kim-hoang-assets/trauPhoto.jpg` }
  ];

  function drawSample(ctx, s) {
    ctx.save();
    if (s.img) {
      ctx.drawImage(s.img, 0, 0, W, H);
    } else if (s.draw) {
      ctx.scale(W / 600, H / 800);
      ctx.strokeStyle = '#1b1210';
      ctx.fillStyle = '#1b1210';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      s.draw(ctx);
    }
    ctx.restore();
  }

  // Offscreen canvases from kim-hoang-in-tranh.html
  const paper = mk();
  const pctx = paper.getContext('2d');
  const mask = mk();
  const mctx = mask.getContext('2d');
  const reg = mk();
  const rctx = reg.getContext('2d');
  const maskB = mk();
  const mbctx = maskB.getContext('2d');
  const ink = mk();
  const ictx = ink.getContext('2d');
  const color = mk();
  const cctx = color.getContext('2d');

  const blockColor = mk();
  const bcctx = blockColor.getContext('2d');
  const blockBump = mk();
  const bbctx = blockBump.getContext('2d');
  const blockInk = mk();
  const bictx = blockInk.getContext('2d');
  const ghost = mk();
  const gctx = ghost.getContext('2d');

  const sheetBase = mk(SPW, SPH);
  const sbase = sheetBase.getContext('2d');
  const sheetTop = mk(SPW, SPH);
  const stop = sheetTop.getContext('2d');
  const sheetBot = mk(SPW, SPH);
  const sbot = sheetBot.getContext('2d');
  const tmpA = mk();
  const tmpB = mk(W / 2, H / 2);

  let paperType = 'red';
  let step = 'pick';
  let sample = samples[0];
  let isSeated = false;

  // Printing state
  const inMask = new Uint8Array(COLS * ROWS);
  const inkC = new Float32Array(COLS * ROWS);
  const pressC = new Float32Array(COLS * ROWS);
  let maskCells = [];
  let ps = 'ink';
  let load = 0;
  let orient = 0;
  let held = null;
  let moving = 0;
  let sheetLoc = 'stack';
  let yawCur = 0;
  let inkReady = false;
  let pressReady = false;
  let inkLow = false;
  let inkDirty = false;
  let ghostDirty = false;
  const tweens = [];
  function tween(dur, fn, ease = easeIO) {
    return new Promise((res) => tweens.push({ t: 0, dur, fn, ease, res }));
  }

  function buildPaper() {
    const c = pctx;
    c.clearRect(0, 0, W, H);
    if (paperType === 'red') {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#c9391f');
      g.addColorStop(1, '#b8301c');
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const l = 6 + Math.random() * 22;
        const a = Math.random() * Math.PI;
        c.strokeStyle = Math.random() < 0.5 ? 'rgba(255,200,170,0.07)' : 'rgba(60,0,0,0.07)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        c.stroke();
      }
      const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(40,0,0,0.35)');
      c.fillStyle = v;
      c.fillRect(0, 0, W, H);
    } else {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#eee4cb');
      g.addColorStop(1, '#ded1b0');
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 3600; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const l = 8 + Math.random() * 34;
        const a = Math.random() * Math.PI;
        c.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(120,90,50,0.10)';
        c.lineWidth = Math.random() < 0.2 ? 2 : 1;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(
          x + Math.cos(a) * l * 0.5 + 3,
          y + Math.sin(a) * l * 0.5 - 3,
          x + Math.cos(a) * l,
          y + Math.sin(a) * l
        );
        c.stroke();
      }
      const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(90,60,20,0.22)');
      c.fillStyle = v;
      c.fillRect(0, 0, W, H);
    }
  }

  function composeSheetBase() {
    sbase.clearRect(0, 0, SPW, SPH);
    sbase.drawImage(paper, 0, 0, SPW, SPH);
  }

  function composeSheetTop(withGhost) {
    stop.clearRect(0, 0, SPW, SPH);
    stop.drawImage(sheetBase, 0, 0);
    if (withGhost) {
      stop.globalAlpha = 0.6;
      stop.drawImage(ghost, OFX, OFY);
      stop.globalAlpha = 1;
    }
  }

  function setupBlockData() {
    mbctx.clearRect(0, 0, W, H);
    mbctx.save();
    mbctx.translate(W, 0);
    mbctx.scale(-1, 1);
    mbctx.drawImage(mask, 0, 0);
    mbctx.restore();

    drawWood(bcctx);
    const t = tmpA.getContext('2d');
    t.globalCompositeOperation = 'source-over';
    t.clearRect(0, 0, W, H);
    t.drawImage(maskB, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = '#35312d';
    t.fillRect(0, 0, W, H);
    t.globalCompositeOperation = 'source-over';
    if (sample && sample.face) {
      bcctx.drawImage(sample.face, 0, 0, W, H);
    } else {
      bcctx.globalAlpha = 0.92;
      bcctx.drawImage(tmpA, 0, 0);
      bcctx.globalAlpha = 1;
    }

    t.globalCompositeOperation = 'source-over';
    t.clearRect(0, 0, W, H);
    t.drawImage(maskB, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = '#ffffff';
    t.fillRect(0, 0, W, H);
    t.globalCompositeOperation = 'source-over';
    const sm = tmpB.getContext('2d');
    sm.clearRect(0, 0, tmpB.width, tmpB.height);
    sm.imageSmoothingEnabled = true;
    sm.drawImage(tmpA, 0, 0, tmpB.width, tmpB.height);
    bbctx.fillStyle = '#262626';
    bbctx.fillRect(0, 0, W, H);
    bbctx.imageSmoothingEnabled = true;
    bbctx.drawImage(tmpB, 0, 0, W, H);

    const d = mbctx.getImageData(0, 0, W, H).data;
    inMask.fill(0);
    maskCells = [];
    for (let cy = 0; cy < ROWS; cy++) {
      for (let cx = 0; cx < COLS; cx++) {
        let f = 0;
        for (let yy = 0; yy < CELL && !f; yy += 2) {
          for (let xx = 0; xx < CELL && !f; xx += 2) {
            if (d[((cy * CELL + yy) * W + cx * CELL + xx) * 4 + 3] > 40) {
              f = 1;
              break;
            }
          }
        }
        if (f) {
          inMask[cy * COLS + cx] = 1;
          maskCells.push(cy * COLS + cx);
        }
      }
    }
  }

  // --- Build 3D Objects on the Table ---
  // 1. Woven mat & cushions (front cushion at z = 0.72 for the player, back cushion at z = -0.74 for Nghệ nhân Đào Đình Chung)
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(2.15, 2.05).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: rugTexture(maxAnisotropy), roughness: 0.95 })
  );
  rug.position.set(0, 0.004, 0.0);
  rug.receiveShadow = true;
  rug.userData = { item: 'rug' };
  root.add(rug);

  const cushionMat = new THREE.MeshStandardMaterial({ color: '#8f2419', roughness: 0.85 });
  // Only the player's sitting cushions (front & sides) trigger sitting down at the table
  [
    [0, 0.72, true],
    [-0.04, -0.74, false],
    [-0.86, 0.06, true],
    [0.86, 0.06, true]
  ].forEach(([cx, cz, isPlayerSeat]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 24), cushionMat);
    c.position.set(cx, 0.038, cz);
    c.castShadow = true;
    c.receiveShadow = true;
    c.userData = isPlayerSeat ? { item: 'seat', artworkId: 'kh_seat' } : { item: 'artisan', artworkId: 'kh_artisan' };
    root.add(c);
  });

  // 1b. Nghệ nhân Đào Đình Chung (Ong_do.glb) sitting cross-legged at the back of the table & painting Kim Hoàng art
  const artisanGroup = new THREE.Group();
  artisanGroup.position.set(-0.04, 0.0, -0.72);
  artisanGroup.userData = { item: 'artisan', artworkId: 'kh_artisan' };
  root.add(artisanGroup);

  const artisanBrushGroup = new THREE.Group();
  // Traditional bamboo calligraphy/painting brush held directly inside Nghệ nhân Đào Đình Chung's curled right hand
  // Local (0,0,0) is the exact grip point where the thumb and curled fingers wrap around the bamboo shaft
  const brushShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0042, 0.0055, 0.175, 12),
    new THREE.MeshStandardMaterial({ color: '#8a5328', roughness: 0.6 })
  );
  brushShaft.position.y = 0.038;
  const brushFerrule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.0055, 0.018, 12),
    new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: 0.35 })
  );
  brushFerrule.position.y = -0.044;
  const brushTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.006, 0.025, 12),
    new THREE.MeshStandardMaterial({ color: '#f5c518', roughness: 0.45 })
  );
  brushTip.rotation.x = Math.PI;
  brushTip.position.y = -0.064;
  artisanBrushGroup.add(brushShaft, brushFerrule, brushTip);
  artisanGroup.add(artisanBrushGroup);

  // Small Kim Hoàng red paper sheet on the back zone of the table (z = -0.36, well clear of the woodblock & paper stack)
  const artisanSheetCanvas = mk(240, 320);
  const artisanSheetCtx = artisanSheetCanvas.getContext('2d');
  const artisanSheetTex = ct(artisanSheetCanvas, true, maxAnisotropy);
  function redrawArtisanSheet() {
    artisanSheetCtx.fillStyle = '#c8341d';
    artisanSheetCtx.fillRect(0, 0, 240, 320);
    artisanSheetCtx.strokeStyle = 'rgba(255,220,160,0.28)';
    artisanSheetCtx.lineWidth = 4;
    artisanSheetCtx.strokeRect(10, 10, 220, 300);
    if (samples[0] && samples[0].img) {
      artisanSheetCtx.save();
      artisanSheetCtx.translate(120, 160);
      artisanSheetCtx.scale(-1, -1);
      artisanSheetCtx.drawImage(samples[0].img, -100, -135, 200, 270);
      artisanSheetCtx.restore();
    }
    artisanSheetTex.needsUpdate = true;
  }
  redrawArtisanSheet();

  const artisanSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.17).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: artisanSheetTex,
      roughness: 0.88,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    })
  );
  artisanSheet.position.set(-0.08, TOP_Y + 0.008, -0.36);
  artisanSheet.rotation.y = 0.03;
  artisanSheet.userData = { item: 'artisan', artworkId: 'kh_artisan' };
  root.add(artisanSheet);

  // Small ceramic color bowl (bát gốm đựng màu vàng hoa hòe) beside the paper in the back-left corner
  const colorBowlGroup = new THREE.Group();
  colorBowlGroup.position.set(-0.29, TOP_Y, -0.34);
  const bowlOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.024, 0.024, 20),
    new THREE.MeshStandardMaterial({ color: '#5c4938', roughness: 0.4 })
  );
  bowlOuter.position.y = 0.012;
  const bowlPigment = new THREE.Mesh(
    new THREE.CircleGeometry(0.028, 20).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#f5c518', roughness: 0.25 })
  );
  bowlPigment.position.y = 0.0245;
  colorBowlGroup.add(bowlOuter, bowlPigment);
  colorBowlGroup.userData = { item: 'artisan', artworkId: 'kh_artisan' };
  root.add(colorBowlGroup);

  const artisanAnimatedMeshes = [];
  let gripMeshRef = null;
  const gripVertexIndices = [];

  const sStep = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const rX = (x, y, z, cy, cz, ang) => {
    const dy = y - cy;
    const dz = z - cz;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [x, cy + dy * c - dz * s, cz + dy * s + dz * c];
  };
  const rY = (x, y, z, cx, cz, ang) => {
    const dx = x - cx;
    const dz = z - cz;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [cx + dx * c + dz * s, y, cz - dx * s + dz * c];
  };
  const rZ = (x, y, z, cx, cy, ang) => {
    const dx = x - cx;
    const dy = y - cy;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [cx + dx * c - dy * s, cy + dx * s + dy * c, z];
  };

  function setupArtisanModel(ongDoScene) {
    ongDoScene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      // Hide the duplicate inner lining (LopTrong) and stray back button (Button_Npc_Khaydo)
      if (child.name && (child.name.includes('LopTrong') || child.name.includes('Button_Npc_Khaydo'))) {
        child.visible = false;
        return;
      }

      // Make the outer Aodai mesh 100% opaque, solid, and uniformly colored traditional deep indigo-black silk
      if (child.material && child.name && child.name.includes('Aodai_Npc_Khaydo')) {
        child.material = child.material.clone();
        child.material.transparent = false;
        child.material.opacity = 1;
        child.material.alphaTest = 0;
        child.material.depthWrite = true;
        child.material.side = THREE.DoubleSide;
        child.material.map = null;
        child.material.color.set('#1e212b');
        child.material.roughness = 0.82;
        child.material.metalness = 0.02;
        child.material.needsUpdate = true;
      }

      const isBodyMesh = child.name && child.name.includes('Body');
      const isAodaiMesh = child.name && child.name.includes('Aodai_Npc_Khaydo');

      child.geometry = child.geometry.clone();
      const pos = child.geometry.attributes.position;
      if (!pos) return;

      const rawCoords = new Float32Array(pos.count * 3);
      const dynamicIndices = [];

      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const ax = Math.abs(x);
        const s = x >= 0 ? 1.0 : -1.0;

        // Tuck arm skin slightly inside the sleeve so no skin clips through at the elbow
        if (isBodyMesh && ax > 20.0 && ax < 57.0 && y > 100.0) {
          y = 121.5 + (y - 121.5) * 0.85;
          z *= 0.85;
        }
        // Slightly expand ONLY the back of the áo dài collar so it wraps cleanly behind the neck without touching the face
        if (isAodaiMesh && y >= 123.5 && y <= 130.5 && ax < 11.0 && z < 0.0) {
          const wc = sStep(123.5, 127.0, y);
          x *= 1.0 + 0.1 * wc;
          z -= 1.5 * wc;
        }

        // Pre-bake cross-legged seated pose for lower body (y < 80)
        if (y < 80 && ax < 25) {
          const wk = sStep(43.0, 30.0, y);
          if (wk > 0) {
            [x, y, z] = rZ(x, y, z, s * 9.0, 39.0, -s * 1.48 * wk);
            z -= 4.0 * wk;
          }
          const wh = sStep(78.0, 62.0, y);
          if (wh > 0) {
            [x, y, z] = rX(x, y, z, 74.0, 0.0, -1.5 * wh);
            x *= 1.0 + 0.25 * wh * (1.0 - 0.5 * wk);
          }
        }

        // Pre-bake finger grip curl on right hand (x < -58, y > 100) so fingers wrap tightly around the brush shaft
        if (x < -58.0 && y > 100.0) {
          if (x >= -65.5 && x <= -62.5) {
            if (!gripMeshRef || child.name.includes('Body')) {
              gripMeshRef = child;
              gripVertexIndices.push(i);
            }
          }
          const wf = sStep(62.2, 66.5, -x);
          if (wf > 0) {
            [x, y, z] = rZ(x, y, z, -63.8, 123.6, 1.52 * wf);
          }
          if (z > 0.7 && x < -60.0) {
            const wt = sStep(0.7, 3.2, z);
            [x, y, z] = rX(x, y, z, 123.5, 0.7, 1.05 * wt);
          }
        }

        // Pre-bake gentle finger curve on left hand (resting on paper edge)
        if (x > 58.0 && y > 100.0) {
          const wf = sStep(62.5, 67.0, x);
          if (wf > 0) {
            [x, y, z] = rZ(x, y, z, 64.0, 123.6, -0.58 * wf);
          }
        }

        rawCoords[i * 3] = x;
        rawCoords[i * 3 + 1] = y;
        rawCoords[i * 3 + 2] = z;

        if (y > 74.0) {
          dynamicIndices.push(i);
        } else {
          pos.setXYZ(i, x, Math.max(4.0, y - 58.0), z);
        }
      }

      artisanAnimatedMeshes.push({ mesh: child, pos, rawCoords, dynamicIndices, isAodaiMesh });
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
      child.userData = { item: 'artisan', artworkId: 'kh_artisan' };
      if (child.material && child.material.map) {
        child.material.map.anisotropy = maxAnisotropy;
      }
    });
  }

  let artisanPaintPhase = 0;

  function updateArtisanPose(t, dt = 0) {
    if (!artisanAnimatedMeshes.length) return;

    // Natural rhythm:
    // - Every ~8.0s: brief brush dip into the yellow hoa hòe pigment bowl
    // - Only occasionally (every ~28s, for ~3s): pause painting, sit up slightly, and look up/around the room
    const cycDip = t % 8.0;
    const cycLook = t % 28.0;
    const lookUp = sStep(23.5, 24.2, cycLook) * (1.0 - sStep(26.6, 27.3, cycLook));
    const dip = sStep(5.8, 6.3, cycDip) * (1.0 - sStep(7.2, 7.75, cycDip)) * (1.0 - lookUp);
    const dipNod = cycDip > 6.3 && cycDip < 7.25 ? Math.sin((cycDip - 6.3) * 9.5) * 0.055 : 0.0;

    // Advance painting phase only when actively painting (pauses smoothly while looking around)
    artisanPaintPhase += dt * (1.0 - dip) * (1.0 - lookUp);
    const pt = artisanPaintPhase;

    const strokeX = Math.sin(pt * 2.1) * 0.11 + Math.sin(pt * 4.7) * 0.03;
    const strokeZ = Math.cos(pt * 1.6) * 0.08 + Math.cos(pt * 3.9) * 0.02;
    const strokeLift = Math.max(0, Math.sin(pt * 3.2)) * 0.032;

    const rElbowYaw = 1.52 + (1.0 - dip) * strokeX;
    const rElbowPitch =
      0.34 - (1.0 - dip) * (1.0 - lookUp) * (strokeZ * 0.32 - strokeLift) + dip * dipNod - lookUp * 0.08;
    const rArmYaw = 0.52 * (1.0 - dip) + 0.05 * dip;
    const rWristPitch = Math.sin(pt * 5.2) * 0.11 * (1.0 - dip) * (1.0 - lookUp) + dipNod * 1.4 + lookUp * 0.08;
    const rWristRoll = Math.cos(pt * 4.1) * 0.08 * (1.0 - dip) * (1.0 - lookUp);

    const lElbowYaw = -1.55 + Math.sin(t * 1.2) * 0.012 * (1.0 - lookUp);
    const lElbowPitch = 0.52 + Math.cos(t * 1.5) * 0.01 * (1.0 - lookUp);
    const lArmYaw = 0.75;

    const breath = Math.sin(t * 1.7) * 0.016;
    const glanceYaw = lookUp > 0 ? Math.sin((cycLook - 24.0) * 1.6) * 0.34 * lookUp : 0.0;
    const headYaw = (-0.10 + (1.0 - dip) * strokeX * 0.45 - dip * 0.25) * (1.0 - lookUp) + glanceYaw;
    const headPitch = (0.23 + Math.sin(t * 1.4) * 0.028 + dip * 0.04) * (1.0 - lookUp) - 0.09 * lookUp;
    const torsoLean = 0.17 - 0.07 * lookUp + breath;

    for (const item of artisanAnimatedMeshes) {
      const { pos, rawCoords, dynamicIndices } = item;
      for (let k = 0; k < dynamicIndices.length; k++) {
        const i = dynamicIndices[k];
        let x = rawCoords[i * 3];
        let y = rawCoords[i * 3 + 1];
        let z = rawCoords[i * 3 + 2];
        const ax = Math.abs(x);
        const s = x >= 0 ? 1.0 : -1.0;

        // 1. Right wrist fine articulation while painting
        if (x < -58.0 && y > 100.0) {
          const ww = sStep(58.0, 62.5, -x);
          if (ww > 0) {
            [x, y, z] = rZ(x, y, z, -60.0, 123.5, rWristPitch * ww);
            [x, y, z] = rY(x, y, z, -60.0, -0.5, rWristRoll * ww);
          }
        }

        // 2. Shoulder & Elbow Forward Kinematics
        if (y > 95.0 && ax > 15.0) {
          const we = sStep(34.0, 42.0, ax);
          if (we > 0) {
            const ey = s < 0 ? rElbowYaw : lElbowYaw;
            [x, y, z] = rY(x, y, z, s * 39.0, -1.5, ey * we);
          }
          const ws = sStep(15.0, 22.0, ax);
          if (ws > 0) {
            [x, y, z] = rZ(x, y, z, s * 17.0, 121.5, -s * 1.22 * ws);
            [x, y, z] = rX(x, y, z, 121.5, -1.0, -0.48 * ws);
            if (we > 0) {
              const ep = s < 0 ? rElbowPitch : lElbowPitch;
              const ay = s < 0 ? rArmYaw : lArmYaw;
              [x, y, z] = rX(x, y, z, 102.0, 9.0, ep * we);
              [x, y, z] = rY(x, y, z, s * 24.0, 9.0, -s * ay * we);
            }
          }
        }

        // 3. Rotate the entire head (chin, mouth, eyes, hat) rigidly together while keeping the collar fixed
        if (!item.isAodaiMesh && y > 120.5 && ax < 16.0) {
          const whd = sStep(120.5, 123.4, y);
          [x, y, z] = rY(x, y, z, 0.0, 0.0, headYaw * whd);
          [x, y, z] = rX(x, y, z, 126.0, 0.0, headPitch * whd);
        }

        // 4. Upper torso lean over the table + natural breathing (sits up slightly when looking around)
        if (y > 74.0) {
          const wb = sStep(74.0, 92.0, y);
          [x, y, z] = rX(x, y, z, 78.0, 0.0, torsoLean * wb);
        }

        pos.setXYZ(i, x, Math.max(4.0, y - 58.0), z);
      }
      pos.needsUpdate = true;
    }

    // Lock the 3D brush directly to the exact live centroid of his right-hand grip vertices (zero gap!)
    if (gripMeshRef && gripVertexIndices.length > 0) {
      const gPos = gripMeshRef.geometry.attributes.position;
      let gx = 0;
      let gy = 0;
      let gz = 0;
      for (let k = 0; k < gripVertexIndices.length; k++) {
        const idx = gripVertexIndices[k];
        gx += gPos.getX(idx);
        gy += gPos.getY(idx);
        gz += gPos.getZ(idx);
      }
      const inv = 0.01 / gripVertexIndices.length;
      // Offset 6mm inward into the closed fist hole so the bamboo shaft sits squarely between thumb and curled fingers
      artisanBrushGroup.position.set(gx * inv + 0.006, gy * inv - 0.008, gz * inv - 0.003);
      artisanBrushGroup.rotation.set(
        0.16 + rWristPitch * 0.55,
        -0.08 + rWristRoll * 0.5,
        -0.12 - strokeX * 0.35 * (1.0 - dip)
      );
    }
  }

  let artisanModel = null;
  await new Promise((resolve) => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      `${basePath}/Ong_do/Ong_do.glb`,
      (gltf) => {
        artisanModel = gltf.scene;
        setupArtisanModel(artisanModel);
        updateArtisanPose(0);
        artisanAnimatedMeshes.forEach(({ mesh }) => mesh.geometry.computeVertexNormals());
        artisanGroup.add(artisanModel);
        resolve();
      },
      undefined,
      (err) => {
        console.error('Failed to load Ong_do.glb:', err);
        resolve();
      }
    );
  });

  // 2. Bamboo Table
  const table = buildTable(maxAnisotropy);
  table.userData.item = 'table';
  root.add(table);

  // 3. Woodblock
  const blockColorTex = ct(blockColor, true, maxAnisotropy);
  const blockBumpTex = ct(blockBump, false, maxAnisotropy);
  const blockInkTex = ct(blockInk, true, maxAnisotropy);
  const woodSide = new THREE.MeshStandardMaterial({ color: '#7d766a', roughness: 0.85 });
  const topMat = new THREE.MeshStandardMaterial({
    map: blockColorTex,
    bumpMap: blockBumpTex,
    bumpScale: 3,
    roughness: 0.8
  });
  const block = new THREE.Mesh(new THREE.BoxGeometry(BW, BT, BD), [
    woodSide,
    woodSide,
    topMat,
    woodSide,
    woodSide,
    woodSide
  ]);
  block.position.set(BX, TOP_Y + BT / 2, BZ);
  block.castShadow = true;
  block.receiveShadow = true;
  block.userData = { item: 'block' };
  root.add(block);

  const inkPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(BW, BD).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: blockInkTex,
      transparent: true,
      roughness: 0.22,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    })
  );
  inkPlane.position.set(BX, BLOCK_TOP + 0.0004, BZ);
  inkPlane.userData = { item: 'block' };
  root.add(inkPlane);

  // 4. Ink Tray
  const tray = new THREE.Group();
  tray.position.set(TRAY.x, TOP_Y, TRAY.z);
  tray.userData = { item: 'tray' };
  const cer = new THREE.MeshStandardMaterial({ color: '#4a3a30', roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(TRAY.w, 0.03, TRAY.d), cer);
  base.position.y = 0.015;
  base.castShadow = true;
  base.receiveShadow = true;
  tray.add(base);
  const inkSurf = new THREE.Mesh(
    new THREE.PlaneGeometry(TRAY.w - 0.03, TRAY.d - 0.03).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#060505', roughness: 0.06, metalness: 0.3 })
  );
  inkSurf.position.y = 0.0305;
  tray.add(inkSurf);
  [
    [0, TRAY.d / 2 - 0.007, TRAY.w, 0.014],
    [0, -TRAY.d / 2 + 0.007, TRAY.w, 0.014],
    [TRAY.w / 2 - 0.007, 0, 0.014, TRAY.d],
    [-TRAY.w / 2 + 0.007, 0, 0.014, TRAY.d]
  ].forEach(([x, z, w, d]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, d), cer);
    l.position.set(x, 0.034, z);
    l.castShadow = true;
    tray.add(l);
  });
  root.add(tray);

  // 5. Paper Stack & Active Sheet
  const stackTex = ct(sheetBase, true, maxAnisotropy);
  const sheetTopTex = ct(sheetTop, true, maxAnisotropy);
  const sheetBotTex = ct(sheetBot, true, maxAnisotropy);
  const edgeMat = new THREE.MeshStandardMaterial({ color: '#d8b0a0', roughness: 0.95 });
  const stackTopMat = new THREE.MeshStandardMaterial({ map: stackTex, roughness: 0.95 });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(SHW, STK.h, SHD), [
    edgeMat,
    edgeMat,
    stackTopMat,
    edgeMat,
    edgeMat,
    edgeMat
  ]);
  stack.position.set(STK.x, TOP_Y + STK.h / 2, STK.z);
  stack.castShadow = true;
  stack.receiveShadow = true;
  stack.userData = { item: 'stackObj' };
  root.add(stack);

  const sheet = new THREE.Group();
  sheet.userData = { item: 'sheetObj' };
  const sTopMat = new THREE.MeshStandardMaterial({
    map: sheetTopTex,
    roughness: 0.92,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3
  });
  const sBotMat = new THREE.MeshStandardMaterial({
    map: sheetBotTex,
    roughness: 0.92,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3
  });
  const sTop = new THREE.Mesh(new THREE.PlaneGeometry(SHW, SHD).rotateX(-Math.PI / 2), sTopMat);
  const sBot = new THREE.Mesh(new THREE.PlaneGeometry(SHW, SHD).rotateX(Math.PI / 2), sBotMat);
  sTop.castShadow = sBot.castShadow = true;
  sTop.receiveShadow = sBot.receiveShadow = true;
  sheet.add(sTop, sBot);
  root.add(sheet);

  // 6. Two Rollers
  const rl = {};
  ['ink', 'press'].forEach((k) => {
    const r = buildRoller(k, maxAnisotropy);
    root.add(r.g);
    rl[k] = {
      g: r.g,
      spin: r.spin,
      drumMat: r.drumMat,
      handle: r.handle,
      mats: r.mats,
      b: 0,
      hx: KIND[k].rest.x,
      hz: KIND[k].rest.z,
      hy: TOP_Y + MAT_Y + KIND[k].rad
    };
  });

  const pulse = {
    inkRoller: rl.ink.mats,
    pressRoller: rl.press.mats,
    paper: [stackTopMat],
    sheet: []
  };
  Object.values(pulse).forEach((a) =>
    a.forEach((m) => {
      m.emissive.set('#ffb347');
      m.emissiveIntensity = 0;
    })
  );

  // Floating 3D labels over the table objects & Nghệ nhân Đào Đình Chung
  const labelBox = $('kh-labels');
  const labelDefs = [
    {
      id: 'artisan',
      cls: 'kh-chip artisan',
      text: () => 'Nghệ nhân Đào Đình Chung',
      pos: () => new THREE.Vector3(-0.04, 1.07, -0.74),
      show: () => false
    },
    {
      id: 'inkRoller',
      cls: 'kh-chip',
      text: () => (held === 'ink' ? 'Đặt con lăn về chỗ cũ' : 'Con lăn mực'),
      pos: () => new THREE.Vector3(KIND.ink.rest.x + 0.05, TOP_Y + 0.08, KIND.ink.rest.z),
      show: () => isSeated && step === 'print' && ((rl.ink.b === 0 && held !== 'ink') || held === 'ink')
    },
    {
      id: 'pressRoller',
      cls: 'kh-chip',
      text: () => (held === 'press' ? 'Đặt con lăn về chỗ cũ' : 'Con lăn ép'),
      pos: () => new THREE.Vector3(KIND.press.rest.x + 0.05, TOP_Y + 0.08, KIND.press.rest.z),
      show: () => isSeated && step === 'print' && ((rl.press.b === 0 && held !== 'press') || held === 'press')
    },
    {
      id: 'tray',
      cls: 'kh-chip',
      text: () => 'Khay mực',
      pos: () => new THREE.Vector3(TRAY.x, TOP_Y + 0.08, TRAY.z - 0.02),
      show: () => isSeated && step === 'print'
    },
    {
      id: 'block',
      cls: 'kh-chip',
      text: () => 'Ván khắc',
      pos: () => new THREE.Vector3(BX, BLOCK_TOP + 0.05, BZ - BD / 2 + 0.04),
      show: () => isSeated && step === 'print' && sheetLoc === 'stack'
    },
    {
      id: 'paper',
      cls: 'kh-chip',
      text: () => (ps === 'done' ? 'Bản in (Chạm để tô màu)' : 'Chồng giấy'),
      pos: () => new THREE.Vector3(STK.x, TOP_Y + 0.14, STK.z - 0.02),
      show: () => isSeated && step === 'print' && sheetLoc === 'stack'
    }
  ].map((d) => {
    const el = document.createElement('div');
    el.className = d.cls || 'kh-chip';
    el.style.display = 'none';
    labelBox.appendChild(el);
    return { ...d, el, last: '' };
  });

  const pickRoots = [block, inkPlane, tray, stack, sheet, table, rl.ink.g, rl.press.g, artisanGroup, artisanSheet];
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pointerState = { x: -0.2, z: 0.22, down: false, last: null };
  let animTime = 0;

  function placeSheet(x, y, z, rz) {
    sheet.position.set(x, y, z);
    sheet.rotation.set(0, 0, rz || 0);
  }

  // --- Printing Physics ---
  const inTray = (x, z) =>
    Math.abs(x - TRAY.x) < (TRAY.w - 0.01) / 2 && Math.abs(z - TRAY.z) < (TRAY.d - 0.01) / 2;
  const overBlock = (x, z) => Math.abs(x - BX) < BW / 2 + 0.02 && Math.abs(z - BZ) < BD / 2 + 0.02;

  function footprint(x, z) {
    const K = KIND[held];
    const cx = ((x - BX) / BW + 0.5) * W;
    const cy = ((z - BZ) / BD + 0.5) * H;
    const hx = ((orient ? K.thk : K.len) / 2) * PXM;
    const hy = ((orient ? K.len : K.thk) / 2) * PXM;
    const rx = Math.max(0, Math.floor(cx - hx));
    const ry = Math.max(0, Math.floor(cy - hy));
    const rx2 = Math.min(W, Math.ceil(cx + hx));
    const ry2 = Math.min(H, Math.ceil(cy + hy));
    if (rx2 <= rx || ry2 <= ry) return null;
    return {
      rx,
      ry,
      rw: rx2 - rx,
      rh: ry2 - ry,
      c0: Math.floor(rx / CELL),
      c1: Math.floor((rx2 - 1) / CELL),
      r0: Math.floor(ry / CELL),
      r1: Math.floor((ry2 - 1) / CELL)
    };
  }

  function applyStep(x, z, seg) {
    if (ps === 'ink' && held === 'ink') {
      if (inTray(x, z)) {
        load = Math.min(1, load + 0.0045);
        return;
      }
      if (load < 0.02) return;
      const f = footprint(x, z);
      if (!f) return;
      for (let r = f.r0; r <= f.r1; r++) {
        for (let c = f.c0; c <= f.c1; c++) {
          const i = r * COLS + c;
          if (inMask[i]) inkC[i] = Math.min(1.4, inkC[i] + load / 65);
        }
      }
      bictx.globalAlpha = 0.045 * load;
      bictx.drawImage(maskB, f.rx, f.ry, f.rw, f.rh, f.rx, f.ry, f.rw, f.rh);
      bictx.globalAlpha = 1;
      inkDirty = true;
      load = Math.max(0, load - seg * PXM * 0.00007);
    } else if (ps === 'press' && held === 'press') {
      const f = footprint(x, z);
      if (!f) return;
      for (let r = f.r0; r <= f.r1; r++) {
        for (let c = f.c0; c <= f.c1; c++) {
          const i = r * COLS + c;
          if (inMask[i]) pressC[i] = Math.min(1.4, pressC[i] + 1 / 42);
        }
      }
      gctx.globalAlpha = 0.045;
      gctx.drawImage(blockInk, f.rx, f.ry, f.rw, f.rh, f.rx, f.ry, f.rw, f.rh);
      gctx.globalAlpha = 1;
      ghostDirty = true;
    }
  }

  function stats() {
    let si = 0;
    let sp = 0;
    let sq = 0;
    let wellInked = 0;
    let wellPressed = 0;
    for (const i of maskCells) {
      const a = Math.min(1, inkC[i]);
      const q = Math.min(1, pressC[i]);
      si += a;
      sp += q;
      const m = Math.min(a, q);
      sq += m;
      if (inkC[i] >= 0.85) wellInked++;
      if (m >= 0.85) wellPressed++;
    }
    const n = maskCells.length || 1;
    return {
      ink: Math.min(si / n, wellInked / n),
      press: sp / n,
      q: Math.min(sq / n, wellPressed / n)
    };
  }

  let lastSt = { ink: 0, press: 0, q: 0 };

  function setBar(id, v01, tgt) {
    const p = Math.min(100, Math.round((v01 / tgt) * 100));
    document.querySelectorAll('[data-bar="' + id + '"]').forEach((el) => {
      el.style.width = p + '%';
    });
    const t = $('t-' + id);
    if (t) t.textContent = p + '%';
    return p;
  }

  const hints = {
    ink: 'Bước 1: Chạm vào Con lăn mực trên bàn để cầm lên.',
    inkHeld: 'Nhúng con lăn vào Khay mực, rồi giữ chuột kéo lăn lên Ván khắc.',
    inkSoaking: 'Đang thấm mực đều vào con lăn... Hãy lăn qua lại trong khay thêm chút nữa.',
    inkSoaked: 'Mực đã thấm đều vào con lăn! Hãy lăn đều lên Ván khắc.',
    inkLow: 'Con lăn hết mực rồi. Hãy nhúng lại vào Khay mực.',
    place: 'Ván đã đủ mực! Chạm vào Chồng giấy để đặt một tờ lên ván.',
    placing: 'Đang đặt giấy lên ván khắc...',
    press: 'Bước 3: Chạm vào Con lăn ép để cầm lên.',
    pressHeld: 'Giữ và kéo Con lăn ép lăn kín mặt giấy để mực thấm sang.',
    pressDone: 'Mực đã thấm đều! Chạm vào tờ giấy trên ván để bóc ra và lật lại.',
    peeling: 'Đang bóc giấy khỏi ván và lật lại...',
    done: 'Đã in xong! Chạm vào bức tranh trên bàn (hoặc nút bên phải) để bắt đầu tô màu ngay trên bàn.'
  };

  let mobilePanValue = 0;
  let edgePanDir = 0;
  let lastDragClientX = null;
  let lastHoldClient = null;
  let lastHintKey = '';

  function updateEdgePan(clientX) {
    if (camera.aspect >= 1 || !held || !pointerState.down) {
      edgePanDir = 0;
      return;
    }
    const nx = clientX / Math.max(1, window.innerWidth);
    edgePanDir = nx < 0.24 ? -((0.24 - nx) / 0.24) : nx > 0.76 ? (nx - 0.76) / 0.24 : 0;
  }

  function hintKey() {
    if (ps === 'ink') {
      if (inkReady) return 'place';
      if (held !== 'ink') return 'ink';
      if (inTray(rl.ink.hx, rl.ink.hz) && load < 0.88) return 'inkSoaking';
      if (inkLow) return 'inkLow';
      if (load >= 0.88 && !overBlock(rl.ink.hx, rl.ink.hz)) return 'inkSoaked';
      return 'inkHeld';
    }
    if (ps === 'press') return pressReady ? 'pressDone' : held === 'press' ? 'pressHeld' : 'press';
    return ps;
  }

  function target() {
    if (ps === 'ink') return inkReady ? 'paper' : held === 'ink' ? (inkLow ? 'tray' : null) : 'inkRoller';
    if (ps === 'press') return pressReady ? 'sheet' : held === 'press' ? null : 'pressRoller';
    if (ps === 'done') return 'sheet';
    return null;
  }

  function refreshBars() {
    const st = (lastSt = stats());
    setBar('load', load, 1);
    const pi = setBar('ink', st.ink, INK_T);
    const pq = setBar('q', st.q, Q_T);
    const low = held === 'ink' && load < 0.12 && pi < 100;
    const hk = hintKey();
    if (hk !== lastHintKey) {
      lastHintKey = hk;
      $('hint3d').textContent = hints[hk];
    }
    if (pi >= 100 !== inkReady || pq >= 100 !== pressReady || low !== inkLow) refreshUI();
  }

  function refreshUI() {
    const st = (lastSt = stats());
    setBar('load', load, 1);
    const pi = setBar('ink', st.ink, INK_T);
    const pq = setBar('q', st.q, Q_T);
    inkReady = pi >= 100;
    pressReady = pq >= 100;
    inkLow = held === 'ink' && load < 0.12 && !inkReady;

    const stageOf =
      ps === 'ink'
        ? inkReady
          ? 'place'
          : 'ink'
        : ps === 'placing'
        ? 'place'
        : ps === 'press'
        ? pressReady
          ? 'peel'
          : 'press'
        : 'peel';
    const order = ['ink', 'place', 'press', 'peel'];
    document.querySelectorAll('#flow li').forEach((li) => {
      const idx = order.indexOf(li.dataset.s);
      const cur = order.indexOf(stageOf);
      li.classList.toggle('on', idx === cur && ps !== 'done');
      li.classList.toggle('ok', idx < cur || ps === 'done');
    });

    $('gocolor').classList.toggle('hidden', ps !== 'done');
    $('donebar').classList.toggle('hidden', !isSeated || ps !== 'done');
    lastHintKey = hintKey();
    $('hint3d').textContent = hints[lastHintKey];
  }

  function rollTo(x, z) {
    if (!held || moving || (ps !== 'ink' && ps !== 'press')) return;
    const p = pointerState;
    if (!p.last) {
      p.last = { x, z };
      applyStep(x, z, 0);
      refreshBars();
      return;
    }
    const dx = x - p.last.x;
    const dz = z - p.last.z;
    const dist = Math.hypot(dx, dz);
    const n = Math.max(1, Math.ceil(dist / 0.0025));
    for (let i = 1; i <= n; i++) {
      applyStep(p.last.x + (dx * i) / n, p.last.z + (dz * i) / n, dist / n);
    }
    p.last = { x, z };
    refreshBars();
  }

  let infoTimer = 0;
  function hideInfo() {
    clearTimeout(infoTimer);
    $('kh-info').classList.add('hidden');
  }

  function infoData(key) {
    const pi = Math.round(Math.min(1, lastSt.ink / INK_T) * 100);
    const pq = Math.round(Math.min(1, lastSt.q / Q_T) * 100);
    const paperName = paperType === 'red' ? 'giấy đỏ' : 'giấy dó';
    if (key === 'inkRoller')
      return {
        t: 'Con lăn mực',
        w: 'Con lăn có cán, dùng để quét mực đen thành một lớp mỏng lên mặt ván khắc.',
        u: 'Dùng ở bước 1: nhúng vào khay mực, rồi lăn lên ván. Mực chỉ bám vào phần gỗ nổi.',
        n: ps === 'ink' ? 'Bây giờ: chạm vào con lăn để cầm lên.' : 'Bước này đã xong, ván đã có mực.'
      };
    if (key === 'pressRoller')
      return {
        t: 'Con lăn ép',
        w: 'Con lăn nhẵn, không dính mực, dùng để ép tờ giấy sát xuống mặt ván.',
        u: 'Dùng ở bước 3: lăn lên tờ giấy đã đặt trên ván để mực từ phần nổi thấm sang giấy.',
        n:
          ps === 'press'
            ? 'Bây giờ: chạm vào con lăn để cầm lên.'
            : ps === 'ink'
            ? 'Chưa cần dùng. Hãy tra mực lên ván và đặt giấy lên trước.'
            : 'Bước này đã xong.'
      };
    if (key === 'tray')
      return {
        t: 'Khay mực',
        w: 'Khay đựng mực đen.',
        u: 'Nhúng con lăn mực vào đây mỗi khi con lăn hết mực.',
        n: ps === 'ink' ? 'Cầm con lăn mực, đưa xuống khay rồi rê qua lại để lấy mực.' : 'Bước tra mực đã xong.'
      };
    if (key === 'block')
      return {
        t: 'Ván khắc gỗ',
        w: 'Tấm gỗ khắc hình nổi, hình trên ván là ảnh lật gương của bản in.',
        u: 'Chỉ phần nổi ăn mực. Ép giấy lên ván, nét nổi sẽ in thành nét đen đúng hình.',
        n: ps === 'ink' ? `Bây giờ: lăn mực lên ván, mực đang bám ${pi}%.` : ''
      };
    if (key === 'paper') {
      const o = {
        t: 'Chồng giấy',
        w: `Giấy dùng để in tranh (đang chọn ${paperName}).`,
        u: 'Dùng ở bước 2: lấy một tờ đặt lên ván khi ván đã đủ mực.'
      };
      if (ps === 'ink')
        o.n = inkReady
          ? 'Ván đã đủ mực. Chạm vào giấy để đặt lên.'
          : `Chưa đặt giấy được: mực trên ván mới đạt ${pi}%. Hãy lăn thêm.`;
      else o.n = 'Tờ giấy đã nằm trên ván.';
      return o;
    }
    if (key === 'sheet')
      return {
        t: 'Tờ giấy trên ván',
        w: 'Tờ giấy đang nằm sát mặt ván khắc.',
        u: 'Lăn ép để mực thấm sang, đủ rồi thì chạm vào giấy để bóc ra và lật lại.',
        n: pressReady
          ? 'Mực đã thấm đều. Chạm vào giấy để bóc.'
          : `Chưa bóc được: mực mới thấm ${pq}%. Hãy cầm con lăn ép lăn thêm.`
      };
    if (key === 'artisan')
      return {
        t: 'Nghệ nhân Đào Đình Chung — Nghệ nhân Tranh Kim Hoàng',
        w: 'Nghệ nhân tâm huyết gìn giữ và phục dựng dòng tranh dân gian Kim Hoàng (làng Kim Hoàng, xã Vân Canh, Hoài Đức, Hà Nội) — dòng tranh Tết nổi tiếng in trên nền giấy đỏ điều.',
        u: 'Tranh Kim Hoàng kết hợp nét khắc mộc bản tinh xảo với lối chấm phá màu tự nhiên (vàng hoa hòe, đỏ son, xanh chàm) phóng khoáng của người nghệ nhân.',
        n: 'Lời nhắn của Nghệ nhân: "Mời bạn ngồi xuống chiếu, chọn một ván khắc rồi tự tay lăn mực, in tranh và chấm phá sắc màu cùng tôi nhé!"'
      };
    return null;
  }

  function showInfo(key) {
    const d = infoData(key);
    if (!d) return;
    $('info-t').textContent = d.t;
    $('info-w').textContent = d.w;
    $('info-u').textContent = d.u;
    $('info-n').textContent = d.n || '';
    $('info-n').classList.toggle('hidden', !d.n);
    $('kh-info').classList.remove('hidden');
    clearTimeout(infoTimer);
    infoTimer = setTimeout(hideInfo, 12000);
  }

  async function pickUp(kind) {
    if (held || moving) return;
    moving++;
    hideInfo();
    const rs = rl[kind];
    const K = KIND[kind];
    rs.hx = K.rest.x;
    rs.hz = K.rest.z;
    rs.hy = TOP_Y + MAT_Y + K.rad + 0.03;
    pointerState.x = K.rest.x;
    pointerState.z = K.rest.z - 0.08;
    yawCur = orient ? Math.PI / 2 : 0;
    await tween(0.38, (e) => {
      rs.b = e;
    });
    moving--;
    held = kind;
    pointerState.down = false;
    pointerState.last = null;
    refreshUI();
  }

  async function putDown() {
    if (!held) return;
    const kind = held;
    const rs = rl[kind];
    const b0 = rs.b;
    held = null;
    pointerState.down = false;
    pointerState.last = null;
    moving++;
    refreshUI();
    await tween(0.4, (e) => {
      rs.b = b0 * (1 - e);
    });
    moving--;
    refreshUI();
  }

  async function doPlace() {
    if (ps !== 'ink' || moving) return;
    hideInfo();
    if (held) await putDown();
    ps = 'placing';
    refreshUI();
    const y0 = TOP_Y + STK.h + 0.0008;
    const yUp = y0 + 0.16;
    await tween(0.42, (k) => placeSheet(STK.x, lerp(y0, yUp, k), STK.z, 0.05 * Math.sin(k * Math.PI)));
    await tween(0.7, (k) =>
      placeSheet(
        lerp(STK.x, BX, k),
        yUp + 0.02 * Math.sin(k * Math.PI),
        lerp(STK.z, BZ, k),
        0.04 * Math.sin(k * Math.PI * 2)
      )
    );
    await tween(0.45, (k) => placeSheet(BX, lerp(yUp, BLOCK_TOP + 0.003, k), BZ, 0));
    gctx.clearRect(0, 0, W, H);
    composeSheetTop(false);
    sheetTopTex.needsUpdate = true;
    sheetLoc = 'block';
    ps = 'press';
    refreshUI();
  }

  function buildPrintCanvas() {
    const src = mbctx.getImageData(0, 0, W, H).data;
    const out = ictx.createImageData(W, H);
    const od = out.data;
    const sm = (a, b, v) => {
      const t = clamp((v - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    };
    for (let y = 0; y < H; y++) {
      const row = Math.floor(y / CELL) * COLS;
      for (let x = 0; x < W; x++) {
        const a = src[(y * W + x) * 4 + 3];
        if (!a) continue;
        const c = row + Math.floor(x / CELL);
        const q = Math.min(inkC[c], pressC[c]);
        let f = sm(0.05, 0.9, q);
        if (f < 0.98) {
          const n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          f *= 0.62 + 0.38 * Math.abs(n);
        }
        const px = W - 1 - x;
        const o = (y * W + px) * 4;
        od[o] = 27;
        od[o + 1] = 18;
        od[o + 2] = 16;
        od[o + 3] = Math.round(a * f);
      }
    }
    ictx.clearRect(0, 0, W, H);
    ictx.putImageData(out, 0, 0);
  }

  function updateSheetBotTexture() {
    sbot.setTransform(1, 0, 0, 1, 0, 0);
    sbot.clearRect(0, 0, SPW, SPH);
    sbot.save();
    sbot.translate(SPW, SPH);
    sbot.scale(-1, -1);
    sbot.drawImage(sheetBase, 0, 0);
    sbot.drawImage(color, OFX, OFY);
    sbot.drawImage(ink, OFX, OFY);
    sbot.restore();
    sheetBotTex.needsUpdate = true;
  }

  async function doPeel() {
    if (ps !== 'press' || moving) return;
    hideInfo();
    if (held) await putDown();
    ps = 'peeling';
    refreshUI();
    buildPrintCanvas();
    cctx.clearRect(0, 0, W, H);
    updateSheetBotTexture(false);

    const yRest = BLOCK_TOP + 0.003;
    const yLift = yRest + 0.15;
    const yLand = TOP_Y + STK.h + 0.0016;
    await tween(0.5, (k) => placeSheet(BX, lerp(yRest, yLift, k), BZ, 0.14 * k));
    await tween(1.0, (k) => {
      const arc = Math.sin(k * Math.PI);
      placeSheet(
        lerp(BX, STK.x, k),
        lerp(yLift, yLand, k) + 0.12 * arc,
        lerp(BZ, STK.z, k),
        lerp(0.14, Math.PI, k)
      );
    });
    sheetLoc = 'stack';
    ps = 'done';
    refreshUI();
  }

  function resetPrint() {
    tweens.length = 0;
    moving = 0;
    held = null;
    sheetLoc = 'stack';
    hideInfo();
    ps = 'ink';
    load = 0;
    orient = 0;
    inkC.fill(0);
    pressC.fill(0);
    bictx.clearRect(0, 0, W, H);
    gctx.clearRect(0, 0, W, H);
    ictx.clearRect(0, 0, W, H);
    cctx.clearRect(0, 0, W, H);
    composeSheetTop(false);
    ['ink', 'press'].forEach((k) => {
      rl[k].b = 0;
    });
    pointerState.down = false;
    pointerState.last = null;
    placeSheet(STK.x, TOP_Y + STK.h + 0.0008, STK.z, 0);
    blockInkTex.needsUpdate = true;
    sheetTopTex.needsUpdate = true;
    inkDirty = false;
    ghostDirty = false;
    refreshUI();
  }

  // --- Step 3: Coloring Directly on the 3D Sheet on the Table ---
  const palette = [
    { name: 'Vàng hoa hòe', c: '#f5c518', src: 'Truyền thống lấy từ hoa hòe.' },
    { name: 'Đỏ son', c: '#d8201a', src: 'Truyền thống lấy từ sỏi son tán nhỏ.' },
    { name: 'Xanh chàm', c: '#26498a', src: 'Truyền thống lấy từ lá chàm.' },
    { name: 'Xanh dương', c: '#3a78d0', src: 'Một số tài liệu ghi lấy từ hạt mồng tơi.' },
    { name: 'Đen', c: '#1b1210', src: 'Truyền thống lấy từ tro rơm nếp.' }
  ];
  const toolHelp = {
    brush: 'Giữ chuột và kéo trực tiếp trên tờ tranh trên bàn để tô. Bật "Tô gọn trong nét" để tô nhanh không lem.',
    fill: 'Bấm vào một ô kín trên tờ tranh trên bàn để đổ màu kín cả ô.',
    erase: 'Giữ chuột và kéo trên tờ tranh để xoá màu đã tô. Nét mực đen không bị xoá.'
  };
  const ptr = { x: -999, y: -999, down: false, last: null };
  let tool = 'brush';
  let lockInk = true;
  let brush = 18;
  let paintColor = '#f5c518';
  let regionMap = null;
  let stroke = null;
  let gridBuilt = false;
  const recent = [];
  const undoStack = [];

  // Độ "hàn" khe hở trong nét mực (px trên canvas 600x800). Nét khắc gỗ của nhiều bức bị đứt,
  // khiến thân con vật thông ra nền và màu tô bị loang. Hàn các khe nhỏ để mỗi mảng thành vùng kín
  // như bức Ngựa. Bức có ảnh vùng riêng (Gà) hoặc nét đã khép kín (Ngựa) thì không cần hàn.
  const DEFAULT_REGION_GAP = 6;

  function buildRegions() {
    const d = rctx.getImageData(0, 0, W, H).data;
    const N = W * H;
    const gap =
      sample && sample.regionGap != null ? sample.regionGap : sample && sample.regionImg ? 0 : DEFAULT_REGION_GAP;
    regionMap = new Int32Array(N);
    const ink = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (d[i * 4 + 3] > 90) ink[i] = 1;
    if (gap > 0) {
      // Nở nét mực ra `gap` px (cửa sổ vuông, tách 2 chiều) để bịt các khe hở
      const tmp = new Uint8Array(N);
      for (let y = 0; y < H; y++) {
        const row = y * W;
        let last = -1e9;
        for (let x = 0; x < W; x++) {
          if (ink[row + x]) last = x;
          if (x - last <= gap) tmp[row + x] = 1;
        }
        last = 1e9;
        for (let x = W - 1; x >= 0; x--) {
          if (ink[row + x]) last = x;
          if (last - x <= gap) tmp[row + x] = 1;
        }
      }
      for (let x = 0; x < W; x++) {
        let last = -1e9;
        for (let y = 0; y < H; y++) {
          if (tmp[y * W + x]) last = y;
          if (y - last <= gap) regionMap[y * W + x] = -1;
        }
        last = 1e9;
        for (let y = H - 1; y >= 0; y--) {
          if (tmp[y * W + x]) last = y;
          if (last - y <= gap) regionMap[y * W + x] = -1;
        }
      }
    } else {
      for (let i = 0; i < N; i++) if (ink[i]) regionMap[i] = -1;
    }
    const st = new Int32Array(N);
    let label = 0;
    for (let s = 0; s < N; s++) {
      if (regionMap[s] !== 0) continue;
      label++;
      let sp = 0;
      st[sp++] = s;
      regionMap[s] = label;
      while (sp) {
        const i = st[--sp];
        const x = i % W;
        if (x > 0 && regionMap[i - 1] === 0) {
          regionMap[i - 1] = label;
          st[sp++] = i - 1;
        }
        if (x < W - 1 && regionMap[i + 1] === 0) {
          regionMap[i + 1] = label;
          st[sp++] = i + 1;
        }
        if (i >= W && regionMap[i - W] === 0) {
          regionMap[i - W] = label;
          st[sp++] = i - W;
        }
        if (i < N - W && regionMap[i + W] === 0) {
          regionMap[i + W] = label;
          st[sp++] = i + W;
        }
      }
    }
    if (gap > 0) {
      // Trả lại phần giấy trắng bị nét nở che mất cho vùng gần nhất (lan đồng thời từ mọi vùng,
      // chỉ đi trên giấy trắng, không vượt qua nét mực thật) để màu tô sát mép nét như cũ.
      let frontier = [];
      for (let i = 0; i < N; i++) {
        if (regionMap[i] <= 0) continue;
        const x = i % W;
        if (
          (x > 0 && regionMap[i - 1] < 0 && !ink[i - 1]) ||
          (x < W - 1 && regionMap[i + 1] < 0 && !ink[i + 1]) ||
          (i >= W && regionMap[i - W] < 0 && !ink[i - W]) ||
          (i < N - W && regionMap[i + W] < 0 && !ink[i + W])
        )
          frontier.push(i);
      }
      while (frontier.length) {
        const next = [];
        for (const i of frontier) {
          const l = regionMap[i];
          const x = i % W;
          const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i >= W ? i - W : -1, i < N - W ? i + W : -1];
          for (const j of nb) {
            if (j < 0 || ink[j] || regionMap[j] >= 0) continue;
            regionMap[j] = l;
            next.push(j);
          }
        }
        frontier = next;
      }
      // Khoảng giấy nhỏ bị nét nở bịt kín hoàn toàn: cho thành vùng riêng để vẫn tô được
      for (let s0 = 0; s0 < N; s0++) {
        if (regionMap[s0] >= 0 || ink[s0]) continue;
        label++;
        let sp = 0;
        st[sp++] = s0;
        regionMap[s0] = label;
        while (sp) {
          const i = st[--sp];
          const x = i % W;
          const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i >= W ? i - W : -1, i < N - W ? i + W : -1];
          for (const j of nb) {
            if (j < 0 || ink[j] || regionMap[j] >= 0) continue;
            regionMap[j] = label;
            st[sp++] = j;
          }
        }
      }
    }
  }

  function labelAt(px, py) {
    const cx = Math.round(px);
    const cy = Math.round(py);
    for (let r = 0; r <= 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const l = regionMap[y * W + x];
          if (l > 0) return l;
        }
      }
    }
    return 0;
  }

  function regionMaskFor(label) {
    const m = mk();
    const x = m.getContext('2d');
    const img = x.createImageData(W, H);
    const dd = img.data;
    for (let i = 0, N = W * H; i < N; i++) if (regionMap[i] === label) dd[i * 4 + 3] = 255;
    x.putImageData(img, 0, 0);
    const t = mk();
    t.getContext('2d').drawImage(m, 0, 0);
    [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
      [-2, -2],
      [2, 2],
      [-2, 2],
      [2, -2]
    ].forEach(([dx, dy]) => x.drawImage(t, dx, dy));
    return m;
  }

  function pushUndo() {
    const s = mk();
    s.getContext('2d').drawImage(color, 0, 0);
    undoStack.push(s);
    if (undoStack.length > 20) undoStack.shift();
    return s;
  }

  function undo() {
    const s = undoStack.pop();
    if (!s) return;
    cctx.clearRect(0, 0, W, H);
    cctx.drawImage(s, 0, 0);
    updateSheetBotTexture(true);
  }

  function bristle(ctx, a, b, col, size) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = col;
    for (let k = 0; k < 3; k++) {
      const j = (k - 1) * size * 0.18;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = size * (0.75 + Math.random() * 0.25);
      ctx.beginPath();
      ctx.moveTo(a.x + j, a.y - j);
      ctx.lineTo(b.x + j, b.y - j);
      ctx.stroke();
    }
    ctx.restore();
  }

  function applyLocked() {
    const m = stroke.mtx;
    m.save();
    m.globalCompositeOperation = 'copy';
    m.drawImage(stroke.tmp, 0, 0);
    m.globalCompositeOperation = 'destination-in';
    m.drawImage(stroke.mask, 0, 0);
    m.restore();
    cctx.save();
    cctx.globalCompositeOperation = 'copy';
    cctx.drawImage(stroke.snap, 0, 0);
    cctx.globalCompositeOperation = 'source-over';
    cctx.drawImage(stroke.mtmp, 0, 0);
    cctx.restore();
  }

  function paintSeg(a, b) {
    if (tool === 'erase') {
      cctx.save();
      cctx.globalCompositeOperation = 'destination-out';
      cctx.globalAlpha = 1;
      cctx.strokeStyle = '#000';
      cctx.lineCap = 'round';
      cctx.lineWidth = brush;
      cctx.beginPath();
      cctx.moveTo(a.x, a.y);
      cctx.lineTo(b.x, b.y);
      cctx.stroke();
      cctx.restore();
      return;
    }
    if (stroke) {
      bristle(stroke.tctx, a, b, paintColor, brush);
      applyLocked();
      return;
    }
    bristle(cctx, a, b, paintColor, brush);
  }

  function beginLocked(p) {
    const l = labelAt(p.x, p.y);
    if (!l) return false;
    const snap = pushUndo();
    const tmp = mk();
    const mtmp = mk();
    stroke = {
      snap,
      tmp,
      mtmp,
      tctx: tmp.getContext('2d'),
      mtx: mtmp.getContext('2d'),
      mask: regionMaskFor(l)
    };
    addRecent(paintColor);
    return true;
  }

  function fillAt(p) {
    const l = labelAt(p.x, p.y);
    if (!l) return;
    pushUndo();
    addRecent(paintColor);
    const m = regionMaskFor(l);
    const t = mk();
    const x = t.getContext('2d');
    cctx.save();
    cctx.globalCompositeOperation = 'destination-out';
    cctx.drawImage(m, 0, 0);
    cctx.restore();
    x.fillStyle = paintColor;
    x.globalAlpha = 0.93;
    x.fillRect(0, 0, W, H);
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(m, 0, 0);
    cctx.drawImage(t, 0, 0);
  }

  function startColor(p) {
    if (tool === 'fill') {
      fillAt(p);
      updateSheetBotTexture(true);
      return;
    }
    ptr.last = p;
    if (tool === 'erase') {
      pushUndo();
      cctx.save();
      cctx.globalCompositeOperation = 'destination-out';
      cctx.beginPath();
      cctx.arc(p.x, p.y, brush / 2, 0, Math.PI * 2);
      cctx.fill();
      cctx.restore();
      updateSheetBotTexture(true);
      return;
    }
    if (lockInk) {
      if (beginLocked(p)) {
        paintSeg(p, { x: p.x + 0.01, y: p.y });
        updateSheetBotTexture(true);
      }
      return;
    }
    pushUndo();
    addRecent(paintColor);
    paintSeg(p, { x: p.x + 0.01, y: p.y });
    updateSheetBotTexture(true);
  }

  function moveColor(p) {
    if (tool === 'fill') return;
    if (!ptr.last) ptr.last = p;
    if (tool === 'erase') {
      cctx.save();
      cctx.globalCompositeOperation = 'destination-out';
      cctx.lineCap = 'round';
      cctx.lineWidth = brush;
      cctx.beginPath();
      cctx.moveTo(ptr.last.x, ptr.last.y);
      cctx.lineTo(p.x, p.y);
      cctx.stroke();
      cctx.restore();
      ptr.last = p;
      updateSheetBotTexture(true);
      return;
    }
    if (tool === 'brush' && lockInk && !stroke) {
      if (!beginLocked(p)) {
        ptr.last = p;
        return;
      }
    }
    paintSeg(ptr.last, p);
    ptr.last = p;
    updateSheetBotTexture(true);
  }

  function drawToolCursor(vctx) {
    const { x, y } = ptr;
    if (x < -900) return;
    vctx.save();
    if (tool !== 'fill') {
      const r = brush / 2;
      vctx.lineWidth = 2;
      vctx.strokeStyle = tool === 'erase' ? '#fff' : paintColor;
      vctx.beginPath();
      vctx.arc(x, y, r, 0, Math.PI * 2);
      vctx.stroke();
      vctx.lineWidth = 1;
      vctx.strokeStyle = 'rgba(0,0,0,0.55)';
      vctx.beginPath();
      vctx.arc(x, y, r + 2, 0, Math.PI * 2);
      vctx.stroke();
    }
    vctx.translate(x, y);
    vctx.rotate(0.62);
    vctx.lineJoin = 'round';
    vctx.lineWidth = 2;
    vctx.strokeStyle = '#2a140a';
    vctx.shadowColor = 'rgba(0,0,0,0.35)';
    vctx.shadowBlur = 6;
    vctx.shadowOffsetY = 3;
    if (tool === 'brush') {
      const hg = vctx.createLinearGradient(-8, 0, 8, 0);
      hg.addColorStop(0, '#6b3f1d');
      hg.addColorStop(0.5, '#c28848');
      hg.addColorStop(1, '#6b3f1d');
      vctx.fillStyle = hg;
      vctx.beginPath();
      vctx.moveTo(-7, -66);
      vctx.lineTo(7, -66);
      vctx.lineTo(5, -190);
      vctx.quadraticCurveTo(0, -198, -5, -190);
      vctx.closePath();
      vctx.fill();
      vctx.stroke();
      vctx.fillStyle = '#cfd3d8';
      vctx.beginPath();
      vctx.rect(-9, -66, 18, 26);
      vctx.fill();
      vctx.stroke();
      vctx.fillStyle = paintColor;
      vctx.beginPath();
      vctx.moveTo(0, 0);
      vctx.bezierCurveTo(-11, -8, -10, -30, -8, -40);
      vctx.lineTo(8, -40);
      vctx.bezierCurveTo(10, -30, 11, -8, 0, 0);
      vctx.closePath();
      vctx.fill();
      vctx.stroke();
    } else if (tool === 'erase') {
      vctx.fillStyle = '#f2b3c1';
      vctx.beginPath();
      vctx.rect(-15, -46, 30, 46);
      vctx.fill();
      vctx.stroke();
      vctx.fillStyle = '#ffffff';
      vctx.beginPath();
      vctx.rect(-15, -46, 30, 14);
      vctx.fill();
      vctx.stroke();
    } else {
      vctx.fillStyle = paintColor;
      vctx.strokeStyle = '#fff';
      vctx.lineWidth = 3;
      vctx.beginPath();
      vctx.arc(0, -16, 14, 0, Math.PI * 2);
      vctx.fill();
      vctx.stroke();
      vctx.beginPath();
      vctx.moveTo(-9, -24);
      vctx.lineTo(0, -48);
      vctx.lineTo(9, -24);
      vctx.closePath();
      vctx.fill();
      vctx.stroke();
    }
    vctx.restore();
  }

  const brushCursorEl = $('kh-brush-cursor');
  const brushCursorCtx = brushCursorEl ? brushCursorEl.getContext('2d') : null;

  function update2DBrushCursor(clientX, clientY, visible) {
    if (!brushCursorEl || !brushCursorCtx) return;
    if (!visible || !isSeated || step !== 'color') {
      brushCursorEl.classList.add('hidden');
      return;
    }
    brushCursorEl.classList.remove('hidden');
    brushCursorEl.style.transform = `translate3d(${clientX - 24}px, ${clientY - 24}px, 0)`;

    const c = brushCursorCtx;
    c.clearRect(0, 0, 120, 120);
    c.save();
    c.translate(24, 24);

    if (tool !== 'fill') {
      const r = Math.max(3, brush * 0.36);
      c.lineWidth = 2;
      c.strokeStyle = tool === 'erase' ? '#fff' : paintColor;
      c.beginPath();
      c.arc(0, 0, r, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 1;
      c.strokeStyle = 'rgba(0,0,0,0.65)';
      c.beginPath();
      c.arc(0, 0, r + 1.5, 0, Math.PI * 2);
      c.stroke();
    }

    c.rotate(0.58);
    c.lineJoin = 'round';
    c.lineWidth = 1.6;
    c.strokeStyle = '#2a140a';
    c.shadowColor = 'rgba(0,0,0,0.4)';
    c.shadowBlur = 4;
    c.shadowOffsetY = 2;

    if (tool === 'brush') {
      c.fillStyle = '#9e6630';
      c.beginPath();
      c.moveTo(-4, -26);
      c.lineTo(4, -26);
      c.lineTo(3, -78);
      c.quadraticCurveTo(0, -83, -3, -78);
      c.closePath();
      c.fill();
      c.stroke();

      c.fillStyle = '#cfd3d8';
      c.beginPath();
      c.rect(-5, -26, 10, 11);
      c.fill();
      c.stroke();

      c.fillStyle = paintColor;
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-6, -4, -5.5, -12, -4.5, -16);
      c.lineTo(4.5, -16);
      c.bezierCurveTo(5.5, -12, 6, -4, 0, 0);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (tool === 'erase') {
      c.fillStyle = '#f2b3c1';
      c.beginPath();
      c.rect(-8, -24, 16, 24);
      c.fill();
      c.stroke();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.rect(-8, -24, 16, 8);
      c.fill();
      c.stroke();
    } else {
      c.fillStyle = paintColor;
      c.strokeStyle = '#fff';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, -8, 8, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-5, -12);
      c.lineTo(0, -25);
      c.lineTo(5, -12);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  function setColor(hex, name, note) {
    paintColor = hex.toLowerCase();
    $('dot').style.background = paintColor;
    $('cname').textContent = name;
    $('cnote').textContent = note || '';
    $('picker').value = paintColor;
    document
      .querySelectorAll('[data-c]')
      .forEach((el) => el.classList.toggle('on', el.dataset.c.toLowerCase() === paintColor));
    if (tool === 'erase') setTool('brush');
  }

  function setTool(t) {
    tool = t;
    document.querySelectorAll('#tools .tool').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    $('lockrow').classList.toggle('hidden', t !== 'brush');
    $('sizerow').classList.toggle('hidden', t === 'fill');
    $('toolhelp').textContent = toolHelp[t];
  }

  function addRecent(hex) {
    const i = recent.indexOf(hex);
    if (i >= 0) recent.splice(i, 1);
    recent.unshift(hex);
    if (recent.length > 10) recent.pop();
    const box = $('recent');
    box.innerHTML = '';
    recent.forEach((c) => {
      const e = document.createElement('i');
      e.style.background = c;
      e.dataset.c = c;
      e.title = c.toUpperCase();
      e.onclick = () => setColor(c, 'Màu vừa dùng', '');
      box.appendChild(e);
    });
    document
      .querySelectorAll('[data-c]')
      .forEach((el) => el.classList.toggle('on', el.dataset.c.toLowerCase() === paintColor));
  }

  function renderSwatches() {
    const box = $('swatches');
    box.innerHTML = '';
    palette.forEach((p) => {
      const d = document.createElement('div');
      d.className = 'sw';
      d.style.background = p.c;
      d.dataset.c = p.c;
      d.title = p.name;
      d.onclick = () => setColor(p.c, p.name, p.src);
      box.appendChild(d);
    });
  }

  function buildGrid() {
    if (gridBuilt) return;
    gridBuilt = true;
    const g = $('grid');
    g.innerHTML = '';
    const add = (hex) => {
      const e = document.createElement('i');
      e.style.background = hex;
      e.dataset.c = hex;
      e.title = hex.toUpperCase();
      e.onclick = () => setColor(hex, 'Màu ' + hex.toUpperCase(), '');
      g.appendChild(e);
    };
    [26, 38, 50, 62, 74, 86].forEach((l) => {
      for (let hh = 0; hh < 360; hh += 30) add(hslToHex(hh, 78, l));
    });
    for (let i = 0; i < 12; i++) add(hslToHex(0, 0, Math.round((i * 100) / 11)));
  }

  async function enterColor() {
    if (held) await putDown();
    hideInfo();
    colorPanX = 0;
    colorPanZ = 0;
    setColorZoom(1);
    buildRegions();
    stroke = null;
    undoStack.length = 0;
    cctx.clearRect(0, 0, W, H);
    renderSwatches();
    buildGrid();
    setTool('brush');
    setColor(palette[0].c, palette[0].name, palette[0].src);
    setStep('color');
    // Slide the printed sheet to the middle of the bamboo table for comfortable 3D coloring
    await tween(0.55, (k) => {
      placeSheet(
        lerp(STK.x, 0.0, k),
        BLOCK_TOP + 0.004 + 0.06 * Math.sin(k * Math.PI),
        lerp(STK.z, 0.05, k),
        Math.PI
      );
    });
    updateSheetBotTexture(false);
  }

  // --- Step Management ---
  const panels = ['pick', 'print', 'color', 'done'];
  function setStep(s) {
    step = s;
    panels.forEach((p) => $('p-' + p).classList.toggle('hidden', p !== s));
    $('hint3d').classList.toggle('hidden', !isSeated || s !== 'print');
    $('kh-print-hud').classList.toggle('hidden', !isSeated || s !== 'print');
    $('kh-color-zoombar').classList.toggle('hidden', !isSeated || s !== 'color');
    if (!isSeated || s !== 'color') {
      colorPanMode = false;
      const cpt = $('cpan-toggle');
      if (cpt) cpt.classList.remove('on');
    }
    if (s !== 'color') {
      update2DBrushCursor(0, 0, false);
    }
    if (s === 'done') {
      ptr.x = -999;
      ptr.y = -999;
      updateSheetBotTexture(false);
    }
  }

  function startPrint(s) {
    sample = s;
    mctx.clearRect(0, 0, W, H);
    drawSample(mctx, s);
    rctx.clearRect(0, 0, W, H);
    if (s.regionImg) rctx.drawImage(s.regionImg, 0, 0, W, H);
    else drawSample(rctx, s);

    $('blockfig').classList.toggle('hidden', !s.block);
    if (s.block) $('blockimg').src = s.block;

    composeSheetBase();
    stop.clearRect(0, 0, SPW, SPH);
    setupBlockData();
    resetPrint();
    edgeMat.color.set(paperType === 'red' ? '#d8b0a0' : '#e6dcc4');
    blockColorTex.needsUpdate = true;
    blockBumpTex.needsUpdate = true;
    stackTex.needsUpdate = true;
    setStep('print');
  }

  const paperNotes = {
    red: 'Tranh Kim Hoàng truyền thống in trên giấy đỏ (hồng điều), nên còn gọi là "tranh đỏ".',
    do: 'Giấy dó là loại giấy của tranh Hàng Trống và tranh Đông Hồ. Bạn có thể chọn để thử, dù tranh Kim Hoàng xưa in trên giấy đỏ.'
  };

  function setPaper(t) {
    paperType = t;
    buildPaper();
    composeSheetBase();
    composeSheetTop(false);
    edgeMat.color.set(paperType === 'red' ? '#d8b0a0' : '#e6dcc4');
    stackTex.needsUpdate = true;
    sheetTopTex.needsUpdate = true;
    document.documentElement.style.setProperty('--paperc', t === 'red' ? '#c33a24' : '#e5d9bd');
  }

  function buildCards() {
    const box = $('cards');
    box.innerHTML = '';
    samples.forEach((s) => {
      const b = document.createElement('button');
      b.className = 'kh-card';
      const c = document.createElement('canvas');
      c.width = 150;
      c.height = 200;
      const x = c.getContext('2d');
      x.scale(c.width / W, c.height / H);
      drawSample(x, s);
      b.appendChild(c);
      b.appendChild(document.createTextNode(s.name));
      b.onclick = () => startPrint(s);
      box.appendChild(b);
    });
  }

  // --- Raycasting & Pointer Events on the 3D Table in Seated Mode ---
  function rayFromEvent(e) {
    const r = domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  }

  function pickTableCoords(e) {
    rayFromEvent(e);
    // Intersect horizontal plane at table height in world space
    const worldTableTop = new THREE.Vector3(0, TOP_Y + 0.04, 0);
    root.localToWorld(worldTableTop);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -worldTableTop.y);
    const hitWorld = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, hitWorld)) return null;
    const hitLocal = root.worldToLocal(hitWorld.clone());
    return {
      x: clamp(hitLocal.x, -0.54, 0.54),
      z: clamp(hitLocal.z, -0.45, 0.48)
    };
  }

  function itemOf(o) {
    while (o) {
      if (o.userData && o.userData.item) return o.userData.item;
      o = o.parent;
    }
    return null;
  }

  function pickTableItem(e) {
    rayFromEvent(e);
    const hits = ray.intersectObjects(pickRoots, true);
    for (const h of hits) {
      let it = itemOf(h.object);
      if (!it) continue;
      if (held && it === KIND[held].item) continue;
      if (it === 'stackObj') it = 'paper';
      if (it === 'sheetObj') it = sheetLoc === 'block' ? 'sheet' : 'paper';
      return it;
    }
    return null;
  }

  function pickSheetPaintCoords(e) {
    rayFromEvent(e);
    const hits = ray.intersectObject(sBot, false);
    if (!hits.length || !hits[0].uv) return null;
    // Use exact raycast UV on sBot so mouse X (left/right) and Y (up/down) match 1:1 with the painting canvas
    const uv = hits[0].uv;
    const sx = (1 - uv.x) * SPW - OFX;
    const sy = uv.y * SPH - OFY;
    if (sx < 0 || sx > W || sy < 0 || sy > H) return null;
    return { x: sx, y: sy };
  }

  let tdown = null;

  domElement.addEventListener('pointerdown', (e) => {
    if (!isSeated || (e.pointerType === 'mouse' && e.button !== 0)) return;
    tdown = { x: e.clientX, y: e.clientY, moved: false };
    lastDragClientX = step === 'print' && !held && camera.aspect < 1 ? e.clientX : null;

    if (step === 'print' && held && !moving) {
      const q = pickTableCoords(e);
      pointerState.down = true;
      pointerState.last = null;
      lastHoldClient = { clientX: e.clientX, clientY: e.clientY };
      updateEdgePan(e.clientX);
      if (q) {
        pointerState.x = q.x;
        pointerState.z = q.z;
        rollTo(q.x, q.z);
      }
    } else if (step === 'color') {
      if (colorPanMode) {
        colorPanDrag = { x: e.clientX, y: e.clientY };
        return;
      }
      const p = pickSheetPaintCoords(e);
      if (p) {
        ptr.x = p.x;
        ptr.y = p.y;
        ptr.down = true;
        ptr.last = null;
        if (e.pointerType !== 'touch') {
          update2DBrushCursor(e.clientX, e.clientY, true);
        }
        startColor(p);
      }
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isSeated) return;
    if (tdown && Math.hypot(e.clientX - tdown.x, e.clientY - tdown.y) > 8) {
      tdown.moved = true;
    }

    if (step === 'print') {
      if (held && !moving) {
        if (pointerState.down) {
          lastHoldClient = { clientX: e.clientX, clientY: e.clientY };
          updateEdgePan(e.clientX);
        }
        const q = pickTableCoords(e);
        if (!q) return;
        pointerState.x = q.x;
        pointerState.z = q.z;
        // Roll smoothly whether holding down the mouse button OR moving the held roller directly over the tray/block
        const activeZone =
          (held === 'ink' && (inTray(q.x, q.z) || (load > 0.02 && overBlock(q.x, q.z)))) ||
          (held === 'press' && overBlock(q.x, q.z));
        if (pointerState.down || activeZone) {
          rollTo(q.x, q.z);
        } else {
          pointerState.last = null;
        }
      } else if (!held && tdown && lastDragClientX !== null && camera.aspect < 1) {
        const dx = e.clientX - lastDragClientX;
        lastDragClientX = e.clientX;
        mobilePanValue = clamp(mobilePanValue - dx / Math.max(180, window.innerWidth * 0.55), -1, 1);
      } else if (!tdown) {
        const it = pickTableItem(e);
        domElement.style.cursor = it && it !== 'table' ? 'pointer' : 'default';
      }
    } else if (step === 'color') {
      if (colorPanMode) {
        update2DBrushCursor(0, 0, false);
        domElement.style.cursor = colorPanDrag ? 'grabbing' : 'grab';
        if (colorPanDrag) {
          const panScale = 0.095 / Math.max(1, colorZoom);
          colorPanX -= (e.clientX - colorPanDrag.x) * panScale;
          colorPanZ -= (e.clientY - colorPanDrag.y) * panScale;
          clampColorPan();
          colorPanDrag = { x: e.clientX, y: e.clientY };
        }
        return;
      }
      const p = pickSheetPaintCoords(e);
      if (p) {
        ptr.x = p.x;
        ptr.y = p.y;
        domElement.style.cursor = e.pointerType === 'touch' ? 'default' : 'none';
        if (e.pointerType !== 'touch') {
          update2DBrushCursor(e.clientX, e.clientY, true);
        } else {
          update2DBrushCursor(0, 0, false);
        }
        if (ptr.down) moveColor(p);
      } else {
        ptr.x = -999;
        ptr.y = -999;
        domElement.style.cursor = 'default';
        update2DBrushCursor(e.clientX, e.clientY, false);
      }
    }
  });

  const finishPointer = (e, cancelled) => {
    edgePanDir = 0;
    lastDragClientX = null;
    lastHoldClient = null;
    colorPanDrag = null;
    if (!isSeated) return;
    const d = tdown;
    tdown = null;
    pointerState.down = false;
    pointerState.last = null;
    ptr.down = false;
    ptr.last = null;
    stroke = null;
    if (!d || cancelled) return;

    if (step === 'print') {
      if (!d.moved) {
        if (moving || ps === 'placing' || ps === 'peeling') return;
        if (held) {
          const q = pickTableCoords(e);
          const K = KIND[held];
          if (q && q.x >= K.rest.x - 0.08 && q.x <= K.rest.x + 0.33 && Math.abs(q.z - K.rest.z) <= 0.11) {
            putDown();
            return;
          }
        }
        const it = pickTableItem(e);
        if (!it || it === 'table') {
          hideInfo();
          return;
        }
        if (it === 'inkRoller' || it === 'pressRoller') {
          const kind = it === 'inkRoller' ? 'ink' : 'press';
          if (!held && ps === (kind === 'ink' ? 'ink' : 'press')) pickUp(kind);
          else if (held === kind) putDown();
          else showInfo(it);
          return;
        }
        if (it === 'paper') {
          if (ps === 'ink') doPlace();
          else if (ps === 'done') enterColor();
          else showInfo('paper');
          return;
        }
        if (it === 'sheet') {
          if (ps === 'press') doPeel();
          else showInfo('sheet');
          return;
        }
        showInfo(it);
      }
    }
  };

  let colorZoom = 1;
  let colorPanX = 0;
  let colorPanZ = 0;
  let colorPanMode = false;
  let colorPanDrag = null;
  let pinchState = null;

  function clampColorPan() {
    const maxPanX = Math.max(0, (colorZoom - 1) * 18);
    const maxPanZ = Math.max(0, (colorZoom - 1) * 24);
    colorPanX = clamp(colorPanX, -maxPanX, maxPanX);
    colorPanZ = clamp(colorPanZ, -maxPanZ, maxPanZ);
  }

  function setColorZoom(nextZoom) {
    colorZoom = clamp(nextZoom, 1, 3.2);
    clampColorPan();
    const rst = $('czoom-reset');
    if (rst) rst.textContent = Math.round(colorZoom * 100) + '%';
  }

  domElement.addEventListener(
    'wheel',
    (e) => {
      if (!isSeated || step !== 'color') return;
      e.preventDefault();
      setColorZoom(colorZoom - e.deltaY * 0.0015);
    },
    { passive: false }
  );

  domElement.addEventListener(
    'touchstart',
    (e) => {
      if (!isSeated || step !== 'color' || e.touches.length !== 2) return;
      e.preventDefault();
      // Cancel any 1-finger brush stroke when starting a 2-finger pinch/pan
      ptr.down = false;
      ptr.last = null;
      stroke = null;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      pinchState = {
        dist: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY),
        mx: (t0.clientX + t1.clientX) * 0.5,
        my: (t0.clientY + t1.clientY) * 0.5
      };
    },
    { passive: false }
  );

  domElement.addEventListener(
    'touchmove',
    (e) => {
      if (!isSeated || step !== 'color' || e.touches.length !== 2 || !pinchState) return;
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const mx = (t0.clientX + t1.clientX) * 0.5;
      const my = (t0.clientY + t1.clientY) * 0.5;
      if (pinchState.dist > 10) {
        setColorZoom(colorZoom * (dist / pinchState.dist));
      }
      const panScale = 0.085 / Math.max(1, colorZoom);
      colorPanX -= (mx - pinchState.mx) * panScale;
      colorPanZ -= (my - pinchState.my) * panScale;
      clampColorPan();
      pinchState = { dist, mx, my };
    },
    { passive: false }
  );

  domElement.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchState = null;
  });

  window.addEventListener('pointerup', (e) => finishPointer(e, false));
  window.addEventListener('pointercancel', (e) => finishPointer(e, true));

  // --- Bind UI Controls ---
  $('reprint').onclick = () => resetPrint();
  $('reprint2').onclick = () => resetPrint();
  $('gocolor').onclick = () => enterColor();
  $('gocolor2').onclick = () => enterColor();
  $('infox').onclick = hideInfo;

  document.querySelectorAll('#tools .tool').forEach((b) => {
    b.onclick = () => {
      colorPanMode = false;
      const cpt = $('cpan-toggle');
      if (cpt) cpt.classList.remove('on');
      setTool(b.dataset.t);
    };
  });
  $('lock').onchange = (e) => {
    lockInk = e.target.checked;
  };
  $('size').oninput = (e) => {
    brush = +e.target.value;
    $('sizev').textContent = brush;
  };
  $('picker').oninput = (e) => setColor(e.target.value, 'Màu tự chọn ' + e.target.value.toUpperCase(), '');
  $('undo').onclick = undo;
  $('clearc').onclick = () => {
    pushUndo();
    cctx.clearRect(0, 0, W, H);
    updateSheetBotTexture(true);
  };

  const sigPad = $('sig-pad');
  const sigNameInput = $('sig-name');
  const sigClearBtn = $('sig-clear');
  const sigCtx = sigPad ? sigPad.getContext('2d') : null;
  let hasSigStroke = false;
  let sigDrawing = false;

  if (sigPad && sigCtx) {
    sigCtx.strokeStyle = '#1b110c';
    sigCtx.lineWidth = 4.2;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';

    const getSigPt = (e) => {
      const r = sigPad.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * sigPad.width,
        y: ((e.clientY - r.top) / r.height) * sigPad.height
      };
    };

    sigPad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sigPad.setPointerCapture(e.pointerId);
      sigDrawing = true;
      const p = getSigPt(e);
      sigCtx.beginPath();
      sigCtx.moveTo(p.x, p.y);
      hasSigStroke = true;
    });
    sigPad.addEventListener('pointermove', (e) => {
      if (!sigDrawing) return;
      const p = getSigPt(e);
      sigCtx.lineTo(p.x, p.y);
      sigCtx.stroke();
    });
    const endSig = () => {
      sigDrawing = false;
    };
    sigPad.addEventListener('pointerup', endSig);
    sigPad.addEventListener('pointercancel', endSig);
  }

  function clearSignature() {
    hasSigStroke = false;
    if (sigCtx && sigPad) sigCtx.clearRect(0, 0, sigPad.width, sigPad.height);
    if (sigNameInput) sigNameInput.value = '';
  }

  if (sigClearBtn) sigClearBtn.onclick = clearSignature;

  function drawSignatureOverlay(x) {
    const sigName = sigNameInput ? sigNameInput.value.trim() : '';
    if (!hasSigStroke && !sigName) return;

    x.save();
    const padRight = Math.round(W * 0.045);
    const padBottom = Math.round(H * 0.04);
    let cursorY = H - padBottom;

    // Traditional small red artist seal stamp (ấn triện) at bottom-right
    const sealSize = Math.max(22, Math.round(W * 0.042));
    const sealX = W - padRight - sealSize;
    const sealY = cursorY - sealSize;
    x.fillStyle = 'rgba(168, 28, 18, 0.9)';
    x.fillRect(sealX, sealY, sealSize, sealSize);
    x.strokeStyle = '#f5d790';
    x.lineWidth = 1.5;
    x.strokeRect(sealX + 2, sealY + 2, sealSize - 4, sealSize - 4);
    x.fillStyle = '#f9e7be';
    x.font = `700 ${Math.round(sealSize * 0.52)}px Georgia, serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('印', sealX + sealSize / 2, sealY + sealSize / 2 + 1);

    if (sigName) {
      const fontSize = Math.max(18, Math.round(W * 0.032));
      x.font = `italic 700 ${fontSize}px "Playfair Display", Georgia, serif`;
      x.textAlign = 'right';
      x.textBaseline = 'alphabetic';
      x.fillStyle = 'rgba(255, 240, 210, 0.45)';
      x.fillText(sigName, sealX - 10 + 1, cursorY - 4 + 1);
      x.fillStyle = '#1b110c';
      x.fillText(sigName, sealX - 10, cursorY - 4);
      cursorY -= fontSize + 6;
    }

    if (hasSigStroke && sigPad) {
      const drawW = Math.round(W * 0.22);
      const drawH = Math.round(drawW * (sigPad.height / sigPad.width));
      const drawX = (sigName ? sealX - 10 : sealX - 8) - drawW;
      const drawY = cursorY - drawH;
      x.drawImage(sigPad, drawX, drawY, drawW, drawH);
    }
    x.restore();
  }

  function composeFinal(targetCanvas) {
    const x = targetCanvas.getContext('2d');
    x.drawImage(paper, 0, 0);
    x.drawImage(color, 0, 0);
    x.drawImage(ink, 0, 0);
    drawSignatureOverlay(x);
  }

  $('finish').onclick = () => setStep('done');
  $('backcolor').onclick = () => setStep('color');
  $('cpan-toggle').onclick = () => {
    colorPanMode = !colorPanMode;
    $('cpan-toggle').classList.toggle('on', colorPanMode);
  };
  $('czoom-in').onclick = () => setColorZoom(colorZoom + 0.45);
  $('czoom-out').onclick = () => setColorZoom(colorZoom - 0.45);
  $('czoom-reset').onclick = () => {
    colorPanX = 0;
    colorPanZ = 0;
    setColorZoom(1);
  };
  $('save').onclick = () => {
    const out = mk();
    composeFinal(out);
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'tranh-kim-hoang-cua-toi.png';
    a.click();
  };
  $('hang').onclick = async () => {
    const out = mk();
    composeFinal(out);
    const sigName = sigNameInput ? sigNameInput.value.trim() : '';
    const hangBtn = $('hang');
    if (hangBtn) hangBtn.disabled = true;
    $('hangmsg').textContent = 'Đang đóng khung và treo tranh...';
    let res = null;
    if (onHangPainting) {
      res = await onHangPainting(out, sigName);
    }
    if (hangBtn) hangBtn.disabled = false;
    $('hangmsg').textContent = res && res.uploadedToR2
      ? 'Đã đóng khung và treo bức tranh của bạn lên bức tường chữ LƯU SẮC KIM HOÀNG! Hãy đứng dậy quay lại ngắm nhé.'
      : 'Đã đóng khung và treo bức tranh có chữ ký của bạn lên bức tường chữ LƯU SẮC KIM HOÀNG! Hãy đứng dậy để ngắm.';
  };
  $('again').onclick = () => {
    $('hangmsg').textContent = '';
    clearSignature();
    setStep('pick');
  };

  const sheetToggleBtn = $('kh-sheet-toggle');
  const sidebarEl = $('kh-sidebar');
  if (sheetToggleBtn && sidebarEl) {
    sheetToggleBtn.onclick = () => {
      const collapsed = sidebarEl.classList.toggle('is-collapsed');
      document.body.classList.toggle('kh-sheet-collapsed', collapsed);
      sheetToggleBtn.textContent = collapsed ? 'Mở bảng' : 'Thu gọn';
      sheetToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    };
  }

  window.addEventListener('keydown', (e) => {
    if (!isSeated) return;
    if (step === 'print' && (e.key === 'r' || e.key === 'R')) {
      orient = orient ? 0 : 1;
      yawCur = orient ? Math.PI / 2 : 0;
    }
    if (step === 'color' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
    }
  });

  // --- Animation Update Called Every Frame ---
  function poseRoller(kind) {
    const rs = rl[kind];
    const K = KIND[kind];
    const g = rs.g;
    const p = pointerState;
    const isHeld = held === kind;
    const activeRollZone =
      isHeld &&
      (p.down ||
        (kind === 'ink' && (inTray(p.x, p.z) || (load > 0.02 && overBlock(p.x, p.z)))) ||
        (kind === 'press' && overBlock(p.x, p.z)));
    if (isHeld && rs.b >= 1) {
      const k = 0.85;
      rs.hx = lerp(rs.hx, p.x, k);
      rs.hz = lerp(rs.hz, p.z, k);
    }
    let surf = TOP_Y + MAT_Y;
    if (inTray(rs.hx, rs.hz)) surf = TOP_Y + 0.0315;
    else if (overBlock(rs.hx, rs.hz)) surf = BLOCK_TOP + (ps === 'press' ? 0.0016 : 0);
    rs.hy = lerp(rs.hy, surf + K.rad + (activeRollZone ? 0 : 0.032), 0.45);
    const e = rs.b;
    const restY = TOP_Y + MAT_Y + K.rad;
    const x = lerp(K.rest.x, rs.hx, e);
    const z = lerp(K.rest.z, rs.hz, e);
    const y = lerp(restY, rs.hy, e) + 0.09 * Math.sin(e * Math.PI);
    g.position.set(x, y, z);
    g.rotation.y = lerp(Math.PI / 2, yawCur, e);
    rs.handle.rotation.x = REST_A * (1 - e);
    if (rs.px !== undefined && isHeld && e >= 1 && activeRollZone) {
      const dx = x - rs.px;
      const dz = z - rs.pz;
      rs.spin.rotation.x += (orient ? -dx : dz) / K.rad;
    }
    rs.px = x;
    rs.pz = z;
    if (kind === 'ink') {
      const v = 0.12 + 0.88 * (1 - load);
      rs.drumMat.color.set(`rgb(${Math.round(176 * v)},${Math.round(122 * v)},${Math.round(66 * v)})`);
    }
  }

  function updateLabels() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const tg = target();
    labelDefs.forEach((d) => {
      if (!d.show()) {
        d.el.style.display = 'none';
        return;
      }
      const t = d.text();
      if (t !== d.last) {
        d.el.textContent = t;
        d.last = t;
      }
      const worldPos = root.localToWorld(d.pos().clone());
      const v = worldPos.project(camera);
      if (v.z > 1) {
        d.el.style.display = 'none';
        return;
      }
      d.el.style.display = '';
      d.el.style.transform = `translate(${(((v.x + 1) / 2) * w).toFixed(1)}px,${(((1 - v.y) / 2) * h).toFixed(
        1
      )}px) translate(-50%,-100%)`;
      d.el.classList.toggle('go', tg === d.id);
    });
  }

  function update(dt) {
    animTime += dt;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(tw.ease(k));
      if (k >= 1) {
        tweens.splice(i, 1);
        tw.res();
      }
    }
    if (inkDirty) {
      blockInkTex.needsUpdate = true;
      inkDirty = false;
    }
    if (ghostDirty) {
      composeSheetTop(true);
      sheetTopTex.needsUpdate = true;
      ghostDirty = false;
    }
    // Real-time multi-joint arm/hand/head pose + brush locked to right-hand grip
    updateArtisanPose(animTime, dt);

    poseRoller('ink');
    poseRoller('press');
    if (isSeated && step === 'print' && camera.aspect < 1 && held && !moving && edgePanDir !== 0) {
      mobilePanValue = clamp(mobilePanValue + edgePanDir * dt * 1.15, -1, 1);
      if (lastHoldClient && pointerState.down) {
        const q = pickTableCoords(lastHoldClient);
        if (q) {
          pointerState.x = q.x;
          pointerState.z = q.z;
          rollTo(q.x, q.z);
        }
      }
    } else if (!isSeated || step !== 'print') {
      mobilePanValue = lerp(mobilePanValue, 0, Math.min(1, dt * 6));
    }
    if (held === 'ink' && !moving && rl.ink.b >= 1 && ps === 'ink' && inTray(rl.ink.hx, rl.ink.hz) && load < 1) {
      load = Math.min(1, load + dt * 0.42);
      refreshBars();
    }
    const tg = isSeated && step === 'print' ? target() : null;
    const s = 0.16 + 0.14 * Math.sin(animTime * 4.5);
    for (const k in pulse) {
      const on = tg === k;
      for (const m of pulse[k]) m.emissiveIntensity = on ? s : 0;
    }
    updateLabels();
  }

  // Initialize default sample & cards
  setPaper('red');
  buildCards();
  mctx.clearRect(0, 0, W, H);
  drawSample(mctx, samples[0]);
  setupBlockData();
  resetPrint();
  setStep('pick');

  const interactiveMeshes = [];
  root.traverse((c) => {
    if (c.isMesh && c.userData.artworkId) {
      interactiveMeshes.push(c);
    }
  });

  return {
    group: root,
    interactiveMeshes,
    update,
    setSeated(val) {
      isSeated = val;
      if (!val) {
        if (held) putDown();
        hideInfo();
        update2DBrushCursor(0, 0, false);
        domElement.style.cursor = '';
      }
      setStep(step);
    },
    getStep: () => step,
    setStep,
    getMobilePanValue: () => mobilePanValue,
    getColorView: () => ({ zoom: colorZoom, panX: colorPanX, panZ: colorPanZ }),
    showArtisanStory() {
      if (!isSeated) {
        $('donebar').classList.add('hidden');
        $('hint3d').classList.add('hidden');
      }
      $('kh-print-hud').classList.remove('hidden');
      showInfo('artisan');
    }
  };
}

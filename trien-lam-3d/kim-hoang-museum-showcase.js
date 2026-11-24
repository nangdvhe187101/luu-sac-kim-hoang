import * as THREE from 'three';
import { createKimHoangStation } from './game/kim-hoang-table.js?v=kim_hoang_shared_v7';

export const MOSAIC_FONT = {
  L: ['00000','00000','00000','10000','10000','10000','10000','10000','11111'],
  Ư: ['00000','00001','00011','10010','10010','10010','10010','10010','01100'],
  U: ['00000','00000','00000','10001','10001','10001','10001','10001','01110'],
  S: ['00000','00000','00000','01111','10000','01110','00001','00001','11110'],
  Ắ: ['00010','01010','00100','01110','10001','10001','11111','10001','10001'],
  C: ['00000','00000','00000','01111','10000','10000','10000','10000','01111'],
  K: ['00000','00000','00000','10001','10010','11100','10010','10001','10001'],
  I: ['000','000','000','111','010','010','010','010','111'],
  M: ['00000','00000','00000','10001','11011','10101','10001','10001','10001'],
  H: ['00000','00000','00000','10001','10001','11111','10001','10001','10001'],
  O: ['00000','00000','00000','01110','10001','10001','10001','10001','01110'],
  À: ['00000','01000','00100','01110','10001','10001','11111','10001','10001'],
  N: ['00000','00000','00000','10001','11001','10101','10011','10001','10001'],
  G: ['00000','00000','00000','01111','10000','10000','10111','10001','01111']
};

export const GALLERY_URLS = Array.from({ length: 49 }, (_, i) => `tranh/tranh-${String(i + 1).padStart(2, '0')}.webp`);

export const HALLWAY_PANO_ID = 'panorama_16304155_5038_DB94_41C7_DC85A0DB47C7';
export const ARCHWAY_PANO_ID = 'panorama_7D908AAB_6FA6_6621_41D1_CAE554644A84';
export const WORKSHOP_PANO_ID = 'panorama_16387645_5039_B9F4_41A6_72D0266851A3';
export const R2_API_BASE = 'https://kim-hoang-gallery-api.chibtkhs180128.workers.dev';

// Shared caches across both showcase and 3D room so textures, materials, and GLTF station are only created ONCE!
// Thu nhỏ texture trên điện thoại để tránh Safari iOS hết bộ nhớ và kill tab
export const IS_LOW_MEM_DEVICE = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || window.innerWidth < 820;
export function shrinkTexture(tex, maxSide = 640) {
  const img = tex && tex.image;
  if (!img || !img.width || !img.height) return tex;
  const k = Math.min(1, maxSide / Math.max(img.width, img.height));
  if (k >= 1) return tex;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.width * k));
  c.height = Math.max(1, Math.round(img.height * k));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  tex.image = c;
  tex.needsUpdate = true;
  return tex;
}

const sharedTexLoader = new THREE.TextureLoader();
sharedTexLoader.setCrossOrigin('anonymous');
const sharedTexCache = new Map();
const sharedArtMatCache = new Map();
let sharedStationPromise = null;
const mosaicRefreshCallbacks = new Set();

// Live R2 paintings pool (shared between showcase and 3D workshop room)
let r2PaintingsCache = [];
let r2LastFetch = 0;
let r2FetchPromise = null;

// Trên điện thoại dùng bản tranh nhỏ (tranh/m/, tối đa 640px) để không phải giải mã ảnh gốc 2048px
export function mobileArtUrl(url) {
  if (!IS_LOW_MEM_DEVICE || typeof url !== 'string') return url;
  return url.replace(/(^|\/)tranh\/(tranh-\d+\.webp)/, '$1tranh/m/$2');
}

// Giới hạn số ảnh tải cùng lúc trên điện thoại để tránh đỉnh bộ nhớ khi giải mã
const TEX_MAX_PARALLEL = IS_LOW_MEM_DEVICE ? 3 : 8;
let texActive = 0;
const texQueue = [];
function queuedTexLoad(url, onLoad, onError) {
  texQueue.push({ url, onLoad, onError });
  pumpTexQueue();
}
function pumpTexQueue() {
  while (texActive < TEX_MAX_PARALLEL && texQueue.length) {
    const job = texQueue.shift();
    texActive++;
    const done = () => { texActive--; setTimeout(pumpTexQueue, 0); };
    sharedTexLoader.load(
      job.url,
      (tex) => { try { job.onLoad(tex); } finally { done(); } },
      undefined,
      (err) => { try { job.onError(err); } finally { done(); } }
    );
  }
}

// Cho biết khi nào toàn bộ tranh dùng chung (mosaic) đã tải xong
export function getSharedTexStats() {
  return { pending: sharedTexPending.size + texQueue.length + texActive, loaded: sharedTexCache.size };
}
export function whenSharedTexturesIdle() {
  return new Promise((resolve) => {
    const check = () => {
      if (sharedTexPending.size === 0 && texQueue.length === 0 && texActive === 0) resolve();
      else setTimeout(check, 120);
    };
    setTimeout(check, 50);
  });
}

const sharedTexPending = new Map(); // url -> [onReady...] (gộp các lần tải trùng)

export function getSharedTexture(url, maxAnisotropy = 4, onReady = null) {
  if (sharedTexCache.has(url)) {
    const tex = sharedTexCache.get(url);
    if (onReady) onReady(tex);
    return tex;
  }
  if (sharedTexPending.has(url)) {
    if (onReady) sharedTexPending.get(url).push(onReady);
    return null;
  }
  sharedTexPending.set(url, onReady ? [onReady] : []);
  const flush = (tex) => {
    const cbs = sharedTexPending.get(url) || [];
    sharedTexPending.delete(url);
    cbs.forEach((cb) => { try { cb(tex); } catch (e) { console.warn(e); } });
  };
  queuedTexLoad(
    mobileArtUrl(url),
    (tex) => {
      if (IS_LOW_MEM_DEVICE) shrinkTexture(tex, 512);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      // Mipmap + lọc dị hướng: ô tranh mosaic ở xa vẫn mịn, không nhoè/nhấp nháy
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = Math.max(maxAnisotropy, 4);
      sharedTexCache.set(url, tex);
      flush(tex);
    },
    () => flush(null)
  );
  return null;
}

export function getSharedArtMaterial(url, maxAnisotropy = 4) {
  if (sharedArtMatCache.has(url)) return sharedArtMatCache.get(url);
  const mat = new THREE.MeshBasicMaterial({ color: 0xe84a27 });
  sharedArtMatCache.set(url, mat);
  getSharedTexture(url, maxAnisotropy, (tex) => {
    if (!tex) return;
    mat.map = tex;
    mat.color.setHex(0xffffff);
    mat.needsUpdate = true;
  });
  return mat;
}

export function createFadeArtMaterial(url, maxAnisotropy = 4) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xe84a27,
    transparent: true,
    opacity: 1
  });
  getSharedTexture(url, maxAnisotropy, (tex) => {
    if (!tex) return;
    mat.map = tex;
    mat.color.setHex(0xffffff);
    mat.needsUpdate = true;
  });
  return mat;
}

export function registerMosaicRefresh(cb) {
  mosaicRefreshCallbacks.add(cb);
}

export function getCombinedUserPaintings() {
  const byUrl = new Map();
  for (const item of r2PaintingsCache) {
    if (item && item.url) byUrl.set(item.url, item);
  }
  try {
    const saved = JSON.parse(localStorage.getItem('kim_hoang_mosaic_v1') || '[]');
    for (const item of saved) {
      const u = item && (item.url || item.dataUrl);
      if (u && !byUrl.has(u)) {
        byUrl.set(u, { id: item.id, url: u, sigName: item.sigName || '', isUser: true });
      }
    }
  } catch (_) {}
  return Array.from(byUrl.values());
}

export async function fetchR2Paintings(force = false) {
  const now = Date.now();
  if (!force && now - r2LastFetch < 20000 && r2PaintingsCache.length > 0) {
    return r2PaintingsCache;
  }
  if (r2FetchPromise) return r2FetchPromise;
  r2FetchPromise = fetch(`${R2_API_BASE}/api/paintings`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && Array.isArray(data.items)) {
        r2PaintingsCache = data.items
          .filter((it) => it && it.url)
          .map((it) => ({ ...it, isUser: true }));
        r2LastFetch = Date.now();
        mosaicRefreshCallbacks.forEach((cb) => cb());
      }
      return r2PaintingsCache;
    })
    .catch(() => r2PaintingsCache)
    .finally(() => {
      r2FetchPromise = null;
    });
  return r2FetchPromise;
}

// Kick off initial R2 fetch & refresh periodically every 30s
fetchR2Paintings(true);
setInterval(() => fetchR2Paintings(true), 30000);

export async function hangSharedPainting(outCanvas, sigName = '') {
  const thumb = document.createElement('canvas');
  thumb.width = 480;
  thumb.height = Math.round(480 * (outCanvas.height / outCanvas.width));
  thumb.getContext('2d').drawImage(outCanvas, 0, 0, thumb.width, thumb.height);

  const dataUrl = thumb.toDataURL('image/webp', 0.88);
  const localId = `kh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Optimistic local save so the user sees their painting immediately
  try {
    localStorage.setItem('kim_hoang_my_painting_id', localId);
    const saved = JSON.parse(localStorage.getItem('kim_hoang_mosaic_v1') || '[]');
    saved.unshift({ id: localId, dataUrl, sigName });
    if (saved.length > 40) saved.pop();
    localStorage.setItem('kim_hoang_mosaic_v1', JSON.stringify(saved));
  } catch (_) {}

  mosaicRefreshCallbacks.forEach((cb) => cb());

  // Upload to Cloudflare R2 via Worker
  try {
    let blob = await new Promise((resolve) => thumb.toBlob(resolve, 'image/webp', 0.88));
    if (!blob) {
      blob = await new Promise((resolve) => thumb.toBlob(resolve, 'image/png'));
    }
    if (blob) {
      const fd = new FormData();
      fd.append('file', blob, 'painting.webp');
      fd.append('sigName', sigName || '');
      const res = await fetch(`${R2_API_BASE}/api/paintings`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.item && data.item.url) {
          console.log('✅ Đã upload tranh lên Cloudflare R2 thành công:', data.item);
          r2PaintingsCache = [
            { ...data.item, isUser: true },
            ...r2PaintingsCache.filter((p) => p.url !== data.item.url)
          ];
          try {
            localStorage.setItem('kim_hoang_my_painting_id', data.item.id);
          } catch (_) {}
          mosaicRefreshCallbacks.forEach((cb) => cb());
          return { uploadedToR2: true, item: data.item };
        } else {
          console.error('❌ Upload tranh lên R2 thất bại (JSON payload không hợp lệ):', data);
        }
      } else {
        console.error('❌ Upload tranh lên R2 lỗi HTTP status:', res.status, res.statusText);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi kết nối khi upload tranh lên R2:', err);
  }

  return { uploadedToR2: false, item: { id: localId, url: dataUrl, sigName } };
}

/**
 * Smooth cross-fade rotator for any LƯU SẮC KIM HOÀNG mosaic wall.
 * Every ~2.6s, picks 3–4 tiles, fades opacity 1 -> 0, swaps to next R2/gallery painting, fades 0 -> 1.
 */
export function createMosaicRotator(mosaicSlots, maxAnisotropy = 4) {
  let timer = 0;
  let poolCursor = 0;
  const activeFades = [];

  function getRotationPool() {
    const userItems = getCombinedUserPaintings();
    if (userItems.length >= 6) {
      return userItems;
    }
    const galleryItems = GALLERY_URLS.map((u) => ({ url: u, sigName: '', isUser: false }));
    return [...userItems, ...galleryItems];
  }

  function triggerBatch() {
    if (!mosaicSlots.length) return;
    const pool = getRotationPool();
    if (pool.length <= 1) return;

    const batchCount = Math.min(4, Math.max(2, Math.floor(mosaicSlots.length / 30)));
    for (let b = 0; b < batchCount; b++) {
      // Pick a random non-featured, non-currently-fading slot
      let slot = null;
      for (let tries = 0; tries < 10; tries++) {
        const idx = Math.floor(Math.random() * mosaicSlots.length);
        const cand = mosaicSlots[idx];
        if (cand && !cand.isFeatured && !cand._fading) {
          slot = cand;
          break;
        }
      }
      if (!slot) continue;

      const nextItem = pool[poolCursor % pool.length];
      poolCursor = (poolCursor + 1) % pool.length;
      if (!nextItem || nextItem.url === slot.currentUrl) continue;

      slot._fading = true;
      // Preload texture before starting fade-out so swap is instant with zero hitch
      getSharedTexture(nextItem.url, maxAnisotropy, (tex) => {
        if (!tex) {
          slot._fading = false;
          return;
        }
        activeFades.push({
          slot,
          nextItem,
          nextTex: tex,
          phase: 'out',
          t: 0,
          durOut: 0.75,
          durIn: 0.75
        });
      });
    }
  }

  function update(dt) {
    timer += dt;
    if (timer >= 2.6) {
      timer = 0;
      triggerBatch();
    }

    for (let i = activeFades.length - 1; i >= 0; i--) {
      const f = activeFades[i];
      f.t += dt;
      const mat = f.slot.artMesh.material;
      if (f.phase === 'out') {
        const k = Math.min(1, f.t / f.durOut);
        mat.opacity = 1 - k * 0.92;
        if (k >= 1) {
          mat.map = f.nextTex;
          mat.color.setHex(0xffffff);
          mat.needsUpdate = true;
          f.slot.currentUrl = f.nextItem.url;
          f.slot.sigName = f.nextItem.sigName || '';
          f.slot.isUser = Boolean(f.nextItem.isUser);
          f.phase = 'in';
          f.t = 0;
        }
      } else {
        const k = Math.min(1, f.t / f.durIn);
        mat.opacity = 0.08 + k * 0.92;
        if (k >= 1) {
          mat.opacity = 1;
          f.slot._fading = false;
          activeFades.splice(i, 1);
        }
      }
    }
  }

  return { update };
}

export function getSharedKimHoangStation({ camera, domElement, maxAnisotropy = 4 }) {
  if (!sharedStationPromise) {
    sharedStationPromise = createKimHoangStation({
      camera,
      domElement,
      maxAnisotropy,
      basePath: './game',
      onHangPainting: hangSharedPainting
    }).then((st) => {
      // Add a single low-poly invisible hitbox (12 triangles) for fast hover/click raycasting without scanning high-poly GLTF skin!
      const hitGeo = new THREE.BoxGeometry(1.45, 1.35, 1.35);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitGeo, hitMat);
      hitBox.position.set(0, 0.62, -0.05);
      st.group.add(hitBox);
      st.fastHitMeshes = [hitBox];
      return st;
    });
  }
  return sharedStationPromise;
}

export async function createMuseumKimHoangExperience({ camera, domElement, maxAnisotropy = 4 }) {
  const root = new THREE.Group();
  root.visible = false;

  // Lightweight lighting (no heavy SpotLight/PointLight shader churn)
  const ambient = new THREE.AmbientLight(0xfff5e4, 1.15);
  root.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffe7bd, 1.35);
  dirLight.position.set(2, 5, 3);
  root.add(dirLight);

  // --- "LƯU SẮC KIM HOÀNG" Mosaic Wall ---
  const mosaicWallGroup = new THREE.Group();
  root.add(mosaicWallGroup);

  const mosaicSlots = [];
  const mosaicInteractiveMeshes = [];
  const dx = 0.072;
  const dy = 0.078;
  const tileW = 0.060;
  const tileH = 0.065;
  const lineTopY = [1.80, 0.96];
  const lines = [
    ['L', 'Ư', 'U', ' ', 'S', 'Ắ', 'C'],
    ['K', 'I', 'M', ' ', 'H', 'O', 'À', 'N', 'G']
  ];

  const frameGeo = new THREE.PlaneGeometry(tileW + 0.010, tileH + 0.010);
  const artGeo = new THREE.PlaneGeometry(tileW, tileH);
  const normalFrameMat = new THREE.MeshBasicMaterial({ color: '#e0aa4e' });
  const featuredFrameMat = new THREE.MeshBasicMaterial({ color: '#ffd700' });

  lines.forEach((chars, lineIdx) => {
    let totalCols = 0;
    chars.forEach((ch, idx) => {
      totalCols += ch === ' ' ? 2 : MOSAIC_FONT[ch][0].length + (idx < chars.length - 1 && chars[idx + 1] !== ' ' ? 1 : 0);
    });
    let curCol = 0;
    const startX = -((totalCols - 1) * dx) / 2;

    chars.forEach((ch, idx) => {
      if (ch === ' ') { curCol += 2; return; }
      const rows = MOSAIC_FONT[ch];
      const cols = rows[0].length;
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < cols; c++) {
          if (rows[r][c] !== '1') continue;
          const x = startX + (curCol + c) * dx;
          const y = lineTopY[lineIdx] - r * dy;
          const curveZ = -(x * x) * 0.028;

          const slotIndex = mosaicSlots.length;
          const initUrl = GALLERY_URLS[slotIndex % GALLERY_URLS.length];

          const frameMesh = new THREE.Mesh(frameGeo, normalFrameMat);
          frameMesh.position.set(x, y, curveZ);
          frameMesh.rotation.y = -x * 0.035;

          const artMesh = new THREE.Mesh(artGeo, createFadeArtMaterial(initUrl, maxAnisotropy));
          artMesh.position.set(x, y, curveZ + 0.004);
          artMesh.rotation.y = -x * 0.035;
          artMesh.userData = { isMosaicPainting: true, slotIndex };
          mosaicInteractiveMeshes.push(artMesh);

          mosaicWallGroup.add(frameMesh, artMesh);
          mosaicSlots.push({
            frameMesh,
            artMesh,
            currentUrl: initUrl,
            sigName: '',
            isFeatured: false,
            _fading: false
          });
        }
      }
      curCol += cols + (idx < chars.length - 1 && chars[idx + 1] !== ' ' ? 1 : 0);
    });
  });

  const mosaicRotator = createMosaicRotator(mosaicSlots, maxAnisotropy);

  function refreshMosaic() {
    const userPaintings = getCombinedUserPaintings();
    const myId = localStorage.getItem('kim_hoang_my_painting_id');
    const featuredIdx = Math.min(mosaicSlots.length - 1, Math.floor(mosaicSlots.length * 0.68));
    const myItem = userPaintings.find(p => p.id === myId) || userPaintings[0];

    mosaicSlots.forEach((slot, i) => {
      let srcUrl = GALLERY_URLS[i % GALLERY_URLS.length];
      let sigName = '';
      let isFeatured = false;
      let isUser = false;

      if (i === featuredIdx && myItem) {
        srcUrl = myItem.url || myItem.dataUrl;
        sigName = myItem.sigName || '';
        isFeatured = true;
        isUser = true;
      } else if (userPaintings.length > 0 && (userPaintings.length >= 12 || i % 3 === 0)) {
        const up = userPaintings[i % userPaintings.length];
        srcUrl = up.url || up.dataUrl;
        sigName = up.sigName || '';
        isUser = true;
      }

      slot.currentUrl = srcUrl;
      slot.sigName = sigName;
      slot.isFeatured = isFeatured;
      slot.isUser = isUser;
      slot.frameMesh.material = isFeatured ? featuredFrameMat : normalFrameMat;
      getSharedTexture(srcUrl, maxAnisotropy, (tex) => {
        if (!tex) return;
        slot.artMesh.material.map = tex;
        slot.artMesh.material.color.setHex(0xffffff);
        slot.artMesh.material.opacity = 1;
        slot.artMesh.material.needsUpdate = true;
      });
    });
  }

  registerMosaicRefresh(refreshMosaic);
  const station = await getSharedKimHoangStation({ camera, domElement, maxAnisotropy });
  root.add(station.group);
  refreshMosaic();

  function attachStation() {
    if (station.group.parent !== root) {
      root.add(station.group);
    }
  }

  function placeForPano(panoId) {
    if (panoId === HALLWAY_PANO_ID) {
      attachStation();
      root.visible = true;
      station.group.position.set(-10.6, -1.55, 4.4);
      station.group.rotation.y = Math.PI / 2;

      mosaicWallGroup.position.set(-15.5, -0.5, 4.4);
      mosaicWallGroup.rotation.y = Math.PI / 2;
      mosaicWallGroup.scale.setScalar(1.75);
      station.group.updateMatrixWorld(true);
    } else if (panoId === ARCHWAY_PANO_ID) {
      attachStation();
      root.visible = true;
      station.group.position.set(-11.2, -1.55, 0);
      station.group.rotation.y = Math.PI / 2;

      mosaicWallGroup.position.set(-16.2, -0.5, 0);
      mosaicWallGroup.rotation.y = Math.PI / 2;
      mosaicWallGroup.scale.setScalar(1.75);
      station.group.updateMatrixWorld(true);
    } else if (panoId === WORKSHOP_PANO_ID) {
      attachStation();
      root.visible = true;
      station.group.position.set(4.6, -1.55, 0);
      station.group.rotation.y = -Math.PI / 2;

      mosaicWallGroup.position.set(7.4, -0.25, 0);
      mosaicWallGroup.rotation.y = -Math.PI / 2;
      mosaicWallGroup.scale.setScalar(1.55);
      station.group.updateMatrixWorld(true);
    } else {
      root.visible = false;
    }
  }

  function getSeatedCameraTargets(isPortrait) {
    const camPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    let targetFov = 48;

    if (station.getStep() === 'color') {
      const cv = station.getColorView?.() || { zoom: 1, panX: 0, panZ: 0 };
      const baseFov = isPortrait ? 58 : 43;
      targetFov = baseFov / Math.max(1, cv.zoom);
      const zt = Math.min(1, Math.max(0, (cv.zoom - 1) / 1.2));
      const panXm = cv.panX / 120;
      const panZm = cv.panZ / 120;
      camPos.set(0.0375 + panXm, isPortrait ? THREE.MathUtils.lerp(1.02, 0.97, zt) : 0.97, (isPortrait ? THREE.MathUtils.lerp(0.57, 0.47, zt) : 0.47) + panZm);
      lookTarget.set(0.0375 + panXm, isPortrait ? THREE.MathUtils.lerp(0.15, 0.36, zt) : 0.36, (isPortrait ? THREE.MathUtils.lerp(0.08, 0.056, zt) : 0.056) + panZm);
    } else {
      const panVal = isPortrait ? (station.getMobilePanValue?.() ?? 0) : 0;
      const panCamX = !isPortrait ? 0.054 : (-0.037 + panVal * 0.23);
      const panLookX = !isPortrait ? 0.029 : (-0.07 + panVal * 0.30);
      camPos.set(panCamX, isPortrait ? 1.08 : 1.04, isPortrait ? 1.06 : 0.926);
      lookTarget.set(panLookX, isPortrait ? 0.14 : 0.355, isPortrait ? -0.04 : -0.073);
      targetFov = isPortrait ? 64 : 48;
    }

    station.group.localToWorld(camPos);
    station.group.localToWorld(lookTarget);
    return { camPos, lookTarget, targetFov };
  }

  return {
    root,
    station,
    mosaicSlots,
    mosaicInteractiveMeshes,
    attachStation,
    placeForPano,
    getSeatedCameraTargets,
    refreshMosaic,
    update: (dt, t) => {
      if (root.visible) {
        station.update(dt, t);
        mosaicRotator.update(dt);
      }
    }
  };
}

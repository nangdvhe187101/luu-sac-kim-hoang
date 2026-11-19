import * as THREE from 'three';
import {
  MOSAIC_FONT,
  GALLERY_URLS,
  HALLWAY_PANO_ID,
  ARCHWAY_PANO_ID,
  WORKSHOP_PANO_ID,
  createFadeArtMaterial,
  getSharedTexture,
  getCombinedUserPaintings,
  createMosaicRotator,
  registerMosaicRefresh,
  getSharedKimHoangStation
} from './kim-hoang-museum-showcase.js?v=kim_hoang_v34';

export { HALLWAY_PANO_ID, ARCHWAY_PANO_ID, WORKSHOP_PANO_ID };

function makeWallPanelTexture(maxAnisotropy) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Well-lit museum wall vertical gradient with warm top cove wash
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#7c7e83');
  grad.addColorStop(0.14, '#626469');
  grad.addColorStop(0.55, '#505257');
  grad.addColorStop(0.90, '#404246');
  grad.addColorStop(1, '#2a2b2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle vertical architectural panel seams
  ctx.fillStyle = 'rgba(15, 15, 18, 0.38)';
  for (let x = 0; x < 512; x += 128) {
    ctx.fillRect(x, 0, 2, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(x + 2, 0, 1, 512);
    ctx.fillStyle = 'rgba(15, 15, 18, 0.38)';
  }

  // Top ceiling cornice trim highlight
  ctx.fillStyle = '#9a9ca0';
  ctx.fillRect(0, 0, 512, 8);

  // Baseboard shadow
  ctx.fillStyle = '#1c1d20';
  ctx.fillRect(0, 494, 512, 18);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(8, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function makeFloorTexture(maxAnisotropy) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4e5054';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.025)';
    ctx.fillRect(x, y, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function makeCeilingTexture(maxAnisotropy) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 260);
  grad.addColorStop(0, '#e2e0dc');
  grad.addColorStop(0.45, '#b8babd');
  grad.addColorStop(1, '#8a8c90');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function makeDaisTexture(maxAnisotropy) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#686662');
  grad.addColorStop(0.55, '#4c4e52');
  grad.addColorStop(0.96, '#383a3e');
  grad.addColorStop(1, '#242528');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function buildPottedPlant() {
  const g = new THREE.Group();
  const potMat = new THREE.MeshLambertMaterial({ color: '#1b3532' });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.28, 12), potMat);
  pot.position.y = 0.14;
  g.add(pot);

  const leafMat = new THREE.MeshLambertMaterial({ color: '#2b5e28', side: THREE.DoubleSide });
  const stemMat = new THREE.MeshLambertMaterial({ color: '#3b6a2c' });
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const h = 0.45 + (i % 3) * 0.16;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, h, 5), stemMat);
    stem.position.set(Math.cos(ang) * 0.04, 0.26 + h * 0.45, Math.sin(ang) * 0.04);
    stem.rotation.z = -Math.cos(ang) * 0.22;
    stem.rotation.x = Math.sin(ang) * 0.22;
    g.add(stem);

    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.32), leafMat);
    leaf.position.set(Math.cos(ang) * 0.18, 0.28 + h * 0.82, Math.sin(ang) * 0.18);
    leaf.rotation.y = -ang + Math.PI / 2;
    leaf.rotation.x = 0.65;
    g.add(leaf);
  }
  return g;
}

export async function createLacquerWorkshopRoom({ camera, domElement, maxAnisotropy = 4 }) {
  const root = new THREE.Group();
  root.visible = false;
  const texLoader = new THREE.TextureLoader();

  const ROOM_R = 9.4;
  const ROOM_H = 4.65;
  const DAIS_Z = -1.2;
  const DAIS_Y = 0.06;

  // --- 1. Bright, warm museum lighting (for 3D table & artisan) + pre-lit architectural materials ---
  const ambient = new THREE.AmbientLight(0xfff8ee, 1.25);
  root.add(ambient);

  const hemi = new THREE.HemisphereLight(0xfffaf2, 0x8a8c90, 1.1);
  hemi.position.set(0, ROOM_H, 0);
  root.add(hemi);

  const keyDir = new THREE.DirectionalLight(0xfff1dc, 1.25);
  keyDir.position.set(1.5, ROOM_H, 2.5);
  root.add(keyDir);

  // --- 2. Architecture: Floor, Raised Circular Dais, Curved Walls, Ceiling & Cove Light ---
  const floorTex = makeFloorTexture(maxAnisotropy);
  const floorMat = new THREE.MeshBasicMaterial({ map: floorTex });
  const floorMesh = new THREE.Mesh(new THREE.CircleGeometry(ROOM_R + 4.5, 48), floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.userData = { isWalkableFloor: true };
  root.add(floorMesh);

  const daisTex = makeDaisTexture(maxAnisotropy);
  const daisMat = new THREE.MeshBasicMaterial({ map: daisTex });
  const daisMesh = new THREE.Mesh(new THREE.CylinderGeometry(4.45, 4.52, DAIS_Y, 48), daisMat);
  daisMesh.position.set(0, DAIS_Y / 2, DAIS_Z);
  daisMesh.userData = { isWalkableFloor: true };
  root.add(daisMesh);

  const wallTex = makeWallPanelTexture(maxAnisotropy);
  const wallMat = new THREE.MeshBasicMaterial({ map: wallTex, side: THREE.BackSide });
  const wallArcStart = 0.44;
  const wallArcLen = Math.PI * 2 - 0.88;
  const wallMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(ROOM_R, ROOM_R, ROOM_H, 40, 1, true, wallArcStart, wallArcLen),
    wallMat
  );
  wallMesh.position.y = ROOM_H / 2;
  root.add(wallMesh);

  const pillarMat = new THREE.MeshBasicMaterial({ color: '#dcd9d4' });
  const leftEdgeX = Math.sin(wallArcStart) * ROOM_R;
  const leftEdgeZ = Math.cos(wallArcStart) * ROOM_R;
  const rightEdgeX = Math.sin(-wallArcStart) * ROOM_R;
  const rightEdgeZ = Math.cos(-wallArcStart) * ROOM_R;

  [
    [leftEdgeX + 0.35, leftEdgeZ + 0.5],
    [rightEdgeX - 0.35, rightEdgeZ + 0.5]
  ].forEach(([px, pz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, ROOM_H, 1.4), pillarMat);
    col.position.set(px, ROOM_H / 2, pz);
    root.add(col);
  });

  const hallwayMat = new THREE.MeshBasicMaterial({ color: '#c8c4be', toneMapped: false });
  texLoader.load('media/panorama_16387645_5039_B9F4_41A6_72D0266851A3_0/l/vr2gen/0.jpg?v=kim_hoang_v28', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    hallwayMat.map = tex;
    hallwayMat.color.setHex(0xffffff);
    hallwayMat.needsUpdate = true;
  });
  const hallwayBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), hallwayMat);
  hallwayBackdrop.position.set(0, 1.55, 11.0);
  hallwayBackdrop.rotation.y = Math.PI;
  root.add(hallwayBackdrop);

  const ceilTex = makeCeilingTexture(maxAnisotropy);
  const ceilMat = new THREE.MeshBasicMaterial({ map: ceilTex, side: THREE.DoubleSide });
  const ceilMesh = new THREE.Mesh(new THREE.CircleGeometry(ROOM_R + 4.5, 48), ceilMat);
  ceilMesh.rotation.x = Math.PI / 2;
  ceilMesh.position.y = ROOM_H;
  root.add(ceilMesh);

  const coveGlow = new THREE.Mesh(
    new THREE.RingGeometry(2.42, 3.05, 48),
    new THREE.MeshBasicMaterial({ color: '#fff9ee', side: THREE.DoubleSide })
  );
  coveGlow.rotation.x = Math.PI / 2;
  coveGlow.position.set(0, ROOM_H - 0.03, DAIS_Z);
  root.add(coveGlow);

  const coveDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.44, 2.44, 0.14, 48),
    new THREE.MeshBasicMaterial({ color: '#d8dadf' })
  );
  coveDisc.position.set(0, ROOM_H - 0.08, DAIS_Z);
  root.add(coveDisc);

  const plantL = buildPottedPlant();
  plantL.position.set(leftEdgeX - 0.2, 0, leftEdgeZ - 0.3);
  const plantR = buildPottedPlant();
  plantR.position.set(rightEdgeX + 0.2, 0, rightEdgeZ - 0.3);
  root.add(plantL, plantR);

  // --- 3. Giant "LƯU SẮC KIM HOÀNG" Curved Mosaic Wall ---
  const mosaicWallGroup = new THREE.Group();
  root.add(mosaicWallGroup);

  const mosaicSlots = [];
  const mosaicInteractiveMeshes = [];
  const dx = 0.132;
  const dy = 0.142;
  const tileW = 0.112;
  const tileH = 0.122;
  const lineTopY = [3.62, 2.18];
  const lines = [
    ['L', 'Ư', 'U', ' ', 'S', 'Ắ', 'C'],
    ['K', 'I', 'M', ' ', 'H', 'O', 'À', 'N', 'G']
  ];

  const frameGeo = new THREE.PlaneGeometry(tileW + 0.018, tileH + 0.018);
  const artGeo = new THREE.PlaneGeometry(tileW, tileH);
  const normalFrameMat = new THREE.MeshBasicMaterial({ color: '#e0aa4e' });
  const featuredFrameMat = new THREE.MeshBasicMaterial({ color: '#ffd700' });
  const WALL_MOSAIC_R = ROOM_R - 0.32;

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
          const arcDist = startX + (curCol + c) * dx;
          const theta = arcDist / WALL_MOSAIC_R;
          const wx = Math.sin(theta) * WALL_MOSAIC_R;
          const wz = -Math.cos(theta) * WALL_MOSAIC_R;
          const wy = lineTopY[lineIdx] - r * dy;

          const slotIndex = mosaicSlots.length;
          const initUrl = GALLERY_URLS[slotIndex % GALLERY_URLS.length];

          const frameMesh = new THREE.Mesh(frameGeo, normalFrameMat);
          frameMesh.position.set(wx, wy, wz);
          frameMesh.rotation.y = -theta;

          const artR = WALL_MOSAIC_R - 0.008;
          const artMesh = new THREE.Mesh(artGeo, createFadeArtMaterial(initUrl, maxAnisotropy));
          artMesh.position.set(Math.sin(theta) * artR, wy, -Math.cos(theta) * artR);
          artMesh.rotation.y = -theta;
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
  refreshMosaic();

  function attachStation() {
    if (station.group.parent !== root) {
      root.add(station.group);
    }
    station.group.position.set(0, DAIS_Y, DAIS_Z);
    station.group.rotation.set(0, 0, 0);
    station.group.updateMatrixWorld(true);
  }

  function clampPosition(pos) {
    const r = Math.hypot(pos.x, pos.z);
    if (pos.z > 6.0 && Math.abs(pos.x) < 2.6) {
      pos.z = Math.min(8.8, pos.z);
    } else if (r > ROOM_R - 1.1) {
      const k = (ROOM_R - 1.1) / r;
      pos.x *= k;
      pos.z *= k;
    }

    const dxT = pos.x;
    const dzT = pos.z - DAIS_Z;
    const minDist = 1.45;
    const dT = Math.hypot(dxT, dzT);
    if (dT < minDist && dT > 0.001) {
      pos.x = (dxT / dT) * minDist;
      pos.z = DAIS_Z + (dzT / dT) * minDist;
    }
    pos.y = 1.55;
    return pos;
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
    floorMeshes: [floorMesh, daisMesh],
    mosaicSlots,
    mosaicInteractiveMeshes,
    attachStation,
    clampPosition,
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

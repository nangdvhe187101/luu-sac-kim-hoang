---
phase: 02
name: Hero Stage Spatial Fix
duration: 1.5h
files:
  - index.html (hero section structure)
  - styles.css (.hero-section, .heritage-stage, .stage-character, .envelope-card)
  - app.js (parallax system - may need adjustment)
dependencies:
  - phase-01-asset-audit-categorization
---

# Phase 02: Hero Stage Spatial Fix

## Goal

Tái bố trí hero section để các elements không chồng lấn: nhân vật, thiệp 3D, medallion, mây, dải lụa có khoảng cách và z-index rõ ràng.

## Current Problem (từ screenshot)

```
Current layout at 1440px viewport:
┌─────────────────────────────────────────────┐
│        [Medallion rotating - z:1]           │
│   [Nghệ nhân]  [THIỆP 3D]  [Thần Kê]       │
│    left: 2%     center      right: 2%       │
│     z: 8        z: 5         z: 8           │
│                                              │
│     ❌ Characters CHE KHUẤT thiệp           │
│     ❌ Thiệp bị ép giữa 2 nhân vật          │
│     ❌ Dải lụa bottom:-25px che chữ         │
└─────────────────────────────────────────────┘
```

**Root causes**:
1. **Z-index conflict**: Characters (z:8) > Envelope (z:5) → nhân vật nổi lên trước thiệp
2. **Insufficient horizontal clearance**: `left: 2%` và `right: 2%` + character widths 300px mỗi bên → còn ~840px giữa (thiệp cần 440px + breathing room)
3. **Ribbon overflow**: `bottom: -25px` đẩy dải lụa che player controls

## Approach Comparison

### Approach A: "Wide Stage" (Recommended)

**Strategy**: Đẩy nhân vật ra xa hơn, tăng z-index của envelope

**Changes**:
```css
.stage-char-left {
  left: -8%;  /* was 2% */
  z-index: 3; /* lower than envelope */
}

.stage-char-right {
  right: -8%; /* was 2% */
  z-index: 3;
}

.envelope-stage {
  z-index: 6; /* raise above characters */
}

.stage-ribbon-wrap {
  bottom: -10px; /* was -25px, reduce overflow */
  z-index: 2;    /* behind everything */
}
```

**Pros**:
- ✅ Minimal HTML changes
- ✅ Thiệp nổi rõ ở center stage
- ✅ Nhân vật vẫn visible nhưng đóng vai "cánh gà sân khấu"
- ✅ Giữ nguyên parallax logic

**Cons**:
- ⚠️ Nhân vật bị crop một phần ở viewport <1200px
- ⚠️ Cần thêm `overflow-x: hidden` trên `.hero-section`

**Assumption**: Người dùng có viewport ≥1200px (desktop primary), mobile sẽ có riêng responsive pass sau này.

**Fails when**: Viewport <1024px → characters hoàn toàn ngoài màn hình.

---

### Approach B: "Layered Depth" (Alternative)

**Strategy**: Giữ nguyên positions, dùng `transform: translateZ()` để tạo chiều sâu 3D thật

**Changes**:
```css
.heritage-stage {
  perspective: 2000px; /* increase from 1400px */
  transform-style: preserve-3d;
}

.stage-char-left,
.stage-char-right {
  transform: translateZ(-120px); /* push back in 3D space */
  opacity: 0.85; /* dim to reinforce depth */
}

.envelope-stage {
  transform: translateZ(0); /* front plane */
  z-index: 10;
}

.stage-medallion {
  transform: translateZ(-200px); /* deep background */
}
```

**Pros**:
- ✅ "Hollywood" effect, chuyên nghiệp
- ✅ Không cần đẩy characters ra ngoài viewport
- ✅ Parallax chuột sẽ dramatic hơn

**Cons**:
- ⚠️ Phức tạp hơn, khó debug
- ⚠️ Safari có thể render `translateZ()` khác Chrome
- ⚠️ Performance cost (more GPU layers)

**Assumption**: Trình duyệt hỗ trợ tốt CSS 3D transforms.

**Fails when**: Safari < 15 hoặc mobile GPU yếu → jank/lag.

---

## Decision: Approach A "Wide Stage"

**Lý do**:
1. **Simplicity**: Thay đổi positions & z-index dễ verify hơn 3D transforms
2. **Proven pattern**: Các wedding websites thường dùng spatial separation, không cố nhồi nhiều elements vào 1 viewport
3. **Safer fallback**: Nếu parallax bị disable (`prefers-reduced-motion`), layout vẫn OK

**Trade-off accepted**: Nhân vật bị crop nhẹ ở <1200px, sẽ fix trong mobile responsive phase riêng.

## Implementation Steps

### 1. Update CSS - Character Positions

Edit `styles.css`:

```css
/* Line ~318 */
.stage-char-left {
  left: -8%; /* push out from 2% */
  width: clamp(190px, 22vw, 300px);
  z-index: 3; /* lower than envelope */
  animation: charBreatheLeft 6s ease-in-out infinite alternate;
}

/* Line ~324 */
.stage-char-right {
  right: -8%; /* push out from 2% */
  width: clamp(180px, 20vw, 270px);
  z-index: 3;
  animation: charBreatheRight 7s ease-in-out infinite alternate;
}
```

### 2. Update CSS - Envelope Z-Index

```css
/* Line ~452 (find .envelope-stage) */
.envelope-stage {
  position: relative;
  z-index: 6; /* raise above characters */
  /* ... existing styles ... */
}
```

### 3. Update CSS - Ribbon Clearance

```css
/* Line ~391 */
.stage-ribbon-wrap {
  position: absolute;
  bottom: -10px; /* reduce from -25px */
  left: 50%;
  transform: translateX(-50%);
  width: min(95vw, 920px);
  pointer-events: none;
  z-index: 2; /* behind characters */
  animation: ribbonFloat 8s ease-in-out infinite alternate;
}
```

### 4. Add Overflow Control

```css
/* Line ~233 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6rem 1.5rem 4rem;
  z-index: 20;
  overflow: hidden; /* ADD THIS */
  overflow-x: hidden; /* clip characters outside viewport */
}
```

### 5. Adjust Player Bottom Spacing

```css
/* Find .audio-player-bar (line ~1400+) */
.audio-player-bar {
  /* ... existing ... */
  bottom: 2.2rem; /* already fixed in previous session */
}
```

## Verification

Manual checks at `http://localhost:8765/`:

- [ ] **1440px viewport**: Nhân vật không che thiệp, thiệp rõ ràng ở center
- [ ] **Z-ordering**: Hover chuột → thiệp có thể click, không bị nhân vật chặn
- [ ] **Ribbon clearance**: Player controls không bị dải lụa che
- [ ] **Parallax still works**: Di chuột → các layer vẫn dịch chuyển theo depth
- [ ] **Breathing animations**: Nhân vật vẫn thở nhẹ nhàng, không bị stutter
- [ ] **No horizontal scrollbar**: `overflow-x: hidden` ngăn scrollbar khi characters ngoài viewport

## Risks

- **Medium**: Characters bị crop ở 1024–1200px → sẽ cần media query bổ sung nếu người dùng phản hồi
- **Low**: Z-index change có thể ảnh hưởng đến modal overlays (letter modal) → test modal open/close

## Rollback Plan

Nếu approach A gây vấn đề:
1. Revert positions về `left: 2%`, `right: 2%`
2. Implement Approach B (3D transforms) trong phase mới

## Next Phase

→ **Phase 03**: Scroll Animation System cho timeline images (không liên quan hero stage, có thể chạy song song).

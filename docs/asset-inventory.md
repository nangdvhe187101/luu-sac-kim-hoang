# Asset Inventory: 86 PPTX Extracted Images

Generated: 2026-11-04  
Source: `assets/pptx-extracted/ppt/media/*`  
Catalog: [catalog.html](../assets/pptx-extracted/catalog.html)

## Quick Stats

- **Total**: 86 files (84 PNG + 2 SVG)
- **Transparent RGBA**: ~68 files
- **Full Backgrounds**: 3 files (image1, image7, image80)
- **Max Resolution**: 2400x1350 (backgrounds), 2100x2100 (medallions)
- **Currently Used**: 7 files (image4, image38, image45, image50, image51, image28, image35)
- **Unused High-Value**: 20+ files identified below

## Categories

### A. Characters (Nhân vật độc lập - trong suốt)

**Criteria**: 800x1200+ px, portrait orientation, standalone figures  
**Usage**: Hero stage, timeline illustrations, section decorations

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image4.png | 1267x1873 | 1.5MB | ✅ Hero left (nghệ nhân) | Keep |
| image36.png | 820x1229 | 833KB | ❌ Unused | **ADD**: Timeline node illustration |
| image38.png | 893x864 | 723KB | ✅ Hero right (Thần Kê) | Keep |

**Priority**: Medium — image36 có thể thêm vào timeline nodes để minh họa các chương lịch sử.

---

### B. Medallions (Bố cục tròn nghệ thuật - trong suốt)

**Criteria**: 1344x1344+ px, circular compositions, woodblock art  
**Usage**: Rotating background, section dividers, decorative overlays

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image28.png | 1344x1344 | 1.3MB | ✅ Hero medallion overlay | Keep + **pseudo-element frame** |
| image35.png | 1344x1344 | 1.7MB | ✅ Secondary usage | Keep |
| image45.png | 2100x2100 | 1.9MB | ✅ Hero rotating medallion | Keep |
| image84.png | 1498x1428 | 820KB | ❌ Unused | **ADD**: Timeline decorative frame |

**Priority**: High — image84 có thể dùng làm decorative frame overlay cho timeline images (CSS `::before` pseudo-element).

---

### C. Decorative Bands (Dải trang trí ngang - trong suốt)

**Criteria**: Width 600–1917px, Height 140–500px, horizontal ornamental patterns  
**Usage**: Section borders, timeline separators, footer decorations

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image5.png | 1350x270 | 504KB | ❌ Unused | **ADD**: Section divider (after story-section intro) |
| image8.png | 1350x270 | 545KB | ❌ Unused | **ADD**: Section divider (after gallery intro) |
| image14.png | 765x157 | 121KB | ❌ Unused | **ADD**: Timeline node separator (small) |
| image22.png | 698x141 | 126KB | ❌ Unused | **ADD**: Footer decoration |
| image29.png | 693x315 | 167KB | ❌ Unused | Optional: Guestbook section border |
| image51.png | 1917x455 | 23KB | ✅ Hero ribbon | Keep |

**Priority**: High — Decorative bands là quick wins để tăng visual richness mà không ảnh hưởng layout.

---

### D. Clouds & Ribbons (Mây ngũ sắc & Lụa - trong suốt)

**Criteria**: 1800x1000+ px wide, flowing shapes  
**Usage**: Hero background drift, footer waves, atmospheric elements

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image50.png | 2100x1181 | 234KB | ✅ Hero clouds | Keep |
| image51.png | 1917x455 | 23KB | ✅ Hero ribbon | Keep |

**Priority**: Low — Already fully utilized.

---

### E. Backgrounds (Nền đầy đủ - không trong suốt)

**Criteria**: 1344x672+ px, full scenes, RGB (not RGBA)  
**Usage**: Section backgrounds with dark overlay, hero parallax layers

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image1.png | 2400x1350 | 1.8MB | ❌ Unused | Optional: Gallery section background (with overlay) |
| image7.png | 2400x1350 | 1.6MB | ❌ Unused | Optional: Timeline section background |
| image80.png | 1344x672 | 825KB | ❌ Unused | Optional: Footer background |

**Priority**: Low — Backgrounds cần careful implementation (opacity, performance). Defer to later polish phase.

---

### F. Small Ornaments (Chi tiết nhỏ - trong suốt)

**Criteria**: <800x800 px, icons, symbols, decorative details  
**Usage**: Bullet points, inline decorations, hover accents, gallery ornaments

| File | Dimensions | Size | Current Usage | Recommendation |
|------|-----------|------|---------------|----------------|
| image15.png | 469x472 | 201KB | ❌ Unused | **ADD**: Gallery hover accent |
| image30.png | 504x399 | 171KB | ❌ Unused | **ADD**: Timeline bullet ornament |
| image31.png | 693x462 | 188KB | ❌ Unused | **ADD**: Section intro ornament |
| image32.png | 315x315 | 103KB | ❌ Unused | **ADD**: Small inline decoration |
| image33.png | 609x294 | 176KB | ❌ Unused | **ADD**: Footer ornament |
| image63.png | 600x425 | 60KB | ❌ Unused | **ADD**: Icon/symbol inline |
| image65.png | 700x700 | 85KB | ❌ Unused | **ADD**: Gallery card corner ornament |

**Priority**: Medium — Small ornaments thêm polish mà không làm cluttered nếu dùng đúng chỗ.

---

### G. Vector Assets (SVG - vô hạn scale)

| File | Size | Current Usage | Recommendation |
|------|------|---------------|----------------|
| image52.svg | 11KB | ❌ Unused | **ADD**: Logo variation hoặc inline icon |
| image86.svg | 1.3KB | ❌ Unused | **ADD**: Small UI icon |

**Priority**: Low — SVG useful for scalability nhưng không critical trong phase này.

---

### H. Miscellaneous Large Compositions (Trong suốt)

**Criteria**: 1000x700+ px, complex scenes, compositional elements  
**Usage**: Gallery items, timeline illustrations, section heroes

| File | Dimensions | Size | Recommendation |
|------|-----------|------|----------------|
| image10.png | 1500x844 | 175KB | **ADD**: Timeline chapter illustration |
| image11.png | 1800x1013 | 432KB | **ADD**: Gallery item |
| image21.png | 1303x816 | 352KB | **ADD**: Timeline group scene |
| image60.png | 1800x1013 | 521KB | **ADD**: Gallery item |
| image61.png | 1754x1240 | 335KB | **ADD**: Gallery item |

**Priority**: Medium-High — Gallery expansion là key acceptance criterion.

---

## Usage Strategy Summary

### Currently Used (7 files)

✅ **Hero Stage**:
- image4 (nghệ nhân left)
- image38 (Thần Kê right)
- image45 (medallion rotating center)
- image50 (clouds top)
- image51 (ribbon bottom)
- image28, image35 (decorative overlays)

### Recommended Additions (17+ files, Priority order)

#### 🔴 High Priority (Hero & Timeline polish) — 6 files

1. **image84.png** → Timeline decorative frame overlay (CSS pseudo-element)
2. **image5.png** → Section divider after `.story-section .section-intro-header`
3. **image8.png** → Section divider after `.gallery-section .section-intro-header`
4. **image14.png** → Timeline node separator (between chapters)
5. **image36.png** → Timeline node illustration (secondary character)
6. **image22.png** → Footer decoration band

#### 🟠 Medium Priority (Gallery & ornaments) — 11 files

7. **image11.png** → Gallery grid item #1
8. **image60.png** → Gallery grid item #2
9. **image61.png** → Gallery grid item #3
10. **image10.png** → Timeline chapter illustration
11. **image21.png** → Timeline group scene
12. **image15.png** → Gallery hover accent overlay
13. **image65.png** → Gallery card corner ornament
14. **image30.png** → Timeline bullet decorative icon
15. **image31.png** → Section intro ornament
16. **image32.png** → Small inline decoration
17. **image33.png** → Footer ornament

#### 🟡 Low Priority (Optional polish) — Defer

- Backgrounds (image1, image7, image80) → Performance consideration
- SVG assets → Not critical for current phase
- Remaining misc compositions → Use if needed during gallery expansion

---

## Implementation Notes

### Phase 02: Hero Stage Spatial Fix

**No new assets needed** — just repositioning existing image4, image38, image45, image50, image51.

### Phase 03: Scroll Animation System

**New assets to add**:
- image84 (medallion frame via CSS `::before` on `.node-image-figure`)
- image5, image8 (section dividers via new `.section-divider-ornament` elements)
- image14 (timeline separator between nodes)

**Estimated**: +4 new assets

### Phase 04: Gallery Lightbox & Effects

**New assets to add**:
- image11, image60, image61 (3 new gallery grid items minimum)
- image15, image65 (hover ornament accents)

**Estimated**: +5 new assets minimum

### Total New Assets in Plan

**Minimum**: 9 new assets (+4 Phase 03, +5 Phase 04)  
**Target**: 17+ new assets (acceptance criterion)  
**Current projection**: **16 assets** if all High + Medium priority recommendations implemented

---

## Visual Quality Notes

### Transparent RGBA Confirmed

Most PNGs listed as "Trong suốt" in catalog have alpha channel suitable for overlay.

### Aspect Ratios

- **Portrait**: image4 (1:1.5), image36 (1:1.5), image48 (1:1.6)
- **Square**: image28 (1:1), image35 (1:1), image45 (1:1), image84 (1:1)
- **Landscape wide**: image50 (16:9), image51 (4:1), image5/8 (5:1)
- **Landscape standard**: image1/7 (16:9), image80 (2:1)

### File Sizes

- **Large** (>1MB): image4, image28, image35, image38, image45, image1, image7 → Use sparingly, ensure lazy loading
- **Medium** (200KB–1MB): Most decorative bands and compositions → OK for above-fold
- **Small** (<200KB): Ornaments, small details → Safe for inline/hover effects

---

## Cross-Reference

- **Catalog HTML**: [../assets/pptx-extracted/catalog.html](../assets/pptx-extracted/catalog.html)
- **Media Directory**: `assets/pptx-extracted/ppt/media/`
- **Plan**: `plans/261104-0014-visual-redesign-layout-polish/`

---

**Next Step**: Phase 02 implementation uses this inventory to inform which unused assets to integrate during hero spatial fix and timeline enhancements.

---
phase: 01
name: Asset Audit & Categorization
duration: 30min
files:
  - assets/pptx-extracted/ppt/media/* (read-only inspection)
  - docs/asset-inventory.md (create)
dependencies: []
---

# Phase 01: Asset Audit & Categorization

## Goal

Phân loại 86 ảnh PPTX thành categories rõ ràng, xác định dimensions, transparency, và usage strategy cho từng loại.

## Context

Hiện tại chỉ có file `assets/pptx-extracted/catalog.html` liệt kê 86 files, nhưng chưa có phân loại chi tiết theo công dụng thiết kế. Cần audit để:
1. Biết ảnh nào trong suốt (RGBA) phù hợp overlay
2. Ảnh nào có dimensions phù hợp làm decorative borders
3. Ảnh nào là full backgrounds
4. Ảnh nào là nhân vật standalone

## Tasks

### 1. Read Existing Catalog HTML
- Đọc `assets/pptx-extracted/catalog.html` để lấy danh sách highlighted files
- Ghi nhận các file đã được đánh dấu `highlight` class (11 files chính)

### 2. Categorize by Visual Function

Tạo inventory markdown với 6 categories:

#### A. **Characters** (Nhân vật độc lập - trong suốt)
- Criteria: 800x1200+ px, portrait orientation, standalone figures
- Expected: image4, image36, image38
- Usage: Hero stage, timeline illustrations

#### B. **Medallions** (Bố cục tròn nghệ thuật - trong suốt)
- Criteria: 1344x1344+ px, circular compositions, woodblock art
- Expected: image28, image35, image45, image84
- Usage: Rotating background, section dividers, decorative overlays

#### C. **Decorative Bands** (Dải trang trí ngang - trong suốt)
- Criteria: 1350x200–500 px, horizontal strips, ornamental patterns
- Expected: image5, image8, image14, image22, image29, image51
- Usage: Section borders, timeline separators

#### D. **Clouds & Ribbons** (Mây ngũ sắc & Lụa - trong suốt)
- Criteria: 1800x1000+ px wide, flowing shapes
- Expected: image50 (clouds), image51 (ribbon)
- Usage: Hero background drift, footer waves

#### E. **Backgrounds** (Nền đầy đủ - không trong suốt)
- Criteria: 2400x1350 px, full scenes, RGB not RGBA
- Expected: image1, image7, image80
- Usage: Section backgrounds (with overlay)

#### F. **Small Ornaments** (Chi tiết nhỏ - trong suốt)
- Criteria: <800x800 px, icons, symbols, decorative details
- Expected: image15, image30–33, image63, image65
- Usage: Bullet points, inline decorations, hover accents

### 3. Create Asset Inventory Document

Write to `docs/asset-inventory.md`:

```markdown
# Asset Inventory: 86 PPTX Extracted Images

## Quick Stats
- **Total**: 86 files (84 PNG + 2 SVG)
- **Transparent RGBA**: 68 files
- **Full Backgrounds**: 3 files
- **Max Resolution**: 2400x1350 (backgrounds), 2100x2100 (medallions)

## Categories

### A. Characters (3 files)
| File | Dimensions | Size | Usage |
|------|-----------|------|-------|
| image4.png | 1267x1873 | 1.5MB | Nghệ nhân chính - hero left |
| image36.png | 820x1229 | 833KB | Nhân vật phụ - timeline node |
| image38.png | 893x864 | 723KB | Thần Kê - hero right |

### B. Medallions (4 files)
[...]

[Continue for all 6 categories]
```

### 4. Define Usage Strategy

For each category, document:
- **Current usage**: Which files are already in `index.html`
- **Recommended additions**: Which unused files should be added where
- **Priority**: High (hero fixes), Medium (timeline), Low (optional polish)

## Verification

- [ ] `docs/asset-inventory.md` created with all 86 files categorized
- [ ] Each category has clear dimensions criteria
- [ ] Usage strategy identifies at least 20 currently unused high-value assets
- [ ] Document includes visual examples (links to catalog.html anchors)

## Risks

- **Low risk**: Read-only inspection, no code changes yet
- **Potential issue**: Some PNGs may not be truly transparent (check alpha channel notes from catalog)

## Next Phase

→ **Phase 02**: Use inventory to redesign hero stage spatial layout with proper z-index and clearance.

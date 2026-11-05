---
status: completed
created: 2026-11-04T00:14:00+07:00
updated: 2026-11-04T00:14:00+07:00
mode: hard
phases:
  - phase-01-asset-audit-categorization
  - phase-02-hero-stage-spatial-fix
  - phase-03-scroll-animation-system
  - phase-04-gallery-lightbox-effects
  - phase-05-verification-review
dependencies: []
---

# Thiết Kế Lại Giao Diện Lưu Sắc Kim Hoàng - Visual Polish & Animation System

## Outcome

Giao diện Lưu Sắc Kim Hoàng được thiết kế lại với bố cục chuyên nghiệp, không chồng lấn, tận dụng đầy đủ 86 ảnh PPTX với hiệu ứng chuyển động mượt mà, đạt chuẩn thẩm mỹ website thiệp cưới/sự kiện cao cấp.

## Constraints

- Giữ nguyên nội dung văn bản và cấu trúc sections hiện tại (Hero, Timeline, Gallery, Guestbook, Footer)
- Tương thích trình duyệt hiện đại, smooth 60fps animations
- Không thay đổi backend logic hay yêu cầu framework mới (giữ vanilla HTML/CSS/JS)
- Phải hoạt động trên localhost:8765 ngay sau khi thay đổi
- Đảm bảo accessibility (ARIA labels, keyboard navigation)

## Non-goals

- Không làm lại responsive mobile trong phase này (sẽ là phase riêng sau)
- Không tích hợp CMS hay database
- Không thêm analytics/tracking
- Không refactor sang React/Vue/framework mới

## Acceptance Criteria

1. **Hero section spacing**: Các nhân vật, họa tiết, thiệp 3D không chồng lấn, có khoảng cách rõ ràng, hiển thị đầy đủ ở viewport 1440px
2. **Timeline scroll effects**: Mỗi ảnh có hiệu ứng fade-in + slide-up khi scroll vào view, với decorative frames/borders từ kho ảnh PPTX
3. **Gallery hover & lightbox**: Grid layout với hover effects (scale + glow), lightbox mượt mà
4. **Asset utilization**: Catalog 86 ảnh phân loại rõ ràng theo category và được sử dụng xuyên suốt trang
5. **Performance**: Trang reload mượt mà trên `http://localhost:8765/` với Cmd+Shift+R, không giật lag

## Current Issues (từ screenshot người dùng)

### 🔴 Critical: Hero Stage Overlap
- **Vấn đề**: Nhân vật bên trái (nghệ nhân), thiệp 3D, nhân vật bên phải (Thần Kê), dải lụa son, và medallion xoay đang chồng lên nhau một cách xấu xí
- **Nguyên nhân**: 
  - `.stage-char-left { left: 2%; }` và `.stage-char-right { right: 2%; }` quá gần tâm
  - Envelope card có width cố định `min(440px, 88vw)` nhưng không đủ clearance
  - `z-index` của các layer không được phân tầng đúng (medallion z:1, characters z:8, envelope z:5 → characters che envelope)
- **Ảnh hưởng UX**: Mất tính thẩm mỹ, khó nhìn nhận elements riêng biệt

### 🟠 Medium: Timeline Images - No Animation
- **Vấn đề**: Các ảnh PDF trong `.node-image-figure` xuất hiện đột ngột, không có hiệu ứng chuyển động
- **Thiếu sót**: Không có Intersection Observer để trigger fade-in khi scroll
- **Ảnh hưởng UX**: Trải nghiệm flat, thiếu sự sống động của website sự kiện hiện đại

### 🟠 Medium: Underutilized Asset Library
- **Vấn đề**: Có 86 ảnh PPTX chất lượng cao nhưng chỉ dùng 6–7 file (image4, image38, image45, image50, image51, image28, image35)
- **Assets chưa dùng**:
  - **Nhân vật**: image36 (820x1229), image21 (1303x816), image30–33 (ornaments)
  - **Medallions tròn**: image28, image35, image84 (1344x1344+)
  - **Decorative bands**: image5, image8, image14, image22 (270–400px height)
  - **Backgrounds**: image1, image7, image80 (2400x1350 full scenes)
- **Ảnh hưởng**: Không tận dụng tài nguyên đã có, thiếu đa dạng visual

### 🟡 Low: Gallery Grid - Basic Hover
- **Vấn đề**: Gallery hiện chỉ có `transform: translateY(-4px)` khi hover, thiếu lightbox modal
- **Thiếu**: Click-to-zoom với backdrop, prev/next navigation

## Phases

### Phase 01: Asset Audit & Categorization
**Duration**: 30 min  
**Goal**: Phân loại 86 ảnh PPTX thành categories rõ ràng, xác định usage strategy

### Phase 02: Hero Stage Spatial Fix
**Duration**: 1.5h  
**Goal**: Tái bố trí hero section để các elements không chồng lấn

### Phase 03: Scroll Animation System
**Duration**: 2h  
**Goal**: Intersection Observer + CSS animations cho timeline images và decorative elements

### Phase 04: Gallery Lightbox & Effects
**Duration**: 1.5h  
**Goal**: Hover effects nâng cao + lightbox modal cho gallery

### Phase 05: Verification & Review
**Duration**: 45 min  
**Goal**: Cross-browser testing, performance profiling, accessibility audit

## Total Estimated Effort

**~6 hours** (1 work session hoặc 2 sessions nếu có breaks)

## Trade-offs

Chưa so sánh approaches — sẽ được thực hiện trong Phase 02 (Hero Stage Redesign có 2 approach candidates).

## Better Approaches

Chưa xác định — cần inspect chi tiết layout hiện tại và asset dimensions trong Phase 01.

---

**Next Step**: Đọc `phase-01-asset-audit-categorization.md` để bắt đầu phân loại 86 ảnh.

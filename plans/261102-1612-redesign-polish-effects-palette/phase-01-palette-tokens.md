---
phase: 1
title: "Bảng màu và design tokens"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 01: Bảng màu và design tokens

## Goal
Giảm độ gắt của màu đỏ, giữ tông son gấm hiện tại, và gom mọi màu ghi cứng về biến trong `:root`.

## Files to Create / Modify
- Modify: `styles.css` (khối `:root` ở đầu file, `body`, `.story-node`, `.guestbook-card`, `.footer-cta-section`, `.letter-modal-backdrop`, `.narration-dock` và mọi `rgba(...)`/hex đỏ rải rác)
- Modify: `app.js` (màu cánh hoa trong `renderPetals`, gradient của ảnh Lộc đỏ)

## Tasks & Steps
1. Kiểm kê: liệt kê mọi hex và `rgba` đỏ trong `styles.css` và `app.js`, nhóm theo vai trò (nền trang, thẻ, nhấn, bóng, overlay).
2. Thêm biến mới vào `:root`: các tầng nền, màu thẻ, màu overlay, màu bóng dạng `rgb(var(--...))` để dùng được với alpha.
3. Đổi giá trị nền chính sang bản đã giảm bão hòa. Giá trị khởi điểm (tính từ công thức, cần tinh chỉnh bằng mắt): `#A81E1E / #7E1414 / #540A0A` sang khoảng `#9C2B27 / #75201D / #4D1614`. Giữ nguyên đỏ son rực của con dấu, nút chính, huy hiệu.
4. Thay các giá trị ghi cứng bằng biến. Không đổi bố cục ở phase này.
5. Đổi màu cánh hoa sang hồng đào và kem để nổi trên nền (chi tiết chuyển động ở phase 05).
6. Kiểm tra tương phản chữ/nền cho chữ thân (mục tiêu ≥ 4.5:1) và chữ vàng nhạt trên nền thẻ.

## Verification
- `grep -nE '#[0-9a-fA-F]{6}|rgba?\(' styles.css | grep -v ':root'` chỉ còn các giá trị không phải đỏ (trắng, đen cho bóng, vàng kim). Có thể liệt kê ngoại lệ có chủ đích.
- Chụp ảnh trước/sau ở 1280px để người dùng so tông màu; không tiếp tục phase 02 nếu người dùng chưa chấp nhận tông.
- Tương phản chữ thân đạt ≥ 4.5:1 (đo bằng công cụ tương phản hoặc Lighthouse).

## Risks
- Nền mất độ ấm khi giảm bão hòa. Cách xử lý: giữ hue, chỉ chỉnh độ sáng và bão hòa, và so sánh bằng mắt với bản gốc.

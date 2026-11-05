---
phase: 2
title: "Sửa lỗi cấu trúc, mobile, trợ năng"
status: pending
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 02: Sửa lỗi cấu trúc, mobile, trợ năng

## Goal
Loại bỏ các lỗi căn chỉnh và hành vi sai trước khi thêm hiệu ứng, để hiệu ứng không che lỗi.

## Files to Create / Modify
- Modify: `styles.css`
- Modify: `index.html`
- Modify: `app.js`

## Tasks & Steps
1. Timeline: tâm chấm mốc hiện ở x≈0 còn đường kẻ ở `left: 17px`. Dịch chấm về `left: calc(-2.8rem + 18px)` (hoặc dời đường kẻ) để trùng nhau, rồi đo lại trên trình duyệt.
2. Thư ngỏ: đặt nút đóng và 4 góc hoa văn ra ngoài vùng cuộn (bọc `.letter-paper` bằng khung cố định, phần cuộn là `.letter-scroll` bên trong), để nút đóng luôn hiện.
3. Phím Esc: đóng cả thư ngỏ và lightbox. Trả focus về phần tử đã mở, giữ focus trong modal khi đang mở.
4. Mobile: thêm breakpoint ~480px và ~360px. Giảm padding thẻ lịch sử, sổ lưu bút, giảm lề timeline; header thu gọn tên thương hiệu; dock vẫn hiện tên chương (cắt bằng `text-overflow`) thay vì ẩn hẳn.
5. Chuyển các `style="..."` inline trong `index.html` (màu huy hiệu chương 3, lưới ảnh, đoạn mô tả section) sang class.
6. Thứ tự heading: `h1` là tiêu đề trang (đưa lên hero), `h2` là các section. Sửa `index.html`.
7. Album: đổi `.gallery-item` thành `button` hoặc thêm `tabindex="0"`/`role="button"` và xử lý Enter/Space. Thêm nút trước/sau và phím mũi tên cho lightbox.
8. Chú thích ảnh: sửa "ẢNH 5-7", "ẢNH 10", "ẢNH 14-15" cho khớp ảnh thực sự hiển thị. Đối chiếu số ảnh với tên file, không đoán số thứ tự.
9. Ảnh tư liệu: thay `object-fit: cover` bằng `contain` cho ảnh bìa sách và ảnh lưu trữ, hoặc đặt `aspect-ratio` theo ảnh để không bị cắt. Bỏ hiệu ứng phóng to khi hover trên ảnh tư liệu.
10. Ghim phiên bản Lucide thay cho `@latest`. Ẩn các `[data-lucide]` cho tới khi icon được dựng để không nhấp nháy. Kiểm tra chữ Hán (金) trên con dấu và phong thư không hiện ô vuông khi thiếu font hệ thống; nếu có thì thêm font dự phòng hoặc thay bằng SVG.
11. Thay `alert()` trong sổ lưu bút bằng thông báo dạng toast (khung nhỏ dùng chung, `role="status"`).
12. Sổ lưu bút: hai lời chúc mẫu đổi thành lời chúc ẩn danh hoặc ghi rõ "Lời chúc mẫu"; sắp xếp lời chúc mới nhất lên đầu khi tải lại.

## Verification
- Chụp ảnh ở 360px, 768px, 1280px; kiểm tra bằng `document.documentElement.scrollWidth <= innerWidth` không có cuộn ngang.
- Đo khoảng cách chấm mốc và đường kẻ bằng `getBoundingClientRect()` ≤ 1px.
- Mở thư ngỏ, cuộn xuống, kiểm tra nút đóng còn nhìn thấy; bấm Esc đóng được.
- Duyệt toàn trang chỉ bằng bàn phím: mở phong thư, mở ảnh, đóng ảnh.
- Console sạch lỗi.

## Risks
- Tách `.letter-scroll` thay đổi cấu trúc DOM, có thể ảnh hưởng chữ cái đầu to (drop cap). Kiểm tra lại sau khi sửa.

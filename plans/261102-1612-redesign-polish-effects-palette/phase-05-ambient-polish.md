---
phase: 5
title: "Không khí, dock thuyết minh, chi tiết nhỏ"
status: pending
priority: P2
effort: "2h"
dependencies: [3, 4]
---

# Phase 05: Không khí, dock thuyết minh, chi tiết nhỏ

## Goal
Hoàn thiện lớp hiệu ứng nền và các chi tiết nhỏ tạo cảm giác cao cấp, đồng thời giữ hiệu năng và trợ năng.

## Files to Create / Modify
- Modify: `app.js` (canvas cánh hoa, dock thuyết minh, nhạc nền)
- Modify: `styles.css` (dock, nút, chữ nhũ vàng, `prefers-reduced-motion`)
- Modify: `index.html` (cấu trúc dock, nút đĩa nhạc)

## Tasks & Steps
1. Canvas cánh hoa: xử lý `devicePixelRatio`; ba lớp chiều sâu (hoa lớn mờ ở gần, hoa nhỏ rõ ở xa, tốc độ khác nhau); màu hồng đào/kem và bụi vàng; gió đung đưa. Giảm số hạt trên mobile, tạm dừng khi tab ẩn (`visibilitychange`) và khi giảm chuyển động.
2. Dock thuyết minh: thêm thanh tiến độ chương; thanh sóng âm dùng `scaleY` thay vì animate `height`; dock hiện tên chương trên mobile (cắt bằng dấu ba chấm); không chiếm chỗ nút khác.
3. Nút đĩa nhạc: đổi sang màu đồng bộ với bảng màu (bỏ nền đen/xám); chỉ xoay phần icon, không xoay cả nút.
4. Chữ nhũ vàng chạy ánh sáng ở tiêu đề section (dùng `background-clip: text` và dịch `background-position`); có chế độ tĩnh cho giảm chuyển động.
5. Nút chính: ánh quét khi hover bằng pseudo-element; thay `transition: all` bằng danh sách thuộc tính cụ thể.
6. Khối `prefers-reduced-motion: reduce` tập trung ở cuối `styles.css`; trong `app.js` đọc `matchMedia` để không khởi động canvas và các vòng lặp.
7. Nhạc nền Web Audio: giữ cơ chế, chỉ thêm cụm hợp âm và độ vang nhẹ để bớt cảm giác ngẫu nhiên; kiểm tra âm lượng giảm khi giọng đọc chạy (đã có).
8. Giọng đọc: nếu không có giọng tiếng Việt thì báo trong dock thay vì đọc sai; đổi tốc độ hoặc chọn chương khác không được làm nhảy chương (kiểm tra `cancel()` kích `onend`).

## Verification
- Trang Rendering của devtools: canvas sắc nét trên màn Retina (DPR 2), tốc độ khung ổn định.
- Giả lập tab ẩn: vòng lặp canvas dừng (không còn tiêu tốn CPU).
- Giảm chuyển động bật: không có animation lặp, canvas tắt.
- Đổi tốc độ hoặc bấm chương khi đang đọc: chỉ đọc đúng một chương, không nhảy chương.

## Risks
- Gradient chữ nhũ vàng có thể khó đọc ở cỡ nhỏ. Chỉ áp dụng cho tiêu đề lớn.

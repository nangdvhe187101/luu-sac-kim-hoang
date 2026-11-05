---
phase: 6
title: "Nội dung thiệp mời và kiểm thử cuối"
status: pending
priority: P2
effort: "1h"
dependencies: [5]
---

# Phase 06: Nội dung thiệp mời và kiểm thử cuối

## Goal
Thiệp thật sự là một lời mời có thông tin, album không lặp lại timeline, và toàn bộ plan được kiểm thử trên trình duyệt thật trước khi giao.

## Files to Create / Modify
- Modify: `index.html` (khối thông tin mời, album, chú thích)
- Modify: `styles.css` (khối thông tin mời)
- Modify: `app.js` (ảnh Lộc đỏ tải về, sổ lưu bút)

## Tasks & Steps
1. Thêm khối thông tin sự kiện sau thư ngỏ hoặc sau hero: thời gian, địa điểm, cách tham dự. Thiệp mời đến một sự kiện thật, nên giữ cách gọi "Thiệp Mời Khai Hội". Nội dung lấy đúng từ dữ liệu người dùng cung cấp; không tự bịa. Nếu chưa có dữ liệu, ghi "đang cập nhật" và báo lại cho người dùng.
2. Album: đưa cả bảy ảnh chưa dùng (06, 07, 11, 12, 13, 16, 18) vào album, thay các ô trùng với timeline, để album có 13 ảnh khác nhau. Xem từng ảnh trước khi đặt tiêu đề và chú thích; chú thích phải mô tả đúng nội dung ảnh. Đổi lưới sang bố cục không ép chiều cao để ảnh không bị cắt.
3. Cập nhật `meta description` và các comment HTML nói "toàn bộ 18 ảnh" cho đúng thực tế.
4. Ảnh "Lộc đỏ": chờ phông tải xong (`document.fonts.ready`) trước khi vẽ canvas; bỏ năm và dòng "Thần Kê Đại Cát • 2026", chỉ giữ lời chúc chung; dùng chữ Hán đúng phông hỗ trợ; có thể dùng một ảnh tranh làm họa tiết thay cho nền trơn.
5. Thống nhất thuật ngữ giấy ("xuyến chỉ" hay "tàu vang") giữa thư ngỏ và các chương, theo câu trả lời của người dùng.
6. Liệt kê mọi mốc năm hiện trên trang (hero, thư ngỏ, tiêu đề, các chương, chú thích ảnh) vào một bảng ngắn, báo cho người dùng các chỗ lệch nhau và chờ quyết định. Không tự sửa nội dung lịch sử. Đối chiếu thêm `alt` của từng ảnh, đặc biệt ảnh đen trắng băng rôn "HY SINH VÌ TỔ QUỐC", với chương nó nằm trong.
7. Chạy lượt kiểm thử cuối với toàn bộ tiêu chí chấp nhận ở `plan.md`.

## Verification
- Khởi động server tĩnh ở cổng cố định (ví dụ `python3 -m http.server 8765` trong thư mục dự án), ghi lại PID; mở trang ở 360px, 768px, 1280px và chụp ảnh các màn: hero, thư ngỏ, timeline, album, sổ lưu bút, footer.
- Đối chiếu từng tiêu chí 1 đến 9 trong `plan.md`.
- Console sạch lỗi, tab Network không có tài nguyên 404.
- Tắt server đã mở khi xong (kiểm tra bằng `lsof -i :8765`).

## Risks
- Khối thông tin mời phụ thuộc dữ liệu chưa có. Nếu người dùng chưa cung cấp, giữ chỗ bằng nội dung rõ ràng là "đang cập nhật", không dùng ngày giả.

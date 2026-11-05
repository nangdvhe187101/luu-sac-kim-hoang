---
phase: 3
title: "Phong thư và chuỗi mở thiệp"
status: pending
priority: P1
effort: "3h"
dependencies: [2]
---

# Phase 03: Phong thư và chuỗi mở thiệp

## Goal
Phong thư trông như phong thư thật, và việc mở thiệp là một chuỗi chuyển động liền mạch thay vì modal bật lên đột ngột.

## Files to Create / Modify
- Modify: `styles.css` (`.envelope-*`, `.wax-seal`, `.letter-*`)
- Modify: `index.html` (cấu trúc phong thư, hero)
- Modify: `app.js` (`openLetter`, `closeLetter`)

## Tasks & Steps
1. Phong thư: dựng nắp và hai mảnh gấp bên bằng `clip-path` có viền vàng thật (dùng lớp lót vàng phía sau mảnh đỏ, vì `border` không đi theo `clip-path`). Thêm đường nếp gấp, bóng chuyển sắc nhẹ, hoa văn dệt chìm trên thân.
2. Hero: bỏ lặp. Chỉ giữ một lần tên thương hiệu lớn và một lần câu "Chạm sắc son, lưu dấu người..." (hiện đang lặp hai lần). Tăng kích thước logo.
3. Trình tự mở (dùng class trạng thái trên phong thư và `transitionend`, không dùng `setTimeout` cố định):
   1. Con dấu rạn và mờ dần (opacity/scale).
   2. Nắp lật lên, xong mới đến bước sau.
   3. Lá thư trượt ra khỏi phong bì (translateY) rồi phóng lớn lên thành modal.
   4. Tiêu đề, từng đoạn, chữ ký, nút hiện lần lượt (stagger bằng biến CSS `--i`).
4. Đóng thư thì chạy chuỗi ngược lại, ngắn hơn.
5. Con dấu: bỏ animation `box-shadow` lặp (đè mất hiệu ứng hover). Thay bằng một lớp giả (pseudo-element) đổi `opacity` và `scale`; hover thêm phát sáng.
6. Ánh vàng quét qua viền phong thư một lần khi trang tải xong, sau đó phong thư nhẹ nhàng nổi lên xuống (chỉ `transform`).
7. Âm thanh chuông mở thiệp đồng bộ với bước nắp lật.
8. Giảm tải màn hình đầu: header chỉ giữ logo (bỏ chữ thương hiệu lặp lại logo trên desktop), menu và các nút; chọn một trong hai lớp nền động (parallax hoặc cánh hoa) làm lớp chính, lớp còn lại chỉ bật sau khi thiệp đã mở. Con dấu là hành động nổi bật duy nhất.
9. Lối tắt: thêm liên kết nhỏ "Bỏ qua, xem câu chuyện" ở hero và trong thư ngỏ, cuộn thẳng tới `#storyline`. Phong thư vẫn là lối vào mặc định.

## Verification
- Quay hoặc chụp chuỗi ảnh ở các mốc 0%, 33%, 66%, 100% của chuỗi mở; xác nhận nắp lật nhìn thấy được trước khi modal xuất hiện.
- Chạy `prefers-reduced-motion: reduce` (giả lập trong devtools): thư hiện ngay, không lật, không quét sáng.
- Mở và đóng thư 5 lần liên tiếp, bấm nhanh: không kẹt trạng thái, không lặp âm.
- Panel Performance: chuỗi mở giữ 60fps trên máy cấu hình trung bình, không có layout thrash.

## Risks
- `rotateX` trên nắp bị `clip-path` cắt mất nửa sau khi lật. Cách xử lý: đặt `clip-path` trên phần tử con, `transform` trên phần tử cha.
- Dựa vào `transitionend` dễ kẹt nếu transition bị hủy. Đặt thêm một timer dự phòng dài hơn tổng thời lượng.

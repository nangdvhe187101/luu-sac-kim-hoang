---
phase: 4
title: "Hiệu ứng cuộn, timeline, album"
status: pending
priority: P2
effort: "3h"
dependencies: [2]
---

# Phase 04: Hiệu ứng cuộn, timeline, album

## Goal
Phần dài nhất của trang (timeline và album) có nhịp chuyển động khi cuộn, thay vì hiện sẵn toàn bộ.

## Files to Create / Modify
- Modify: `app.js` (thêm `IntersectionObserver`, tiến độ cuộn)
- Modify: `styles.css` (trạng thái `.reveal`, `.is-in`, timeline, album)
- Modify: `index.html` (gắn `data-reveal` cho thành phần cần hiện dần)

## Tasks & Steps
1. Một `IntersectionObserver` dùng chung cho mọi phần tử `[data-reveal]`: thêm class `is-in` khi vào khung nhìn rồi ngừng quan sát. Mặc định (không có JS hoặc giảm chuyển động) nội dung hiện sẵn, tránh trang trống.
2. Thẻ chương: huy hiệu năm, tiêu đề, đoạn văn hiện lần lượt bằng `translateY` và `opacity` với độ trễ nhỏ.
3. Đường timeline: phần vàng đổ dần theo tiến độ cuộn qua `scaleY` (cập nhật trong `requestAnimationFrame`, đã có sẵn cơ chế cuộn). Chấm mốc nảy lên khi tới chương.
4. Ảnh tư liệu: mở bằng `clip-path: inset(...)` và thu nhỏ chậm từ 1.08 về 1.
5. Album: các ô hiện lần lượt; hover nghiêng nhẹ theo con trỏ (giới hạn ±4°, tắt trên thiết bị cảm ứng).
6. Thẻ đang được đọc: thay `scale(1.02)` bằng quầng sáng vàng và làm mờ nhẹ các thẻ khác, để chữ không bị rung và bố cục không bị đẩy.
7. Bỏ `backdrop-filter` và `will-change` thường trực trên bảy thẻ chương (gây nặng máy yếu); dùng nền đặc có độ trong suốt.
8. Lightbox: phóng ảnh từ vị trí ô nhỏ ra (FLIP đơn giản bằng `transform`), có chuyển cảnh khi chuyển ảnh trước/sau.
9. Hiệu ứng parallax nền: chặn việc lộ mép bằng cách phóng nền lên ~10% hoặc giới hạn mức dịch.

## Verification
- Cuộn từ đầu đến cuối trang ở ba kích thước; mọi khối đều hiện, không khối nào kẹt ở trạng thái ẩn (kiểm tra cuộn nhanh bằng phím End).
- Tắt JavaScript: toàn bộ nội dung vẫn đọc được.
- `prefers-reduced-motion`: mọi thứ hiện sẵn, không chuyển động.
- Performance: không có Long Task >50ms trong lúc cuộn; số lớp compositing hợp lý.

## Risks
- Phần tử bị ẩn trước khi quan sát có thể nhảy bố cục khi hiện. Chỉ dùng `transform`/`opacity` để không đổi kích thước.
- Cuộn tự động của giọng đọc (`scrollIntoView`) xung đột với tiến độ cuộn. Kiểm tra cả hai chạy cùng lúc.

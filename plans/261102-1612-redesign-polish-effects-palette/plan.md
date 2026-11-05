---
title: "Lưu Sắc Kim Hoàng: sửa lỗi giao diện, nâng cấp hiệu ứng, làm dịu màu đỏ"
description: "Làm lại các điểm chưa đẹp của thiệp mời di sản, thêm hiệu ứng cuộn và mở thiệp, và giảm độ gắt của màu đỏ mà vẫn giữ tông son gấm hiện tại."
status: pending
priority: P2
effort: 14h
tags: [frontend, refactor, experimental]
blockedBy: []
blocks: []
created: 2026-11-02
---

# Lưu Sắc Kim Hoàng: redesign và polish

Dự án là một trang tĩnh gồm ba file: `index.html`, `styles.css`, `app.js`, cùng thư mục `assets/`. Không có bước build, không có thư viện ngoài ngoại trừ Lucide và Google Fonts nạp từ CDN. Kế hoạch này giữ nguyên kiến trúc đó.

## Outcome

Trang thiệp mời trông hoàn thiện và cao cấp hơn, đỏ dịu hơn nhưng vẫn là tông son gấm người dùng thích, và có chuyển động mượt khi mở thiệp và khi cuộn.

## Constraints

- Giữ ba file, không thêm framework hay bước build. Chỉ animate `transform` và `opacity`.
- Giữ tông màu hiện tại. Người dùng thích màu này nhưng thấy "hơi đỏ", nên chỉ giảm độ bão hòa, không đổi sắc.
- Mọi hiệu ứng phải tôn trọng `prefers-reduced-motion`.
- Giữ nguyên nội dung lịch sử và các ảnh trong `assets/`. Không tự thêm số liệu hay tên người.
- Process: server xem thử dùng một cổng cố định, và phải tắt khi xong (theo `process-management.md`).

## Non-goals

- Không thêm backend. Sổ lưu bút vẫn lưu `localStorage`.
- Không thay đổi nội dung chương lịch sử, kể cả khi hai bản (giọng đọc và hiển thị) khác nhau về lời văn, trừ khi người dùng yêu cầu.
- Không làm nhạc nền thật. Chỉ chỉnh bản tổng hợp Web Audio hiện có.

## Acceptance criteria

1. Ở 360px, 768px và 1280px không có chữ tràn hoặc bị cắt, và không có thanh cuộn ngang.
2. Chấm mốc timeline nằm đúng trên đường kẻ (lệch ≤ 1px).
3. Nút đóng thư ngỏ luôn thấy khi cuộn; Esc đóng được thư ngỏ và lightbox.
4. Độ bão hòa các nền chính ≤ 60%; không còn màu đỏ ghi cứng ngoài khối `:root`.
5. Chuỗi mở thiệp chạy đủ: con dấu, nắp lật, thư trượt lên, nội dung hiện lần lượt, không bị modal che nắp.
6. Thẻ lịch sử, ảnh và album hiện dần khi cuộn; đường timeline đổ vàng theo tiến độ cuộn.
7. Bật giảm chuyển động thì không còn animation lặp hoặc di chuyển lớn.
8. Chú thích ảnh khớp số ảnh và nguồn ảnh; không còn `alert()`.
9. Console không báo lỗi khi tải trang ở cả ba kích thước.
10. Màn hình đầu chỉ có một hành động nổi bật (con dấu), và người dùng có thể bỏ qua thiệp để vào thẳng phần câu chuyện.
11. Mọi mốc năm hiện trên trang (1701, 1915, "trăm năm", "300 năm") đã được liệt kê và người dùng đã xác nhận cách thống nhất.

## Phases

Các phase đều sửa chung `styles.css`, `index.html`, `app.js`, nên chạy tuần tự, không chạy song song.

| # | Phase | Trạng thái | Phụ thuộc |
|---|-------|-----------|-----------|
| 01 | [Bảng màu và design tokens](phase-01-palette-tokens.md) | pending | không |
| 02 | [Sửa lỗi cấu trúc, mobile, trợ năng](phase-02-structural-fixes.md) | pending | 01 |
| 03 | [Phong thư và chuỗi mở thiệp](phase-03-envelope-sequence.md) | pending | 02 |
| 04 | [Hiệu ứng cuộn, timeline, album](phase-04-scroll-effects.md) | pending | 02 |
| 05 | [Không khí, dock thuyết minh, chi tiết nhỏ](phase-05-ambient-polish.md) | pending | 03, 04 |
| 06 | [Nội dung thiệp mời và kiểm thử cuối](phase-06-content-verification.md) | pending | 05 |

## Quyết định đã chốt với người dùng

1. Màu đỏ: mức 1, chỉ đổi màu (giảm bão hòa còn khoảng 55-60%). Không thêm mảng nền giấy kem.
2. Thiệp mời đến một sự kiện thật, nên giữ cách gọi "Thiệp Mời Khai Hội" và thêm khối thông tin sự kiện ở phase 06.
3. Ảnh "Lộc đỏ": bỏ năm và chữ "Thần Kê Đại Cát", chỉ để lời chúc chung.
4. Bảy ảnh chưa dùng (06, 07, 11, 12, 13, 16, 18) đều đưa vào album, thay các ô trùng với timeline. Album sẽ có đủ 13 ảnh khác nhau.

## Bổ sung từ đánh giá giao diện ngày 2026-11-03

Đánh giá từ góc nhìn người dùng trùng phần lớn với các phase trên (ảnh trùng, chú thích sai, hero lặp, mobile, trợ năng, icon). Các điểm chưa có trong plan được thêm như sau:

- Màn hình đầu quá nhiều lớp (header đủ logo, chữ, 4 mục menu, 3 nút; thêm nền parallax và canvas cánh hoa): phase 03, task 8.
- Hai lớp chặn (phong thư rồi thư ngỏ dài) trước khi tới nội dung: phase 03, task 9.
- Icon Lucide tải trễ gây nhấp nháy, chữ Hán phụ thuộc font máy: phase 02, task 10.
- Mốc năm không thống nhất (1701, 1915, "300 năm", "trăm năm"): phase 06, task 6. Chỉ liệt kê và hỏi, không tự sửa vì thuộc nội dung lịch sử.
- Đánh giá ban đầu nói màu nền chưa khớp ảnh hero. Điểm này không đưa vào plan vì trái với quyết định đã chốt ở mục 1 phía trên (người dùng xác nhận giữ nguyên quyết định giảm bão hòa).

## Unresolved questions

1. Thông tin sự kiện (ngày, giờ, địa điểm, cách tham dự) cụ thể là gì? Phase 06 cần dữ liệu này, nếu chưa có thì giữ chỗ "đang cập nhật" và không dùng ngày giả.
2. Lời chúc chung trên ảnh "Lộc đỏ" muốn viết thế nào? Nếu không có yêu cầu, dùng câu "Vạn Sự Hanh Thông • An Khang Thịnh Vượng" đang có sẵn.
3. Thuật ngữ giấy: dùng "xuyến chỉ" (các chương lịch sử) hay "tàu vang" (thư ngỏ)?
4. Font tiêu đề: logo là chữ thư pháp mềm, còn trang dùng Playfair Display. Có muốn đổi font tiêu đề cho gần logo không? Chưa có quyết định nên plan chưa đổi font.
5. Mốc thời gian: hero ghi "Khởi Nguyên 1701" và "300 năm", thư ngỏ ghi lũ 1915 và "gần trọn một thế kỷ", tiêu đề là "Chuyện Trăm Năm". Muốn thống nhất theo mạch nào?

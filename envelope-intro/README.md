# Envelope intro – Lưu Sắc Kim Hoàng

## Cài vào site
1. Chép cả thư mục `envelope-intro/` vào thư mục public của site (cùng cấp với `assets/`, `tranh/`).
2. Thêm vào `<head>`:  `<link rel="stylesheet" href="/envelope-intro/envelope-intro.css">`
3. Thêm trước `</body>`:  `<script src="/envelope-intro/envelope-intro.js" defer></script>`
   (thêm `data-once="session"` nếu chỉ muốn hiện 1 lần mỗi phiên)
4. Ẩn/xoá màn hình bìa cũ ("Thiệp mời – Mở thiệp"). Nếu bìa cũ đang khoá cuộn trang hoặc chạy hiệu ứng riêng,
   gọi hàm mở của nó trong hook:
   `window.onInvitationOpened = function(){ /* ví dụ: openOldCover() */ };`
   hoặc `window.addEventListener('invitation:opened', ...)`.

Xem thử: `python3 -m http.server` trong thư mục này rồi mở `demo.html`.

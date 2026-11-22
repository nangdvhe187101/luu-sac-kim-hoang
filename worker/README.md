# Worker "Kim Hoàng Gallery API"

Mã chạy trên Cloudflare (không chạy trên Vercel). Thư mục này **không** được deploy cùng website (đã nằm trong `.vercelignore`).

## Cập nhật lên Cloudflare
1. Cloudflare → Workers & Pages → `kim-hoang-gallery-api` → **Edit code**.
2. Xoá code cũ, dán toàn bộ nội dung `worker/index.js`, bấm **Deploy**.
3. Kiểm tra Settings → Bindings vẫn còn `GALLERY_BUCKET` (R2). Không cần thêm gì khác.

## Biến tuỳ chọn (Settings → Variables)
| Tên | Tác dụng |
|---|---|
| `ALLOWED_ORIGINS` | Thêm domain được phép gửi tranh, cách nhau bằng dấu phẩy. Ví dụ bản thử trên Vercel: `https://ten-du-an.vercel.app` hoặc `http://localhost:3000` khi chạy thử trên máy. |
| `UPLOADS_DISABLED` | Đặt `1` để khoá ngay việc gửi tranh khi bị lạm dụng. Xoá biến hoặc đặt `0` để mở lại. |
| `PUBLIC_R2_URL` | Địa chỉ công khai của R2, nếu sau này đổi sang domain riêng. |

## Quản lý ảnh xấu
Vào R2 → bucket → thư mục `paintings/` → xoá file. Trang tự cập nhật sau tối đa 10 giây.

## Đã chặn
- Chỉ nhận ảnh WebP/PNG/JPEG thật (kiểm tra nội dung, không tin tên file), tối đa 1MB.
- Chỉ nhận từ domain của website (kiểm tra `Origin`).
- Tối đa 6 lần gửi / 10 phút / mỗi IP (lưu bản băm, không lưu IP thật).
- Tên ký bị làm sạch: bỏ link, tên miền, thẻ HTML, tối đa 40 ký tự.
- Địa chỉ ảnh do Worker tự tạo; khoá lạ trong R2 không bao giờ được trả về.

## Chưa chặn được
- Ảnh có nội dung phản cảm (Worker không nhìn được nội dung). Dùng `UPLOADS_DISABLED` và xoá tay khi cần.
- Người cố tình giả `Origin` bằng công cụ dòng lệnh vẫn gửi được, nhưng bị giới hạn tần suất và dung lượng.

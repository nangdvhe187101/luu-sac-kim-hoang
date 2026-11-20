# Lưu Sắc Kim Hoàng - Dự án Phục dựng & Lan tỏa Dòng tranh Dân gian Kim Hoàng

Dự án bảo tồn, phục dựng và lan tỏa giá trị di sản dòng tranh dân gian Kim Hoàng (Hoài Đức, Hà Nội) vào đời sống đương đại.

---

## 🌟 Cấu trúc mã nguồn

Dự án được xây dựng với cấu trúc frontend chuẩn, tối ưu hóa responsive, hiệu năng cao và dễ dàng mở rộng:

- **`index.html`**: Trang chủ chính thức giới thiệu tổng quan dự án, hành trình, bộ sưu tập tranh, sản phẩm sáng tạo và tin tức.
- **`vi/`**: Các chuyên trang chuyên sâu:
  - `vi/introduction/`: Giới thiệu dự án, nghệ nhân Đào Đình Chung, chuyên gia TS. Nguyễn Thị Thu Hòa, danh sách đối tác & nhà tài trợ.
  - `vi/visit/`: Không gian tham quan bộ sưu tập tranh Kim Hoàng, hành trình phục dựng và không gian trải nghiệm thực tế ảo 3D (`/vi/visit/3d`).
  - `vi/services/`: Danh mục sản phẩm sáng tạo (quà lưu niệm, charm da, tranh minh họa sáng tạo).
  - `vi/events/`: Lịch sự kiện, workshop và hoạt động cộng đồng.
  - `vi/posts/`: Tin tức, báo chí (Nhân Dân, Tiền Phong, Thông tấn xã VNA, Tracuudi).
  - `vi/search/`: Trang tìm kiếm toàn diện.
- **`trien-lam-3d/`**: Ứng dụng Không gian Bảo tàng Số 3D (Three.js WebGL) tương tác: sảnh đón tiếp lễ tân & màn hình tư liệu lớn, hành lang tròn trưng bày bộ sưu tập tranh Kim Hoàng, phòng tròn trung tâm trải nghiệm vẽ tranh 3D cùng nghệ nhân Đào Đình Chung (in mộc bản, tô màu, ký tên) và bức tường mosaic khổng lồ Lưu Sắc Kim Hoàng lưu trữ tranh trên Cloudflare R2 (tích hợp trực tiếp tại `/vi/visit/3d` và mở toàn trang tại `/trien-lam-3d/`).
- **`css/style.css`**: Hệ thống CSS đồng bộ (bảng màu đỏ hồng điều Kim Hoàng, typography, responsive mobile & desktop).
- **`js/main.js`**: Điều khiển menu dropdown, mobile drawer điều hướng, tìm kiếm tự động, slider carousels.
- **`footer.html` & `scripts/sync-footer.js`**: Footer dùng chung đồng bộ tự động trên toàn bộ các trang.
- **`fonts/`**: Bộ font chữ tối ưu (`BeVietnamPro`, `OPTIMA`).
- **`media/` & `images/`**: Hình ảnh tư liệu, tranh cổ phục dựng, sản phẩm sáng tạo và video chất lượng cao.

---

## 🚀 Hướng dẫn khởi chạy

### Sử dụng Node.js

```bash
npm start
# hoặc
npm run dev
# hoặc
node server.js
```

Sau đó mở trình duyệt và truy cập: **`http://localhost:3001`** (hoặc `http://localhost:3000`).

---

### Sử dụng Python

```bash
python3 -m http.server 3000
```

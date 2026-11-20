# TRIỂN LÃM 3D BẢO TÀNG TRANH DÂN GIAN KIM HOÀNG
> Trải nghiệm không gian thực tế ảo 3D tương tác & Xưởng in tranh mộc bản dân gian Kim Hoàng.

---

## 🏛️ Cấu trúc dự án
- `index.html`: Trang chuyển hướng chính vào bảo tàng 3D.
- `threejs-3d-room.html`: Không gian bảo tàng 3D hoàn chỉnh (WebGL Three.js), bao gồm:
  - Sảnh lễ tân & video tư liệu văn hóa.
  - Hành lang tròn trưng bày các tác phẩm tranh dân gian Kim Hoàng.
  - Phòng tròn trung tâm (Phòng vẽ): Gặp gỡ nghệ nhân Đào Đình Chung, tự tay in mộc bản, tô màu & ký tên tranh.
  - Bức tường mosaic khổng lồ ghép chữ **"LƯU SẮC KIM HOÀNG"** lưu trữ tranh của du khách qua Cloudflare R2.
- `kim-hoang-museum-showcase.js`: Hệ thống đồng bộ và hiển thị tranh cộng đồng trên tường mosaic.
- `kim-hoang-descriptions.js`: Dữ liệu thuyết minh và tư liệu lịch sử cho từng bức tranh.
- `game/`: Module minigame xưởng tranh (mô hình 3D Ông Đồ, bàn in mộc bản, bảng màu, cọ vẽ).
- `models/`: Mô hình 3D tối ưu hóa (đèn thả LED, lễ tân áo dài Việt Nam).
- `tranh/`: Toàn bộ bộ sưu tập ảnh tranh dân gian Kim Hoàng sắc nét.
- `video/`: Video tài liệu chiếu trên màn hình LED bảo tàng.

---

## 🚀 Hướng dẫn khởi chạy

Vì dự án tải mô hình 3D (`.glb`), texture và âm thanh qua Three.js, trình duyệt yêu cầu chạy qua một HTTP Server cục bộ (local web server) để tránh lỗi CORS:

### Cách 1: Sử dụng Python (đã có sẵn trên macOS/Linux/Windows)
Mở Terminal tại thư mục này và gõ:
```bash
python3 -m http.server 8000
```
Sau đó mở trình duyệt truy cập: **`http://localhost:8000`**

### Cách 2: Sử dụng Node.js (`npx serve`)
```bash
npx serve .
```

### Cách 3: Sử dụng tiện ích mở rộng Live Server (VS Code)
- Mở thư mục này trong Visual Studio Code.
- Nhấp chuột phải vào tệp `index.html` hoặc `threejs-3d-room.html` và chọn **"Open with Live Server"**.

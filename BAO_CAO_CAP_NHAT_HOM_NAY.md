# Tổng hợp các hạng mục cập nhật hôm nay (10/11/2026)

Tài liệu này tổng hợp toàn bộ các công việc nâng cấp giao diện (UI/UX), tái cấu trúc mã nguồn theo mô hình MVC và sửa lỗi điều hướng đã thực hiện trên dự án **CLB Golf Đa Phước và những người bạn**.

---

## 1. Nâng cấp giao diện Trang chủ, Header & Footer theo bố cục `thapsangniemtin.vn`

Giữ nguyên bảng màu xanh dương sáng truyền thống của CLB Golf Đa Phước (`--accent: #19578f`, `--accent-hover: #124674`, `--accent-soft: #edf4fa`, `--ink: #172d43`, nền hero `#f0f6fb`), đồng thời triển khai cấu trúc UI hiện đại:

- **Header ([`src/views/public/partials/header.view.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/views/public/partials/header.view.ts))**:
  - Thanh điều hướng cố định nền xanh `#19578f`, cụm logo + tên CLB, menu chính kèm menu con xổ xuống tại mục _Về chúng tôi_ (_Tổng quan CLB_, _Ban điều hành Quỹ_, _Tri ân mạnh thường quân_).
  - Cụm 2 nút kêu gọi hành động (CTA) bên phải: **Đồng hành** (`HonorList.php`) và **Liên hệ** (`contact.php`).
- **Trang chủ ([`src/views/public/pages/home.view.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/views/public/pages/home.view.ts))**:
  - **Hero Banner 2 cột (`.tsnt-hero`)**: Cột trái gồm badge định danh, tiêu đề hiệu ứng gõ chữ động (`data-typewriter`), mô tả sứ mệnh và 2 nút điều hướng; cột phải là **Carousel ảnh hoạt động nổi bật** (`[data-hero-carousel]` trong [`public/JS/site.js`](file:///d:/CLBGOLFDAPHUOC/Web-clb/public/JS/site.js#L430-L473)) có nút chuyển slide, chấm phân trang và tự động chuyển ảnh.
  - **Khối Về chúng tôi & Tác động (`#ve-chung-toi`)**: Khung ảnh tiêu biểu hỗ trợ phóng to (lightbox) đi kèm lưới 4 thẻ số liệu tác động (`.tsnt-impact-grid`).
  - **Khối Học bổng & Hỗ trợ (`#hoc-bong`)**: Bố cục 2 cột gồm bảng danh sách Thông báo xét cấp học bổng từ Ban điều hành và 3 thẻ truy cập nhanh (`.tsnt-quick-cards`).
  - **Khối Người Thắp Sáng Niềm Tin (`#nguoi-thap-sang-niem-tin`)**: Lưới vinh danh các mạnh thường quân và đơn vị đồng hành (`.tsnt-sponsors-grid`).
  - **Khối Cộng đồng CLB Đa Phước (`#cong-dong`)**: Bố cục Bento Grid (`.tsnt-community-bento`) gồm 1 bài hoạt động lớn nổi bật bên trái và 3 bài hoạt động vệ tinh bên phải.
  - **Khối Hoạt động tổng hợp (`#hoat-dong`)**: Gồm hộp đôi _Thông báo từ BĐH_ & _Tin tức mới nhất_ (`.tsnt-dual-boxes`), danh sách gương mặt sinh viên _We're Shining_ (`.tsnt-shining-grid`) và _Bản tin Chung tay & Góc sẻ chia_ (`Blog`).
- **Footer ([`src/views/public/partials/footer.view.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/views/public/partials/footer.view.ts))**:
  - Dải CTA kêu gọi đồng hành (`.footer-cta-strip`), dải 3 chỉ số cam kết minh bạch (`.footer-stats-strip`) và 5 cột thông tin/liên kết điều hướng.

---

## 2. Nâng cấp giao diện cụm trang Về chúng tôi (`About.php` & `ExecutiveBoard.php`)

- **Trang Tổng quan Giới thiệu ([`src/views/public/pages/about.view.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/views/public/pages/about.view.ts))**:
  - **Page Banner căn giữa (`.tsnt-page-banner`)**: Căn giữa thanh đường dẫn breadcrumb, huy hiệu _"Về chúng tôi"_, tiêu đề 2 tầng tách biệt (`.tsnt-banner-title-org` và `.tsnt-banner-title-main` giúp tên CLB không bị ngắt chữ lẻ dòng) và mô tả phụ.
  - **Câu chuyện & Tôn chỉ hoạt động (`#ton-chi`)**: Bố cục 2 cột gồm nội dung tôn chỉ từ cơ sở dữ liệu (`principle`), khung trích dẫn (`blockquote.tsnt-story-quote`), nút điều hướng và cụm ảnh ghép đa lớp (`.tsnt-story-collage`) có ảnh phụ cùng huy hiệu nổi.
  - **Thông tin tổ chức (`.tsnt-org-section`)**: Giới thiệu định danh CLB kèm 4 thẻ thông tin nhanh (Khu vực hoạt động, Điện thoại, Email, Sứ mệnh trọng tâm).
  - **Sứ mệnh & Giá trị cốt lõi (`#tam-nhin-su-menh`)**: Bố cục **5 cột dọc ngang hàng** (`.tsnt-pillars-grid`) với 5 biểu tượng SVG và 5 tông màu pastel riêng biệt (_Chắp cánh tri thức_, _Đồng hành dài hạn_, _Phát triển toàn diện_, _Kết nối cộng đồng_, _Kiến tạo nguồn nhân lực_).
  - **Lộ trình & Mục tiêu phát triển (`#muc-tieu`)**: Trục thời gian so le (`.tsnt-timeline`) hiển thị các mục tiêu (`target`) theo từng giai đoạn kèm ảnh minh họa.
  - **Phạm vi & Phương thức hoạt động (`.tsnt-about-bottom-grid`)**: Bố cục 2 cột hiển thị dữ liệu `scope` và `method`.
- **Trang Ban điều hành Quỹ ([`src/views/public/pages/executive-board.view.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/views/public/pages/executive-board.view.ts))**:
  - Đồng bộ `.tsnt-page-banner` căn giữa và hiển thị danh sách **Ban điều hành** cùng **Ban cố vấn** kèm huy hiệu đếm số lượng thành viên (`.tsnt-team-count`).

---

## 3. Tái cấu trúc mã nguồn theo chuẩn mô hình MVC (`src/`)

Mã nguồn trong `src/` được tách nhỏ theo đúng trách nhiệm từng tầng **Model – View – Controller** và từng trang riêng biệt:

```text
src/
├── server.ts                                  # HTTP Server & Router chính
├── core/
│   ├── config.ts                              # Biến môi trường, lỗi chuẩn & tiện ích ngày/ảnh
│   ├── content.ts                             # Logic hiển thị thông báo & album ảnh
│   └── http.ts                                # Xử lý form upload, Session, Gzip & Response
├── models/
│   ├── types.ts                               # Các interface dữ liệu (PublicPageModel, RouteResult...)
│   ├── repository.ts                          # Các hàm truy vấn nền tảng (record, save, remove, collection)
│   ├── post.model.ts                          # Model Bài viết (Hoạt động, Thông báo, Blog)
│   ├── member.model.ts                        # Model Ban điều hành & Sinh viên
│   ├── about.model.ts                         # Model Giới thiệu CLB
│   ├── sponsor.model.ts                       # Model Mạnh thường quân
│   ├── setting.model.ts                       # Model Cài đặt thông tin website
│   ├── supabase.ts                            # Kết nối Supabase REST & Storage
│   └── legacy.ts                              # Dữ liệu mặc định khi chạy chế độ xem trước (Preview)
├── services/
│   ├── admin.ts                               # Xác thực quản trị viên & kiểm duyệt file ảnh tải lên
│   └── public-blog.ts                         # Kiểm duyệt & chống spam biểu mẫu gửi bài Blog công khai
├── views/
│   ├── public/
│   │   ├── components.ts                      # Các hàm helper dùng chung (card, toolbar, breadcrumb...)
│   │   ├── pages.ts                           # Điểm điều phối renderPublicPage
│   │   ├── partials/
│   │   │   ├── header.view.ts                 # Header công khai
│   │   │   ├── footer.view.ts                 # Footer công khai
│   │   │   ├── dialogs.view.ts                # Hộp thoại phóng to ảnh & Toast
│   │   │   └── layout.view.ts                 # Khung HTML tổng (publicFrame)
│   │   └── pages/
│   │       ├── home.view.ts                   # Giao diện Trang chủ (index.php)
│   │       ├── about.view.ts                  # Giao diện Giới thiệu (About.php)
│   │       ├── executive-board.view.ts        # Giao diện Ban điều hành (ExecutiveBoard.php)
│   │       ├── activities.view.ts             # Giao diện Hoạt động (Activities.php)
│   │       ├── notifications.view.ts          # Giao diện Thông báo (Notifications.php)
│   │       ├── blog.view.ts                   # Giao diện Blog sẻ chia (Blog.php)
│   │       ├── students.view.ts               # Giao diện Hỗ trợ sinh viên (Students.php)
│   │       ├── honor-list.view.ts             # Giao diện Tri ân mạnh thường quân (HonorList.php)
│   │       ├── contact.view.ts                # Giao diện Liên hệ (contact.php)
│   │       └── detail.view.ts                 # Giao diện Chi tiết bài viết (detail.php, detail_blog.php)
│   └── admin/
│       ├── components.ts                      # Các hàm hỗ trợ form quản trị
│       ├── pages.ts                           # Barrel export các view quản trị
│       ├── partials/
│       │   ├── sidebar.view.ts                # Thanh menu trái trang quản trị
│       │   ├── topbar.view.ts                 # Thanh tiêu đề trên trang quản trị
│       │   └── layout.view.ts                 # Khung HTML trang quản trị (adminFrame)
│       └── pages/
│           ├── login.view.ts                  # Giao diện Đăng nhập (login.php)
│           ├── dashboard.view.ts              # Giao diện Tổng quan (index.php)
│           ├── posts.view.ts                  # Giao diện Danh sách & Sửa bài viết
│           ├── team.view.ts                   # Giao diện Quản lý Ban điều hành & Sinh viên
│           ├── content.view.ts                # Giao diện Quản lý Giới thiệu & Tài trợ
│           └── settings.view.ts               # Giao diện Cài đặt thông tin website
└── controllers/
    ├── public.ts                              # Router điều hướng trang công khai
    ├── public/                                # Các controller xử lý dữ liệu từng trang công khai
    │   ├── home.controller.ts
    │   ├── about.controller.ts
    │   ├── executive-board.controller.ts
    │   ├── activities.controller.ts
    │   ├── notifications.controller.ts
    │   ├── blog.controller.ts
    │   ├── students.controller.ts
    │   ├── honor-list.controller.ts
    │   └── detail.controller.ts
    ├── admin.ts                               # Router điều hướng trang quản trị
    └── admin/                                 # Các controller xử lý nghiệp vụ từng trang quản trị
        ├── helpers.ts
        ├── auth.controller.ts
        ├── dashboard.controller.ts
        ├── posts.controller.ts
        ├── team.controller.ts
        ├── content.controller.ts
        └── settings.controller.ts
```

---

## 4. Khắc phục điều hướng trang Đăng nhập Quản trị (`src/server.ts`)

- Bổ sung chuyển hướng tự động trong [`src/server.ts`](file:///d:/CLBGOLFDAPHUOC/Web-clb/src/server.ts#L213-L222) cho các đường dẫn:
  - `/admin` → `/admin/index.php` → `/admin/login.php`
  - `/login`, `/login.php`, `/admin/login` → `/admin/login.php`
- Khắc phục triệt để lỗi chuyển hướng tương đối về `/login.php` gây lỗi 404 khi gõ `/admin` thiếu dấu `/`.

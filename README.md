# CLB Golf Đa Phước

Website PHP, CSS và JavaScript thuần. Giao diện nền sáng, menu xanh và ảnh hoạt động được mô tả trong [DESIGN.md](DESIGN.md).

## Dữ liệu

Supabase PostgreSQL là nơi lưu nội dung khi đã cấu hình. PHP truy cập Data API phía máy chủ; ảnh mới được lưu trong bucket công khai site-media.

- posts: Hoạt động, Thông báo, Blog; nháp/xuất bản, nội dung thường hoặc HTML cũ được làm sạch khi hiển thị.
- members: Ban điều hành, cố vấn và sinh viên.
- sponsors, about_sections, settings: tri ân, giới thiệu, thông tin liên hệ và ảnh chính trang chủ.
- admin_users: tài khoản quản trị PHP, mật khẩu băm, quyền admin/editor. Đây là tài khoản của website, không nằm trong Supabase Auth.
- Các thao tác cập nhật/xóa kiểm tra version để tránh ghi đè thay đổi của người khác.
- JSON hiện có chỉ làm nguồn nhập và bản xem trước chỉ đọc trên máy cá nhân. Website không còn gọi SheetDB. Khi Supabase lỗi, website trả HTTP 503; không âm thầm đọc hoặc ghi sang JSON.

Cấu hình và chuyển dữ liệu: [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Triển khai: [DEPLOYMENT.md](DEPLOYMENT.md).

## Chạy cục bộ

Cần PHP 8.2+ với mbstring, fileinfo, dom, openssl và allow_url_fopen được bật. Trên Windows, chạy script sau để PHP lưu phiên đăng nhập vào thư mục có quyền ghi trong dự án:

    powershell -File scripts/start-local.ps1

Mở http://127.0.0.1:8000/. Khi chưa có cấu hình Supabase, bản cục bộ chỉ xem được dữ liệu nguồn; không thể đăng nhập/lưu vào JSON. Production và Render yêu cầu cấu hình Supabase.

## Cấu trúc MVC

- `public/`: điểm vào HTTP và tài nguyên tĩnh. Các URL cũ như `/Activities.php` và `/admin/posts.php` vẫn hoạt động.
- `app/Controllers/Public/`, `app/Controllers/Admin/`: nhận request, kiểm tra quyền, chuẩn bị dữ liệu và xử lý biểu mẫu.
- `app/Models/`: truy cập Supabase, dữ liệu xem trước và tài khoản quản trị.
- `app/Views/`: HTML trang, layout, thành phần giao diện và hàm hiển thị.
- `app/Support/` và `app/bootstrap.php`: phiên quản trị, CSRF, cấu hình và xử lý lỗi chung.
- `data/`, `uploads/`, `scripts/`, `tests/`: dữ liệu nguồn, ảnh cũ, công cụ CLI và kiểm thử; nằm ngoài web root.

Khi chạy Apache, đặt `DocumentRoot` trỏ tới `public/`. Dockerfile đã cấu hình sẵn.

## Giao diện

Các trang công khai dùng `public/CSS/site.css`, `public/JS/site.js` và `app/Views/helpers.php`. Admin dùng thêm `public/admin/admin.css` và `public/admin/admin.js`. Font Be Vietnam Pro và Phosphor được lưu trong `public/assets/`, có giấy phép.

Danh sách hỗ trợ tìm không dấu, lọc, sắp xếp và phân trang trên các bản ghi đã tải. API Supabase được đọc theo từng trang để không bỏ sót danh sách vượt giới hạn trả về. Blog, Hoạt động và Thông báo đều được quản lý trong admin/posts.php. Bài viết hỗ trợ xem ảnh lớn; admin có xem trước, xác nhận xóa và cảnh báo chưa lưu.

Ảnh Cloudinary cũ giữ nguyên URL và sử dụng biến thể responsive theo [tài liệu Cloudinary](https://cloudinary.com/documentation/image_optimization). Ảnh Supabase Free được phục vụ từ file gốc; nên chọn ảnh có dung lượng phù hợp. Nút gửi tâm tình chỉ hiện khi đã cấu hình email chính thức. Danh sách nhà tài trợ và các gói tài trợ đang được ẩn trong lúc Ban chủ nhiệm xác nhận nội dung; xem [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

## Kiểm tra

    php tests/storage-smoke.php
    php tests/ui-functions.php
    php scripts/migrate-supabase.php --dry-run

Kiểm thử tích hợp chạy SQL thật bằng PostgreSQL trong bộ nhớ (PGlite), giả lập HTTP Data API/Storage trên localhost và chạy PHP trên cổng thử riêng. Không dùng project Supabase thật hoặc ghi vào data/ và uploads/ của dự án.

    npm install --prefix .ui-test-tools --no-save --ignore-scripts @electric-sql/pglite playwright-core
    $env:UI_PGLITE_MODULE = (Resolve-Path .ui-test-tools/node_modules/@electric-sql/pglite).Path
    $env:UI_PLAYWRIGHT_MODULE = (Resolve-Path .ui-test-tools/node_modules/playwright-core).Path
    node tests/supabase-integration.cjs

Cần Chrome. Có thể dùng UI_CHROME_PATH, UI_PHP_PATH hoặc UI_SCREENSHOT_DIR. Bài kiểm tra gồm schema, quyền truy cập, nhập lặp lại, ảnh, tài khoản, giới hạn đăng nhập, dữ liệu vượt 500 bản ghi, luồng đăng tin, version, CSRF, thu hồi quyền và giao diện desktop/mobile.

Sau khi tạo project vẫn phải chạy kiểm tra kết nối, upload và các luồng trên Supabase thật; giả lập không kiểm chứng mạng, API gateway và cấu hình project bên ngoài. Thông tin liên hệ và các chương trình tài trợ cần Ban chủ nhiệm xác nhận trước khi công bố.

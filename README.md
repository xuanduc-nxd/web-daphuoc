# CLB Golf Đa Phước

Website TypeScript/Node.js, CSS và JavaScript thuần. Giao diện nền sáng, menu xanh và ảnh hoạt động được mô tả trong [DESIGN.md](DESIGN.md). Các URL `.php` cũ vẫn hoạt động như tuyến đường tương thích; máy chủ không chạy PHP.

## Dữ liệu

Supabase PostgreSQL là nơi lưu nội dung khi đã cấu hình. Node.js truy cập Data API phía máy chủ; ảnh mới được lưu trong bucket công khai site-media.

- posts: Hoạt động, Thông báo, Blog; nháp/xuất bản, album tối đa 20 ảnh cho Hoạt động, ghim và ngày hết hạn cho Thông báo.
- members: Ban điều hành, cố vấn và sinh viên. Trang Sinh viên công khai tên, trường, ngành học, định hướng, nhu cầu hỗ trợ và lĩnh vực chuyên môn do admin nhập.
- sponsors, about_sections, settings: tri ân, giới thiệu, thông tin liên hệ và ảnh chính trang chủ.
- admin_users: tài khoản quản trị website, mật khẩu băm bcrypt tương thích với bản PHP cũ, quyền admin/editor. Đây là tài khoản của website, không nằm trong Supabase Auth.
- Các thao tác cập nhật/xóa kiểm tra version để tránh ghi đè thay đổi của người khác.
- JSON hiện có chỉ làm nguồn nhập và bản xem trước chỉ đọc trên máy cá nhân. Website không còn gọi SheetDB. Khi Supabase lỗi, website trả HTTP 503; không âm thầm đọc hoặc ghi sang JSON.

Cấu hình và chuyển dữ liệu: [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Triển khai: [DEPLOYMENT.md](DEPLOYMENT.md).

## Chạy cục bộ

Cần Node.js 24+. Cài các gói và chạy máy chủ cục bộ:

    npm ci

    powershell -File scripts/start-local.ps1

Mở http://127.0.0.1:8000/. Khi chưa có cấu hình Supabase, bản cục bộ chỉ xem được dữ liệu nguồn; không thể đăng nhập/lưu vào JSON. Production và Render yêu cầu cấu hình Supabase. Có thể dùng `npm start` trực tiếp; mặc định máy chủ nghe cổng 10000 hoặc giá trị `PORT`.

## Cấu trúc ứng dụng

- `src/server.ts`: điểm vào HTTP, ánh xạ URL `.php` tương thích và phục vụ tài nguyên tĩnh.
- `src/controllers/`: xử lý request, kiểm tra quyền, gọi model/service và chọn view. Controller công khai chỉ tải dữ liệu rồi chuyển cho view.
- `src/models/`: repository, kết nối Supabase và dữ liệu nguồn cục bộ.
- `src/views/public/`, `src/views/admin/`: dựng HTML từ dữ liệu đã được controller chuẩn bị; không truy vấn Supabase.
- `src/services/admin.ts`: xác thực quản trị và xử lý ảnh tải lên.
- `src/core/`: cấu hình, phiên đăng nhập, biểu mẫu HTTP và quy tắc nội dung dùng chung.
- `public/`, `data/`, `uploads/`, `scripts/`, `tests/`: tài nguyên tĩnh, dữ liệu nguồn, ảnh cũ, công cụ CLI và kiểm thử.

Dockerfile chạy máy chủ Node trên cổng 10000. Chỉ tài nguyên tĩnh trong `public/` và các tuyến đường đã khai báo được phục vụ qua HTTP.

## Giao diện

Các trang công khai dùng `public/CSS/site.css`, `public/JS/site.js` và `src/views/public/`. Admin dùng thêm `public/admin/admin.css`, `public/admin/admin.js` và `src/views/admin/`. Font Be Vietnam Pro và Phosphor được lưu trong `public/assets/`, có giấy phép.

Danh sách hỗ trợ tìm không dấu, lọc, sắp xếp và phân trang trên các bản ghi đã tải. API Supabase được đọc theo từng trang để không bỏ sót danh sách vượt giới hạn trả về. Blog, Hoạt động và Thông báo đều được quản lý trong admin/posts.php. Bài viết hỗ trợ xem ảnh lớn; admin có xem trước, xác nhận xóa và cảnh báo chưa lưu.

Ảnh Cloudinary cũ giữ nguyên URL và sử dụng biến thể responsive theo [tài liệu Cloudinary](https://cloudinary.com/documentation/image_optimization). Ảnh Supabase Free được phục vụ từ file gốc; nên chọn ảnh có dung lượng phù hợp. Nút gửi tâm tình chỉ hiện khi đã cấu hình email chính thức. Danh sách nhà tài trợ và các gói tài trợ đang được ẩn trong lúc Ban chủ nhiệm xác nhận nội dung; xem [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

## Kiểm tra

    npm run check
    npm run migrate -- --dry-run
    npm run test:integration

Kiểm thử tích hợp chạy SQL thật bằng PostgreSQL trong bộ nhớ (PGlite), giả lập HTTP Data API/Storage trên localhost và chạy Node trên cổng thử riêng. Không dùng project Supabase thật hoặc ghi vào data/ và uploads/ của dự án.

    $env:UI_PLAYWRIGHT_MODULE = (Resolve-Path node_modules/playwright-core).Path
    npm run test:integration

Cần Chrome cho phần kiểm tra giao diện. Có thể dùng UI_CHROME_PATH hoặc UI_SCREENSHOT_DIR. Bài kiểm tra gồm schema, quyền truy cập, nhập lặp lại, ảnh, tài khoản, giới hạn đăng nhập, dữ liệu vượt 500 bản ghi, luồng đăng tin, version, CSRF, thu hồi quyền và giao diện desktop/mobile.

Sau khi tạo project vẫn phải chạy kiểm tra kết nối, upload và các luồng trên Supabase thật; giả lập không kiểm chứng mạng, API gateway và cấu hình project bên ngoài. Thông tin liên hệ và các chương trình tài trợ cần Ban chủ nhiệm xác nhận trước khi công bố.

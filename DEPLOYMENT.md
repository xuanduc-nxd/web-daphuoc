# Triển khai Render + Vercel + Supabase

Chuẩn bị project và dữ liệu theo [SUPABASE_SETUP.md](SUPABASE_SETUP.md) trước khi công bố.

## Kiến trúc

Render chạy toàn bộ website PHP và kết nối Supabase. Vercel chỉ làm điểm vào công khai, chuyển tiếp đường dẫn sang Render bằng external rewrite. Dùng project Vercel có Root Directory là `vercel-proxy`; không chọn thư mục gốc của repository để tránh phục vụ mã PHP như file tĩnh. Mật khẩu và Supabase secret key chỉ đặt ở Render, không đặt trên Vercel.

## 1. Render

Tạo Web Service từ repository GitHub này, chọn nhánh chứa bản triển khai, Runtime `Docker`, Root Directory là thư mục gốc. Service dùng Dockerfile hiện có và lắng nghe cổng 10000. Trong Render → Environment đặt:

| Biến | Giá trị |
| --- | --- |
| APP_ENV | production |
| APP_PREVIEW_MODE | false |
| SUPABASE_URL | URL project Supabase |
| SUPABASE_SECRET_KEY | Secret key dùng riêng cho backend PHP |

Không cần SHEETDB_API_LINK, ADMIN_PASSWORD, ADMIN_PASSWORD_HASH hoặc APP_DATA_DIR. Các biến cũ có thể gỡ sau khi chuyển dữ liệu và kiểm thử thành công.

Không đưa .env/secret key vào Git. Docker loại .env khỏi image và đặt `public/` làm Apache DocumentRoot; `app/`, `data/`, `uploads/`, `scripts/` và `tests/` không thể truy cập trực tiếp qua HTTP. Các script khởi tạo chỉ chạy từ CLI.

Database nằm trên Supabase; ảnh mới và ảnh local được chuyển vào Storage. Website không dùng filesystem tạm của Render để lưu nội dung mới. APP_UPLOAD_DIR chỉ còn dùng khi nhập/đọc ảnh local cũ; sau khi chuyển hết ảnh, website không cần disk để lưu ảnh mới.

Render Free có chế độ ngủ khi ít truy cập. Supabase Free có giới hạn dung lượng, băng thông và có thể tạm dừng project ít hoạt động. Chọn gói phù hợp nếu cần truy cập liên tục; tham khảo [Render Free](https://render.com/docs/free) và [Supabase pricing](https://supabase.com/pricing).

Sau khi Render báo deploy thành công, mở URL `https://<service>.onrender.com/` và kiểm tra trang chủ, `Activities.php`, `Notifications.php`, `admin/login.php` trước khi cấu hình Vercel.

## 2. Vercel

Tạo Project từ repository `xuanduc-nxd/web-daphuoc`, nhánh `main`. Chọn **Root Directory: `vercel-proxy`** và Framework Preset `Other`.

File `vercel-proxy/vercel.json` đã đặt đích chuyển tiếp là `https://web-daphuoc.onrender.com`. Không cần biến môi trường trên Vercel. Nếu đã tạo `RENDER_ORIGIN` trong project Vercel, có thể xóa biến này sau khi deploy thành công; nó không chứa bí mật.

Deploy rồi mở URL `.vercel.app` của project. Kiểm tra đăng nhập admin, lưu bài nháp, ảnh tải lên, liên kết chi tiết và tìm kiếm qua URL Vercel. Nếu cần tên miền riêng, gắn tên miền vào **Vercel Project** sau khi các kiểm tra này đạt. Nếu URL Render thay đổi, cập nhật hai `destination` trong `vercel-proxy/vercel.json` và đẩy lại lên GitHub.

## Trước khi công bố

- Chạy check-supabase.php; xác nhận settings/main và tài khoản admin đã có.
- Đăng nhập, tạo một bài nháp, kiểm tra nháp không xuất hiện công khai, xuất bản/ẩn/xóa bài thử.
- Upload một ảnh thử, kiểm tra public URL; deploy lại và xác nhận bản ghi/ảnh vẫn còn.
- Kiểm tra cập nhật điện thoại/email trong admin phản ánh ở chân trang, Liên hệ và Tài trợ.
- Xác nhận editor bị chặn khỏi cài đặt, giới thiệu và tài trợ; admin có thể quản lý các mục này.
- Đối chiếu số lượng bản ghi và các liên kết bài viết trước/sau khi chuyển dữ liệu.
- Ban chủ nhiệm xác nhận thông tin liên hệ, mạng xã hội và nội dung tài trợ trước khi công bố.

## Tên miền

Gắn tên miền công khai vào Vercel Project → Settings → Domains, đặt DNS theo giá trị Vercel cung cấp rồi xác minh. Giữ URL `onrender.com` làm upstream cho Vercel. Supabase tiếp tục dùng URL project mặc định; không cần add-on tên miền riêng cho API.

Kiểm tra cả trang chủ, các trang nội dung, admin, ảnh và HTTPS qua tên miền. [Tài liệu Domains của Vercel](https://vercel.com/docs/domains).

## Sao lưu

Lưu bản sao ngoài Supabase cho cả database và ảnh. Backup database không bao gồm file Storage. Không xóa data/ và uploads/ cũ cho đến khi đã đối chiếu dữ liệu, chuyển ảnh, xác nhận trên project thật và có bản sao dự phòng.

Nếu project từng dùng bảng site_data JSONB cũ, SQL mới giữ nguyên bảng đó. Script nhập hiện lấy nguồn từ file local; cần xuất dữ liệu mới nhất từ site_data riêng trước khi nhập nếu trên server có dữ liệu mới hơn bản local.

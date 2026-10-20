# Tạo Supabase cho website CLB

## 1. Tạo project

Vào [Supabase Dashboard](https://supabase.com/dashboard), tạo một project riêng cho website, có thể đặt tên clb-golf-da-phuoc. Gói Free phù hợp để phát triển và chạy thử. Chọn khu vực gần nơi chạy PHP; lưu mật khẩu database trong nơi quản lý mật khẩu của bạn.

Mật khẩu database, secret key và mật khẩu đăng nhập admin website là ba giá trị khác nhau.

## 2. Tạo bảng và Storage

Mở SQL Editor → New query. Sao chép **toàn bộ** [supabase-setup.sql](supabase-setup.sql), từ `begin;` đến `commit;`, rồi Run. Nếu đang bôi chọn một đoạn SQL trong editor, bỏ vùng chọn trước khi Run; chạy riêng dòng bắt đầu bằng `id text ...` sẽ báo lỗi cú pháp vì thiếu câu lệnh `create table (...)`.

SQL tạo:

| Bảng | Nội dung |
| --- | --- |
| posts | Hoạt động, Thông báo và Blog |
| members | Ban điều hành/cố vấn, sinh viên |
| sponsors | Danh sách tri ân |
| about_sections | Tôn chỉ, phạm vi, mục tiêu, phương thức |
| settings | Thông tin website, liên hệ và ảnh trang chủ |
| admin_users | Tài khoản quản trị website PHP |
| admin_login_attempts | Giới hạn thử đăng nhập |

Bucket site-media công khai dùng cho ảnh trên website, tối đa 5 MB/file và chỉ nhận JPG, PNG, WebP, GIF. Không dùng bucket này cho hồ sơ hoặc giấy tờ riêng tư.

Các bảng bật RLS và chỉ cấp quyền cho service_role. Người xem truy cập nội dung qua PHP; trình duyệt không nhận secret key. Phân quyền admin/editor được kiểm tra trong PHP trước mỗi request quản trị. Bảng site_data cũ được giữ nguyên nếu đã tồn tại.

Website dùng đăng nhập PHP và mật khẩu băm trong admin_users. Không cần tạo user trong mục Authentication của Supabase cho phiên bản này.

## 3. Cấu hình trên máy

Nếu chưa có .env, sao chép .env.example thành .env; nếu đã có, sửa file hiện có:

    if (!(Test-Path .env)) { Copy-Item .env.example .env }

Điền SUPABASE_URL và SUPABASE_SECRET_KEY trong .env. URL có dạng https://PROJECT_REF.supabase.co, không thêm /rest/v1. Lấy URL trong Connect hoặc Integrations → Data API; lấy secret key ở Settings → API Keys. Dùng key bắt đầu bằng sb_secret_, chỉ đặt phía máy chủ. Không gửi key trong chat hoặc đưa vào Git.

Giữ APP_ENV=development trên máy cá nhân. Khi triển khai đặt APP_ENV=production và APP_PREVIEW_MODE=false trong Environment của Render.

Khi chưa có cả hai giá trị Supabase, website trên máy chỉ xem dữ liệu nguồn. Không có ghi JSON hoặc đăng nhập mặc định. Khi đã cấu hình, website dùng Supabase và báo lỗi nếu không kết nối được.

## 4. Nhập dữ liệu và ảnh hiện có

Kiểm tra trước; bước này không gọi API hoặc thay đổi file:

    php scripts/migrate-supabase.php --dry-run

Sau khi kiểm tra số lượng và ảnh nguồn, nhập:

    php scripts/migrate-supabase.php --apply
    php scripts/check-supabase.php

Script giữ id của Blog local và các hồ sơ. Bài SheetDB có id mới theo loại, đồng thời lưu legacy_id để các liên kết cũ vẫn được tìm đúng. Blog trong bản sao Sheets trước đây không được trang Blog hiện tại sử dụng; những bài này được nhập làm bản nháp để Ban chủ nhiệm xem lại trước khi xuất bản.

Ảnh có đường dẫn media.php?file=... hoặc uploads/... được tải từ thư mục uploads hiện tại lên Storage và đổi URL trong bản ghi nhập. Ảnh Cloudinary/ảnh bên ngoài giữ nguyên URL. File gốc không bị chỉnh sửa hoặc xóa.

Có thể dùng --source-dir và --uploads-dir để chỉ định nguồn sao lưu khác. Script dừng nếu thiếu ảnh hoặc JSON không hợp lệ. Chạy lại sẽ bỏ qua bản ghi đã có cùng id, giữ các chỉnh sửa trong database và không ghi đè ảnh cùng tên. Nếu nhập bị gián đoạn, kiểm tra lỗi rồi chạy lại; các request nhập theo lô không phải một transaction cho toàn bộ dữ liệu.

Nếu bản đã triển khai có dữ liệu mới hơn file local, hãy xuất dữ liệu mới nhất trước. Script này không tự đọc bảng site_data cũ hoặc Google Sheets đang hoạt động.

## 5. Tạo tài khoản quản trị

Trên Windows, chạy:

    powershell -File scripts/create-admin.ps1 -Username admin -Name "Ban chủ nhiệm"

Bạn sẽ nhập mật khẩu kín, ít nhất 12 ký tự, tối đa 72 byte. Script chỉ tạo tài khoản mới; không ghi đè tài khoản đã có. Không có mật khẩu mặc định.

Tạo tài khoản biên tập khi cần:

    powershell -File scripts/create-admin.ps1 -Username bientap -Name "Biên tập CLB" -Role editor

Admin được quản lý mọi mục. Editor được quản lý bài viết và thành viên, không được đổi cài đặt, giới thiệu và tài trợ. Để thu hồi quyền, đặt disabled=true trong admin_users; phiên của tài khoản sẽ bị từ chối ở request tiếp theo. Thay đổi tài khoản hoặc mật khẩu làm tăng version và yêu cầu đăng nhập lại; quyền mới được áp dụng sau khi đăng nhập.

Trên Linux/macOS có thể đặt ADMIN_SETUP_PASSWORD tạm trong môi trường tiến trình rồi chạy scripts/create-admin.php --username admin; không ghi mật khẩu trong lệnh hoặc .env.

## 6. Kiểm tra trước khi đưa lên web

Mở website cục bộ và đăng nhập /admin/login.php. Đăng một bài nháp ở từng loại, kiểm tra danh sách/chi tiết chưa hiển thị nháp, xuất bản rồi kiểm tra trang chủ và đúng mục nội dung. Thử tải ảnh mới, sửa hồ sơ và cập nhật liên hệ.

Mở cùng bài trên hai cửa sổ, lưu ở cửa sổ thứ nhất rồi lưu cửa sổ thứ hai. Lần lưu thứ hai phải yêu cầu tải lại nội dung; thay đổi đã lưu không bị ghi đè.

Sau deploy, xác nhận dữ liệu và ảnh vẫn còn. Không xóa nguồn cũ cho đến khi đã đối chiếu project thật và có bản sao dự phòng.

## Giới hạn và tài liệu

Supabase Free có 500 MB database, 1 GB Storage và giới hạn băng thông; project ít hoạt động có thể tạm dừng. Free không có backup tự động. Backup database của gói trả phí cũng không chứa file Storage; ảnh cần được sao lưu riêng.

- [Data API](https://supabase.com/docs/guides/api)
- [Secret key phía máy chủ](https://supabase.com/docs/guides/getting-started/api-keys)
- [Quyền truy cập và RLS](https://supabase.com/docs/guides/api/securing-your-api)
- [Giá và hạn mức](https://supabase.com/pricing)
- [Sao lưu database](https://supabase.com/docs/guides/platform/backups)

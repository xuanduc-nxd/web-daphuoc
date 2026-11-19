# Triển khai Render + Vercel + Supabase + Cloudinary

Chuẩn bị project và dữ liệu theo [SUPABASE_SETUP.md](SUPABASE_SETUP.md) trước khi công bố.

Trước khi triển khai trang Ban điều hành theo khóa, chạy `supabase-board-terms.sql` trên project Supabase hiện có. Script thêm trường nhiệm kỳ, chức danh, tên khóa hiện tại và xếp ba hồ sơ đã được xác nhận vào khóa hiện tại. Sau đó quản trị viên có thể nhập chức danh, thứ tự hiển thị và tên khóa trong admin.

Trước khi triển khai phiên bản có album Hoạt động, ghim/hết hạn Thông báo và các trường hồ sơ Sinh viên mới, chạy lại toàn bộ `supabase-setup.sql` hoặc riêng `supabase-student-fields.sql` trên project Supabase hiện tại. SQL bổ sung cột mới và giữ dữ liệu cũ. Sau đó mới deploy mã Node.js mới.

Để nhận bài gửi công khai trên Blog, chạy thêm `supabase-public-blog.sql` trên project hiện có trước khi deploy. Nếu vừa chạy lại toàn bộ `supabase-setup.sql` thì đã có phần này. Kiểm tra một bài gửi thử ở `/admin/posts.php?kind=blog`: bài phải ở trạng thái nháp cho đến khi quản trị viên duyệt.

Trước khi dùng album ảnh trong Thông tin website, chạy `supabase-site-gallery.sql` trên project Supabase hiện có. Để quản lý ảnh nền và ảnh trung tâm riêng cho trang chủ và Giới thiệu, chạy thêm `supabase-home-about-images.sql`. Sau khi deploy, tải ảnh thử, kiểm tra ảnh đúng trang và kiểm tra album trên điện thoại.

## Kiến trúc

Render chạy toàn bộ website TypeScript/Node.js, kết nối Supabase cho dữ liệu và Cloudinary cho ảnh. Vercel chỉ làm điểm vào công khai, chuyển tiếp đường dẫn sang Render bằng external rewrite. Dùng project Vercel có Root Directory là `vercel-proxy`; không chọn thư mục gốc của repository. Các secret chỉ đặt ở Render, không đặt trên Vercel.

## 1. Render

Tạo Web Service từ repository GitHub này, chọn nhánh chứa bản triển khai, Runtime `Docker`, Root Directory là thư mục gốc. Service dùng Node.js 24 qua Dockerfile và lắng nghe cổng 10000. Trong Render → Environment đặt:

| Biến | Giá trị |
| --- | --- |
| APP_ENV | production |
| APP_PREVIEW_MODE | false |
| SUPABASE_URL | URL project Supabase |
| PUBLIC_SITE_URL | Địa chỉ công khai dùng cho thẻ chia sẻ bài viết và ảnh bìa. Mặc định là https://web-daphuoc.vercel.app. |
| SUPABASE_SECRET_KEY | Secret key dùng riêng cho backend Node.js |
| CLOUDINARY_CLOUD_NAME | Cloud name trong Cloudinary Console |
| CLOUDINARY_API_KEY | API key của Cloudinary |
| CLOUDINARY_API_SECRET | API secret, chỉ dùng phía máy chủ |

Để bật banner tối đa 5 ảnh trên Trang chủ và Giới thiệu trong cơ sở dữ liệu hiện có, chạy `supabase-banner-slides.sql` một lần trong Supabase SQL Editor trước khi lưu ảnh từ admin. Không cần chạy lại với cơ sở dữ liệu mới tạo từ `supabase-setup.sql`.

Không cần SHEETDB_API_LINK, ADMIN_PASSWORD, ADMIN_PASSWORD_HASH hoặc APP_DATA_DIR. Các biến cũ có thể gỡ sau khi chuyển dữ liệu và kiểm thử thành công.

Không đưa .env/secret key vào Git. Docker loại .env khỏi image; máy chủ Node chỉ phục vụ tài nguyên tĩnh trong `public/` và các URL đã khai báo. `src/`, `data/`, `uploads/`, `scripts/` và `tests/` không thể truy cập trực tiếp qua HTTP. Các script khởi tạo chỉ chạy từ CLI.

Database nằm trên Supabase; ảnh mới được tối ưu WebP và lưu trên Cloudinary. Website không dùng filesystem tạm của Render hoặc Supabase Storage để lưu ảnh mới. APP_UPLOAD_DIR chỉ còn dùng khi nhập/đọc ảnh local cũ.

Sau khi sao lưu, kiểm tra trước ảnh Supabase cần chuyển bằng `npm run migrate:cloudinary`; thêm `-- --apply` để tải ảnh lên Cloudinary và cập nhật URL trong database. Script không tự xóa ảnh nguồn Supabase, giúp có thể đối chiếu và quay lại nếu cần.

Phiên đăng nhập được lưu trong `.runtime/sessions` trên ổ đĩa của tiến trình Node. Khi Render khởi động lại hoặc chuyển instance, admin cần đăng nhập lại. Render Free có chế độ ngủ khi ít truy cập. Supabase Free có giới hạn dung lượng, băng thông và có thể tạm dừng project ít hoạt động. Chọn gói phù hợp nếu cần truy cập liên tục; tham khảo [Render Free](https://render.com/docs/free) và [Supabase pricing](https://supabase.com/pricing).

Sau khi Render báo deploy thành công, mở URL `https://<service>.onrender.com/` và kiểm tra trang chủ, `Activities.php`, `Notifications.php`, `admin/login.php` trước khi cấu hình Vercel.

## 2. Vercel

Tạo Project từ repository `xuanduc-nxd/web-daphuoc`, nhánh `main`. Chọn **Root Directory: `vercel-proxy`** và Framework Preset `Other`.

File `vercel-proxy/vercel.json` đã đặt đích chuyển tiếp là `https://web-daphuoc.onrender.com`. Không cần biến môi trường trên Vercel. Nếu đã tạo `RENDER_ORIGIN` trong project Vercel, có thể xóa biến này sau khi deploy thành công; nó không chứa bí mật.

Deploy rồi mở URL `.vercel.app` của project. Kiểm tra đăng nhập admin, lưu bài nháp, ảnh tải lên, liên kết chi tiết và tìm kiếm trong danh sách bài qua URL Vercel. Nếu cần tên miền riêng, gắn tên miền vào **Vercel Project** sau khi các kiểm tra này đạt. Nếu URL Render thay đổi, cập nhật hai `destination` trong `vercel-proxy/vercel.json` và đẩy lại lên GitHub.

## Trước khi công bố

- Chạy `npm run check-supabase`; xác nhận settings/main và tài khoản admin đã có.
- Đăng nhập, tạo một bài nháp, kiểm tra nháp không xuất hiện công khai, xuất bản/ẩn/xóa bài thử.
- Upload một ảnh thử, xác nhận URL thuộc `res.cloudinary.com`, có biến thể responsive và vẫn còn sau khi deploy lại.
- Kiểm tra cập nhật điện thoại/email trong admin phản ánh ở chân trang và Liên hệ.
- Xác nhận editor bị chặn khỏi cài đặt, giới thiệu và tài trợ; admin có thể quản lý các mục này.
- Đối chiếu số lượng bản ghi và các liên kết bài viết trước/sau khi chuyển dữ liệu.
- Ban chủ nhiệm xác nhận thông tin liên hệ, mạng xã hội và nội dung tài trợ trước khi công bố.

## Tên miền

Gắn tên miền công khai vào Vercel Project → Settings → Domains, đặt DNS theo giá trị Vercel cung cấp rồi xác minh. Giữ URL `onrender.com` làm upstream cho Vercel. Supabase tiếp tục dùng URL project mặc định; không cần add-on tên miền riêng cho API.

Kiểm tra cả trang chủ, các trang nội dung, admin, ảnh và HTTPS qua tên miền. [Tài liệu Domains của Vercel](https://vercel.com/docs/domains).

## Sao lưu

Lưu bản sao riêng cho database Supabase và thư viện ảnh Cloudinary. Backup database không bao gồm file ảnh. Không xóa ảnh Supabase Storage, data/ hoặc uploads/ cũ cho đến khi đã đối chiếu dữ liệu, xác nhận Cloudinary trên website thật và có bản sao dự phòng.

Nếu project từng dùng bảng site_data JSONB cũ, SQL mới giữ nguyên bảng đó. Script nhập hiện lấy nguồn từ file local; cần xuất dữ liệu mới nhất từ site_data riêng trước khi nhập nếu trên server có dữ liệu mới hơn bản local.

# Danh sách hoàn thiện website CLB

Cập nhật ngày 20/10/2026. Dùng danh sách này để theo dõi việc chuẩn bị trước khi công bố website.

## Đã hoàn thành trên bản làm việc

- [x] Chạy kiểm tra cú pháp PHP, hai bộ test PHP và bước nhập dữ liệu thử (`--dry-run`).
- [x] Chạy kiểm thử tích hợp SQL/API/Storage giả lập và giao diện desktop, tablet, mobile. Không dùng project Supabase thật.
- [x] Giữ một bài Hoạt động công khai với ghi chú thời hạn nhận hồ sơ 30/05/2026 đã qua; chuyển các bài trùng và bài Blog thử về nháp.
- [x] Tạm ẩn liên hệ, mạng xã hội, danh sách nhà tài trợ và các gói tài trợ chưa được Ban chủ nhiệm xác nhận.
- [x] Tạo `.env` từ mẫu và xác nhận file này được Git bỏ qua.
- [x] Trang quản trị có nút tạo riêng cho Hoạt động, Thông báo và Blog; biểu mẫu mới yêu cầu chọn loại bài, trạng thái công khai hiển thị rõ.
- [x] Kiểm tra project Supabase thật: 12 đường dẫn công khai và 2 ảnh Storage trả HTTP 200; trang quản trị chuyển hướng về đăng nhập khi chưa xác thực.
- [x] Bài nguồn sau nhập: 1 Hoạt động công khai; các bài trùng và Blog thử vẫn là nháp, không truy cập được qua trang chi tiết.

## Cần Ban chủ nhiệm xác nhận

- [ ] Số điện thoại, email và tài khoản mạng xã hội chính thức.
- [ ] Tên và mức đóng góp của từng mục trong `data/review/sponsors-unapproved.json` (chỉ lưu trên máy, không đẩy lên Git).
- [ ] Tên, mức đóng góp và cam kết của các chương trình tài trợ trước khi khôi phục.
- [ ] Nội dung bài Hoạt động lưu trữ, ảnh và chú thích ảnh trên trang chủ.
- [ ] Hồ sơ sinh viên: dữ liệu nguồn hiện chưa có hồ sơ thuộc nhóm này.

## Cần cấu hình Supabase

- [x] Tạo project, chạy toàn bộ `supabase-setup.sql` trong SQL Editor.
- [x] Điền `SUPABASE_URL` và `SUPABASE_SECRET_KEY` vào `.env` trên máy; file được Git bỏ qua.
- [x] Chạy `php scripts/migrate-supabase.php --apply`, sau đó `php scripts/check-supabase.php`.
- [x] Tạo tài khoản quản trị bằng `scripts/create-admin.ps1`; `check-supabase.php` xác nhận có 1 tài khoản.
- [x] Đăng nhập tài khoản admin trên web cục bộ kết nối Supabase thật.
- [x] Tạo và xuất bản Hoạt động qua admin trên Supabase thật; trang danh sách, chi tiết và ảnh mới đều trả HTTP 200.
- [x] Tạo và xuất bản Thông báo qua admin trên Supabase thật; trang danh sách và ảnh mới trả HTTP 200.
- [x] Tạo Thông báo nháp qua Data API thật, xác nhận không hiện công khai rồi xóa bản ghi thử.
- [x] Đối chiếu số bản ghi sau nhập: 9 bài (1 công khai, 8 nháp), 6 hồ sơ thành viên, 0 mục tài trợ, 18 mục giới thiệu, 1 cài đặt và 2 ảnh đã chuyển.
- [x] Sau khi Ban quản trị đăng thêm 2 bài: 11 bài (3 công khai, 8 nháp).

## Cần triển khai

- [ ] Rà soát và commit các thay đổi hiện còn trong bản làm việc trước khi triển khai.
- [ ] Xác nhận ứng dụng chạy sạch trên PHP 8.2 của Dockerfile; PHP cục bộ hiện là 8.0.
- [ ] Tạo dịch vụ Render từ Dockerfile, đặt biến môi trường theo `DEPLOYMENT.md`.
- [ ] Kiểm tra URL Render, quyền quản trị, ảnh và dữ liệu sau khi triển khai lại.
- [ ] Tạo Vercel Project từ `vercel-proxy` và kiểm tra URL `.vercel.app`.
- [ ] Gắn tên miền vào Vercel, kiểm tra HTTPS và sao lưu database cùng ảnh Storage.
- [ ] Ban chủ nhiệm duyệt nội dung cuối cùng trên tên miền chính thức.

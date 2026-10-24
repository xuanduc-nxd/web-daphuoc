# Danh sách hoàn thiện website CLB

Cập nhật ngày 20/10/2026. Dùng danh sách này để theo dõi việc chuẩn bị trước khi công bố website.

## Chuyển backend sang TypeScript/Node.js (24/10/2026)

- [x] Chuyển trang công khai, quản trị, phiên đăng nhập, Supabase, upload ảnh và công cụ CLI sang Node.js 24.
- [x] Kiểm tra TypeScript, dữ liệu nguồn, SQL/RLS, luồng quản trị và giao diện desktop/mobile trên PGlite và HTTP giả lập cục bộ.
- [x] Kiểm tra đọc Supabase thật bằng Node.js và render trang chủ, Hoạt động, Thông báo, Sinh viên; không ghi dữ liệu thật.
- [ ] Deploy Dockerfile Node.js mới lên Render; xác nhận đăng nhập bằng tài khoản bcrypt hiện có, lưu bài và tải ảnh trên Supabase thật.
- [ ] Kiểm tra URL Vercel và tên miền sau khi Render chạy Node.js.
- [ ] Đối chiếu số hồ sơ thành viên: kiểm tra đọc Supabase hiện trả 1, trong khi ghi chú kiểm kê cũ bên dưới là 6.

## Đã hoàn thành trên bản làm việc

- [x] Bản PHP trước đây đã qua kiểm tra cú pháp, kiểm thử và bước nhập dữ liệu thử (`--dry-run`).
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
- [x] Bản PHP trước đây đã chạy công cụ nhập và kiểm tra Supabase.
- [x] Tạo tài khoản quản trị bằng `scripts/create-admin.ps1`; công cụ kiểm tra xác nhận có 1 tài khoản.
- [x] Đăng nhập tài khoản admin trên web cục bộ kết nối Supabase thật.
- [x] Tạo và xuất bản Hoạt động qua admin trên Supabase thật; trang danh sách, chi tiết và ảnh mới đều trả HTTP 200.
- [x] Tạo và xuất bản Thông báo qua admin trên Supabase thật; trang danh sách và ảnh mới trả HTTP 200.
- [x] Tạo Thông báo nháp qua Data API thật, xác nhận không hiện công khai rồi xóa bản ghi thử.
- [x] Đối chiếu số bản ghi sau nhập: 9 bài (1 công khai, 8 nháp), 6 hồ sơ thành viên, 0 mục tài trợ, 18 mục giới thiệu, 1 cài đặt và 2 ảnh đã chuyển.
- [x] Sau khi Ban quản trị đăng thêm 2 bài: 11 bài (3 công khai, 8 nháp).

## Cần triển khai

- [ ] Chạy lại `supabase-setup.sql` trên project thật trước khi deploy mã album/ghim/các trường sinh viên; xác nhận bản sao lưu database và Storage.
- [ ] Kiểm tra tải album khoảng 10 ảnh qua cả URL Render và Vercel; thử chọn ảnh đại diện, đổi thứ tự và gỡ ảnh.
- [ ] Kiểm tra thông báo ghim, thông báo quá hạn ẩn khỏi danh sách/tìm kiếm/liên kết trực tiếp theo giờ Việt Nam.
- [ ] Nhập hồ sơ sinh viên đã được duyệt; xác nhận trang công khai có tên, trường, ngành học, định hướng, nhu cầu hỗ trợ và lĩnh vực chuyên môn đã được phép công bố.

- [x] Rà soát, commit và đẩy bản triển khai lên nhánh `main` của `xuanduc-nxd/web-daphuoc`.
- [x] Bản PHP 8.2 trước đây đã chạy công khai trên Render.
- [x] Tạo Render Web Service tại `https://web-daphuoc.onrender.com` với Supabase thật.
- [x] Kiểm tra trang chủ, Hoạt động, Thông báo, đăng nhập, bài đã xuất bản và ảnh trên Render.
- [x] Tạo Vercel Project từ `vercel-proxy`; `https://web-daphuoc-vercel-proxy.vercel.app` trả HTTP 200 cho các trang chính và đăng nhập quản trị thành công.
- [ ] Kiểm thử lưu bài nháp kèm ảnh qua URL Vercel.
- [ ] Sao lưu database và ảnh Storage ra ngoài Supabase.
- [ ] Nếu có tên miền riêng, gắn vào Vercel và kiểm tra HTTPS.
- [ ] Ban chủ nhiệm duyệt nội dung cuối cùng trước khi quảng bá website rộng rãi.

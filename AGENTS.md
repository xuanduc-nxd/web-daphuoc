# Vai trò AI trong dự án

Áp dụng luồng Builder → Tester → Reviewer cho các thay đổi của website CLB Golf Đa Phước. Mỗi vai trò có thể được thực hiện trong cùng một phiên làm việc hoặc được giao cho tác nhân riêng khi người dùng yêu cầu.

## Builder

- Xác định yêu cầu và các tệp liên quan trước khi sửa. Giữ nguyên những thay đổi đang có ngoài phạm vi công việc.
- Triển khai thay đổi nhỏ nhất đáp ứng yêu cầu; cập nhật tài liệu khi hành vi, cấu hình hoặc quy trình triển khai thay đổi.
- Kiểm tra mã bằng `npm run check` và bàn giao danh sách thay đổi, kết quả kiểm tra cùng rủi ro còn lại cho Tester.

## Tester

- Xác minh hành vi theo yêu cầu bằng kiểm thử độc lập với cách Builder triển khai.
- Chạy `npm run check`. Chạy `npm run test:integration` khi thay đổi ảnh hưởng đến dữ liệu, phân quyền, đăng nhập, biểu mẫu hoặc luồng HTTP. Với thay đổi giao diện, kiểm tra thêm các trang liên quan ở kích thước desktop và điện thoại bằng các bài kiểm tra trong `tests/`.
- Ghi rõ số bài kiểm tra đạt, lỗi và bỏ qua. Nếu phát hiện lỗi, mô tả bước tái hiện và chuyển lại Builder để sửa trước khi chuyển Reviewer.

## Reviewer

- Đối chiếu thay đổi với yêu cầu, kiểm tra phạm vi sửa, quyền truy cập, dữ liệu, bí mật và tác động lên các trang khác.
- Đọc bằng chứng kiểm thử của Tester; xác nhận các trường hợp quan trọng đã được kiểm tra và nêu rõ giới hạn chưa xác minh.
- Chỉ kết luận hoàn tất khi vấn đề đã được giải quyết và các kiểm tra phù hợp đạt. Nếu còn lỗi, nêu vị trí và yêu cầu quay lại Builder hoặc Tester.

## Kiểm tra của dự án

- Yêu cầu Node.js 24 trở lên. `npm run dev` chạy máy chủ phát triển; cổng mặc định là `10000` và có thể đổi bằng `PORT`.
- `npm run check` chạy TypeScript và unit test.
- `npm run test:integration` dùng PostgreSQL trong bộ nhớ cùng các dịch vụ giả lập trên localhost; không cần ghi vào Supabase hoặc Cloudinary thật.
- `tests/ui-smoke.cjs` và `tests/admin-layout.cjs` cần Chrome và URL máy chủ cục bộ qua `UI_TEST_BASE_URL`.
- Không commit, push, chạy migration trên dữ liệu thật hoặc triển khai website khi người dùng chưa yêu cầu các hành động đó.

# Quy tắc dành cho AI

Tài liệu này định nghĩa các giới hạn bắt buộc đối với AI khi làm việc trong dự án.

## Nguyên tắc phê duyệt

Khi AI đề xuất một giải pháp, AI phải chờ DEV phê duyệt giải pháp đó trước khi bắt đầu thực hiện.

Quy trình bắt buộc:

1. AI phân tích vấn đề.
2. AI đề xuất giải pháp và phạm vi thay đổi.
3. AI chờ DEV phê duyệt giải pháp.
4. AI chỉ bắt đầu thực hiện sau khi nhận được approval rõ ràng.

Khi chưa có approval, AI chỉ được phân tích, đặt câu hỏi làm rõ và đề xuất giải pháp; không được chỉnh sửa bất kỳ file nào.

## Các quy tắc bắt buộc

| STT | Quy tắc | Yêu cầu đối với AI |
| --- | --- | --- |
| 1 | Không thực hiện giải pháp khi chưa được DEV phê duyệt | Approval phải là xác nhận rõ ràng cho solution và phạm vi cụ thể. Yêu cầu phân tích hoặc đề xuất solution không đồng nghĩa với approval để thực hiện. |
| 2 | Không vượt quá phạm vi được duyệt | AI chỉ được thay đổi các file và chức năng thuộc solution đã được approval. Vấn đề ngoài phạm vi phải được báo cáo và chờ approval mới. |
| 3 | Không tự ý thực hiện hành động phá hủy | AI không được xóa dữ liệu, xóa file, reset Git, drop database, ghi đè cấu hình hoặc thực hiện hành động khó hoàn tác khi chưa có xác nhận riêng từ DEV. |
| 4 | Không tự ý commit, push, tạo PR hoặc deploy | Approval cho solution không mặc nhiên cho phép commit, push, tạo PR, publish hoặc deploy. Các hành động này phải được DEV yêu cầu rõ ràng. |
| 5 | Không đọc hoặc tiết lộ thông tin bí mật | AI không được đọc `.env`, private key, access token hoặc credentials khi chưa được phép; không được đưa secrets vào code, log, tài liệu, commit hoặc phản hồi. |
| 6 | Không tự ý thêm hoặc nâng cấp dependency | AI phải trình bày dependency, lý do sử dụng và rủi ro trước khi cài đặt hoặc nâng cấp, sau đó chờ DEV approval. |
| 7 | Không tự ý thay đổi database | AI phải trình bày schema, migration, ảnh hưởng dữ liệu và phương án rollback. Approval để tạo migration không đồng nghĩa với approval để chạy migration. |
| 8 | Không sửa hoặc xóa thay đổi của người khác | AI phải giữ nguyên các thay đổi không thuộc phạm vi công việc. Nếu phát hiện thay đổi bất ngờ hoặc xung đột, AI phải dừng và báo DEV. |
| 9 | Không báo hoàn thành khi chưa xác minh | AI phải chạy test hoặc build phù hợp với thay đổi trước khi báo hoàn thành. Nếu không thể xác minh, AI phải nêu rõ nội dung chưa được xác minh và lý do. |
| 10 | Không tự ý sửa thêm ngoài yêu cầu | AI không được tự ý refactor, format hàng loạt, tối ưu hoặc sửa lỗi ngoài phạm vi. Các cải tiến khác chỉ được ghi nhận dưới dạng đề xuất. |
| 11 | Không tự quyết định khi yêu cầu chưa rõ ràng | Nếu có nhiều cách hiểu có thể làm thay đổi hành vi hệ thống, AI phải hỏi DEV thay vì tự chọn phương án có rủi ro. |
| 12 | Không sử dụng approval cũ cho solution mới | Khi solution hoặc phạm vi thay đổi đáng kể, AI phải trình bày lại phương án và xin approval mới trước khi tiếp tục. |
| 13 | Không che giấu thay đổi hoặc rủi ro | Sau khi thực hiện, AI phải báo cáo các file đã thay đổi, hành vi đã thay đổi, kết quả xác minh và các rủi ro còn lại. |

## Phạm vi của approval

Approval chỉ có hiệu lực đối với solution và phạm vi được DEV xác nhận. AI phải xin approval mới khi có một trong các trường hợp sau:

- Cần thay đổi thêm file hoặc chức năng ngoài phạm vi ban đầu.
- Solution ban đầu không còn phù hợp và cần đổi hướng xử lý.
- Phát sinh dependency, migration hoặc thay đổi cấu hình chưa được đề cập.
- Cần thực hiện commit, push, tạo PR, publish hoặc deploy nhưng DEV chưa yêu cầu rõ ràng.

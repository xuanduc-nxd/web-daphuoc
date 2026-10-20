# Giao diện CLB Golf Đa Phước

Người dùng chọn giao diện sáng, gần gũi, nhiều ảnh hoạt động. Website là trang tin CLB do Ban chủ nhiệm quản lý. Redesign trên PHP + CSS/JavaScript native; giữ logo, URL, dữ liệu và luồng quản trị.

Audit: nhận diện xanh/cyan, logo Đa Phước, header cố định 100px; banner tối, gradient chữ, thẻ xoay, khoảng trống lớn, ngày thô và menu thiếu keyboard. Giữ các trang Giới thiệu, Thông báo, Hoạt động, Blog, Tài trợ và các trang con. Title hiện đồng nhất; bổ sung metadata theo trang.

Theo phản hồi mới, giao diện cần đặc sắc hơn và menu màu xanh. Thiết kế theo hướng trang tin cộng đồng giàu hình ảnh: nền sáng, menu xanh với chữ trắng, ảnh thật đan xen ở phần mở đầu, tin nổi bật có thứ bậc rõ, khu vực học bổng dùng sắc xanh cùng nhận diện.

DESIGN_VARIANCE: 7; MOTION_INTENSITY: 3; VISUAL_DENSITY: 4. Font Be Vietnam Pro self-hosted 400/500/600/700; một bộ icon Phosphor. Accent #19578f, chữ #172d43, nền trắng/#f5f8fc. Light theme theo lựa chọn của người dùng; các vùng xanh gắn với nhận diện CLB. Container 1240px, header 80px (70px mobile), body 16px; hero tối đa 70px. Ảnh hero bo góc bất đối xứng, ảnh chi tiết nhỏ xếp lệch nhẹ. Radius khối/ảnh thường 20px, nút/input 10px, badge 6px. Layer header 20, menu 30, dialog 50. Focus trắng trên nền xanh và xanh trên nền trắng, target 44px, mobile một cột dưới 768px, drawer dưới 1100px. Motion phục vụ phản hồi, hỗ trợ reduced motion.

Dùng ảnh thật hiện có, không tạo số liệu hoặc nhân vật mới. Tương tác: tìm kiếm/lọc/sắp xếp/phân trang, menu mobile, xem ảnh lớn, chia sẻ/copy link, xem trước bài và ảnh trong admin, xác nhận xóa, cảnh báo thay đổi chưa lưu. Dữ liệu được lưu bằng các luồng POST/token hiện tại.

Kiểm tra: Chrome/Playwright desktop/mobile, PHP lint, thao tác UI và quản trị trên dữ liệu thử riêng, Lighthouse. Font/icon có giấy phép local. Không đổi hệ lưu trữ hoặc xác thực trong đợt UI.

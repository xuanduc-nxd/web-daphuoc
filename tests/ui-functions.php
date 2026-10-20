<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../app/Views/helpers.php';

function ui_assert(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

ui_assert(ui_date('Wed Mar 25 2026 00:00:00 GMT+0700 (Giờ Đông Dương)') === '25/03/2026', 'Ngày có múi giờ phải giữ đúng ngày tại Việt Nam.');
ui_assert(ui_date('14/10/2026') === '14/10/2026', 'Ngày dd/mm/yyyy phải hiển thị đúng.');
ui_assert(ui_year('Thu Jan 01 2026 00:00:00 GMT+0700') === '2026', 'Bộ lọc năm phải dùng múi giờ Việt Nam.');
ui_assert(ui_timestamp('31/02/2026') === 0, 'Ngày không hợp lệ phải được nhận diện.');
ui_assert(ui_image('javascript:alert(1)') === 'Image/act-1.jpg', 'URL ảnh không an toàn phải dùng fallback.');
ui_assert(ui_image_srcset('uploads/example.jpg') === '', 'Ảnh local khác không được chuyển thành URL Cloudinary.');
ui_assert(str_contains(ui_image_srcset('Image/act-1.jpg'), 'assets/images/activity-480.webp'), 'Ảnh hoạt động có bản đóng gói phù hợp màn hình.');
ui_assert(str_contains(ui_image_srcset('https://res.cloudinary.com/demo/image/upload/v123/photo.jpg'), 'w_480'), 'Ảnh Cloudinary có các kích thước phù hợp màn hình.');
$html = ui_rich_text('<p onclick="alert(1)">Nội dung <strong>đậm</strong></p><script>alert(1)</script><a href="javascript:alert(2)">Liên kết</a>');
ui_assert(str_contains($html, '<strong>đậm</strong>'), 'Nội dung định dạng hợp lệ phải được giữ.');
ui_assert(!str_contains($html, 'onclick') && !str_contains($html, '<script') && !str_contains($html, 'javascript:'), 'HTML hiển thị không được giữ script hoặc thuộc tính thực thi.');
echo "UI helper tests passed\n";

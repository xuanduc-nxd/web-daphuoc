<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../app/Models/SiteRepository.php';
$options = getopt('', ['dry-run', 'apply', 'source-dir:', 'uploads-dir:']);
if (isset($options['dry-run']) === isset($options['apply'])) {
    fwrite(STDERR, "Dùng --dry-run để kiểm tra, hoặc --apply để nhập dữ liệu vào Supabase.\n");
    exit(1);
}
$source = (string) ($options['source-dir'] ?? __DIR__ . '/../data');
$uploads = (string) ($options['uploads-dir'] ?? app_upload_dir());
$datasets = legacy_datasets($source);
$images = [];
foreach ($datasets as $rows) foreach ($rows as $row) foreach (['image','hero_image'] as $field) {
    $image = (string) ($row[$field] ?? '');
    if (preg_match('~^(?:media\.php\?file=|uploads/)([a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif))$~', $image, $matches)) {
        $images[$image] = $matches[1];
    }
}
$missing = [];
foreach ($images as $filename) if (!is_file(rtrim($uploads, '/\\') . '/' . $filename)) $missing[] = $filename;
echo "Nguồn nhập (chỉ đọc): " . $source . PHP_EOL;
foreach ($datasets as $table => $rows) echo $table . ': ' . count($rows) . PHP_EOL;
echo 'Ảnh tải lên cần chuyển: ' . count($images) . PHP_EOL;
if ($missing) {
    fwrite(STDERR, "Thiếu ảnh trong thư mục uploads: " . implode(', ', $missing) . PHP_EOL);
    exit(1);
}
if (isset($options['dry-run'])) {
    echo "Kiểm tra nguồn thành công. Chưa gửi dữ liệu hoặc ảnh lên Supabase.\n";
    exit;
}
if (!supabase_configured()) throw new AppStorageException('Tạo project, chạy SQL và cấu hình .env trước khi nhập dữ liệu.');
// Validate every target table before uploading or writing anything.
foreach (array_keys($datasets) as $table) supabase_select($table, [], 'id.asc', 'id,version', 1);
echo 'Đích Supabase: ' . (string) parse_url((string) getenv('SUPABASE_URL'), PHP_URL_HOST) . PHP_EOL;
$urls = [];
foreach ($images as $old => $filename) {
    $path = rtrim($uploads, '/\\') . '/' . $filename;
    $mime = mime_content_type($path);
    if (!in_array($mime, ['image/jpeg','image/png','image/webp','image/gif'], true) || @getimagesize($path) === false) {
        throw new AppStorageException('Ảnh nguồn không hợp lệ: ' . $filename);
    }
    $urls[$old] = supabase_upload_file($filename, $mime, $path, true);
}
foreach ($datasets as $table => $rows) {
    foreach ($rows as &$row) foreach (['image','hero_image'] as $field) {
        if (isset($row[$field], $urls[$row[$field]])) $row[$field] = $urls[$row[$field]];
    }
    unset($row);
    $created = supabase_import($table, $rows);
    echo $table . ': tạo ' . $created . ', giữ ' . (count($rows) - $created) . ' bản ghi đã có.' . PHP_EOL;
}
echo "Đã nhập xong. File nguồn được giữ nguyên. Chạy check-supabase.php rồi tạo tài khoản quản trị.\n";

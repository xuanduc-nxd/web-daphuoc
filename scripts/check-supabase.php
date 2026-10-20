<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../app/Models/SiteRepository.php';
if (!supabase_configured()) throw new AppStorageException('Chưa cấu hình Supabase.');
echo 'Supabase: ' . (string) parse_url((string) getenv('SUPABASE_URL'), PHP_URL_HOST) . PHP_EOL;
foreach (['posts','members','sponsors','about_sections','settings','admin_users'] as $table) {
    $rows = supabase_select($table, [], 'id.asc', 'id,version');
    echo $table . ': ' . count($rows) . ' bản ghi.' . PHP_EOL;
}
if (!site_record('settings', 'main')) throw new AppStorageException('Chưa nhập cài đặt ban đầu. Chạy migrate-supabase.php --apply.');
if (!supabase_select('admin_users', ['role' => 'eq.admin', 'disabled' => 'eq.false'], 'id.asc', 'id', 1)) {
    echo "Chưa có quản trị viên. Chạy scripts/create-admin.ps1.\n";
}
echo "Đọc dữ liệu thành công. Kiểm tra thêm đăng nhập, đăng bài và tải ảnh trên website.\n";

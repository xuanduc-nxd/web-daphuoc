<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once __DIR__ . '/../app/Models/SiteRepository.php';
$options = getopt('', ['username:', 'name:', 'role:']);
$username = strtolower(trim((string) ($options['username'] ?? '')));
$role = (string) ($options['role'] ?? 'admin');
$password = (string) getenv('ADMIN_SETUP_PASSWORD');
if (!preg_match('/^[a-z0-9_.-]{3,64}$/', $username) || !in_array($role, ['admin','editor'], true)) {
    fwrite(STDERR, "Dùng --username ten_dang_nhap [--name \"Họ tên\"] [--role admin|editor].\n");
    exit(1);
}
if (mb_strlen($password) < 12 || strlen($password) > 72) {
    fwrite(STDERR, "Mật khẩu cần ít nhất 12 ký tự và tối đa 72 byte. Dùng create-admin.ps1 để nhập kín.\n");
    exit(1);
}
if (!supabase_configured()) throw new AppStorageException('Chưa cấu hình Supabase.');
if (supabase_select('admin_users', ['username' => 'eq.' . $username], 'id.asc', 'id', 1)) {
    throw new AppStorageException('Tên đăng nhập đã tồn tại. Không ghi đè tài khoản đã có.');
}
supabase_insert('admin_users', [
    'id' => 'admin_' . bin2hex(random_bytes(12)), 'username' => $username,
    'display_name' => (string) ($options['name'] ?? $username),
    'password_hash' => password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]),
    'role' => $role, 'disabled' => false,
]);
echo 'Đã tạo tài khoản ' . $username . ' với quyền ' . $role . ". Không có mật khẩu mặc định.\n";

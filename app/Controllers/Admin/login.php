<?php
require_once __DIR__ . '/../../Support/admin.php';
require_once __DIR__ . '/../../Views/helpers.php';
if (admin_is_logged_in()) { header('Location: index.php'); exit; }
$error = '';
$configured = supabase_configured();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_form_check_token()) $error = 'Phiên đăng nhập đã hết hạn. Vui lòng tải lại trang.';
    elseif (!$configured) $error = 'Cấu hình Supabase và tạo tài khoản quản trị trước khi đăng nhập.';
    else {
        try {
            $account = admin_authenticate((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''));
            if ($account) {
                session_regenerate_id(true);
                $_SESSION = [
                    'admin_id' => $account['id'], 'admin_source' => 'supabase', 'admin_version' => (int) $account['version'],
                    'admin_role' => $account['role'], 'admin_username' => $account['display_name'] ?: $account['username'],
                    'admin_logged_in' => true, 'admin_last_active' => time(),
                ];
                header('Location: index.php');
                exit;
            }
            $error = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        } catch (AppStorageException | AppConflictException $exception) { $error = $exception->getMessage(); }
    }
}
require __DIR__ . '/../../Views/admin/login.php';

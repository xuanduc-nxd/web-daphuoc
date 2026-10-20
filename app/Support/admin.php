<?php
declare(strict_types=1);
require_once __DIR__ . '/../Models/AdminUser.php';
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'),
        'samesite' => 'Lax',
    ]);
    session_start();
}

function admin_is_logged_in(): bool
{
    static $checked = false;
    static $valid = false;
    if ($checked) return $valid;
    $checked = true;
    if (empty($_SESSION['admin_id']) || ($_SESSION['admin_source'] ?? '') !== 'supabase'
        || time() - (int) ($_SESSION['admin_last_active'] ?? 0) > 3600) {
        unset($_SESSION['admin_id'], $_SESSION['admin_logged_in'], $_SESSION['admin_role']);
        return false;
    }
    $account = admin_account((string) $_SESSION['admin_id']);
    if (!$account || !in_array($account['role'] ?? '', ['admin','editor'], true)
        || (int) ($_SESSION['admin_version'] ?? 0) !== (int) $account['version']) {
        $_SESSION = [];
        return false;
    }
    $_SESSION['admin_role'] = $account['role'];
    $_SESSION['admin_username'] = $account['display_name'] ?: $account['username'];
    $_SESSION['admin_last_active'] = time();
    return $valid = true;
}

function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_require_owner(): void
{
    admin_require_login();
    if (($_SESSION['admin_role'] ?? '') === 'admin') return;
    http_response_code(403);
    admin_layout_start('Không có quyền truy cập');
    echo '<section class="panel"><h1>Không có quyền truy cập</h1><p>Mục này dành cho tài khoản quản trị.</p><a class="button primary" href="index.php">Về tổng quan</a></section>';
    admin_layout_end();
    exit;
}

function admin_e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function admin_redirect(string $url, string $message = '', string $type = 'success'): void
{
    if ($message !== '') $_SESSION['admin_flash'] = ['message' => $message, 'type' => $type];
    header('Location: ' . $url);
    exit;
}

function admin_flash(): ?array
{
    $flash = $_SESSION['admin_flash'] ?? null;
    unset($_SESSION['admin_flash']);
    return $flash;
}

function admin_team_token(): string
{
    if (empty($_SESSION['team_token'])) $_SESSION['team_token'] = bin2hex(random_bytes(32));
    return (string) $_SESSION['team_token'];
}

function admin_team_check_token(): bool
{
    $submitted = (string) ($_POST['token'] ?? '');
    return $submitted !== '' && hash_equals(admin_team_token(), $submitted);
}

function admin_form_token(): string
{
    if (empty($_SESSION['admin_form_token'])) $_SESSION['admin_form_token'] = bin2hex(random_bytes(32));
    return (string) $_SESSION['admin_form_token'];
}

function admin_form_check_token(): bool
{
    $submitted = (string) ($_POST['token'] ?? '');
    return $submitted !== '' && hash_equals(admin_form_token(), $submitted);
}

function admin_team_image_src(string $image): string
{
    if (preg_match('~^https?://~i', $image)) return $image;
    return '../' . ltrim($image, '/');
}

function admin_date_value(string $value): ?string
{
    $value = trim($value);
    if ($value !== '' && !preg_match('~^(?:\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2})$~', $value)) {
        throw new InvalidArgumentException('Ngày cần đúng định dạng dd/mm/yyyy.');
    }
    return app_date_value($value);
}

function admin_uploaded_image(string $prefix): ?string
{
    $file = $_FILES['image'] ?? null;
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 5 * 1024 * 1024 || !is_uploaded_file($file['tmp_name'])) {
        throw new InvalidArgumentException('Ảnh không hợp lệ hoặc vượt quá 5 MB.');
    }
    $mime = mime_content_type($file['tmp_name']);
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    if (!isset($allowed[$mime]) || @getimagesize($file['tmp_name']) === false) throw new InvalidArgumentException('Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF.');
    $filename = $prefix . '-' . bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
    return supabase_upload_file($filename, $mime, $file['tmp_name']);
}

function admin_layout_start(string $title): void
{
    require_once __DIR__ . '/../Views/helpers.php';
    $flash = admin_flash();
    $page = basename((string) ($_SERVER['SCRIPT_NAME'] ?? ''));
    $teamType = ($_GET['type'] ?? '') === 'student' ? 'student' : 'board';
    if ($page === 'team-edit.php' && isset($_GET['id'])) {
        foreach (site_members() as $member) {
            if (($member['id'] ?? '') === $_GET['id']) {
                $teamType = ($member['type'] ?? 'board') === 'student' ? 'student' : 'board';
                break;
            }
        }
    }
    $navigation = [
        ['label' => 'Tổng quan', 'href' => 'index.php', 'icon' => 'squares-four', 'active' => $page === 'index.php'],
        ['label' => 'Bài viết', 'href' => 'posts.php', 'icon' => 'newspaper', 'active' => in_array($page, ['posts.php', 'post-edit.php'], true)],
        ['label' => 'Ban điều hành', 'href' => 'team.php?type=board', 'icon' => 'users-three', 'active' => in_array($page, ['team.php', 'team-edit.php'], true) && $teamType === 'board'],
        ['label' => 'Sinh viên', 'href' => 'team.php?type=student', 'icon' => 'graduation-cap', 'active' => in_array($page, ['team.php', 'team-edit.php'], true) && $teamType === 'student'],
        ['label' => 'Tri ân & tài trợ', 'href' => 'content.php?type=sponsor', 'icon' => 'hand-heart', 'active' => ($page === 'content.php' || $page === 'content-edit.php') && ($_GET['type'] ?? '') === 'sponsor'],
        ['label' => 'Giới thiệu CLB', 'href' => 'content.php?type=about', 'icon' => 'info', 'active' => ($page === 'content.php' || $page === 'content-edit.php') && ($_GET['type'] ?? '') === 'about'],
        ['label' => 'Thông tin website', 'href' => 'settings.php', 'icon' => 'gear-six', 'active' => $page === 'settings.php'],
    ];
    if (($_SESSION['admin_role'] ?? '') !== 'admin') $navigation = array_slice($navigation, 0, 4);
    include __DIR__ . '/../Views/admin/layout-start.php';
}

function admin_layout_end(): void
{
    include __DIR__ . '/../Views/admin/layout-end.php';
}

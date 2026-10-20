<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') admin_redirect('posts.php');
if (!admin_form_check_token()) admin_redirect('posts.php', 'Yêu cầu không hợp lệ.', 'error');
try {
    site_delete('posts', trim((string) ($_POST['id'] ?? '')), (int) ($_POST['version'] ?? 0));
    admin_redirect('posts.php', 'Đã xóa bài viết.');
} catch (AppStorageException | AppConflictException $error) { admin_redirect('posts.php', $error->getMessage(), 'error'); }

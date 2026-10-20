<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') admin_redirect('posts.php');
$token = (string) ($_POST['token'] ?? '');
if ($token === '' || !hash_equals((string) ($_SESSION['post_status_token'] ?? ''), $token)) admin_redirect('posts.php', 'Yêu cầu không hợp lệ.', 'error');
$id = trim((string) ($_POST['id'] ?? ''));
$post = site_record('posts', $id);
if (!$post) admin_redirect('posts.php', 'Không tìm thấy bài viết.', 'error');
try {
    $status = $post['status'] === 'published' ? 'draft' : 'published';
    site_save('posts', ['id' => $id, 'status' => $status], (int) ($_POST['version'] ?? 0));
    admin_redirect('posts.php?kind=' . $post['kind'], $status === 'draft' ? 'Đã ẩn bài viết khỏi website.' : 'Đã hiển thị bài viết trên website.');
} catch (AppStorageException | AppConflictException $error) { admin_redirect('posts.php', $error->getMessage(), 'error'); }

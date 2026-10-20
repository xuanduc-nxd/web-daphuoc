<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
$id = is_string($_GET['id'] ?? $_POST['id'] ?? null) ? trim($_GET['id'] ?? $_POST['id']) : '';
$existing = $id !== '' ? site_record('posts', $id) : null;
if ($id !== '' && !$existing) admin_redirect('posts.php', 'Không tìm thấy bài viết.', 'error');
$kind = $existing['kind'] ?? (in_array($_GET['kind'] ?? '', ['activity','notification','blog'], true) ? $_GET['kind'] : '');
$post = $existing ?? ['id' => '', 'kind' => $kind, 'title' => '', 'excerpt' => '', 'content' => '', 'content_format' => 'plain', 'image' => '', 'author' => 'CLB Golf Đa Phước', 'role' => 'CLB Golf Đa Phước', 'date' => date('Y-m-d'), 'status' => 'draft', 'version' => 1];
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_form_check_token()) admin_redirect('posts.php', 'Yêu cầu không hợp lệ.', 'error');
    $post['kind'] = $existing ? $existing['kind'] : (string) ($_POST['kind'] ?? '');
    foreach (['title','excerpt','content','author','role'] as $field) $post[$field] = trim((string) ($_POST[$field] ?? ''));
    $post['date'] = trim((string) ($_POST['date'] ?? ''));
    $post['status'] = ($_POST['status'] ?? '') === 'published' ? 'published' : 'draft';
    $post['version'] = (int) ($_POST['version'] ?? 0);
    try {
        if (!in_array($post['kind'], ['activity','notification','blog'], true)) throw new InvalidArgumentException('Chọn loại bài hợp lệ.');
        if ($post['title'] === '' || mb_strlen($post['title']) > 500) throw new InvalidArgumentException('Tiêu đề cần từ 1 đến 500 ký tự.');
        if (mb_strlen($post['author']) > 200 || mb_strlen($post['role']) > 200 || strlen($post['content']) > 1000000) throw new InvalidArgumentException('Thông tin bài viết quá dài.');
        $date = admin_date_value($post['date']);
        $image = admin_uploaded_image('post');
        if ($image !== null) $post['image'] = $image;
        $payload = array_intersect_key($post, array_flip(['id','kind','title','excerpt','content','content_format','image','author','role','status']));
        $payload['id'] = $existing ? $id : 'post_' . bin2hex(random_bytes(12));
        $payload['date'] = $date;
        site_save('posts', $payload, $existing ? $post['version'] : null);
        admin_redirect('posts.php?kind=' . $post['kind'], 'Đã lưu bài viết.');
    } catch (AppStorageException | AppConflictException | InvalidArgumentException $exception) { $error = $exception->getMessage(); }
}
admin_layout_start($existing ? 'Sửa bài viết' : 'Đăng bài mới');
require __DIR__ . '/../../Views/admin/post-edit.php';

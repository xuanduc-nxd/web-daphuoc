<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_owner();
$type = ($_GET['type'] ?? '') === 'about' ? 'about' : 'sponsor';
$table = $type === 'about' ? 'about_sections' : 'sponsors';
$id = trim((string) ($_GET['id'] ?? $_POST['id'] ?? ''));
$existing = $id !== '' ? site_record($table, $id) : null;
if ($id !== '' && !$existing) admin_redirect('content.php?type=' . $type, 'Không tìm thấy nội dung.', 'error');
$row = $existing ?? ($type === 'about'
    ? ['id' => '', 'section_key' => 'principle', 'category' => '', 'content' => '', 'sort_order' => 0, 'version' => 1]
    : ['id' => '', 'title' => '', 'excerpt' => '', 'content' => '', 'image' => '', 'date' => date('Y-m-d'), 'sort_order' => 0, 'version' => 1]);
$sections = ['principle' => 'Tôn chỉ và mục đích', 'scope' => 'Phạm vi và đối tượng', 'target' => 'Mục tiêu', 'method' => 'Phương thức hoạt động'];
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_form_check_token()) admin_redirect('content.php?type=' . $type, 'Yêu cầu không hợp lệ.', 'error');
    foreach ($type === 'about' ? ['section_key','category','content'] : ['title','excerpt','content','date'] as $field) $row[$field] = trim((string) ($_POST[$field] ?? ''));
    $row['sort_order'] = (int) ($_POST['sort_order'] ?? 0);
    $row['version'] = (int) ($_POST['version'] ?? 0);
    try {
        if ($type === 'about') {
            if (!isset($sections[$row['section_key']]) || $row['content'] === '') throw new InvalidArgumentException('Chọn mục và nhập nội dung giới thiệu.');
        } else {
            if ($row['title'] === '' || mb_strlen($row['title']) > 500) throw new InvalidArgumentException('Tên cần từ 1 đến 500 ký tự.');
            $date = admin_date_value($row['date']);
            $image = admin_uploaded_image('sponsor');
            if ($image !== null) $row['image'] = $image;
        }
        if ($row['sort_order'] < 0 || $row['sort_order'] > 100000) throw new InvalidArgumentException('Thứ tự cần từ 0 đến 100000.');
        $fields = $type === 'about' ? ['id','section_key','category','content','sort_order'] : ['id','title','excerpt','content','image','date','sort_order'];
        $payload = array_intersect_key($row, array_flip($fields));
        $payload['id'] = $existing ? $id : $type . '_' . bin2hex(random_bytes(12));
        if ($type === 'sponsor') $payload['date'] = $date;
        site_save($table, $payload, $existing ? $row['version'] : null);
        admin_redirect('content.php?type=' . $type, 'Đã lưu nội dung.');
    } catch (AppStorageException | AppConflictException | InvalidArgumentException $exception) { $error = $exception->getMessage(); }
}
admin_layout_start($existing ? 'Sửa nội dung' : 'Thêm nội dung');
require __DIR__ . '/../../Views/admin/content-edit.php';

<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_owner();
$type = ($_GET['type'] ?? '') === 'about' ? 'about' : 'sponsor';
$table = $type === 'about' ? 'about_sections' : 'sponsors';
$title = $type === 'about' ? 'Giới thiệu CLB' : 'Tri ân & tài trợ';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_form_check_token()) admin_redirect('content.php?type=' . $type, 'Yêu cầu không hợp lệ.', 'error');
    try {
        site_delete($table, trim((string) ($_POST['id'] ?? '')), (int) ($_POST['version'] ?? 0));
        admin_redirect('content.php?type=' . $type, 'Đã xóa nội dung.');
    } catch (AppStorageException | AppConflictException $error) { admin_redirect('content.php?type=' . $type, $error->getMessage(), 'error'); }
}
$rows = $type === 'about' ? site_about_sections() : site_sponsors();
$sections = ['principle' => 'Tôn chỉ và mục đích', 'scope' => 'Phạm vi và đối tượng', 'target' => 'Mục tiêu', 'method' => 'Phương thức hoạt động'];
admin_layout_start($title);
require __DIR__ . '/../../Views/admin/content.php';

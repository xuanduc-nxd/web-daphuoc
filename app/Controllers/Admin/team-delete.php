<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') admin_redirect('team.php');
if (!admin_team_check_token()) admin_redirect('team.php', 'Yêu cầu không hợp lệ.', 'error');
$id = trim((string) ($_POST['id'] ?? ''));
$member = site_record('members', $id);
if (!$member) admin_redirect('team.php', 'Không tìm thấy hồ sơ.', 'error');
$type = $member['type'];
try {
    site_delete('members', $id, (int) ($_POST['version'] ?? 0));
    admin_redirect('team.php?type=' . $type, 'Đã xóa hồ sơ.');
} catch (AppStorageException | AppConflictException $error) { admin_redirect('team.php?type=' . $type, $error->getMessage(), 'error'); }

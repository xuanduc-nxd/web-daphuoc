<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
$id = is_string($_GET['id'] ?? $_POST['id'] ?? null) ? trim($_GET['id'] ?? $_POST['id']) : '';
$existing = $id !== '' ? site_record('members', $id) : null;
if ($id !== '' && !$existing) admin_redirect('team.php', 'Không tìm thấy hồ sơ.', 'error');
$type = $existing['type'] ?? (($_GET['type'] ?? $_POST['type'] ?? '') === 'student' ? 'student' : 'board');
$member = $existing ?? ['id' => '', 'type' => $type, 'name' => '', 'position' => 'Ban điều hành', 'school' => '', 'major' => '', 'detail' => '', 'image' => '', 'sort_order' => 0, 'version' => 1];
$index = $existing ? 0 : null;
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_team_check_token()) admin_redirect('team.php?type=' . $type, 'Yêu cầu không hợp lệ.', 'error');
    foreach (['name','detail'] as $field) $member[$field] = trim((string) ($_POST[$field] ?? ''));
    if ($type === 'board') $member['position'] = ($_POST['position'] ?? '') === 'Ban cố vấn' ? 'Ban cố vấn' : 'Ban điều hành';
    else foreach (['school','major'] as $field) $member[$field] = trim((string) ($_POST[$field] ?? ''));
    $member['version'] = (int) ($_POST['version'] ?? 0);
    try {
        if ($member['name'] === '' || mb_strlen($member['name']) > 200) throw new InvalidArgumentException('Họ tên cần từ 1 đến 200 ký tự.');
        $image = admin_uploaded_image('team');
        if ($image !== null) $member['image'] = $image;
        elseif (!empty($_POST['remove_image'])) $member['image'] = '';
        $payload = array_intersect_key($member, array_flip(['id','type','name','position','school','major','detail','image','sort_order']));
        $payload['id'] = $existing ? $id : 'team_' . bin2hex(random_bytes(12));
        if (!$existing) {
            $rows = site_members();
            $payload['sort_order'] = $rows ? max(array_column($rows, 'sort_order')) + 1 : 0;
        }
        site_save('members', $payload, $existing ? $member['version'] : null);
        admin_redirect('team.php?type=' . $type, 'Đã lưu hồ sơ.');
    } catch (AppStorageException | AppConflictException | InvalidArgumentException $exception) { $error = $exception->getMessage(); }
}
$title = $existing ? 'Sửa hồ sơ' : 'Thêm hồ sơ';
admin_layout_start($title);
require __DIR__ . '/../../Views/admin/team-edit.php';

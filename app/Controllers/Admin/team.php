<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
$type = ($_GET['type'] ?? '') === 'student' ? 'student' : 'board';
$title = $type === 'student' ? 'Sinh viên' : 'Ban điều hành';
$members = array_values(array_filter(site_members(), fn($member) => ($member['type'] ?? 'board') === $type));
admin_layout_start($title);
require __DIR__ . '/../../Views/admin/team.php';

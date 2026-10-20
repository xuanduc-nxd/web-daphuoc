<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
$filterKind = in_array($_GET['kind'] ?? '', ['activity','notification','blog'], true) ? $_GET['kind'] : null;
$posts = site_posts($filterKind);
if (empty($_SESSION['post_status_token'])) $_SESSION['post_status_token'] = bin2hex(random_bytes(32));
admin_layout_start('Bài viết');
require __DIR__ . '/../../Views/admin/posts.php';

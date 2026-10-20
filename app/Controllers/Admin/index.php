<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_login();
$posts = site_posts();
$settings = site_settings();
$team = site_members();
admin_layout_start('Tổng quan');
require __DIR__ . '/../../Views/admin/index.php';

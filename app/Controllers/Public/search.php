<?php
require_once __DIR__ . '/../../Support/public.php';

$results = [];
foreach (site_collection('activities') as $row) $results[] = ['post' => $row, 'category' => 'Hoạt động', 'href' => 'detail.php?type=activities&id=' . rawurlencode((string) ($row['id'] ?? ''))];
foreach (site_collection('notifications') as $row) $results[] = ['post' => $row, 'category' => 'Thông báo', 'href' => 'detail.php?id=' . rawurlencode((string) ($row['id'] ?? ''))];
foreach (site_posts('blog', true) as $row) $results[] = ['post' => $row, 'category' => 'Blog', 'href' => 'detail_blog.php?id=' . rawurlencode((string) ($row['id'] ?? ''))];
$pageTitle = 'Tìm kiếm · CLB Golf Đa Phước';
require __DIR__ . '/../../Views/public/search.php';

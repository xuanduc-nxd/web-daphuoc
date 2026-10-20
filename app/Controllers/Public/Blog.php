<?php
require_once __DIR__ . '/../../Support/public.php';

$blog_posts = site_posts('blog', true);
$pageTitle = 'Blog · CLB Golf Đa Phước';

$roles = array_values(array_unique(array_filter(array_column($blog_posts, 'role'))));
require __DIR__ . '/../../Views/public/Blog.php';

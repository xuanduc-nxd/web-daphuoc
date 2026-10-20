<?php
require_once __DIR__ . '/../../Support/public.php';
$activities = site_collection('activities');
$pageTitle = 'Hoạt động · CLB Golf Đa Phước';
$pageDescription = 'Theo dõi các hoạt động, chương trình học bổng và những khoảnh khắc của CLB Golf Đa Phước.';
require __DIR__ . '/../../Views/public/Activities.php';

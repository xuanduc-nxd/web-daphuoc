<?php
require_once __DIR__ . '/../../Support/public.php';
$about_data = site_collection('abouts');
$sections = [];
foreach ($about_data as $item) $sections[$item['section_key'] ?? ''][] = $item;
$targets = [];
foreach ($sections['target'] ?? [] as $target) $targets[$target['category'] ?? 'Mục tiêu'][] = $target['content'] ?? '';
$pageTitle = 'Giới thiệu · CLB Golf Đa Phước';
require __DIR__ . '/../../Views/public/About.php';

<?php
require_once __DIR__ . '/../../Support/public.php';
$id = is_string($_GET['id'] ?? null) ? trim($_GET['id']) : '';
$type = is_string($_GET['type'] ?? null) ? $_GET['type'] : 'notifications';
$type = in_array($type, ['activities', 'sponsors', 'notifications'], true) ? $type : 'notifications';
$mapping = [
    'activities' => ['activity', 'activities', 'Hoạt động', 'Activities.php'],
    'sponsors' => ['sponsor', 'sponsors', 'Tài trợ', 'HonorList.php'],
    'notifications' => ['notification', 'notifications', 'Thông báo', 'Notifications.php'],
];
[$kind, $collection, $backLabel, $backHref] = $mapping[$type];
$category = $backLabel;
$article = $id === '' ? null : ($kind === 'sponsor' ? site_record('sponsors', $id) : site_public_post($kind, $id));
$recent_posts = $article ? array_slice(array_values(array_filter(site_collection($collection), fn($post) => (string) $post['id'] !== (string) $article['id'])), 0, 4) : [];
$detailBase = 'detail.php?type=' . $type . '&id=';
$plainContent = $article && ($article['content_format'] ?? 'html') === 'plain';
include __DIR__ . '/../../Views/public/article.php';

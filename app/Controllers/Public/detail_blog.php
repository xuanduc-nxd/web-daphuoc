<?php
require_once __DIR__ . '/../../Support/public.php';
$id = is_string($_GET['id'] ?? null) ? trim($_GET['id']) : '';
$article = $id === '' ? null : site_public_post('blog', $id);
$recent_posts = array_slice(array_values(array_filter(site_posts('blog', true), fn($post) => !$article || $post['id'] !== $article['id'])), 0, 4);
$category = (string) ($article['role'] ?? 'Blog');
$backLabel = 'Blog';
$backHref = 'Blog.php';
$detailBase = 'detail_blog.php?id=';
$plainContent = !$article || ($article['content_format'] ?? 'plain') === 'plain';
include __DIR__ . '/../../Views/public/article.php';

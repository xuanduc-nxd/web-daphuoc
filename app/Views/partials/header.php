<?php
require_once __DIR__ . '/../helpers.php';
$siteSettings = site_settings();
$assetBasePath = isset($baseHref) ? rtrim($baseHref, '/\\') . '/' : '';
$currentPage = basename((string) ($_SERVER['SCRIPT_NAME'] ?? $_SERVER['PHP_SELF'] ?? 'index.php'));
$menuDefinitions = [
    ['label' => 'Giới thiệu', 'href' => 'About.php', 'children' => [['label' => 'Ban điều hành Quỹ', 'href' => 'ExecutiveBoard.php'], ['label' => 'Sinh viên', 'href' => 'Students.php']]],
    ['label' => 'Thông báo', 'href' => 'Notifications.php', 'children' => []],
    ['label' => 'Hoạt động', 'href' => 'Activities.php', 'children' => []],
    ['label' => 'Blog', 'href' => 'Blog.php', 'children' => []],
    ['label' => 'Tài trợ', 'href' => 'Sponsorship.php', 'children' => []],
];
$pageTitle = $pageTitle ?? $siteSettings['site_name'] . ' và những người bạn';
$pageDescription = $pageDescription ?? 'Tin tức, hoạt động và những câu chuyện đồng hành cùng thế hệ trẻ Đà Nẵng của CLB Golf Đa Phước và những người bạn.';
?>
<!doctype html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?= ui_e($pageDescription) ?>">
    <meta name="theme-color" content="#19578f">
    <meta property="og:title" content="<?= ui_e($pageTitle) ?>">
    <meta property="og:description" content="<?= ui_e($pageDescription) ?>">
    <meta property="og:type" content="<?= isset($article) && $article ? 'article' : 'website' ?>">
    <?php if (!empty($article['image']) && preg_match('~^https?://~i', $article['image'])): ?><meta property="og:image" content="<?= ui_e(ui_image($article['image'])) ?>"><?php endif; ?>
    <title><?= ui_e($pageTitle) ?></title>
    <link rel="icon" href="<?= ui_e($assetBasePath) ?>assets/images/favicon.png" type="image/png">
    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
    <link rel="preload" href="<?= ui_e($assetBasePath) ?>assets/fonts/be-vietnam-pro-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="<?= ui_e($assetBasePath) ?>CSS/fonts.css">
    <link rel="stylesheet" href="<?= ui_e($assetBasePath) ?>CSS/icons.css">
    <link rel="stylesheet" href="<?= ui_e($assetBasePath) ?>CSS/site.css">
    <script src="<?= ui_e($assetBasePath) ?>JS/site.js" defer></script>
</head>
<body>
    <a class="skip-link" href="#main-content">Đến nội dung chính</a>
    <header class="site-header">
        <div class="header-inner">
            <a class="brand" href="<?= ui_e($assetBasePath) ?>index.php">
                <img src="<?= ui_e($assetBasePath) ?>assets/images/logo.webp" width="56" height="56" alt="Logo Đa Phước">
                <span><strong><?= ui_e($siteSettings['site_name']) ?></strong><small>Và những người bạn</small></span>
            </a>
            <nav class="site-nav" id="mobileMenu" aria-label="Điều hướng chính">
                <?php foreach ($menuDefinitions as $item):
                    $detailSections = ['activities' => 'Activities.php', 'notifications' => 'Notifications.php', 'sponsors' => 'Sponsorship.php'];
                    $active = $currentPage === $item['href'] || ($item['href'] === 'About.php' && in_array($currentPage, ['ExecutiveBoard.php', 'Students.php'], true)) || ($item['href'] === 'Blog.php' && $currentPage === 'detail_blog.php') || ($item['href'] === 'Sponsorship.php' && $currentPage === 'HonorList.php') || ($currentPage === 'detail.php' && ($detailSections[$type ?? 'notifications'] ?? '') === $item['href']);
                ?>
                <div class="nav-item <?= $item['children'] ? 'has-submenu' : '' ?>">
                    <a href="<?= ui_e($assetBasePath . $item['href']) ?>" <?= $active ? 'aria-current="page"' : '' ?>><?= ui_e($item['label']) ?></a>
                    <?php if ($item['children']): ?>
                        <button class="submenu-toggle" type="button" aria-label="Mở các trang giới thiệu" aria-expanded="false" aria-controls="about-submenu"><?= ui_icon('caret-down') ?></button>
                        <div class="nav-submenu" id="about-submenu" hidden><?php foreach ($item['children'] as $child): ?><a href="<?= ui_e($assetBasePath . $child['href']) ?>"><?= ui_e($child['label']) ?></a><?php endforeach; ?></div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
                <a class="nav-contact" href="<?= ui_e($assetBasePath) ?>contact.php">Liên hệ <?= ui_icon('arrow-up-right') ?></a>
            </nav>
            <div class="header-actions">
                <a class="icon-button" href="<?= ui_e($assetBasePath) ?>search.php" aria-label="Tìm kiếm website"><?= ui_icon('magnifying-glass') ?></a>
                <button class="icon-button menu-toggle" id="menuToggle" type="button" aria-controls="mobileMenu" aria-expanded="false" aria-label="Mở menu"><?= ui_icon('list') ?></button>
            </div>
        </div>
    </header>
    <div class="menu-backdrop" data-menu-backdrop hidden></div>

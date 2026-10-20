<!doctype html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?= admin_e($title) ?> · Golf Đa Phước Admin</title>
        <link rel="icon" href="../assets/images/favicon.png">
        <link rel="stylesheet" href="../CSS/fonts.css"><link rel="stylesheet" href="../CSS/icons.css"><link rel="stylesheet" href="../CSS/site.css"><link rel="stylesheet" href="admin.css">
        <script src="../JS/site.js" defer></script><script src="admin.js" defer></script>
    </head>
    <body class="admin-body">
    <a class="skip-link" href="#main-content">Đến nội dung chính</a>
    <div class="admin-shell">
        <aside class="admin-sidebar" id="admin-sidebar">
            <button class="icon-button admin-sidebar-close" type="button" data-admin-close aria-label="Đóng menu quản trị"><?= ui_icon('x') ?></button>
            <a class="admin-brand" href="index.php"><img src="../assets/images/logo.webp" width="44" height="44" alt="Logo Đa Phước"><span>Golf Đa Phước<small>Trang quản trị</small></span></a>
            <span class="sidebar-label">Quản lý nội dung</span>
            <nav aria-label="Điều hướng quản trị"><?php foreach ($navigation as $item): ?><a href="<?= admin_e($item['href']) ?>" class="<?= $item['active'] ? 'active' : '' ?>" <?= $item['active'] ? 'aria-current="page"' : '' ?>><?= ui_icon($item['icon']) ?> <?= admin_e($item['label']) ?></a><?php endforeach; ?></nav>
            <div class="sidebar-bottom"><a href="../" target="_blank" rel="noopener noreferrer"><?= ui_icon('arrow-square-out') ?> Xem website</a><a href="logout.php"><?= ui_icon('sign-out') ?> Đăng xuất</a></div>
        </aside>
        <div class="admin-backdrop" data-admin-backdrop hidden></div>
        <main class="admin-main" id="main-content">
            <div class="admin-topbar"><div><button class="icon-button admin-menu-toggle" type="button" data-admin-menu aria-controls="admin-sidebar" aria-expanded="false" aria-label="Mở menu quản trị"><?= ui_icon('list') ?></button><span><?= admin_e($title) ?></span></div><span class="admin-user"><?= ui_icon('user-circle') ?> <?= admin_e($_SESSION['admin_username'] ?? 'Admin') ?></span></div>

            <?php if ($flash): ?><div class="flash <?= admin_e($flash['type']) ?>" role="<?= $flash['type'] === 'error' ? 'alert' : 'status' ?>"><?= admin_e($flash['message']) ?></div><?php endif; ?>

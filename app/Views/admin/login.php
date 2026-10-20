<!doctype html>

<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Đăng nhập quản trị · Golf Đa Phước</title><link rel="icon" href="../assets/images/favicon.png"><link rel="stylesheet" href="../CSS/fonts.css"><link rel="stylesheet" href="../CSS/icons.css"><link rel="stylesheet" href="../CSS/site.css"><link rel="stylesheet" href="admin.css"><script src="admin.js" defer></script></head>
<body class="login-body">
<div class="login-shell">
    <aside class="login-intro"><a class="brand" href="../index.php"><img src="../assets/images/logo.webp" width="52" height="52" alt="Logo Đa Phước"><span><strong>CLB Golf Đa Phước</strong><small>Và những người bạn</small></span></a><div><h2>Cùng kể những câu chuyện của CLB.</h2><p>Cập nhật hoạt động, chia sẻ tâm tình và kết nối những người cùng đồng hành.</p></div><img class="login-photo" src="../assets/images/activity-800.webp" width="800" height="500" alt="Hoạt động trao học bổng của CLB"></aside>
    <main class="login-content"><div class="login-card"><h1>Chào mừng trở lại</h1><p>Đăng nhập để quản lý nội dung của CLB.</p><?php if ($error): ?><div class="flash error" role="alert"><?= admin_e($error) ?></div><?php endif; ?>
        <?php if (!$configured): ?><div class="flash error">Chưa kết nối Supabase. Hoàn tất cấu hình và tạo tài khoản quản trị trước khi đăng nhập.</div><?php endif; ?>
        <form method="post"><input type="hidden" name="token" value="<?= admin_e(admin_form_token()) ?>"><label>Tên đăng nhập<input name="username" required autofocus autocomplete="username" placeholder="Nhập tên đăng nhập"></label><label>Mật khẩu<div class="password-field"><input type="password" name="password" required autocomplete="current-password" placeholder="Nhập mật khẩu"><button class="icon-button" type="button" data-toggle-password aria-label="Hiện mật khẩu" aria-pressed="false"><?= ui_icon('eye') ?></button></div></label><button class="button primary" type="submit" <?= !$configured ? 'disabled' : '' ?>>Đăng nhập <?= ui_icon('arrow-right') ?></button></form>
        <a class="text-link login-back" href="../index.php"><?= ui_icon('arrow-left') ?> Quay lại website</a><p class="login-footer">Dành cho người phụ trách nội dung của CLB.</p>
    </div></main>
</div>
</body>
</html>

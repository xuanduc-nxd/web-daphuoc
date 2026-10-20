<?php
require_once __DIR__ . '/../../Support/admin.php';
admin_require_owner();
$settings = site_settings();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_form_check_token()) admin_redirect('settings.php', 'Yêu cầu không hợp lệ.', 'error');
    $settings['version'] = (int) ($_POST['version'] ?? 0);
    foreach (['site_name','notice','contact','phone','email','location','facebook','instagram','tiktok','threads','hero_image'] as $field) $settings[$field] = trim((string) ($_POST[$field] ?? ''));
    try {
        if ($settings['site_name'] === '' || mb_strlen($settings['site_name']) > 80) throw new InvalidArgumentException('Tên website cần từ 1 đến 80 ký tự.');
        if ($settings['email'] !== '' && !filter_var($settings['email'], FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Email không hợp lệ.');
        if ($settings['phone'] !== '' && !preg_match('/^[0-9+(). \-]{6,30}$/', $settings['phone'])) throw new InvalidArgumentException('Số điện thoại không hợp lệ.');
        foreach (['facebook','instagram','tiktok','threads'] as $field) {
            if ($settings[$field] !== '' && (!filter_var($settings[$field], FILTER_VALIDATE_URL) || !str_starts_with($settings[$field], 'https://'))) throw new InvalidArgumentException('Liên kết mạng xã hội cần bắt đầu bằng https://.');
        }
        $settings['hero_image'] = app_image_value($settings['hero_image']);
        $image = admin_uploaded_image('hero');
        if ($image !== null) $settings['hero_image'] = $image;
        $payload = array_intersect_key($settings, array_flip(['id','site_name','notice','contact','phone','email','location','facebook','instagram','tiktok','threads','hero_image']));
        site_save('settings', $payload, $settings['version']);
        admin_redirect('settings.php', 'Đã cập nhật thông tin website.');
    } catch (AppStorageException | AppConflictException | InvalidArgumentException $exception) { $error = $exception->getMessage(); }
}
admin_layout_start('Thông tin website');
require __DIR__ . '/../../Views/admin/settings.php';

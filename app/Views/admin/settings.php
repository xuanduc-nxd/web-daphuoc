
<section class="page-heading"><div><p class="eyebrow">Cài đặt</p><h1>Thông tin website</h1><p>Các thông tin này hiển thị trên trang chủ, chân trang và trang Liên hệ.</p></div></section>
<?php if ($error !== ''): ?><div class="flash error" role="alert"><?= admin_e($error) ?></div><?php endif; ?>
<form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    <input type="hidden" name="token" value="<?= admin_e(admin_form_token()) ?>"><input type="hidden" name="version" value="<?= (int) $settings['version'] ?>">
    <label>Tên website<input name="site_name" maxlength="80" required value="<?= admin_e($settings['site_name']) ?>"></label>
    <label>Thông điệp của CLB<textarea name="notice" rows="2"><?= admin_e($settings['notice']) ?></textarea></label>
    <label>Thông tin liên hệ bổ sung<textarea name="contact" rows="3"><?= admin_e($settings['contact']) ?></textarea></label>
    <div class="form-grid"><label>Điện thoại<input name="phone" value="<?= admin_e($settings['phone']) ?>"></label><label>Email<input type="email" name="email" value="<?= admin_e($settings['email']) ?>"></label></div>
    <label>Khu vực hoạt động<input name="location" value="<?= admin_e($settings['location']) ?>"></label>
    <div class="form-grid"><?php foreach (['facebook' => 'Facebook','instagram' => 'Instagram','tiktok' => 'TikTok','threads' => 'Threads'] as $field => $label): ?><label><?= $label ?><input type="url" name="<?= $field ?>" value="<?= admin_e($settings[$field]) ?>" placeholder="https://"></label><?php endforeach; ?></div>
    <label>Đường dẫn ảnh chính trang chủ<input name="hero_image" value="<?= admin_e($settings['hero_image']) ?>"></label>
    <label>Hoặc tải ảnh mới<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input><small>Tối đa 5 MB.</small><small data-image-error class="image-error" hidden></small><img class="upload-preview" data-image-preview data-original="<?= admin_e(admin_team_image_src($settings['hero_image'])) ?>" src="<?= admin_e(admin_team_image_src($settings['hero_image'])) ?>" alt="Ảnh chính trang chủ"></label>
    <div class="editor-actions"><button class="button primary" type="submit"><?= ui_icon('floppy-disk') ?> Lưu thông tin</button></div>
</form>
<?php admin_layout_end(); ?>

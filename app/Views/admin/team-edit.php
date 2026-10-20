
<section class="page-heading"><div><p class="eyebrow"><?= $type === 'student' ? 'Sinh viên' : 'Ban điều hành / Cố vấn' ?></p><h1><?= $title ?></h1><p>Cập nhật thông tin và ảnh đại diện cho hồ sơ.</p></div><a class="button ghost" href="team.php?type=<?= $type ?>"><?= ui_icon('arrow-left') ?> Quay lại</a></section>
<?php if ($error !== ''): ?><div class="flash error" role="alert"><?= admin_e($error) ?></div><?php endif; ?>
<form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    <input type="hidden" name="version" value="<?= (int) $member['version'] ?>"><input type="hidden" name="id" value="<?= admin_e($index !== null ? $member['id'] : '') ?>"><input type="hidden" name="type" value="<?= $type ?>"><input type="hidden" name="token" value="<?= admin_e(admin_team_token()) ?>">
    <label>Họ tên<input name="name" value="<?= admin_e($member['name'] ?? '') ?>" required placeholder="Nhập họ và tên"></label>
    <?php if ($type === 'board'): ?><label>Nhóm<select name="position"><option value="Ban điều hành" <?= ($member['position'] ?? '') === 'Ban điều hành' ? 'selected' : '' ?>>Ban điều hành</option><option value="Ban cố vấn" <?= ($member['position'] ?? '') === 'Ban cố vấn' ? 'selected' : '' ?>>Ban cố vấn</option></select></label>
    <?php else: ?><div class="form-grid"><label>Trường / đơn vị<input name="school" value="<?= admin_e($member['school'] ?? '') ?>"></label><label>Ngành học / vai trò<input name="major" value="<?= admin_e($member['major'] ?? '') ?>"></label></div><?php endif; ?>
    <label>Thông tin giới thiệu<textarea name="detail" rows="5" placeholder="Giới thiệu ngắn về hồ sơ"><?= admin_e($member['detail'] ?? '') ?></textarea></label>
    <label>Ảnh đại diện<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input><small>JPG, PNG, WebP hoặc GIF; tối đa 5 MB.</small><small class="image-error" data-image-error hidden></small><img class="upload-preview" data-image-preview data-original="<?= admin_e(!empty($member['image']) ? admin_team_image_src($member['image']) : '') ?>" src="<?= admin_e(!empty($member['image']) ? admin_team_image_src($member['image']) : '../Image/act-1.jpg') ?>" alt="Ảnh đại diện được chọn" <?= empty($member['image']) ? 'hidden' : '' ?>></label>
    <?php if (!empty($member['image'])): ?><label class="team-remove-image"><input type="checkbox" name="remove_image" value="1"> Xóa ảnh đại diện hiện tại</label><?php endif; ?>
    <div class="editor-actions"><button class="button primary" type="submit"><?= ui_icon('floppy-disk') ?> Lưu hồ sơ</button></div>
</form>
<?php admin_layout_end(); ?>

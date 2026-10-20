
<section class="page-heading"><div><p class="eyebrow"><?= $type === 'about' ? 'Giới thiệu CLB' : 'Tri ân & tài trợ' ?></p><h1><?= $existing ? 'Sửa nội dung' : 'Thêm nội dung' ?></h1></div><a class="button ghost" href="content.php?type=<?= $type ?>"><?= ui_icon('arrow-left') ?> Quay lại</a></section>
<?php if ($error !== ''): ?><div class="flash error" role="alert"><?= admin_e($error) ?></div><?php endif; ?>
<form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor>
    <input type="hidden" name="id" value="<?= admin_e($id) ?>"><input type="hidden" name="version" value="<?= (int) $row['version'] ?>"><input type="hidden" name="token" value="<?= admin_e(admin_form_token()) ?>">
    <?php if ($type === 'about'): ?>
        <div class="form-grid"><label>Mục<select name="section_key"><?php foreach ($sections as $key => $label): ?><option value="<?= $key ?>" <?= $row['section_key'] === $key ? 'selected' : '' ?>><?= $label ?></option><?php endforeach; ?></select></label><label>Giai đoạn / nhóm mục tiêu<input name="category" value="<?= admin_e($row['category']) ?>" placeholder="Dùng cho mục Mục tiêu"></label></div>
    <?php else: ?>
        <label>Tên cá nhân / đơn vị<input name="title" required maxlength="500" value="<?= admin_e($row['title']) ?>"></label>
        <div class="form-grid"><label>Thông tin đóng góp<input name="excerpt" value="<?= admin_e($row['excerpt']) ?>"></label><label>Ngày<input name="date" value="<?= admin_e($row['date'] && preg_match('/^\d{4}-\d{2}-\d{2}$/', $row['date']) ? ui_date($row['date']) : $row['date']) ?>" placeholder="dd/mm/yyyy"></label></div>
    <?php endif; ?>
    <label>Nội dung<textarea name="content" rows="8" <?= $type === 'about' ? 'required' : '' ?>><?= admin_e($row['content']) ?></textarea></label>
    <label>Thứ tự hiển thị<input type="number" min="0" max="100000" name="sort_order" value="<?= (int) $row['sort_order'] ?>"><small>Số nhỏ được xếp trước.</small></label>
    <?php if ($type === 'sponsor'): ?><label>Ảnh<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input><small>Tối đa 5 MB.</small><small data-image-error class="image-error" hidden></small><img class="upload-preview" data-image-preview data-original="<?= admin_e($row['image'] ? admin_team_image_src($row['image']) : '') ?>" src="<?= admin_e($row['image'] ? admin_team_image_src($row['image']) : '../Image/act-1.jpg') ?>" alt="Ảnh tài trợ" <?= !$row['image'] ? 'hidden' : '' ?>></label><?php endif; ?>
    <div class="editor-actions"><button class="button primary" type="submit"><?= ui_icon('floppy-disk') ?> Lưu nội dung</button></div>
</form>
<?php admin_layout_end(); ?>

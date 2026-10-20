
<section class="page-heading"><div><p class="eyebrow">Nội dung</p><h1><?= $id ? 'Sửa bài ' . admin_e(app_kind_label($post['kind'])) : ($post['kind'] ? 'Tạo bài ' . admin_e(app_kind_label($post['kind'])) : 'Tạo bài viết') ?></h1><p>Soạn nội dung, chọn ảnh và xem trước bài viết trước khi lưu.</p></div><a class="button ghost" href="posts.php"><?= ui_icon('arrow-left') ?> Quay lại</a></section>
<?php if ($error !== ''): ?><div class="flash error" role="alert"><?= admin_e($error) ?></div><?php endif; ?>
<form class="panel editor-form" method="post" enctype="multipart/form-data" data-editor data-post-editor>
    <input type="hidden" name="token" value="<?= admin_e(admin_form_token()) ?>"><input type="hidden" name="id" value="<?= admin_e($post['id']) ?>">
    <input type="hidden" name="version" value="<?= (int) $post['version'] ?>">
    <label>Loại bài<select name="kind" required <?= $existing ? 'disabled' : '' ?>><?php if (!$existing): ?><option value="" <?= $post['kind'] === '' ? 'selected' : '' ?> disabled>Chọn Hoạt động, Thông báo hoặc Blog</option><?php endif; ?><?php foreach (['activity','notification','blog'] as $option): ?><option value="<?= $option ?>" <?= $post['kind'] === $option ? 'selected' : '' ?>><?= admin_e(app_kind_label($option)) ?></option><?php endforeach; ?></select><?php if ($existing): ?><small>Loại bài đã lưu không thể đổi. Để đăng loại khác, vào Bài viết và chọn nút tạo tương ứng.</small><?php endif; ?></label>
    <div class="form-grid">
        <label>Tiêu đề<input name="title" value="<?= admin_e($post['title']) ?>" required placeholder="Nhập tiêu đề bài viết"></label>
        <label>Ngày đăng<input name="date" value="<?= admin_e($post['date'] && preg_match('/^\d{4}-\d{2}-\d{2}$/', $post['date']) ? ui_date($post['date']) : $post['date']) ?>" placeholder="dd/mm/yyyy"></label>
        <label>Tác giả<input name="author" value="<?= admin_e($post['author']) ?>"></label>
        <label>Nhãn bài viết<input name="role" value="<?= admin_e($post['role']) ?>"></label>
    </div>
    <label><span class="field-header"><span>Tóm tắt</span><small data-character-count="post-excerpt"></small></span><textarea id="post-excerpt" name="excerpt" rows="3" placeholder="Giới thiệu ngắn về bài viết"><?= admin_e($post['excerpt']) ?></textarea></label>
    <label><span class="field-header"><span>Nội dung bài viết</span><small data-character-count="post-content"></small></span><textarea id="post-content" name="content" rows="12" placeholder="Nhập nội dung bài viết..."><?= admin_e($post['content']) ?></textarea></label>
    <div class="form-grid">
        <label>Ảnh đại diện<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" data-image-input><small>JPG, PNG, WebP hoặc GIF; tối đa 5 MB.</small><small class="image-error" data-image-error hidden></small><img class="upload-preview" data-image-preview data-original="<?= admin_e($post['image'] ? admin_team_image_src($post['image']) : '') ?>" src="<?= admin_e($post['image'] ? admin_team_image_src($post['image']) : '../Image/act-1.jpg') ?>" alt="Ảnh đại diện được chọn" <?= !$post['image'] ? 'hidden' : '' ?>></label>
        <label>Trạng thái<select name="status"><option value="draft" <?= $post['status'] === 'draft' ? 'selected' : '' ?>>Bản nháp</option><option value="published" <?= $post['status'] === 'published' ? 'selected' : '' ?>>Đã đăng</option></select><small>Chọn “Đã đăng” để bài xuất hiện trên website.</small></label>
    </div>
    <div class="editor-actions"><button class="button secondary" type="button" data-post-preview><?= ui_icon('eye') ?> Xem trước</button><button class="button primary" type="submit"><?= ui_icon('floppy-disk') ?> Lưu bài viết</button></div>
</form>
<dialog class="post-preview-dialog" id="post-preview-dialog" aria-labelledby="preview-heading"><button class="icon-button dialog-close" type="button" data-close-dialog aria-label="Đóng xem trước"><?= ui_icon('x') ?></button><p class="preview-note" id="preview-heading">Xem trước nội dung. Bài viết chưa được lưu.</p><div class="article-meta" data-preview-meta></div><h2 data-preview-title></h2><p class="article-lead" data-preview-excerpt></p><img data-preview-image alt="Ảnh đại diện bài viết" hidden><div class="preview-content" data-preview-content></div></dialog>
<?php admin_layout_end(); ?>

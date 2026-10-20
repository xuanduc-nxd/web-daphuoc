<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Hoạt động'); ui_page_heading('Hoạt động của CLB', 'Những cuộc gặp gỡ, những hành trình sẻ chia và những dấu ấn cùng nhau.', 'users-three'); ?>
    <?php if ($activities): ?>
    <section data-collection data-page-size="6" aria-label="Danh sách hoạt động">
        <?php ui_toolbar($activities, 'Tìm hoạt động, chương trình...'); ?>
        <div class="news-grid"><?php foreach ($activities as $post) ui_card($post, 'detail.php?type=activities&id=' . rawurlencode((string) ($post['id'] ?? ''))); ?></div>
        <?php ui_collection_end(); ?>
    </section>
    <?php else: ui_empty('Chưa có hoạt động được đăng', 'Các hoạt động mới sẽ được cập nhật tại đây.'); endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Thông báo'); ui_page_heading('Thông báo', 'Cập nhật thông tin, chương trình và những điều cần biết từ CLB.', 'megaphone'); ?>
    <?php if ($activities): ?>
    <section data-collection data-page-size="6" aria-label="Danh sách thông báo">
        <?php ui_toolbar($activities, 'Tìm thông báo...'); ?>
        <div class="notification-layout">
            <div><?php foreach ($activities as $post) ui_card($post, 'detail.php?id=' . rawurlencode((string) ($post['id'] ?? '')), 'Thông báo', 'notification-row'); ?></div>
            <aside class="sidebar"><h2>Bài đăng mới</h2><?php foreach (array_slice($activities, 0, 4) as $post): ?><a class="sidebar-link" href="detail.php?id=<?= rawurlencode((string) ($post['id'] ?? '')) ?>"><strong><?= ui_e($post['title'] ?? '') ?></strong><small><?= ui_e(ui_date($post['date'] ?? '')) ?></small></a><?php endforeach; ?></aside>
        </div>
        <?php ui_collection_end(); ?>
    </section>
    <?php else: ui_empty('Chưa có thông báo mới', 'Bạn có thể theo dõi hoạt động của CLB hoặc liên hệ để biết thêm thông tin.', 'megaphone'); endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

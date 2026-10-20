<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Blog'); ui_page_heading('Những câu chuyện đồng hành', 'Nơi những tâm hồn đồng điệu gửi gắm tâm tình.', 'notebook'); ?>
    <?php if ($siteSettings['email'] !== ''): ?><a class="button secondary" href="mailto:<?= ui_e($siteSettings['email']) ?>?subject=<?= rawurlencode('Gửi tâm tình đến CLB Golf Đa Phước') ?>">Gửi tâm tình của bạn <?= ui_icon('envelope') ?></a><?php endif; ?>
    <?php if ($blog_posts): ?>
    <section class="section" data-collection data-page-size="6" aria-label="Danh sách bài Blog">
        <?php ui_toolbar($blog_posts, 'Tìm câu chuyện, tác giả...', $roles); ?>
        <div class="news-grid"><?php foreach ($blog_posts as $post) ui_card($post, 'detail_blog.php?id=' . rawurlencode((string) ($post['id'] ?? '')), (string) ($post['role'] ?? 'Blog')); ?></div>
        <?php ui_collection_end(); ?>
    </section>
    <?php else: ?><div class="section"><?php ui_empty('Câu chuyện mới đang chờ được chia sẻ', 'Chưa có bài viết được xuất bản. Bạn có thể gửi tâm tình qua email cho CLB.', 'notebook'); ?></div><?php endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Tri ân mạnh thường quân', 'Tài trợ', 'Sponsorship.php'); ui_page_heading('Tri ân những tấm lòng', 'Chân thành cảm ơn những mạnh thường quân đã đồng hành và chắp cánh ước mơ cho các em.', 'hand-heart'); ?>
    <?php if ($sponsors_all): ?>
    <section data-collection data-result-label="mạnh thường quân" data-page-size="8" aria-label="Danh sách mạnh thường quân">
        <?php ui_toolbar($sponsors_all, 'Tìm tên mạnh thường quân...'); ?>
        <div class="honor-grid"><?php foreach ($sponsors_all as $sponsor): ?><article class="honor-card" data-filter-item data-search="<?= ui_e(($sponsor['title'] ?? '') . ' ' . ($sponsor['excerpt'] ?? '')) ?>" data-date="<?= ui_timestamp($sponsor['date'] ?? '') ?>" data-year="<?= ui_e(ui_year($sponsor['date'] ?? '')) ?>"><span class="heading-symbol"><?= ui_icon('hand-heart') ?></span><div><h2><?= ui_e($sponsor['title'] ?? '') ?></h2><p>Đã đóng góp</p><strong><?= ui_e($sponsor['excerpt'] ?? '') ?></strong><?php if (!empty($sponsor['content'])): ?><p><?= ui_e(strip_tags($sponsor['content'])) ?></p><?php endif; ?></div></article><?php endforeach; ?></div>
        <?php ui_collection_end(); ?>
    </section>
    <?php else: ui_empty('Danh sách đang được cập nhật', 'Cảm ơn những tấm lòng đã đồng hành cùng CLB.', 'hand-heart'); endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

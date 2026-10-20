<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Tìm kiếm'); ui_page_heading('Bạn đang tìm điều gì?', 'Tìm hoạt động, thông báo và câu chuyện đã được đăng trên website.', 'magnifying-glass'); ?>
    <?php if ($results): ?><section data-collection data-page-size="6" aria-label="Kết quả tìm kiếm"><?php ui_toolbar(array_column($results, 'post'), 'Nhập từ khóa...', ['Hoạt động', 'Thông báo', 'Blog']); ?><div class="news-grid"><?php foreach ($results as $result) ui_card($result['post'], $result['href'], $result['category']); ?></div><?php ui_collection_end(); ?></section><?php else: ui_empty('Chưa có bài viết để tìm kiếm', 'Nội dung mới sẽ được Ban chủ nhiệm cập nhật tại đây.', 'magnifying-glass'); endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

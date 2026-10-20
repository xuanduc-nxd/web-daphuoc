<?php
if (!$article) {
    http_response_code(404);
    $pageTitle = 'Bài viết không tồn tại · CLB Golf Đa Phước';
    include __DIR__ . '/../partials/header.php';
    ?>
    <main id="main-content" class="container not-found"><div class="empty-state"><span class="empty-symbol"><?= ui_icon('newspaper') ?></span><h1>Bài viết không tồn tại</h1><p>Bài viết có thể đã được ẩn hoặc liên kết chưa chính xác. Bạn có thể quay lại danh sách để tìm nội dung khác.</p><a class="button primary" href="<?= ui_e($backHref) ?>">Về <?= ui_e($backLabel) ?> <?= ui_icon('arrow-right') ?></a></div></main>
    <?php include __DIR__ . '/../partials/footer.php'; return;
}
$pageTitle = (string) ($article['title'] ?? 'Bài viết') . ' · CLB Golf Đa Phước';
$pageDescription = mb_substr(strip_tags((string) ($article['excerpt'] ?? '')), 0, 180, 'UTF-8');
include __DIR__ . '/../partials/header.php';
?>
<main id="main-content" class="container article-main">
    <?php ui_breadcrumb('Bài viết', $backLabel, $backHref); ?>
    <div class="article-layout">
        <article>
            <header class="article-header">
                <div class="article-meta"><span class="category-label"><?= ui_e($category) ?></span><span><?= ui_e(ui_date($article['date'] ?? '')) ?></span><?php if (!empty($article['author'])): ?><span><?= ui_e($article['author']) ?></span><?php endif; ?></div>
                <h1><?= ui_e($article['title'] ?? '') ?></h1>
                <?php if (!empty($article['excerpt'])): ?><p class="article-lead"><?= ui_e(strip_tags($article['excerpt'])) ?></p><?php endif; ?>
            </header>
            <?php if (!empty($article['image'])): ?><button class="article-cover" type="button" data-lightbox="<?= ui_e(ui_image($article['image'])) ?>" aria-label="Xem ảnh bìa bài viết"><img src="<?= ui_e(ui_image($article['image'])) ?>" srcset="<?= ui_e(ui_image_srcset($article['image'])) ?>" sizes="(max-width:767px) calc(100vw - 36px), 820px" data-fallback="Image/act-1.jpg" alt="<?= ui_e($article['title'] ?? 'Ảnh hoạt động') ?>" width="1000" height="625" fetchpriority="high"></button><?php endif; ?>
            <div class="article-content"><?= !empty($plainContent) ? nl2br(ui_e($article['content'] ?? '')) : ui_rich_text((string) ($article['content'] ?? '')) ?></div>
            <div class="article-actions"><a class="text-link" href="<?= ui_e($backHref) ?>"><?= ui_icon('arrow-left') ?> Quay lại <?= ui_e($backLabel) ?></a><div class="share-actions"><button class="button secondary" type="button" data-share><?= ui_icon('share-network') ?> Chia sẻ</button><button class="icon-button" type="button" data-copy-link aria-label="Sao chép liên kết"><?= ui_icon('link') ?></button></div></div>
        </article>
        <?php if ($recent_posts): ?><aside class="sidebar"><h2>Bài đăng mới</h2><?php foreach ($recent_posts as $post): ?><a class="sidebar-link" href="<?= ui_e($detailBase . rawurlencode((string) ($post['id'] ?? ''))) ?>"><strong><?= ui_e($post['title'] ?? '') ?></strong><small><?= ui_e(ui_date($post['date'] ?? '')) ?></small></a><?php endforeach; ?></aside><?php endif; ?>
    </div>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

<?php
declare(strict_types=1);
function ui_e($value = ''): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function ui_icon(string $name): string
{
    return '<i class="ph ph-' . ui_e($name) . '" aria-hidden="true"></i>';
}

function app_kind_label(string $kind): string
{
    return ['activity' => 'Hoạt động', 'notification' => 'Thông báo', 'blog' => 'Blog'][$kind] ?? 'Bài viết';
}

function ui_timestamp($value): int
{
    $value = trim((string) $value);
    if ($value === '') return 0;
    if (preg_match('~^(\d{1,2})/(\d{1,2})/(\d{4})$~', $value, $parts)) {
        if (!checkdate((int) $parts[2], (int) $parts[1], (int) $parts[3])) return 0;
        return mktime(12, 0, 0, (int) $parts[2], (int) $parts[1], (int) $parts[3]);
    }
    $value = preg_replace('~\s*\([^)]*\)\s*$~u', '', $value) ?? $value;
    return strtotime($value) ?: 0;
}

function ui_date($value): string
{
    $timestamp = ui_timestamp($value);
    return $timestamp ? (new DateTimeImmutable('@' . $timestamp))->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'))->format('d/m/Y') : 'Chưa cập nhật ngày';
}

function ui_year($value): string
{
    $timestamp = ui_timestamp($value);
    return $timestamp ? (new DateTimeImmutable('@' . $timestamp))->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'))->format('Y') : '';
}

function ui_image($value, string $fallback = 'Image/act-1.jpg'): string
{
    $value = trim((string) $value);
    if (preg_match('~^https?://~i', $value) && filter_var($value, FILTER_VALIDATE_URL)) return $value;
    if ($value !== '' && preg_match('~^[a-zA-Z0-9_][a-zA-Z0-9_./?=&%+-]*$~', $value) && !str_contains($value, '..')) return $value;
    return $fallback;
}

function ui_image_srcset($value): string
{
    $url = ui_image($value);
    if ($url === 'Image/act-1.jpg') {
        return 'assets/images/activity-480.webp 480w, assets/images/activity-800.webp 800w, assets/images/activity-1200.webp 1200w';
    }
    if (!preg_match('~^https://res\.cloudinary\.com/[^/]+/image/upload/v\d+/~', $url)) return '';
    $variants = [];
    foreach ([480, 800, 1200] as $width) {
        $variant = str_replace('/image/upload/', '/image/upload/c_limit,w_' . $width . '/q_auto/f_auto/', $url);
        $variants[] = $variant . ' ' . $width . 'w';
    }
    return implode(', ', $variants);
}

function ui_breadcrumb(string $label, string $parent = '', string $href = ''): void
{
    ?>
    <nav class="breadcrumbs" aria-label="Đường dẫn trang">
        <a href="index.php">Trang chủ</a><span aria-hidden="true">/</span>
        <?php if ($parent !== ''): ?><a href="<?= ui_e($href) ?>"><?= ui_e($parent) ?></a><span aria-hidden="true">/</span><?php endif; ?>
        <span aria-current="page"><?= ui_e($label) ?></span>
    </nav>
    <?php
}

function ui_page_heading(string $title, string $description, string $icon = ''): void
{
    ?>
    <div class="page-heading-public">
        <?php if ($icon !== ''): ?><span class="heading-symbol"><?= ui_icon($icon) ?></span><?php endif; ?>
        <h1><?= ui_e($title) ?></h1><p><?= ui_e($description) ?></p>
    </div>
    <?php
}

function ui_empty(string $title, string $description, string $icon = 'newspaper'): void
{
    ?>
    <div class="empty-state"><span class="empty-symbol"><?= ui_icon($icon) ?></span><h2><?= ui_e($title) ?></h2><p><?= ui_e($description) ?></p></div>
    <?php
}

function ui_card(array $post, string $href, string $category = 'Hoạt động', string $class = ''): void
{
    $title = (string) ($post['title'] ?? 'Bài viết');
    $plain = strip_tags((string) ($post['excerpt'] ?? ''));
    $date = ui_timestamp($post['date'] ?? '');
    $sizes = str_contains($class, 'news-featured') ? '(max-width:767px) calc(100vw - 36px), 680px' : (str_contains($class, 'news-compact') ? '(max-width:767px) 100px, 145px' : '(max-width:767px) calc(100vw - 36px), 400px');
    ?>
    <article class="news-card <?= ui_e($class) ?>" data-filter-item data-search="<?= ui_e($title . ' ' . $plain . ' ' . ($post['author'] ?? '')) ?>" data-category="<?= ui_e($category) ?>" data-date="<?= $date ?>" data-year="<?= ui_e(ui_year($post['date'] ?? '')) ?>">
        <a class="news-image" href="<?= ui_e($href) ?>"><img src="<?= ui_e(ui_image($post['image'] ?? '')) ?>" srcset="<?= ui_e(ui_image_srcset($post['image'] ?? '')) ?>" sizes="<?= ui_e($sizes) ?>" data-fallback="assets/images/activity-800.webp" alt="<?= ui_e($title) ?>" width="800" height="500" loading="lazy" decoding="async"></a>
        <div class="news-body">
            <div class="article-meta"><span class="category-label"><?= ui_e($category) ?></span><span><?= ui_e(ui_date($post['date'] ?? '')) ?></span></div>
            <h2><a href="<?= ui_e($href) ?>"><?= ui_e($title) ?></a></h2><p><?= ui_e($plain) ?></p>
            <a class="text-link" href="<?= ui_e($href) ?>">Đọc bài viết <?= ui_icon('arrow-up-right') ?></a>
        </div>
    </article>
    <?php
}

function ui_toolbar(array $rows, string $placeholder = 'Tìm bài viết...', array $categories = []): void
{
    $years = [];
    foreach ($rows as $row) {
        $date = ui_timestamp($row['date'] ?? '');
        if ($date) $years[ui_year($row['date'] ?? '')] = true;
    }
    krsort($years);
    ?>
    <div class="collection-toolbar">
        <label class="search-field"><span class="sr-only">Tìm kiếm trong danh sách</span><?= ui_icon('magnifying-glass') ?><input type="search" data-search-input placeholder="<?= ui_e($placeholder) ?>" autocomplete="off"></label>
        <?php if ($categories): ?><label class="select-field"><span class="sr-only">Chủ đề</span><select data-category-filter><option value="">Tất cả chủ đề</option><?php foreach ($categories as $category): ?><option><?= ui_e($category) ?></option><?php endforeach; ?></select></label><?php endif; ?>
        <?php if ($years): ?><label class="select-field"><span class="sr-only">Năm đăng bài</span><select data-year-filter><option value="">Tất cả năm</option><?php foreach (array_keys($years) as $year): ?><option><?= ui_e($year) ?></option><?php endforeach; ?></select></label><?php endif; ?>
        <label class="select-field"><span class="sr-only">Sắp xếp bài viết</span><select data-sort-input><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="az">Tiêu đề A-Z</option></select></label>
    </div>
    <div class="collection-summary"><span data-result-count aria-live="polite"><?= count($rows) ?> bài viết</span><button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc <?= ui_icon('x') ?></button></div>
    <?php
}

function ui_collection_end(): void
{
    ?>
    <div class="empty-state" data-filter-empty hidden><span class="empty-symbol"><?= ui_icon('magnifying-glass') ?></span><h2>Chưa tìm thấy kết quả</h2><p>Thử từ khóa khác hoặc xóa bộ lọc để xem tất cả nội dung.</p><button class="button secondary" type="button" data-reset-filters>Xóa bộ lọc</button></div>
    <nav class="pagination" data-pagination aria-label="Phân trang" hidden></nav>
    <?php
}

function ui_rich_text(string $html): string
{
    if (trim($html) === '') return '';
    if ($html === strip_tags($html)) return nl2br(ui_e($html));
    $document = new DOMDocument();
    $previous = libxml_use_internal_errors(true);
    $document->loadHTML('<?xml encoding="UTF-8"><div>' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    $render = function ($node) use (&$render): string {
        if ($node instanceof DOMText) return ui_e($node->textContent);
        if (!($node instanceof DOMElement)) return '';
        $tag = strtolower($node->tagName);
        if (in_array($tag, ['script', 'style', 'iframe', 'object', 'form'], true)) return '';
        $children = '';
        foreach ($node->childNodes as $child) $children .= $render($child);
        if ($tag === 'br') return '<br>';
        if ($tag === 'a') {
            $href = $node->getAttribute('href');
            if (preg_match('~^https?://~i', $href) && filter_var($href, FILTER_VALIDATE_URL)) return '<a href="' . ui_e($href) . '" rel="noopener noreferrer">' . $children . '</a>';
            return $children;
        }
        if (!in_array($tag, ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'blockquote'], true)) return $children;
        return '<' . $tag . '>' . $children . '</' . $tag . '>';
    };
    $output = '';
    foreach ($document->childNodes as $node) $output .= $render($node);
    return $output;
}

<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Giới thiệu'); ui_page_heading('Về CLB Golf Đa Phước', 'Thắp sáng ước mơ, kiến tạo tương lai.'); ?>
    <section class="about-intro">
        <div><h2>Tôn chỉ và mục đích</h2><ul class="about-content-list"><?php foreach ($sections['principle'] ?? [] as $item): ?><li><?= ui_icon('check-circle') ?><div><?= ui_rich_text((string) ($item['content'] ?? '')) ?></div></li><?php endforeach; ?></ul><div class="about-actions"><a class="button primary" href="ExecutiveBoard.php">Ban điều hành Quỹ <?= ui_icon('arrow-up-right') ?></a><a class="button secondary" href="Students.php">Sinh viên</a></div></div>
        <img src="Image/act-1.jpg" srcset="<?= ui_e(ui_image_srcset('Image/act-1.jpg')) ?>" sizes="(max-width:767px) calc(100vw - 36px), 600px" width="800" height="600" alt="Hoạt động trao học bổng của CLB Golf Đa Phước" fetchpriority="high">
    </section>
    <section class="about-block"><h2>Phạm vi và đối tượng</h2><ul class="about-content-list"><?php foreach ($sections['scope'] ?? [] as $item): ?><li><?= ui_icon('arrow-right') ?><div><?= ui_rich_text((string) ($item['content'] ?? '')) ?></div></li><?php endforeach; ?></ul></section>
    <section class="section"><div class="section-heading"><h2>Mục tiêu</h2></div><div class="values-grid"><?php foreach ($targets as $period => $contents): ?><article class="value-item"><h3><?= ui_e($period) ?></h3><ul><?php foreach ($contents as $content): ?><li><?= ui_rich_text((string) $content) ?></li><?php endforeach; ?></ul></article><?php endforeach; ?></div></section>
    <section class="about-block"><h2>Phương thức hoạt động</h2><ul class="about-content-list"><?php foreach ($sections['method'] ?? [] as $item): ?><li><?= ui_icon('check-circle') ?><div><?= ui_rich_text((string) ($item['content'] ?? '')) ?></div></li><?php endforeach; ?></ul><a class="text-link" href="Sponsorship.php">Đồng hành cùng chúng tôi <?= ui_icon('arrow-up-right') ?></a></section>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

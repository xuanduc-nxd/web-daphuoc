<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content">
    <section class="home-hero">
        <div class="container hero-layout">
            <div class="hero-copy">
                <div class="hero-eyebrow">Kết nối đam mê · Lan tỏa sẻ chia</div>
                <h1>CLB Golf <span>Đa Phước</span></h1>
                <p class="hero-lead">Và những người bạn,<br>cùng tiếp sức những ước mơ.</p>
                <p class="hero-description">Từ niềm đam mê golf đến những hoạt động sẻ chia, đồng hành cùng học sinh, sinh viên Đà Nẵng.</p>
                <div class="hero-actions">
                    <a class="button primary" href="Activities.php">Khám phá hoạt động <?= ui_icon('arrow-up-right') ?></a>
                    <a class="button secondary" href="About.php">Về CLB</a>
                </div>
            </div>
            <div class="hero-visual">
                <figure class="hero-photo">
                    <button type="button" class="hero-photo-open" data-lightbox="<?= ui_e($heroImage) ?>" aria-label="Xem ảnh hoạt động của CLB">
                        <img src="<?= ui_e($heroImage) ?>" srcset="<?= ui_e(ui_image_srcset($heroImage)) ?>" sizes="(max-width:767px) calc(100vw - 36px), (max-width:1320px) 53vw, 657px" data-fallback="assets/images/activity-800.webp" alt="Hoạt động của CLB Golf Đa Phước và những người bạn" width="1100" height="800" fetchpriority="high">
                    </button>
                </figure>
                <figure class="hero-detail-photo">
                    <img src="<?= ui_e($detailPhoto) ?>" srcset="<?= ui_e(ui_image_srcset($detailPhoto)) ?>" sizes="(max-width:767px) 132px, 210px" data-fallback="assets/images/activity-480.webp" alt="<?= ui_e($activities_home[0]['title'] ?? 'Khoảnh khắc trao học bổng') ?>" width="300" height="240" loading="lazy">
                    <figcaption>Những khoảnh khắc sẻ chia</figcaption>
                </figure>
                <div class="hero-photo-note"><?= ui_icon('hand-heart') ?><span>Những tấm lòng<br><strong>Cùng một hành trình</strong></span></div>
                <span class="hero-location"><?= ui_icon('map-pin') ?> Đà Nẵng, Việt Nam</span>
            </div>
        </div>
    </section>
    <div class="container home-intro">
        <div class="intro-symbol"><?= ui_icon('hand-heart') ?></div>
        <p><strong>Đam mê kết nối. Tấm lòng sẻ chia.</strong><span>Cùng mở thêm cơ hội học tập và phát triển cho thế hệ trẻ.</span></p>
        <a class="text-link" href="Notifications.php">Thông báo mới <?= ui_icon('arrow-up-right') ?></a>
    </div>
    <section class="container section home-activities">
        <div class="section-heading">
            <div><p class="section-eyebrow">Dấu ấn &amp; câu chuyện</p><h2>Nhịp sống CLB</h2></div>
            <a class="text-link" href="Activities.php">Tất cả hoạt động <?= ui_icon('arrow-up-right') ?></a>
        </div>
        <?php if ($activities_home): ?>
        <div class="home-news">
            <?php $featured = array_shift($activities_home); ui_card($featured, 'detail.php?type=activities&id=' . rawurlencode((string) ($featured['id'] ?? '')), 'Hoạt động', 'news-featured'); ?>
            <div class="home-news-side">
                <h3 class="recent-heading">Hoạt động gần đây</h3>
                <?php foreach ($activities_home as $post) ui_card($post, 'detail.php?type=activities&id=' . rawurlencode((string) ($post['id'] ?? '')), 'Hoạt động', 'news-compact'); ?>
            </div>
        </div>
        <?php else: ui_empty('Hoạt động đang được cập nhật', 'Bạn có thể xem các thông báo hoặc tìm hiểu thêm về CLB.'); endif; ?>
    </section>
    <section class="community-section section">
        <div class="container community-layout">
            <div class="community-visual">
                <button class="community-photo" type="button" data-lightbox="Image/act-1.jpg" aria-label="Xem ảnh trao học bổng">
                    <img src="Image/act-1.jpg" srcset="<?= ui_e(ui_image_srcset('Image/act-1.jpg')) ?>" sizes="(max-width:767px) calc(100vw - 36px), 620px" width="900" height="675" alt="CLB Golf Đa Phước trao học bổng cho sinh viên Đại học Đà Nẵng" loading="lazy">
                    <span class="photo-expand"><?= ui_icon('arrows-out') ?></span>
                </button>
                <p class="community-caption">Khoảnh khắc trao học bổng · Đại học Đà Nẵng</p>
            </div>
            <div class="community-copy">
                <p class="section-eyebrow">Hành trình đồng hành</p>
                <h2>Cùng mở thêm cơ hội<br>cho thế hệ trẻ.</h2>
                <p>Những hoạt động sẻ chia mở thêm cơ hội học tập, rèn luyện và phát triển cho học sinh, sinh viên.</p>
                <ul class="purpose-list">
                    <li><?= ui_icon('graduation-cap') ?><span>Hỗ trợ học bổng</span></li>
                    <li><?= ui_icon('users-three') ?><span>Kết nối, giao lưu và cùng phát triển</span></li>
                    <li><?= ui_icon('hand-heart') ?><span>Hỗ trợ học tập và sinh hoạt</span></li>
                </ul>
                <a class="text-link" href="Students.php">Gặp gỡ các bạn sinh viên <?= ui_icon('arrow-up-right') ?></a>
            </div>
        </div>
    </section>
    <section class="container section home-sponsors">
        <div class="sponsor-intro">
            <p class="section-eyebrow">Cảm ơn sự đồng hành</p>
            <h2>Những tấm lòng<br>cùng tiếp sức.</h2>
            <p>Mỗi sự sẻ chia đều góp phần viết tiếp hành trình học tập của các em.</p>
            <a class="text-link" href="HonorList.php">Danh sách tri ân <?= ui_icon('arrow-up-right') ?></a>
        </div>
        <?php if ($sponsors_home): ?>
            <div class="sponsor-list">
                <?php foreach ($sponsors_home as $sponsor): ?>
                <article class="sponsor-row">
                    <span class="sponsor-symbol"><?= ui_icon('hand-heart') ?></span>
                    <div><h3><?= ui_e($sponsor['title'] ?? '') ?></h3><p><?= ui_e($sponsor['excerpt'] ?? '') ?></p></div>
                </article>
                <?php endforeach; ?>
            </div>
        <?php else: ui_empty('Danh sách đang được cập nhật', 'Cảm ơn những tấm lòng đã đồng hành cùng CLB.', 'hand-heart'); endif; ?>
    </section>
    <section class="container contact-banner">
        <div class="contact-banner-copy"><span class="contact-banner-symbol"><?= ui_icon('hand-heart') ?></span><div><h2>Chung tay tiếp sức ước mơ</h2><p>Cùng CLB mang thêm cơ hội đến với các em.</p></div></div>
        <div class="contact-banner-actions"><a class="button primary" href="Sponsorship.php">Đồng hành &amp; tài trợ <?= ui_icon('arrow-up-right') ?></a><a class="text-link" href="contact.php">Liên hệ CLB <?= ui_icon('arrow-up-right') ?></a></div>
    </section>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

<?php $siteSettings = site_settings(); ?>
    <footer class="site-footer">
        <div class="container footer-main">
            <div class="footer-brand">
                <a class="brand" href="index.php"><img src="assets/images/logo.webp" width="56" height="56" alt="Logo Đa Phước"><span><strong><?= ui_e($siteSettings['site_name']) ?></strong><small>Và những người bạn</small></span></a>
                <p><?= ui_e($siteSettings['notice']) ?></p>
                <?php if ($siteSettings['contact'] !== ''): ?><p><?= nl2br(ui_e($siteSettings['contact'])) ?></p><?php endif; ?>
                <div class="social-links">
                    <?php if ($siteSettings['facebook'] !== ''): ?><a href="<?= ui_e($siteSettings['facebook']) ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><?= ui_icon('facebook-logo') ?></a><?php endif; ?>
                    <?php if ($siteSettings['instagram'] !== ''): ?><a href="<?= ui_e($siteSettings['instagram']) ?>" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><?= ui_icon('instagram-logo') ?></a><?php endif; ?>
                    <?php if ($siteSettings['tiktok'] !== ''): ?><a href="<?= ui_e($siteSettings['tiktok']) ?>" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><?= ui_icon('tiktok-logo') ?></a><?php endif; ?>
                    <?php if ($siteSettings['threads'] !== ''): ?><a href="<?= ui_e($siteSettings['threads']) ?>" target="_blank" rel="noopener noreferrer" aria-label="Threads"><?= ui_icon('threads-logo') ?></a><?php endif; ?>
                </div>
            </div>
            <div class="footer-navigation"><h2>Khám phá CLB</h2><a href="About.php">Giới thiệu</a><a href="Activities.php">Hoạt động</a><a href="Notifications.php">Thông báo</a><a href="Blog.php">Blog</a><a href="Sponsorship.php">Tài trợ</a></div>
            <div class="footer-contact"><h2>Liên hệ</h2><?php if ($siteSettings['location'] !== ''): ?><p><?= ui_icon('map-pin') ?> <?= ui_e($siteSettings['location']) ?></p><?php endif; ?><?php if ($siteSettings['phone'] !== ''): ?><a href="tel:<?= ui_e(preg_replace('/[^0-9+]/', '', $siteSettings['phone'])) ?>"><?= ui_icon('phone') ?> <?= ui_e($siteSettings['phone']) ?></a><?php endif; ?><?php if ($siteSettings['email'] !== ''): ?><a href="mailto:<?= ui_e($siteSettings['email']) ?>"><?= ui_icon('envelope') ?> <?= ui_e($siteSettings['email']) ?></a><?php endif; ?><a class="text-link" href="contact.php">Thông tin liên hệ <?= ui_icon('arrow-up-right') ?></a></div>
        </div>
        <div class="container footer-bottom"><span>© <?= date('Y') ?> CLB Golf Đa Phước và những người bạn</span><span>Ươm mầm tài năng</span></div>
    </footer>
    <dialog class="image-dialog" id="image-dialog" aria-labelledby="image-dialog-caption"><button class="icon-button dialog-close" type="button" data-close-dialog aria-label="Đóng ảnh"><?= ui_icon('x') ?></button><img id="image-dialog-image" src="" alt=""><p id="image-dialog-caption"></p></dialog>
    <div class="toast" id="ui-toast" role="status" aria-live="polite" hidden></div>
</body>
</html>

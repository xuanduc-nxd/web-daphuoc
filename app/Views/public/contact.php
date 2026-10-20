<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Liên hệ'); ui_page_heading('Cùng kết nối với CLB', 'Liên hệ để tìm hiểu hoạt động, chia sẻ câu chuyện hoặc đồng hành cùng các chương trình.'); ?>
    <div class="contact-layout">
        <div class="contact-list">
            <?php if ($siteSettings['phone'] !== ''): ?><section class="contact-item"><?= ui_icon('phone') ?><div><h2>Điện thoại</h2><a href="tel:<?= ui_e(preg_replace('/[^0-9+]/', '', $siteSettings['phone'])) ?>"><?= ui_e($siteSettings['phone']) ?></a></div></section><?php endif; ?>
            <?php if ($siteSettings['email'] !== ''): ?><section class="contact-item"><?= ui_icon('envelope') ?><div><h2>Email</h2><a href="mailto:<?= ui_e($siteSettings['email']) ?>"><?= ui_e($siteSettings['email']) ?></a></div></section><?php endif; ?>
            <section class="contact-item"><?= ui_icon('map-pin') ?><div><h2>Khu vực hoạt động</h2><p><?= ui_e($siteSettings['location']) ?></p></div></section>
            <?php if ($siteSettings['facebook'] !== ''): ?><section class="contact-item"><?= ui_icon('facebook-logo') ?><div><h2>Facebook</h2><a href="<?= ui_e($siteSettings['facebook']) ?>" target="_blank" rel="noopener noreferrer">Mở trang Facebook <?= ui_icon('arrow-up-right') ?></a></div></section><?php endif; ?>
        </div>
        <div class="contact-photo"><img src="Image/act-1.jpg" srcset="<?= ui_e(ui_image_srcset('Image/act-1.jpg')) ?>" sizes="(max-width:767px) calc(100vw - 36px), 600px" width="900" height="675" alt="Hoạt động trao học bổng của CLB Golf Đa Phước"><p>CLB Golf Đa Phước và những người bạn, đồng hành cùng thế hệ trẻ Đà Nẵng.</p></div>
    </div>
    <section class="contact-faq"><h2>Bạn muốn tìm hiểu thêm?</h2>
        <details><summary>Tôi xem thông tin học bổng ở đâu?</summary><p>Các thông tin về chương trình học bổng được đăng trong mục <a class="text-link" href="Notifications.php">Thông báo</a>. Hãy xem hướng dẫn và thời hạn trong từng bài.</p></details>
        <?php if ($siteSettings['email'] !== ''): ?><details><summary>Tôi muốn gửi một câu chuyện cho Blog.</summary><p>Bạn có thể gửi nội dung và hình ảnh qua email cho CLB. Ban chủ nhiệm sẽ trao đổi về nội dung trước khi đăng.</p></details><?php endif; ?>
        <details><summary>Tôi muốn đồng hành hoặc tài trợ.</summary><p>Xem các hình thức tại trang <a class="text-link" href="Sponsorship.php">Tài trợ</a> và liên hệ trực tiếp để trao đổi thông tin.</p></details>
    </section>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

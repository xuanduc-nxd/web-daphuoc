<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Sinh viên', 'Giới thiệu', 'About.php'); ui_page_heading('Sinh viên', 'Những gương mặt và câu chuyện trên hành trình cùng CLB.', 'graduation-cap'); ?>
    <?php if ($students): ?><div class="team-grid"><?php foreach ($students as $student) team_render_card($student); ?></div><?php else: ui_empty('Thông tin sinh viên đang được cập nhật', 'Theo dõi các hoạt động và chương trình học bổng của CLB trong thời gian tới.', 'graduation-cap'); ?><div class="about-actions"><a class="button primary" href="Activities.php">Hoạt động <?= ui_icon('arrow-up-right') ?></a><a class="button secondary" href="Notifications.php">Thông báo</a></div><?php endif; ?>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

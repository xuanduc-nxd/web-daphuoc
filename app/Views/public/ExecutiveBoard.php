<?php include __DIR__ . '/../partials/header.php'; ?>
<main id="main-content" class="container listing-main">
    <?php ui_breadcrumb('Ban điều hành Quỹ', 'Giới thiệu', 'About.php'); ui_page_heading('Những người cùng đồng hành', 'Ban điều hành và Ban cố vấn của CLB Golf Đa Phước và những người bạn.', 'users-three'); ?>
    <section class="team-group"><h2>Ban điều hành</h2><?php if ($board): ?><div class="team-grid"><?php foreach ($board as $member) team_render_card($member); ?></div><?php else: ui_empty('Danh sách đang được cập nhật', 'Thông tin Ban điều hành sẽ được bổ sung tại đây.', 'users-three'); endif; ?></section>
    <section class="team-group"><h2>Ban cố vấn</h2><?php if ($advisors): ?><div class="team-grid"><?php foreach ($advisors as $member) team_render_card($member); ?></div><?php else: ui_empty('Danh sách đang được cập nhật', 'Thông tin Ban cố vấn sẽ được bổ sung tại đây.', 'users-three'); endif; ?></section>
</main>
<?php include __DIR__ . '/../partials/footer.php'; ?>

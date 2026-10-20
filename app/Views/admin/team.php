
<section class="page-heading"><div><p class="eyebrow">Giới thiệu</p><h1><?= admin_e($title) ?></h1><p>Quản lý hồ sơ và ảnh đại diện hiển thị trên website.</p></div><a class="button primary" href="team-edit.php?type=<?= $type ?>"><?= ui_icon('plus') ?> Thêm <?= $type === 'student' ? 'sinh viên' : 'thành viên' ?></a></section>
<div class="team-tabs"><a class="<?= $type === 'board' ? 'active' : '' ?>" href="team.php?type=board">Ban điều hành / Cố vấn</a><a class="<?= $type === 'student' ? 'active' : '' ?>" href="team.php?type=student">Sinh viên</a></div>
<section data-collection data-result-label="hồ sơ" data-page-size="10" aria-label="Quản lý hồ sơ">
    <div class="collection-toolbar"><label class="search-field"><span class="sr-only">Tìm hồ sơ</span><?= ui_icon('magnifying-glass') ?><input type="search" data-search-input placeholder="Tìm họ tên, <?= $type === 'student' ? 'trường, ngành' : 'chức danh' ?>..." autocomplete="off"></label><?php if ($type === 'board'): ?><label class="select-field"><span class="sr-only">Nhóm</span><select data-category-filter><option value="">Tất cả nhóm</option><option>Ban điều hành</option><option>Ban cố vấn</option></select></label><?php endif; ?></div>
    <div class="collection-summary"><span data-result-count aria-live="polite"><?= count($members) ?> hồ sơ</span><button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc <?= ui_icon('x') ?></button></div>
    <div class="panel table-wrap"><table><thead><tr><th>Ảnh</th><th>Họ tên</th><th><?= $type === 'student' ? 'Trường / Ngành' : 'Nhóm' ?></th><th>Thao tác</th></tr></thead><tbody>
        <?php if (!$members): ?><tr><td colspan="4" class="empty table-empty"><?= ui_icon('users-three') ?><p>Chưa có hồ sơ nào.</p><a class="text-link" href="team-edit.php?type=<?= $type ?>">Thêm hồ sơ <?= ui_icon('arrow-up-right') ?></a></td></tr><?php endif; ?>
        <?php foreach ($members as $member): ?>
        <tr data-filter-item data-search="<?= admin_e(implode(' ', [$member['name'] ?? '', $member['school'] ?? '', $member['major'] ?? '', $member['position'] ?? ''])) ?>" data-category="<?= admin_e($member['position'] ?? '') ?>" data-date="0">
            <td><?php if (!empty($member['image'])): ?><img class="team-thumb" src="<?= admin_e(admin_team_image_src((string) $member['image'])) ?>" alt="Ảnh <?= admin_e($member['name'] ?? '') ?>"><?php else: ?><span class="team-thumb-placeholder"><?= admin_e(mb_substr((string) ($member['name'] ?? ''), 0, 1, 'UTF-8')) ?></span><?php endif; ?></td>
            <td><strong><?= admin_e($member['name'] ?? '') ?></strong><small><?= admin_e($member['detail'] ?? '') ?></small></td><td><?= admin_e($type === 'student' ? trim(($member['school'] ?? '') . ' · ' . ($member['major'] ?? ''), ' ·') : ($member['position'] ?? '')) ?></td>
            <td class="actions"><a href="team-edit.php?id=<?= rawurlencode((string) $member['id']) ?>"><?= ui_icon('pencil-simple') ?> Sửa</a><form method="post" action="team-delete.php" data-confirm="<?= admin_e('Xóa hồ sơ của ' . ($member['name'] ?? '') . '?') ?>"><input type="hidden" name="version" value="<?= (int) $member['version'] ?>"><input type="hidden" name="id" value="<?= admin_e($member['id']) ?>"><input type="hidden" name="token" value="<?= admin_e(admin_team_token()) ?>"><button class="link-danger" type="submit"><?= ui_icon('trash') ?> Xóa</button></form></td>
        </tr>
        <?php endforeach; ?>
    </tbody></table></div>
    <?php if ($members) ui_collection_end(); ?>
</section>
<?php admin_layout_end(); ?>

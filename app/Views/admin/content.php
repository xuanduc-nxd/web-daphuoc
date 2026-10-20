
<section class="page-heading"><div><p class="eyebrow">Nội dung website</p><h1><?= admin_e($title) ?></h1><p><?= $type === 'about' ? 'Cập nhật nội dung trên trang Giới thiệu.' : 'Cập nhật danh sách tri ân và thông tin đóng góp.' ?></p></div><a class="button primary" href="content-edit.php?type=<?= $type ?>"><?= ui_icon('plus') ?> Thêm nội dung</a></section>
<section data-collection data-page-size="10" data-result-label="nội dung">
    <div class="collection-toolbar"><label class="search-field"><span class="sr-only">Tìm nội dung</span><?= ui_icon('magnifying-glass') ?><input type="search" data-search-input placeholder="Tìm nội dung..."></label><label class="select-field"><span class="sr-only">Sắp xếp</span><select data-sort-input><option value="newest">Thứ tự hiện tại</option><option value="az">Nội dung A–Z</option></select></label></div>
    <div class="collection-summary"><span data-result-count aria-live="polite"><?= count($rows) ?> nội dung</span><button class="text-link" type="button" data-reset-filters hidden>Xóa bộ lọc <?= ui_icon('x') ?></button></div>
    <div class="panel table-wrap"><table><thead><tr><th>Nội dung</th><th><?= $type === 'about' ? 'Mục' : 'Đóng góp' ?></th><th>Thứ tự</th><th>Thao tác</th></tr></thead><tbody>
    <?php if (!$rows): ?><tr><td colspan="4" class="empty table-empty">Chưa có nội dung.</td></tr><?php endif; ?>
    <?php foreach ($rows as $row): $label = $type === 'about' ? strip_tags($row['content']) : $row['title']; ?>
        <tr data-filter-item data-search="<?= admin_e($label . ' ' . ($row['category'] ?? '') . ' ' . ($row['excerpt'] ?? '')) ?>" data-date="<?= -(int) $row['sort_order'] ?>">
            <td><strong><?= admin_e(mb_strimwidth($label, 0, 150, '…', 'UTF-8')) ?></strong></td><td><?= admin_e($type === 'about' ? ($sections[$row['section_key']] . ($row['category'] ? ' · ' . $row['category'] : '')) : $row['excerpt']) ?></td><td><?= (int) $row['sort_order'] ?></td>
            <td class="actions"><a href="content-edit.php?type=<?= $type ?>&amp;id=<?= rawurlencode($row['id']) ?>"><?= ui_icon('pencil-simple') ?> Sửa</a><form method="post" action="content.php?type=<?= $type ?>" data-confirm="<?= admin_e('Xóa nội dung “' . mb_strimwidth($label, 0, 80, '…', 'UTF-8') . '”?') ?>"><input type="hidden" name="token" value="<?= admin_e(admin_form_token()) ?>"><input type="hidden" name="id" value="<?= admin_e($row['id']) ?>"><input type="hidden" name="version" value="<?= (int) $row['version'] ?>"><button class="link-danger" type="submit"><?= ui_icon('trash') ?> Xóa</button></form></td>
        </tr>
    <?php endforeach; ?>
    </tbody></table></div><?php if ($rows) ui_collection_end(); ?>
</section>
<?php admin_layout_end(); ?>

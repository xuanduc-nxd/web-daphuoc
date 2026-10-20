<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
putenv('SUPABASE_URL=');
putenv('SUPABASE_SECRET_KEY=');
putenv('APP_ENV=development');
putenv('RENDER=');
putenv('APP_PREVIEW_MODE=true');
require_once __DIR__ . '/../app/Models/SiteRepository.php';
$postsHash = hash_file('sha256', __DIR__ . '/../data/posts.json');
$teamHash = hash_file('sha256', __DIR__ . '/../data/team.json');
$datasets = legacy_datasets();
if (count(site_members()) !== count($datasets['members'])) throw new RuntimeException('Thiếu hồ sơ trong bản xem trước.');
$ids = array_column($datasets['posts'], 'id');
if (count(array_unique($ids)) !== count($ids)) throw new RuntimeException('Id bài viết trùng khi hợp nhất dữ liệu.');
foreach (['activity','notification','blog'] as $kind) {
    foreach (site_posts($kind, true) as $post) {
        if ($post['status'] !== 'published') throw new RuntimeException('Bản nháp bị hiển thị công khai.');
        if (!site_public_post($kind, $post['id'])) throw new RuntimeException('Liên kết bài viết không hoạt động.');
    }
}
foreach ($datasets['posts'] as $post) {
    if (str_starts_with($post['id'], 'legacy_blog_') && $post['status'] !== 'draft') throw new RuntimeException('Blog lưu trữ bị tự xuất bản.');
}
if (app_date_value('Wed Mar 25 2026 00:00:00 GMT+0700 (Giờ Đông Dương)') !== '2026-03-25') throw new RuntimeException('Ngày nhập bị lệch múi giờ.');
try { app_date_value('31/02/2026'); throw new RuntimeException('Ngày không hợp lệ được chấp nhận.'); }
catch (InvalidArgumentException $expected) {}
try { site_save('posts', ['id' => 'must_not_write', 'title' => 'test']); throw new RuntimeException('Bản xem trước được phép ghi.'); }
catch (AppStorageException $expected) {}
putenv('SUPABASE_URL=https://example.supabase.co/rest/v1');
putenv('SUPABASE_SECRET_KEY=sb_secret_test_fixture');
try { supabase_configured(); throw new RuntimeException('SUPABASE_URL có /rest/v1 được chấp nhận.'); }
catch (AppStorageException $expected) {}
putenv('SUPABASE_URL=https://example.supabase.co/');
if (!supabase_configured()) throw new RuntimeException('URL project gốc không được chấp nhận.');
putenv('SUPABASE_URL=');
putenv('SUPABASE_SECRET_KEY=');
if ($postsHash !== hash_file('sha256', __DIR__ . '/../data/posts.json') || $teamHash !== hash_file('sha256', __DIR__ . '/../data/team.json')) throw new RuntimeException('File nguồn bị thay đổi.');
echo "Preview read-only, import normalization, archive drafts, dates and source preservation passed\n";

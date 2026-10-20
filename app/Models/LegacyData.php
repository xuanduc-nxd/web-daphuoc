<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

function app_default_settings(): array
{
    return [
        'id' => 'main', 'site_name' => 'CLB Golf Đa Phước',
        'notice' => 'Đồng hành cùng thế hệ trẻ Đà Nẵng', 'contact' => '',
        'phone' => '', 'email' => '',
        'location' => 'Đà Nẵng, Việt Nam',
        'facebook' => '',
        'instagram' => '',
        'tiktok' => '',
        'threads' => '',
        'hero_image' => 'Image/act-1.jpg',
    ];
}

function app_date_value(string $value): ?string
{
    $value = trim($value);
    if ($value === '') return null;
    if (preg_match('~^(\d{1,2})/(\d{1,2})/(\d{4})$~', $value, $m)) {
        if (!checkdate((int) $m[2], (int) $m[1], (int) $m[3])) throw new InvalidArgumentException('Ngày không hợp lệ. Dùng định dạng dd/mm/yyyy.');
        return sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
    }
    if (preg_match('~^(\d{4})-(\d{2})-(\d{2})$~', $value, $m)) {
        if (!checkdate((int) $m[2], (int) $m[3], (int) $m[1])) throw new InvalidArgumentException('Ngày không hợp lệ.');
        return $value;
    }
    $value = preg_replace('~\s*\([^)]*\)\s*$~u', '', $value) ?? $value;
    try { return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'))->format('Y-m-d'); }
    catch (Exception $error) { throw new InvalidArgumentException('Ngày trong dữ liệu nguồn không hợp lệ.'); }
}

function app_image_value(string $value): string
{
    $value = trim($value);
    if ($value === '') return '';
    if (preg_match('~^https?://~i', $value) && filter_var($value, FILTER_VALIDATE_URL)) return $value;
    if (preg_match('~^[a-zA-Z0-9_][a-zA-Z0-9_./?=&%+-]*$~', $value) && !str_contains($value, '..')) return $value;
    throw new InvalidArgumentException('Đường dẫn ảnh không hợp lệ.');
}

function legacy_read(string $root, string $file): array
{
    $path = rtrim($root, '/\\') . '/' . $file;
    if (!is_file($path)) return [];
    try { $rows = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { throw new AppStorageException('File dữ liệu nguồn không hợp lệ: ' . $file); }
    if (!is_array($rows)) throw new AppStorageException('File dữ liệu nguồn không phải danh sách: ' . $file);
    return $rows;
}

function legacy_datasets(?string $root = null): array
{
    $root = $root ?? ((string) getenv('APP_PREVIEW_DATA_DIR') ?: dirname(__DIR__, 2) . '/data');
    $datasets = ['posts' => [], 'members' => [], 'sponsors' => [], 'about_sections' => [], 'settings' => []];
    $sources = [
        ['posts.json', 'blog', ''],
        ['sheets/activities.json', 'activity', 'activity_'],
        ['sheets/notifications.json', 'notification', 'notification_'],
        ['sheets/blog.json', 'blog', 'legacy_blog_'],
    ];
    foreach ($sources as [$file, $kind, $prefix]) {
        foreach (legacy_read($root, $file) as $post) {
            if (!is_array($post) || empty($post['id']) || trim((string) ($post['title'] ?? '')) === '') throw new AppStorageException('Bài viết nguồn thiếu id hoặc tiêu đề: ' . $file);
            $datasets['posts'][] = [
                'id' => $prefix . $post['id'], 'legacy_id' => $prefix === '' ? null : (string) $post['id'],
                'kind' => $kind, 'title' => trim((string) $post['title']),
                'excerpt' => (string) ($post['excerpt'] ?? ''), 'content' => (string) ($post['content'] ?? ''),
                'content_format' => $prefix === '' ? 'plain' : 'html',
                'image' => app_image_value((string) ($post['image'] ?? '')),
                'author' => (string) ($post['author'] ?? 'CLB Golf Đa Phước'), 'role' => (string) ($post['role'] ?? 'CLB Golf Đa Phước'),
                'date' => app_date_value((string) ($post['date'] ?? '')),
                // The legacy sheet Blog was not served by the current Blog page.
                // Preserve these records as drafts instead of publishing archives.
                'status' => ($post['status'] ?? ($prefix === '' || $file === 'sheets/blog.json' ? 'draft' : 'published')) === 'published' ? 'published' : 'draft',
            ];
        }
    }
    foreach (legacy_read($root, 'team.json') as $position => $member) {
        if (!is_array($member) || empty($member['id']) || empty($member['name'])) throw new AppStorageException('Hồ sơ nguồn thiếu id hoặc họ tên.');
        $datasets['members'][] = [
            'id' => (string) $member['id'], 'type' => ($member['type'] ?? '') === 'student' ? 'student' : 'board',
            'name' => (string) $member['name'], 'position' => (string) ($member['position'] ?? ''),
            'school' => (string) ($member['school'] ?? ''), 'major' => (string) ($member['major'] ?? ''),
            'detail' => (string) ($member['detail'] ?? ''), 'image' => app_image_value((string) ($member['image'] ?? '')),
            'sort_order' => $position,
        ];
    }
    foreach (legacy_read($root, 'sheets/sponsors.json') as $position => $sponsor) {
        $datasets['sponsors'][] = [
            'id' => (string) ($sponsor['id'] ?? 'sponsor_' . $position), 'title' => (string) ($sponsor['title'] ?? ''),
            'excerpt' => (string) ($sponsor['excerpt'] ?? ''), 'content' => (string) ($sponsor['content'] ?? ''),
            'image' => app_image_value((string) ($sponsor['image'] ?? '')),
            'date' => app_date_value((string) ($sponsor['date'] ?? '')), 'sort_order' => $position,
        ];
    }
    foreach (legacy_read($root, 'sheets/abouts.json') as $position => $section) {
        $datasets['about_sections'][] = [
            'id' => (string) ($section['id'] ?? 'about_' . $position), 'section_key' => (string) ($section['section_key'] ?? ''),
            'category' => (string) ($section['category'] ?? ''), 'content' => (string) ($section['content'] ?? ''),
            'sort_order' => $position,
        ];
    }
    $settings = app_default_settings();
    foreach (legacy_read($root, 'settings.json') as $field => $value) {
        if (array_key_exists($field, $settings) && is_string($value) && $field !== 'id') {
            if ($value !== '' || !in_array($field, ['facebook','instagram','tiktok','threads','hero_image'], true)) $settings[$field] = $value;
        }
    }
    $defaults = legacy_read($root, 'sheets/defaults.json');
    if (!empty($defaults[0]['link'])) $settings['hero_image'] = app_image_value((string) $defaults[0]['link']);
    $datasets['settings'][] = $settings;
    foreach ($datasets as $table => $rows) {
        $ids = [];
        foreach ($rows as $row) {
            if (isset($ids[$row['id']])) throw new AppStorageException('Dữ liệu nguồn bị trùng id trong bảng ' . $table);
            $ids[$row['id']] = true;
        }
    }
    return $datasets;
}

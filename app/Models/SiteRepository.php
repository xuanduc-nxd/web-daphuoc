<?php
declare(strict_types=1);
require_once __DIR__ . '/Supabase.php';
require_once __DIR__ . '/LegacyData.php';

function app_preview_mode(): bool
{
    if (supabase_configured()) return false;
    if (app_is_production()) throw new AppStorageException('Website production cần cấu hình Supabase.');
    $flag = getenv('APP_PREVIEW_MODE');
    if ($flag !== false && !in_array(strtolower($flag), ['1','true'], true)) throw new AppStorageException('Chưa cấu hình Supabase.');
    return true;
}

function app_preview_rows(string $table): array
{
    static $datasets;
    if ($datasets === null) $datasets = legacy_datasets();
    return array_map(fn($row) => $row + ['version' => 1], $datasets[$table] ?? []);
}

function site_posts(?string $kind = null, bool $publishedOnly = false): array
{
    if ($kind !== null && !in_array($kind, ['activity','notification','blog'], true)) throw new InvalidArgumentException('Loại bài không hợp lệ.');
    if (app_preview_mode()) {
        $rows = array_values(array_filter(app_preview_rows('posts'), fn($row) => ($kind === null || $row['kind'] === $kind) && (!$publishedOnly || $row['status'] === 'published')));
        usort($rows, fn($a, $b) => strcmp($b['date'] ?? '', $a['date'] ?? '') ?: strcmp($a['id'], $b['id']));
        return $rows;
    }
    $filters = [];
    if ($kind !== null) $filters['kind'] = 'eq.' . $kind;
    if ($publishedOnly) $filters['status'] = 'eq.published';
    return supabase_select('posts', $filters, 'date.desc.nullslast,id.asc');
}

function site_record(string $table, string $id, array $filters = []): ?array
{
    if ($id === '') return null;
    if (app_preview_mode()) {
        foreach (app_preview_rows($table) as $row) {
            if ($row['id'] !== $id) continue;
            foreach ($filters as $field => $value) if (($row[$field] ?? null) !== $value) continue 2;
            return $row;
        }
        return null;
    }
    $query = ['id' => 'eq.' . $id];
    foreach ($filters as $field => $value) $query[$field] = 'eq.' . $value;
    return supabase_select($table, $query, 'id.asc', '*', 1)[0] ?? null;
}

function site_public_post(string $kind, string $id): ?array
{
    if (!in_array($kind, ['activity','notification','blog'], true)) return null;
    $row = site_record('posts', $id, ['kind' => $kind, 'status' => 'published']);
    if ($row !== null) return $row;
    if (app_preview_mode()) {
        foreach (site_posts($kind, true) as $row) if (($row['legacy_id'] ?? null) === $id) return $row;
        return null;
    }
    return supabase_select('posts', ['legacy_id' => 'eq.' . $id, 'kind' => 'eq.' . $kind, 'status' => 'eq.published'], 'id.asc', '*', 1)[0] ?? null;
}

function site_members(?string $type = null): array
{
    if ($type !== null && !in_array($type, ['board','student'], true)) throw new InvalidArgumentException('Nhóm hồ sơ không hợp lệ.');
    if (app_preview_mode()) return array_values(array_filter(app_preview_rows('members'), fn($row) => $type === null || $row['type'] === $type));
    return supabase_select('members', $type === null ? [] : ['type' => 'eq.' . $type], 'sort_order.asc,id.asc');
}

function site_sponsors(): array
{
    return app_preview_mode() ? app_preview_rows('sponsors') : supabase_select('sponsors', [], 'sort_order.asc,id.asc');
}

function site_about_sections(): array
{
    return app_preview_mode() ? app_preview_rows('about_sections') : supabase_select('about_sections', [], 'sort_order.asc,id.asc');
}

function site_settings(): array
{
    static $settings;
    if ($settings !== null) return $settings;
    $row = site_record('settings', 'main');
    if ($row === null) throw new AppStorageException('Chưa nhập dữ liệu ban đầu. Chạy công cụ migrate-supabase.');
    return $settings = array_merge(app_default_settings(), $row);
}

function site_collection(string $collection): array
{
    $types = ['activities' => 'activity', 'notifications' => 'notification', 'blog' => 'blog'];
    if (isset($types[$collection])) return site_posts($types[$collection], true);
    if ($collection === 'sponsors') return site_sponsors();
    if ($collection === 'abouts') return site_about_sections();
    throw new InvalidArgumentException('Danh sách nội dung không hợp lệ.');
}

function site_save(string $table, array $row, ?int $version = null): array
{
    if (app_preview_mode()) throw new AppStorageException('Bản xem trước chỉ đọc. Cấu hình Supabase để lưu nội dung.');
    $id = (string) ($row['id'] ?? '');
    unset($row['version'], $row['created_at'], $row['updated_at']);
    if ($version === null) return supabase_insert($table, $row);
    unset($row['id']);
    return supabase_change($table, $id, $version, $row);
}

function site_delete(string $table, string $id, int $version): void
{
    if (app_preview_mode()) throw new AppStorageException('Bản xem trước chỉ đọc.');
    supabase_change($table, $id, $version, null);
}

function app_upload_dir(): string
{
    return rtrim((string) (getenv('APP_UPLOAD_DIR') ?: dirname(__DIR__, 2) . '/uploads'), '/\\');
}

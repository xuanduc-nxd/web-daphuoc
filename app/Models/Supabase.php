<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

function supabase_configured(): bool
{
    $url = trim((string) getenv('SUPABASE_URL'));
    $key = trim((string) getenv('SUPABASE_SECRET_KEY'));
    if ($url === '' && $key === '') return false;
    $parts = parse_url($url);
    $localTest = getenv('APP_ENV') === 'test'
        && in_array($parts['host'] ?? '', ['127.0.0.1', 'localhost'], true)
        && ($parts['scheme'] ?? '') === 'http';
    if ($url === '' || $key === '' || !is_array($parts)
        || (($parts['scheme'] ?? '') !== 'https' && !$localTest)
        || empty($parts['host']) || isset($parts['user']) || isset($parts['pass'])
        || isset($parts['query']) || isset($parts['fragment'])
        || preg_match('/[\r\n]/', $key)
        || str_starts_with($key, 'sb_publishable_')) {
        throw new AppStorageException('Cấu hình Supabase chưa đầy đủ hoặc không hợp lệ.');
    }
    if (isset($parts['path']) && !in_array($parts['path'], ['', '/'], true)) {
        throw new AppStorageException('SUPABASE_URL chỉ chứa URL project, không thêm /rest/v1.');
    }
    return true;
}

function supabase_request(string $method, string $path, ?string $body = null, string $contentType = 'application/json', array $extraHeaders = []): array
{
    if (!supabase_configured()) throw new AppStorageException('Chưa cấu hình Supabase.');
    $key = trim((string) getenv('SUPABASE_SECRET_KEY'));
    $headers = ['apikey: ' . $key, 'Content-Type: ' . $contentType, 'Accept: application/json'];
    // New sb_secret keys go only in apikey. Legacy service_role JWTs also support Bearer.
    if (!str_starts_with($key, 'sb_secret_')) $headers[] = 'Authorization: Bearer ' . $key;
    $headers = array_merge($headers, $extraHeaders);
    $context = stream_context_create(['http' => [
        'method' => $method,
        'header' => implode("\r\n", $headers),
        'content' => $body ?? '',
        'timeout' => 12,
        'ignore_errors' => true,
        'follow_location' => 0,
    ]]);
    $response = @file_get_contents(rtrim((string) getenv('SUPABASE_URL'), '/') . $path, false, $context);
    $statusLine = $http_response_header[0] ?? '';
    preg_match('/^HTTP\/\S+\s+(\d{3})/', $statusLine, $matches);
    return [(int) ($matches[1] ?? 0), $response === false ? '' : $response];
}

function supabase_json_request(string $method, string $path, ?array $data = null, array $headers = []): array
{
    $body = $data === null ? null : json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    [$status, $response] = supabase_request($method, $path, $body, 'application/json', $headers);
    if ($status < 200 || $status >= 300) {
        error_log('Supabase request failed: HTTP ' . $status);
        throw new AppStorageException($status === 409 ? 'Dữ liệu đã tồn tại hoặc bị trùng. Vui lòng kiểm tra lại.' : 'Không kết nối được dữ liệu Supabase. Kiểm tra cấu hình và các bảng đã tạo.');
    }
    if ($response === '') return [];
    try { $decoded = json_decode($response, true, 512, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { throw new AppStorageException('Supabase trả về dữ liệu không hợp lệ.'); }
    if (!is_array($decoded)) throw new AppStorageException('Supabase trả về dữ liệu không hợp lệ.');
    return $decoded;
}

function supabase_table(string $table): string
{
    if (!in_array($table, ['posts', 'members', 'sponsors', 'about_sections', 'settings', 'admin_users'], true)) {
        throw new InvalidArgumentException('Bảng dữ liệu không hợp lệ.');
    }
    return '/rest/v1/' . $table;
}

function supabase_select(string $table, array $filters = [], string $order = 'id.asc', string $columns = '*', ?int $maximum = null): array
{
    $path = supabase_table($table);
    $rows = [];
    $offset = 0;
    do {
        $limit = $maximum !== null ? min(500, $maximum - count($rows)) : 500;
        if ($limit <= 0) break;
        $query = array_merge($filters, ['select' => $columns, 'order' => $order, 'offset' => $offset, 'limit' => $limit]);
        $page = supabase_json_request('GET', $path . '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986));
        foreach ($page as $row) {
            if (!is_array($row)) throw new AppStorageException('Bản ghi Supabase không hợp lệ.');
            $rows[] = $row;
        }
        $offset += count($page);
    } while (count($page) === $limit);
    return $rows;
}

function supabase_insert(string $table, array $row): array
{
    $rows = supabase_json_request('POST', supabase_table($table), $row, ['Prefer: return=representation']);
    if (!isset($rows[0]) || !is_array($rows[0])) throw new AppStorageException('Không nhận được bản ghi sau khi lưu.');
    return $rows[0];
}

function supabase_change(string $table, string $id, int $version, ?array $changes): array
{
    if ($id === '' || $version < 1) throw new AppConflictException('Bản ghi đã thay đổi. Tải lại trang trước khi thử lại.');
    $query = http_build_query(['id' => 'eq.' . $id, 'version' => 'eq.' . $version], '', '&', PHP_QUERY_RFC3986);
    $rows = supabase_json_request($changes === null ? 'DELETE' : 'PATCH', supabase_table($table) . '?' . $query, $changes, ['Prefer: return=representation']);
    if (!isset($rows[0]) || !is_array($rows[0])) throw new AppConflictException('Nội dung đã được người khác sửa hoặc xóa. Tải lại trang để xem bản mới nhất.');
    return $rows[0];
}

function supabase_import(string $table, array $rows): int
{
    if ($rows === []) return 0;
    $created = 0;
    foreach (array_chunk($rows, 100) as $batch) {
        $result = supabase_json_request('POST', supabase_table($table) . '?on_conflict=id', $batch, ['Prefer: resolution=ignore-duplicates,return=representation']);
        $created += count($result);
    }
    return $created;
}

function supabase_upload_file(string $filename, string $mime, string $path, bool $allowExisting = false): string
{
    if (!preg_match('/^[a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif)$/', $filename) || !is_file($path)) {
        throw new AppStorageException('Ảnh tải lên không hợp lệ.');
    }
    $bytes = file_get_contents($path);
    if ($bytes === false || strlen($bytes) > 5 * 1024 * 1024) throw new AppStorageException('Ảnh không đọc được hoặc vượt quá 5 MB.');
    [$status, $body] = supabase_request('POST', '/storage/v1/object/site-media/' . rawurlencode($filename), $bytes, $mime, ['x-upsert: false']);
    $duplicate = false;
    if ($allowExisting && in_array($status, [400, 409], true)) {
        $error = json_decode($body, true);
        $duplicate = is_array($error) && (in_array((string) ($error['error'] ?? ''), ['Duplicate', 'Asset Already Exists'], true) || (string) ($error['statusCode'] ?? '') === '409');
    }
    if (($status < 200 || $status >= 300) && !$duplicate) throw new AppStorageException('Không lưu được ảnh vào Supabase Storage. Kiểm tra bucket site-media.');
    return rtrim((string) getenv('SUPABASE_URL'), '/') . '/storage/v1/object/public/site-media/' . rawurlencode($filename);
}

<?php
declare(strict_types=1);
require_once __DIR__ . '/SiteRepository.php';

function admin_account(string $id): ?array
{
    if (!supabase_configured()) return null;
    return supabase_select('admin_users', ['id' => 'eq.' . $id, 'disabled' => 'eq.false'], 'id.asc', 'id,username,display_name,role,disabled,version', 1)[0] ?? null;
}

function admin_authenticate(string $username, string $password): ?array
{
    if (!supabase_configured()) return null;
    $username = strtolower(trim($username));
    $attemptKey = hash_hmac('sha256', $username . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'cli'), (string) getenv('SUPABASE_SECRET_KEY'));
    [$status, $body] = supabase_request('POST', '/rest/v1/rpc/consume_admin_login_attempt', json_encode(['attempt_key' => $attemptKey]));
    if ($status < 200 || $status >= 300) throw new AppStorageException('Không kiểm tra được đăng nhập. Kiểm tra SQL khởi tạo Supabase.');
    $allowed = json_decode($body, true);
    if ($allowed !== true) throw new AppConflictException('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.');
    $validUsername = preg_match('/^[a-z0-9_.-]{3,64}$/', $username);
    $row = $validUsername ? (supabase_select('admin_users', ['username' => 'eq.' . $username, 'disabled' => 'eq.false'], 'id.asc', '*', 1)[0] ?? null) : null;
    // Verify a hash even for unknown users; do not reveal which accounts exist.
    $hash = $row['password_hash'] ?? '$2y$12$8JrPkXaYP2KKlxvkEsPTDOgsND0EM6ytphEjcoPHU86DE.pWSAJ4q';
    $valid = strlen($password) <= 72 && password_verify($password, $hash);
    if (!$row || !$valid || !in_array($row['role'] ?? '', ['admin','editor'], true)) return null;
    supabase_json_request('DELETE', '/rest/v1/admin_login_attempts?id=eq.' . $attemptKey);
    unset($row['password_hash']);
    return $row;
}

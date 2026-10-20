<?php
declare(strict_types=1);

function loadEnv(string $path): void
{
    if (!is_file($path)) return;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        if (!preg_match('/^[A-Z][A-Z0-9_]*$/', $name)) continue;
        if (getenv($name) === false) putenv($name . '=' . trim($value, " \t\n\r\0\x0B\"'"));
    }
}
loadEnv(dirname(__DIR__) . '/.env');
date_default_timezone_set('Asia/Ho_Chi_Minh');

function app_is_production(): bool
{
    return getenv('APP_ENV') === 'production' || (bool) getenv('RENDER');
}

class AppStorageException extends RuntimeException {}
class AppConflictException extends RuntimeException {}

set_exception_handler(function (Throwable $error): void {
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "Không hoàn tất được thao tác. " . ($error instanceof AppStorageException || $error instanceof AppConflictException ? $error->getMessage() : 'Kiểm tra cấu hình và dữ liệu đầu vào.') . PHP_EOL);
        exit(1);
    }
    error_log('CLB application error: ' . get_class($error));
    http_response_code($error instanceof AppStorageException ? 503 : 500);
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store');
    ?><!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Chưa kết nối được dữ liệu · CLB Golf Đa Phước</title><link rel="stylesheet" href="/CSS/fonts.css"><link rel="stylesheet" href="/CSS/site.css"></head><body><header class="site-header"><div class="header-inner"><a class="brand" href="/index.php"><img src="/assets/images/logo.webp" width="52" height="52" alt="Logo Đa Phước"><span><strong>CLB Golf Đa Phước</strong><small>Và những người bạn</small></span></a></div></header><main class="container not-found"><div class="empty-state"><h1>Chưa kết nối được dữ liệu</h1><p>Website đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.</p><a class="button primary" href="/">Thử tải lại</a></div></main></body></html><?php
});

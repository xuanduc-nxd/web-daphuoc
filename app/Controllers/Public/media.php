<?php
declare(strict_types=1);
require_once __DIR__ . '/../../Models/SiteRepository.php';

$filename = (string) ($_GET['file'] ?? '');
if (!preg_match('/^[a-zA-Z0-9_-]+\.(?:jpg|png|webp|gif)$/', $filename)) {
    http_response_code(404);
    exit;
}
$path = app_upload_dir() . '/' . $filename;
if (!is_file($path)) {
    http_response_code(404);
    exit;
}
$mime = mime_content_type($path);
if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
    http_response_code(404);
    exit;
}
header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=3600');
header('X-Content-Type-Options: nosniff');
readfile($path);

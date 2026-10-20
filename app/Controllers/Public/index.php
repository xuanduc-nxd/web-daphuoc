<?php
require_once __DIR__ . '/../../Support/public.php';
$activities_home = array_slice(site_collection('activities'), 0, 4);
$sponsors_home = array_slice(site_collection('sponsors'), 0, 6);
$siteSettings = site_settings();
$heroImage = ui_image($siteSettings['hero_image']);
$detailPhoto = ui_image($activities_home[0]['image'] ?? 'Image/act-1.jpg');
require __DIR__ . '/../../Views/public/index.php';

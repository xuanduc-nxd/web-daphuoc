<?php
require_once __DIR__ . '/../../Support/public.php';
require_once __DIR__ . '/../../Views/partials/team-card.php';
$members = site_members('board');
$board = array_values(array_filter($members, fn($member) => ($member['position'] ?? '') === 'Ban điều hành'));
$advisors = array_values(array_filter($members, fn($member) => ($member['position'] ?? '') === 'Ban cố vấn'));
$pageTitle = 'Ban điều hành Quỹ · CLB Golf Đa Phước';
require __DIR__ . '/../../Views/public/ExecutiveBoard.php';

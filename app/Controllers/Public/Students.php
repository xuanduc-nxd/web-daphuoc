<?php
require_once __DIR__ . '/../../Support/public.php';
require_once __DIR__ . '/../../Views/partials/team-card.php';
$students = site_members('student');
$pageTitle = 'Sinh viên · CLB Golf Đa Phước';
require __DIR__ . '/../../Views/public/Students.php';

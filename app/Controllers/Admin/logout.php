<?php
require_once __DIR__ . '/../../Support/admin.php';
$_SESSION = [];
session_destroy();
header('Location: login.php');
exit;

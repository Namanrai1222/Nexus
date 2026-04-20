<?php
// NEXUS Core Configuration

define('JWT_SECRET', 'nexus_forge_super_secret_key_8492049_make_random_in_prod');
define('JWT_EXPIRY', 900); // 15 mins
define('REFRESH_EXPIRY', 604800); // 7 days

// Disable display errors in production, rely on error_log
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Database connection
$db_host = '127.0.0.1';
$db_name = 'nexus_platform_db';
$db_user = 'root';
$db_pass = '';
$db_charset = 'utf8mb4';

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    global $pdo;
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    error_log("DB Connection Failed: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(["error" => "Internal Database Error"]);
    exit;
}

// Global Headers
header('Content-Type: application/json; charset=utf-8');

/**
 * Standard JSON Response Output
 */
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
?>

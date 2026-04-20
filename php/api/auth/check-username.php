<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$username = sanitize($_GET['u'] ?? '');

if (empty($username)) {
    jsonResponse(['error' => 'Username required'], 422);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $exists = $stmt->fetch() !== false;
    
    jsonResponse(['success' => true, 'available' => !$exists], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

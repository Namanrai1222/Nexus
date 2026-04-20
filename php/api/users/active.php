<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Simple mock heuristic: top by reputation
    $stmt = $pdo->query('
        SELECT id, username, avatar_url, reputation
        FROM users
        WHERE is_deleted = 0
        ORDER BY reputation DESC
        LIMIT 5
    ');
    $users = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $users], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $stmt = $pdo->query('
        SELECT t.name, COUNT(pt.post_id) as post_count
        FROM tags t
        JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id
        ORDER BY post_count DESC
        LIMIT 8
    ');
    $tags = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $tags], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

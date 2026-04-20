<?php
require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$q = sanitize($_GET['q'] ?? '');

if (empty($q)) {
    jsonResponse(['success' => true, 'data' => []], 200);
}

try {
    $stmt = $pdo->prepare('SELECT name FROM tags WHERE name LIKE :q ORDER BY name ASC LIMIT 5');
    $stmt->execute([':q' => $q . '%']);
    $tags = $stmt->fetchAll(PDO::FETCH_COLUMN);

    jsonResponse(['success' => true, 'data' => $tags], 200);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database error'], 500);
}
?>

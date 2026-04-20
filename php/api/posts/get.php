<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$id = (int)($_GET['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(['error' => 'Invalid post ID'], 400);
}

try {
    $stmt = $pdo->prepare('
        SELECT p.*, u.username, u.reputation, u.avatar_url, u.bio, u.created_at as user_joined, c.name as category_name, c.color as category_color
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = :id AND p.is_deleted = 0
    ');
    $stmt->execute([':id' => $id]);
    $post = $stmt->fetch();
    
    if (!$post) {
        jsonResponse(['error' => 'Post not found'], 404);
    }
    
    $tagStmt = $pdo->prepare("SELECT t.name FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id = ?");
    $tagStmt->execute([$id]);
    $post['tags'] = $tagStmt->fetchAll(PDO::FETCH_COLUMN);
    
    jsonResponse(['success' => true, 'data' => $post], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

<?php
require_once '../../config.php';
require_once '../../middleware.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) jsonResponse(['error' => 'Invalid ID'], 400);

try {
    $stmt = $pdo->prepare('
        SELECT p.id, p.title, p.upvotes, p.downvotes, p.created_at, c.name as category_name, c.color as category_color,
               (SELECT COUNT(*) FROM replies WHERE post_id = p.id AND is_deleted = 0) as reply_count
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        WHERE p.user_id = :id AND p.is_deleted = 0 
        ORDER BY p.created_at DESC LIMIT 20
    ');
    $stmt->execute([':id' => $id]);
    $posts = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $posts], 200);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database error'], 500);
}
?>

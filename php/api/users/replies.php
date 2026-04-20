<?php
// users/replies.php
require_once '../../config.php';
require_once '../../middleware.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) jsonResponse(['error' => 'Invalid ID'], 400);

try {
    $stmt = $pdo->prepare('
        SELECT r.id, r.post_id, r.body_html, r.upvotes, r.downvotes, r.created_at, p.title as post_title 
        FROM replies r
        JOIN posts p ON r.post_id = p.id
        WHERE r.user_id = :id AND r.is_deleted = 0 
        ORDER BY r.created_at DESC LIMIT 20
    ');
    $stmt->execute([':id' => $id]);
    $replies = $stmt->fetchAll();
    
    foreach ($replies as &$r) {
        $r['excerpt'] = strip_tags($r['body_html']);
        if (strlen($r['excerpt']) > 150) {
            $r['excerpt'] = substr($r['excerpt'], 0, 150) . '...';
        }
    }
    
    jsonResponse(['success' => true, 'data' => $replies], 200);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database error'], 500);
}
?>

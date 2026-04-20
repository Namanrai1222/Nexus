<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
requireAuth(); // Populates $CURRENT_USER

$input = json_decode(file_get_contents('php://input'), true);
$postId = (int)($input['post_id'] ?? 0);
$parentId = isset($input['parent_id']) && (int)$input['parent_id'] > 0 ? (int)$input['parent_id'] : null;
$bodyHtml = trim((string)($input['body_html'] ?? ''));

// Strip script tags
$bodyHtml = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $bodyHtml);

if ($postId <= 0 || empty($bodyHtml)) {
    jsonResponse(['error' => 'Invalid input'], 422);
}

try {
    $stmt = $pdo->prepare('INSERT INTO replies (post_id, user_id, parent_id, body_html) VALUES (:post, :user, :parent, :body)');
    $stmt->execute([
        ':post' => $postId,
        ':user' => $CURRENT_USER->id,
        ':parent' => $parentId,
        ':body' => $bodyHtml
    ]);
    
    // Add 1 rep to user
    $pdo->query("UPDATE users SET reputation = reputation + 1 WHERE id = {$CURRENT_USER->id}");

    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()], 201);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

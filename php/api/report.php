<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
requireAuth();

$input = json_decode(file_get_contents('php://input'), true);
$postId = isset($input['post_id']) && (int)$input['post_id'] > 0 ? (int)$input['post_id'] : null;
$replyId = isset($input['reply_id']) && (int)$input['reply_id'] > 0 ? (int)$input['reply_id'] : null;
$reason = sanitize($input['reason'] ?? '');

if (empty($reason) || strlen($reason) > 255) {
    jsonResponse(['error' => 'Reason must be 1-255 characters'], 422);
}
if (!$postId && !$replyId) {
    jsonResponse(['error' => 'Target required'], 422);
}

try {
    $stmt = $pdo->prepare('INSERT INTO reports (reporter_id, post_id, reply_id, reason) VALUES (:u, :p, :r, :rs)');
    $stmt->execute([
        ':u' => $CURRENT_USER->id,
        ':p' => $postId,
        ':r' => $replyId,
        ':rs' => $reason
    ]);

    jsonResponse(['success' => true], 201);
} catch (PDOException $e) {
    // If table doesn't exist, ignore or log
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

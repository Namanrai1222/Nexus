<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
requireAuth();
if ($CURRENT_USER->role !== 'admin' && $CURRENT_USER->role !== 'moderator') {
    jsonResponse(['error' => 'Unauthorized'], 403);
}

$input = json_decode(file_get_contents('php://input'), true);
$reportId = (int)($input['report_id'] ?? 0);
$action = $input['action'] ?? '';

if ($reportId <= 0 || !in_array($action, ['dismiss', 'delete_post', 'delete_reply', 'ban_user'])) {
    jsonResponse(['error' => 'Invalid parameters'], 422);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT * FROM reports WHERE id = ?');
    $stmt->execute([$reportId]);
    $report = $stmt->fetch();
    
    if (!$report) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Report not found'], 404);
    }

    if ($action === 'dismiss') {
        $pdo->prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?")->execute([$reportId]);
    } else if ($action === 'delete_post' && $report['post_id']) {
        $pdo->prepare("UPDATE posts SET is_deleted = 1 WHERE id = ?")->execute([$report['post_id']]);
        $pdo->prepare("UPDATE reports SET status = 'resolved' WHERE id = ?")->execute([$reportId]);
    } else if ($action === 'delete_reply' && $report['reply_id']) {
        $pdo->prepare("UPDATE replies SET is_deleted = 1 WHERE id = ?")->execute([$report['reply_id']]);
        $pdo->prepare("UPDATE reports SET status = 'resolved' WHERE id = ?")->execute([$reportId]);
    } else if ($action === 'ban_user') {
        $targetUserId = null;
        if ($report['post_id']) {
            $p = $pdo->prepare('SELECT user_id FROM posts WHERE id = ?');
            $p->execute([$report['post_id']]);
            $targetUserId = $p->fetchColumn();
        } else if ($report['reply_id']) {
            $r = $pdo->prepare('SELECT user_id FROM replies WHERE id = ?');
            $r->execute([$report['reply_id']]);
            $targetUserId = $r->fetchColumn();
        }
        
        if ($targetUserId) {
            $pdo->prepare("UPDATE users SET is_deleted = 1 WHERE id = ?")->execute([$targetUserId]);
            $pdo->prepare("UPDATE posts SET is_deleted = 1 WHERE user_id = ?")->execute([$targetUserId]);
            $pdo->prepare("UPDATE replies SET is_deleted = 1 WHERE user_id = ?")->execute([$targetUserId]);
            
            $pdo->prepare("UPDATE reports SET status = 'resolved' WHERE id = ?")->execute([$reportId]);
        } else {
            $pdo->prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?")->execute([$reportId]);
        }
    }

    $pdo->commit();
    jsonResponse(['success' => true], 200);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

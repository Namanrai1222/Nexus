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
$value = (int)($input['value'] ?? 0);

if ($value !== 1 && $value !== -1) {
    jsonResponse(['error' => 'Invalid vote value'], 422);
}
if (!$postId && !$replyId) {
    jsonResponse(['error' => 'Target required'], 422);
}

try {
    // Check for existing vote handling null appropriately
    $q = 'SELECT id, value FROM votes WHERE user_id = :u AND ';
    $q .= $postId ? 'post_id = :p' : 'reply_id = :r';
    
    $checkStmt = $pdo->prepare($q);
    $params = [':u' => $CURRENT_USER->id];
    if ($postId) $params[':p'] = $postId;
    else $params[':r'] = $replyId;
    
    $checkStmt->execute($params);
    $existing = $checkStmt->fetch();

    $pdo->beginTransaction();

    if ($existing) {
        if ($existing['value'] == $value) {
            $pdo->rollBack();
            jsonResponse(['success' => true, 'message' => 'Already voted'], 200);
        } else {
            $pdo->prepare('UPDATE votes SET value = :v WHERE id = :id')->execute([':v' => $value, ':id' => $existing['id']]);
            $table = $postId ? 'posts' : 'replies';
            $targetId = $postId ?: $replyId;
            $oldCol = $existing['value'] == 1 ? 'upvotes' : 'downvotes';
            $newCol = $value == 1 ? 'upvotes' : 'downvotes';
            $pdo->query("UPDATE $table SET $oldCol = GREATEST($oldCol - 1, 0), $newCol = $newCol + 1 WHERE id = $targetId");
            
            // Adjust author rep
            $authorQ = $pdo->query("SELECT user_id FROM $table WHERE id = $targetId")->fetch();
            if ($authorQ) {
                $dir = $value == 1 ? '+2' : '-2';
                $pdo->query("UPDATE users SET reputation = reputation $dir WHERE id = {$authorQ['user_id']}");
            }
        }
    } else {
        $stmt = $pdo->prepare('INSERT INTO votes (user_id, post_id, reply_id, value) VALUES (:u, :p, :r, :v)');
        $stmt->execute([':u' => $CURRENT_USER->id, ':p' => $postId, ':r' => $replyId, ':v' => $value]);
        
        $table = $postId ? 'posts' : 'replies';
        $targetId = $postId ?: $replyId;
        $col = $value == 1 ? 'upvotes' : 'downvotes';
        $pdo->query("UPDATE $table SET $col = $col + 1 WHERE id = $targetId");
        
        // Target user rep
        $authorQ = $pdo->query("SELECT user_id FROM $table WHERE id = $targetId")->fetch();
        if ($authorQ) {
            $dir = $value == 1 ? '+1' : '-1';
            $pdo->query("UPDATE users SET reputation = reputation $dir WHERE id = {$authorQ['user_id']}");
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

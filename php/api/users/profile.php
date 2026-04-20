<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$id = (int)($_GET['id'] ?? 0);
$username = $_GET['username'] ?? '';

if ($id <= 0 && empty($username)) {
    // If authenticated, get own profile
    try {
        requireAuth();
        $id = $CURRENT_USER->id;
    } catch (Exception $e) {
        jsonResponse(['error' => 'User not found'], 404);
    }
}

try {
    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT id, username, role, avatar_url, bio, reputation, created_at FROM users WHERE id = :id AND is_deleted = 0');
        $stmt->execute([':id' => $id]);
    } else {
        $stmt = $pdo->prepare('SELECT id, username, role, avatar_url, bio, reputation, created_at FROM users WHERE username = :u AND is_deleted = 0');
        $stmt->execute([':u' => $username]);
    }
    
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['error' => 'User not found'], 404);
    }

    $statStmt = $pdo->prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ? AND is_deleted = 0');
    $statStmt->execute([$user['id']]);
    $user['post_count'] = $statStmt->fetchColumn();

    $statStmt = $pdo->prepare('SELECT COUNT(*) as c FROM replies WHERE user_id = ? AND is_deleted = 0');
    $statStmt->execute([$user['id']]);
    $user['reply_count'] = $statStmt->fetchColumn();

    jsonResponse(['success' => true, 'data' => $user], 200);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database error'], 500);
}
?>

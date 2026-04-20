<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
requireAuth();

$input = json_decode(file_get_contents('php://input'), true);
$title = sanitize($input['title'] ?? '');
$bodyHtml = trim((string)($input['body_html'] ?? ''));
$catId = (int)($input['category_id'] ?? 0);
$tags = is_array($input['tags'] ?? null) ? array_map('sanitize', $input['tags']) : [];

$bodyHtml = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $bodyHtml);

if (strlen($title) < 10 || strlen($title) > 255) {
    jsonResponse(['error' => 'Title must be 10-255 characters'], 422);
}
if (strlen(strip_tags($bodyHtml)) < 10 || strlen($bodyHtml) > 50000) {
    jsonResponse(['error' => 'Body must be 10-50000 characters'], 422);
}
if ($catId <= 0) {
    jsonResponse(['error' => 'Category is required'], 422);
}
if (count($tags) > 5) {
    jsonResponse(['error' => 'Maximum 5 tags allowed'], 422);
}

try {
    // Check category exists
    $catStmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
    $catStmt->execute([$catId]);
    if (!$catStmt->fetch()) {
        jsonResponse(['error' => 'Invalid category'], 422);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare('INSERT INTO posts (title, body_html, category_id, user_id) VALUES (:t, :b, :c, :u)');
    $stmt->execute([
        ':t' => $title,
        ':b' => $bodyHtml,
        ':c' => $catId,
        ':u' => $CURRENT_USER->id
    ]);
    
    $postId = $pdo->lastInsertId();

    foreach ($tags as $tagName) {
        $tagName = strtolower(trim($tagName));
        if (empty($tagName)) continue;
        
        $tagQ = $pdo->prepare('SELECT id FROM tags WHERE name = ?');
        $tagQ->execute([$tagName]);
        $tagRow = $tagQ->fetch();
        
        if ($tagRow) {
            $tagId = $tagRow['id'];
        } else {
            $insQ = $pdo->prepare('INSERT INTO tags (name) VALUES (?)');
            $insQ->execute([$tagName]);
            $tagId = $pdo->lastInsertId();
        }
        
        $pdo->prepare('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')->execute([$postId, $tagId]);
    }

    $pdo->prepare('DELETE FROM post_drafts WHERE user_id = ?')->execute([$CURRENT_USER->id]);
    
    // Rep increment (+2 for posting)
    $pdo->query("UPDATE users SET reputation = reputation + 2 WHERE id = {$CURRENT_USER->id}");

    $pdo->commit();
    jsonResponse(['success' => true, 'id' => $postId], 201);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

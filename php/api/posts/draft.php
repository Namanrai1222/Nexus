<?php
require_once '../../config.php';
require_once '../../middleware.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT title, body_html, category_id, tags_json FROM post_drafts WHERE user_id = :u');
        $stmt->execute([':u' => $CURRENT_USER->id]);
        $draft = $stmt->fetch();
        jsonResponse(['success' => true, 'data' => $draft ?: null], 200);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Database error'], 500);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = sanitize($input['title'] ?? '');
    $bodyHtml = trim((string)($input['body_html'] ?? ''));
    $catId = (int)($input['category_id'] ?? 0);
    $tagsJson = isset($input['tags']) ? json_encode($input['tags']) : '[]';

    // Basic sanitization
    $bodyHtml = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $bodyHtml);

    try {
        $stmt = $pdo->prepare('
            INSERT INTO post_drafts (user_id, title, body_html, category_id, tags_json)
            VALUES (:u, :t, :b, :c, :tags)
            ON DUPLICATE KEY UPDATE title = :t, body_html = :b, category_id = :c, tags_json = :tags
        ');
        $stmt->execute([
            ':u' => $CURRENT_USER->id,
            ':t' => $title,
            ':b' => $bodyHtml,
            ':c' => $catId,
            ':tags' => $tagsJson
        ]);
        jsonResponse(['success' => true], 200);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        jsonResponse(['error' => 'Database error'], 500);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>

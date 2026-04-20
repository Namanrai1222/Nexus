<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$postId = (int)($_GET['post_id'] ?? 0);
$sort = $_GET['sort'] ?? 'best'; // oldest, newest, best
if ($postId <= 0) jsonResponse(['error' => 'Invalid post ID'], 400);

$orderBy = 'r.is_accepted DESC, (r.upvotes - r.downvotes) DESC, r.created_at ASC';
if ($sort === 'oldest') $orderBy = 'r.is_accepted DESC, r.created_at ASC';
if ($sort === 'newest') $orderBy = 'r.is_accepted DESC, r.created_at DESC';

try {
    $stmt = $pdo->prepare("
        SELECT r.*, u.username, u.reputation, u.avatar_url
        FROM replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.post_id = :post_id AND r.is_deleted = 0
        ORDER BY $orderBy
    ");
    $stmt->execute([':post_id' => $postId]);
    $replies = $stmt->fetchAll();
    
    // Build tree
    $tree = [];
    $lookup = [];
    foreach ($replies as $k => $r) {
        $replies[$k]['children'] = [];
        $lookup[$r['id']] = &$replies[$k];
    }
    
    foreach ($replies as $k => &$r) {
        if ($r['parent_id'] !== null && isset($lookup[$r['parent_id']])) {
            $lookup[$r['parent_id']]['children'][] = &$r;
        } else {
            $tree[] = &$r;
        }
    }

    jsonResponse(['success' => true, 'data' => $tree], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

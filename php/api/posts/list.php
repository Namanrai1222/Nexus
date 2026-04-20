<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 15;
$offset = ($page - 1) * $limit;
$sort = $_GET['sort'] ?? 'hot'; // hot, new, top
$categoryId = (int)($_GET['category'] ?? 0);
$tag = sanitize($_GET['tag'] ?? '');

$whereClauses = ['p.is_deleted = 0'];
$params = [];

if ($categoryId > 0) {
    $whereClauses[] = 'p.category_id = :cat';
    $params[':cat'] = $categoryId;
}

$joinTags = '';
if (!empty($tag)) {
    $joinTags = 'JOIN post_tags pt ON p.id = pt.post_id JOIN tags t ON pt.tag_id = t.id';
    $whereClauses[] = 't.name = :tag';
    $params[':tag'] = $tag;
}

$orderBy = 'p.created_at DESC';
if ($sort === 'top') {
    $orderBy = 'p.upvotes - p.downvotes DESC, p.created_at DESC';
} else if ($sort === 'hot') {
    // Basic hot algorithm: score / time
    $orderBy = 'LOG10(GREATEST((p.upvotes - p.downvotes), 1)) + (UNIX_TIMESTAMP(p.created_at) / 45000) DESC';
}

$where = implode(' ', ['WHERE', implode(' AND ', $whereClauses)]);

$sql = "
    SELECT p.id, p.title, SUBSTRING(p.body_html, 1, 200) as excerpt, p.upvotes, p.downvotes, 
           p.created_at, p.is_pinned, u.username, u.reputation, u.avatar_url, c.name as category_name, c.color as category_color,
           (SELECT COUNT(*) FROM replies WHERE post_id = p.id AND is_deleted = 0) as reply_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    $joinTags
    $where
    ORDER BY p.is_pinned DESC, $orderBy
    LIMIT :limit OFFSET :offset
";

try {
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $posts = $stmt->fetchAll();
    
    // Fetch tags for these posts
    if (!empty($posts)) {
        $postIds = array_column($posts, 'id');
        $inQuery = implode(',', array_fill(0, count($postIds), '?'));
        $tagStmt = $pdo->prepare("SELECT pt.post_id, t.name FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id IN ($inQuery)");
        $tagStmt->execute($postIds);
        
        $tagsLookup = [];
        while ($row = $tagStmt->fetch()) {
            $tagsLookup[$row['post_id']][] = $row['name'];
        }
        
        foreach ($posts as &$post) {
            $post['tags'] = $tagsLookup[$post['id']] ?? [];
        }
    }

    // Strip HTML from excerpts
    foreach ($posts as &$post) {
        $post['excerpt'] = strip_tags($post['excerpt']) . (strlen($post['excerpt']) == 200 ? '...' : '');
    }

    jsonResponse(['success' => true, 'data' => $posts], 200);
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

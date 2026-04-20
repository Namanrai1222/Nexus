<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
requireAuth();

$input = json_decode(file_get_contents('php://input'), true);
$bio = sanitize($input['bio'] ?? '');

if (strlen($bio) > 1000) {
    jsonResponse(['error' => 'Bio too long'], 422);
}

try {
    $stmt = $pdo->prepare('UPDATE users SET bio = :b WHERE id = :id');
    $stmt->execute([':b' => $bio, ':id' => $CURRENT_USER->id]);
    jsonResponse(['success' => true], 200);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Database error'], 500);
}
?>

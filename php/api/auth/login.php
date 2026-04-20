<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Email and password are required'], 422);
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash, role FROM users WHERE email = :email AND is_deleted = 0');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $payload = [
            'user_id' => $user['id'],
            'role' => $user['role'],
            'exp' => time() + JWT_EXPIRY
        ];
        
        $token = JWT::encode($payload, JWT_SECRET);
        
        // Ensure to remove hash before sending
        unset($user['password_hash']);

        jsonResponse([
            'success' => true, 
            'token' => $token,
            'user' => $user
        ], 200);
    } else {
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

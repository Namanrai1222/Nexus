<?php
require_once '../../config.php';
require_once '../../middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$username = sanitize($input['username'] ?? '');
$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($email) || empty($password)) {
    jsonResponse(['error' => 'All fields are required'], 422);
}

if (!validateEmail($email)) {
    jsonResponse(['error' => 'Invalid email format'], 422);
}

if (strlen($username) < 3 || strlen($username) > 30) {
    jsonResponse(['error' => 'Username must be between 3 and 30 characters'], 422);
}

if (strlen($password) < 8) {
    jsonResponse(['error' => 'Password must be at least 8 characters'], 422);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :hash)');
    $stmt->execute([':username' => $username, ':email' => $email, ':hash' => $hash]);
    jsonResponse(['success' => true, 'message' => 'Registration successful'], 201);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        jsonResponse(['error' => 'Username or email already taken'], 409);
    }
    error_log($e->getMessage());
    jsonResponse(['error' => 'Database error'], 500);
}
?>

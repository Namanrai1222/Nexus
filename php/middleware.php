<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

$CURRENT_USER = null;

/**
 * Ensures user is authenticated via JWT Bearer Token
 * On success, populates global $CURRENT_USER object.
 * On failure, exits with 401.
 */
function requireAuth() {
    global $CURRENT_USER;
    global $pdo;

    $headers = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } else {
        $headers = array();
        foreach($_SERVER as $key => $value) {
            if (substr($key, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))))] = $value;
            }
        }
    }

    $authHeader = $headers['Authorization'] ?? '';

    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        jsonResponse(['error' => 'Authentication required'], 401);
    }

    $token = $matches[1];
    $payload = JWT::decode($token, JWT_SECRET);

    if (!$payload || !isset($payload['user_id'])) {
        jsonResponse(['error' => 'Invalid or expired token'], 401);
    }

    $stmt = $pdo->prepare('SELECT id, username, email, role, avatar_url, reputation FROM users WHERE id = :id AND is_deleted = 0');
    $stmt->execute([':id' => $payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse(['error' => 'User not found or deleted'], 401);
    }

    $CURRENT_USER = (object)$user;
}

/**
 * Verifies specific roles
 */
function requireRole($role) {
    global $CURRENT_USER;
    if (!$CURRENT_USER) requireAuth();
    
    // Simple hierarchy check: admin > moderator > member
    $roles = ['member' => 1, 'moderator' => 2, 'admin' => 3];
    
    $userRoleVal = $roles[$CURRENT_USER->role] ?? 0;
    $reqRoleVal  = $roles[$role] ?? 99;

    if ($userRoleVal < $reqRoleVal) {
        jsonResponse(['error' => 'Insufficient permissions'], 403);
    }
}

/**
 * Security: Sanitize input strings for DB storage or comparison
 */
function sanitize($str) {
    return htmlspecialchars(trim(strip_tags((string)$str)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email format
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}
?>

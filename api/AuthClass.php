<?php
/**
 * Session Auth Helper (Read-Only)
 *
 * Slim version that only checks session authentication.
 * User management (login, logout, CRUD) is handled by the central
 * auth service in lw000 (launchpad) at /api/auth_endpoints.php.
 *
 * This class is needed locally because lw001's API endpoints
 * use requireAuth() to protect modification operations.
 */

class Auth {
    private $sessionTimeout = 3600; // 1 hour in seconds

    public function __construct(Database $db) {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',  // CRITICAL: Root path for SSO across all modules
                'domain' => '',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }

    /**
     * Check if user is authenticated
     */
    public function isAuthenticated() {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }

        // Check session timeout
        if (isset($_SESSION['last_activity'])) {
            $elapsed = time() - $_SESSION['last_activity'];
            if ($elapsed > $this->sessionTimeout) {
                session_destroy();
                return false;
            }
        }

        // Update last activity
        $_SESSION['last_activity'] = time();
        return true;
    }

    /**
     * Require authentication (throw error if not authenticated)
     */
    public function requireAuth() {
        if (!$this->isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit();
        }
    }

    /**
     * Require admin privileges
     */
    public function requireAdmin() {
        $this->requireAuth();
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin privileges required']);
            exit();
        }
    }
}

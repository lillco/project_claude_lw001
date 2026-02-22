<?php
/**
 * CORS Helper - Validates origins against allowlist
 * 
 * Security-first CORS handling:
 * - In production (same-origin): No CORS headers needed
 * - In development: Validates against strict allowlist from config
 * - Never reflects arbitrary origins (prevents session hijacking)
 * - Never uses '*' with credentials (spec violation)
 * 
 * Usage:
 *   require_once __DIR__ . '/cors.php';
 *   handleCors();
 */

function handleCors() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Same-origin requests don't send Origin header → no CORS needed
    // This is the production case where all modules are under same domain
    if (empty($origin)) {
        return;
    }
    
    // Load allowed origins from config
    $config = [];
    if (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
    }
    $allowedOrigins = $config['cors']['allowed_origins'] ?? [];
    
    // Check if origin is in allowlist (strict comparison)
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');  // Important for caching with multiple allowed origins
    }
    // If origin not in allowlist → NO Access-Control headers → browser blocks it ✓
    
    // Always set these (safe even without Allow-Origin)
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

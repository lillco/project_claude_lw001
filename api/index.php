<?php
/**
 * Association Manager API
 * PHP/MySQL backend for production
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'Database.php';
require_once 'config.php';

// Initialize database
$db = new Database($config);

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = trim($path, '/');
$segments = explode('/', $path);

// Get request body for POST/PUT
$input = json_decode(file_get_contents('php://input'), true);

try {
    // Route: GET /association - Get association (single record)
    if ($method === 'GET' && $path === 'association') {
        $result = $db->getFirst('association');
        echo json_encode($result);
        exit();
    }

    // Route: POST /association - Create association
    if ($method === 'POST' && $path === 'association') {
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        // Add ID and timestamp
        $data = array_merge([
            'id' => (string)time() . rand(100, 999),
        ], $input);

        $result = $db->insert('association', $data);
        http_response_code(201);
        echo json_encode($result);
        exit();
    }

    // Route: PUT /association/:id - Update association
    if ($method === 'PUT' && $segments[0] === 'association' && isset($segments[1])) {
        $id = $segments[1];

        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        $result = $db->update('association', $id, $input);
        echo json_encode($result);
        exit();
    }

    // No route matched
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

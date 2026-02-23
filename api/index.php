<?php
/**
 * Association Manager API
 * PHP/MySQL backend for production
 */

// Production: disable error display (errors logged to server logs instead)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/AuthClass.php';

// Handle CORS with strict origin validation
handleCors();
header('Content-Type: application/json');

// Initialize database (Database class loads config.php internally)
$db = new Database();
$auth = new Auth($db);

// Require authentication for all modification operations (POST, PUT, DELETE)
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
    $auth->requireAuth();
}

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

        // Separate SEPA accounts from association data
        $sepaAccounts = $input['sepaAccounts'] ?? null;
        unset($input['sepaAccounts']);
        
        // Only allow known association columns
        $allowedFields = ['name', 'description', 'logo', 'street', 'zip', 'city', 
                          'contact_person', 'phone', 'facebook', 'instagram', 'website', 'email'];
        $input = array_intersect_key($input, array_flip($allowedFields));

        // Add ID and timestamp
        $data = array_merge([
            'id' => (string)time() . rand(100, 999),
        ], $input);

        $result = $db->insert('association', $data);
        
        // TODO: Handle SEPA accounts if provided
        // if ($sepaAccounts) { ... }
        
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

        // Separate SEPA accounts from association data
        $sepaAccounts = $input['sepaAccounts'] ?? null;
        unset($input['sepaAccounts']);
        
        // Only allow known association columns
        $allowedFields = ['name', 'description', 'logo', 'street', 'zip', 'city', 
                          'contact_person', 'phone', 'facebook', 'instagram', 'website', 'email'];
        $input = array_intersect_key($input, array_flip($allowedFields));

        $result = $db->update('association', $id, $input);
        
        // TODO: Handle SEPA accounts if provided
        // if ($sepaAccounts) { ... }
        
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

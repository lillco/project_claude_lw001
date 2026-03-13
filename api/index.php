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
    // Determine entity type
    $entity = $segments[0] ?? null;
    $id = $segments[1] ?? null;

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

    // ===== CONTACTS ENDPOINTS =====
    
    // Route: GET /contacts - Get all contacts
    if ($method === 'GET' && $path === 'contacts') {
        $result = $db->getAll('contacts');
        echo json_encode($result);
        exit();
    }

    // Route: GET /contacts/:id - Get single contact
    if ($method === 'GET' && $segments[0] === 'contacts' && isset($segments[1]) && !isset($segments[2])) {
        $id = $segments[1];
        $result = $db->getById('contacts', $id);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Contact not found']);
        } else {
            echo json_encode($result);
        }
        exit();
    }

    // Route: POST /contacts - Create new contact
    if ($method === 'POST' && $path === 'contacts') {
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        $data = array_merge([
            'id' => (string)time() . rand(100, 999),
        ], $input);

        $result = $db->insert('contacts', $data);
        http_response_code(201);
        echo json_encode($result);
        exit();
    }

    // Route: PUT /contacts/:id - Update contact
    if ($method === 'PUT' && $segments[0] === 'contacts' && isset($segments[1]) && !isset($segments[2])) {
        $id = $segments[1];

        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        $result = $db->update('contacts', $id, $input);
        echo json_encode($result);
        exit();
    }

    // Route: DELETE /contacts/:id - Delete contact
    if ($method === 'DELETE' && $segments[0] === 'contacts' && isset($segments[1]) && !isset($segments[2])) {
        $id = $segments[1];
        $result = $db->delete('contacts', $id);
        echo json_encode(['success' => true, 'id' => $id]);
        exit();
    }

    // ===== CONTACT COMMUNICATION ENDPOINTS =====

    // Route: GET /contacts/:id/communication - Get all communication channels for a contact
    if ($method === 'GET' && $segments[0] === 'contacts' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'communication') {
        $contactId = $segments[1];
        $result = $db->getWhere('contact_communication', 'contact_id = ?', [$contactId]);
        echo json_encode($result);
        exit();
    }

    // Route: POST /contacts/:id/communication - Add communication channel
    if ($method === 'POST' && $segments[0] === 'contacts' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'communication') {
        $contactId = $segments[1];

        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        $data = array_merge([
            'id' => (string)time() . rand(100, 999),
            'contact_id' => $contactId,
        ], $input);

        $result = $db->insert('contact_communication', $data);
        http_response_code(201);
        echo json_encode($result);
        exit();
    }

    // Route: PUT /communication/:id - Update communication channel
    if ($method === 'PUT' && $segments[0] === 'communication' && isset($segments[1])) {
        $id = $segments[1];

        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            exit();
        }

        $result = $db->update('contact_communication', $id, $input);
        echo json_encode($result);
        exit();
    }

    // Route: DELETE /communication/:id - Delete communication channel
    if ($method === 'DELETE' && $segments[0] === 'communication' && isset($segments[1])) {
        $id = $segments[1];
        $result = $db->delete('contact_communication', $id);
        echo json_encode(['success' => true, 'id' => $id]);
        exit();
    }

    // Generic CRUD routes for categorization tables
    $categorizationEntities = ['category_types', 'categories', 'categorization'];
    
    if (in_array($entity, $categorizationEntities)) {
        switch ($method) {
            case 'GET':
                if ($id) {
                    // Get single record by ID
                    $result = $db->getById($entity, $id);
                    if (!$result) {
                        http_response_code(404);
                        echo json_encode(['error' => 'Record not found']);
                    } else {
                        echo json_encode($result);
                    }
                } else {
                    // Get all records
                    // For categories, JOIN with category_types to get applicableEntities
                    if ($entity === 'categories') {
                        $conn = $db->getConnection();
                        $stmt = $conn->query("
                            SELECT c.*, ct.name as typeName, ct.applicableEntities 
                            FROM categories c
                            LEFT JOIN category_types ct ON c.typeId = ct.id
                        ");
                        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($result);
                    } else {
                        $result = $db->getAll($entity);
                        echo json_encode($result);
                    }
                }
                exit();

            case 'POST':
                // Create new record
                if (!$input) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No data provided']);
                    exit();
                }
                $result = $db->insert($entity, $input);
                http_response_code(201);
                echo json_encode($result);
                exit();

            case 'PUT':
                // Update existing record
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No ID provided']);
                    exit();
                }
                if (!$input) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No data provided']);
                    exit();
                }
                $result = $db->update($entity, $id, $input);
                echo json_encode($result);
                exit();

            case 'DELETE':
                // Delete record
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No ID provided']);
                    exit();
                }
                $result = $db->delete($entity, $id);
                echo json_encode($result);
                exit();

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                exit();
        }
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

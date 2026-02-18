<?php
/**
 * Database Class for MySQL operations
 * Handles connection and CRUD operations
 */

class Database {
    private $conn = null;
    private $config;

    public function __construct() {
        $configFile = __DIR__ . '/config.php';
        
        if (!file_exists($configFile)) {
            throw new Exception(
                'Database configuration file not found. ' .
                'Please create api/config.php from api/config.example.php and add your database credentials.'
            );
        }
        
        $this->config = require $configFile;
        $this->connect();
    }

    /**
     * Establish database connection
     */
    private function connect() {
        try {
            $dbConfig = $this->config['database'];
            
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $dbConfig['host'],
                $dbConfig['port'],
                $dbConfig['name'],
                $dbConfig['charset']
            );

            $this->conn = new PDO(
                $dsn,
                $dbConfig['user'],
                $dbConfig['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            
            // Create tables if they don't exist
            $this->createTables();
        } catch (PDOException $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Create tables if they don't exist
     */
    private function createTables() {
        $sql = "
            CREATE TABLE IF NOT EXISTS association (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                street VARCHAR(255),
                zip VARCHAR(10),
                city VARCHAR(255),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        
        $this->conn->exec($sql);
    }

    /**
     * Get first record from table (for single-record tables)
     */
    public function getFirst($table) {
        $stmt = $this->conn->prepare("SELECT * FROM {$table} LIMIT 1");
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    /**
     * Get record by ID
     */
    public function getById($table, $id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Insert a new record
     */
    public function insert($table, $data) {
        $keys = array_keys($data);
        $values = array_values($data);
        
        $placeholders = implode(', ', array_fill(0, count($keys), '?'));
        $columns = implode(', ', $keys);
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($values);
        
        return $data;
    }

    /**
     * Update a record by ID
     */
    public function update($table, $id, $data) {
        $keys = array_keys($data);
        $values = array_values($data);
        
        $setClause = implode(', ', array_map(function($key) {
            return "{$key} = ?";
        }, $keys));
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([...$values, $id]);
        
        return array_merge(['id' => $id], $data);
    }

    /**
     * Delete a record by ID
     */
    public function delete($table, $id) {
        $stmt = $this->conn->prepare("DELETE FROM {$table} WHERE id = ?");
        $stmt->execute([$id]);
        return ['id' => $id];
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

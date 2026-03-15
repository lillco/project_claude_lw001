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
        // Association table
        $sql = "
            CREATE TABLE IF NOT EXISTS association (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                logo TEXT,
                street VARCHAR(255),
                zip VARCHAR(10),
                city VARCHAR(255),
                contact_person VARCHAR(255),
                phone VARCHAR(50),
                facebook VARCHAR(500),
                instagram VARCHAR(500),
                website VARCHAR(500),
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        $this->conn->exec($sql);
        
        // SEPA accounts table
        $sql = "
            CREATE TABLE IF NOT EXISTS association_sepa (
                id VARCHAR(50) PRIMARY KEY,
                association_id VARCHAR(50),
                bank_name VARCHAR(255),
                iban VARCHAR(50),
                bic VARCHAR(20),
                is_public BOOLEAN DEFAULT 0,
                usage_purpose VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (association_id) REFERENCES association(id) ON DELETE CASCADE
            )
        ";
        $this->conn->exec($sql);
        
        // Category Types table
        $sql = "
            CREATE TABLE IF NOT EXISTS category_types (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                applicableEntities TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        $this->conn->exec($sql);
        
        // Categories table
        $sql = "
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                typeId VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (typeId) REFERENCES category_types(id) ON DELETE CASCADE
            )
        ";
        $this->conn->exec($sql);
        
        // Categorization table (junction table)
        $sql = "
            CREATE TABLE IF NOT EXISTS categorization (
                id VARCHAR(50) PRIMARY KEY,
                entityType VARCHAR(50) NOT NULL,
                entityId VARCHAR(50) NOT NULL,
                categoryId VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
                UNIQUE KEY unique_categorization (entityType, entityId, categoryId)
            )
        ";
        $this->conn->exec($sql);

        // Contacts table
        $sql = "
            CREATE TABLE IF NOT EXISTS contacts (
                id VARCHAR(50) PRIMARY KEY,
                contact_type VARCHAR(50) NOT NULL,
                location_category_id VARCHAR(50),
                status VARCHAR(50) DEFAULT 'active',
                entry_date DATE,
                company_name VARCHAR(255),
                salutation VARCHAR(50),
                contact_person VARCHAR(255),
                street VARCHAR(255),
                zip VARCHAR(10),
                city VARCHAR(255),
                alt_street VARCHAR(255),
                alt_zip VARCHAR(10),
                alt_city VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (location_category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        ";
        $this->conn->exec($sql);

        // Contact communication channels table
        $sql = "
            CREATE TABLE IF NOT EXISTS contact_communication (
                id VARCHAR(50) PRIMARY KEY,
                contact_id VARCHAR(50) NOT NULL,
                type VARCHAR(50) NOT NULL,
                label VARCHAR(255),
                value VARCHAR(500),
                is_primary BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
            )
        ";
        $this->conn->exec($sql);
    }

    /**
     * Get all records from table
     */
    public function getAll($table) {
        $stmt = $this->conn->prepare("SELECT * FROM {$table}");
        $stmt->execute();
        return $stmt->fetchAll();
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
     * Get records matching a WHERE clause
     */
    public function getWhere($table, $where, $params = []) {
        $stmt = $this->conn->prepare("SELECT * FROM {$table} WHERE {$where}");
        $stmt->execute($params);
        return $stmt->fetchAll();
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
     * Get the PDO connection object
     */
    public function getConnection() {
        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

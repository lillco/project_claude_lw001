<?php
/**
 * CENTRAL Database Configuration Example File
 * 
 * This config is shared by ALL modules (lw000, lw001, lw002, lw003)
 * All modules use the SAME database and users table for SSO
 *
 * IMPORTANT: To use this configuration:
 * 1. Copy this file and rename it to: config.php
 * 2. Fill in your actual MySQL credentials below
 * 3. Add config.php to .gitignore to keep credentials secure
 *
 * Command to copy:
 * cp api/config.example.php api/config.php
 *
 * OR on Windows:
 * copy api\config.example.php api\config.php
 */

return [
    'host' => 'localhost',           // MySQL host (e.g., 'localhost', '192.168.1.100', 'db.example.com')
    'port' => 3306,                  // MySQL port (default: 3306)
    'database' => 'lebendiges_weinheim', // Database name (shared across all modules!)
    'user' => 'your_username',       // Your MySQL username
    'password' => 'your_password',   // Your MySQL password
    'charset' => 'utf8mb4'           // Character set
];

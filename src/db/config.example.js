/**
 * Database Configuration Example
 * Copy this file to config.js and update with your settings
 */

export const dbConfig = {
  // Environment: 'development' or 'production'
  environment: process.env.NODE_ENV || 'development',

  // SQLite configuration (for development)
  sqlite: {
    filename: './data/association-manager.db'
  },

  // MySQL configuration (for production)
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'association_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
}

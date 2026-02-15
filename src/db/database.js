/**
 * Database Layer - Supports SQLite (development) and MySQL (production)
 */

import Database from 'better-sqlite3'
import mysql from 'mysql2/promise'

// Try to load config, fall back to defaults if not found
let dbConfig
try {
  const configModule = await import('./config.js')
  dbConfig = configModule.dbConfig
} catch (error) {
  // Config file doesn't exist - use defaults (SQLite for development)
  dbConfig = {
    environment: process.env.NODE_ENV || 'development',
    sqlite: {
      filename: './data/association-manager.db'
    },
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
}

class DatabaseLayer {
  constructor() {
    this.db = null
    this.pool = null
    this.environment = dbConfig.environment
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    if (this.environment === 'production') {
      // MySQL for production
      this.pool = mysql.createPool(dbConfig.mysql)
      console.log('Connected to MySQL database')
    } else {
      // SQLite for development/testing
      this.db = new Database(dbConfig.sqlite.filename)
      this.db.pragma('journal_mode = WAL')
      console.log('Connected to SQLite database')
    }

    await this.createTables()
  }

  /**
   * Create database tables if they don't exist
   */
  async createTables() {
    const tables = {
      association: `
        CREATE TABLE IF NOT EXISTS association (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          street VARCHAR(255),
          zip VARCHAR(10),
          city VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    }

    for (const [tableName, createSQL] of Object.entries(tables)) {
      if (this.environment === 'production') {
        await this.pool.execute(createSQL)
      } else {
        this.db.exec(createSQL)
      }
    }
  }

  /**
   * Execute a query
   */
  async query(sql, params = []) {
    if (this.environment === 'production') {
      const [rows] = await this.pool.execute(sql, params)
      return rows
    } else {
      const stmt = this.db.prepare(sql)
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params)
      } else {
        return stmt.run(...params)
      }
    }
  }

  /**
   * Get all records from a table
   */
  async getAll(tableName) {
    return await this.query(`SELECT * FROM ${tableName}`)
  }

  /**
   * Get a single record by ID
   */
  async getById(tableName, id) {
    const rows = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id])
    return rows[0] || null
  }

  /**
   * Get first record from table (for single-record tables like association)
   */
  async getFirst(tableName) {
    const rows = await this.query(`SELECT * FROM ${tableName} LIMIT 1`)
    return rows[0] || null
  }

  /**
   * Insert a new record
   */
  async insert(tableName, data) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(', ')
    const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`

    await this.query(sql, values)
    return data
  }

  /**
   * Update a record by ID
   */
  async update(tableName, id, data) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map(key => `${key} = ?`).join(', ')
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`

    await this.query(sql, [...values, id])
    return { id, ...data }
  }

  /**
   * Delete a record by ID
   */
  async delete(tableName, id) {
    await this.query(`DELETE FROM ${tableName} WHERE id = ?`, [id])
    return { id }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.environment === 'production') {
      await this.pool.end()
    } else {
      this.db.close()
    }
  }
}

// Export singleton instance
export const database = new DatabaseLayer()

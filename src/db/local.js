/**
 * Local Development Server (Node.js + SQLite)
 * Run with: npm run server
 */

import express from 'express'
import cors from 'cors'
import { database } from './database.js'
import { generateId } from '../utils/dataHelpers.js'

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
await database.initialize()

console.log('✅ Database initialized (SQLite)')

// Helper to handle async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// GET association (single record)
app.get('/api/association', asyncHandler(async (req, res) => {
  const data = await database.getFirst('association')
  res.json(data)
}))

// POST - Create association (first time)
app.post('/api/association', asyncHandler(async (req, res) => {
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  // Add ID and timestamp
  const newData = {
    id: generateId(),
    ...data
  }

  const result = await database.insert('association', newData)
  res.status(201).json(result)
}))

// PUT - Update association
app.put('/api/association/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const result = await database.update('association', id, data)
  res.json(result)
}))

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local development server running on http://localhost:${PORT}`)
  console.log(`   API available at http://localhost:${PORT}/api`)
})

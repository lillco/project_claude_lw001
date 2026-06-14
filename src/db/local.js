/**
 * Local Development Server (Node.js + SQLite)
 * Run with: npm run server
 */

import express from 'express'
import cors from 'cors'
import { database } from './database.js'
import { generateId } from '../utils/dataHelpers.js'

const app = express()
// Port 3002: must not collide with lw002 (3000) and lw003 (3001),
// because lw002's Einzelhandelsplanung reads contacts from this server
const PORT = process.env.PORT || 3002

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

const associationFields = [
  'name',
  'description',
  'logo',
  'street',
  'zip',
  'city',
  'contact_person',
  'phone',
  'facebook',
  'instagram',
  'website',
  'email'
]

const sepaFields = [
  'bank_name',
  'iban',
  'bic',
  'is_public',
  'usage_purpose'
]

const communicationFields = [
  'type',
  'value',
  'note'
]

const contactFields = [
  'contact_type',
  'location_category_id',
  'status',
  'entry_date',
  'company_name',
  'salutation',
  'contact_person',
  'street',
  'zip',
  'city',
  'alt_street',
  'alt_zip',
  'alt_city'
]

const contactChannelFields = [
  'type',
  'label',
  'value',
  'is_primary'
]

const pickFields = (data, fields) => Object.fromEntries(
  Object.entries(data || {}).filter(([key]) => fields.includes(key))
)

const normalizeSepaAccount = (account, associationId) => ({
  id: account.id || `${generateId()}_${Math.floor(Math.random() * 1000000)}`,
  association_id: associationId,
  bank_name: account.bank_name || '',
  iban: account.iban || '',
  bic: account.bic || '',
  is_public: account.is_public ? 1 : 0,
  usage_purpose: account.usage_purpose || ''
})

const normalizeCommunicationChannel = (channel, associationId) => ({
  id: channel.id || `${generateId()}_${Math.floor(Math.random() * 1000000)}`,
  association_id: associationId,
  type: channel.type || '',
  value: channel.value || '',
  note: channel.note || ''
})

const attachSepaAccounts = async (association) => {
  if (!association) return null

  const accounts = await database.getWhere('association_sepa', 'association_id = ?', [association.id])
  return {
    ...association,
    sepaAccounts: accounts.map(account => ({
      ...account,
      is_public: Boolean(account.is_public)
    }))
  }
}

const attachCommunicationChannels = async (association) => {
  if (!association) return null

  const channels = await database.getWhere('association_communication', 'association_id = ?', [association.id])
  return {
    ...association,
    communicationChannels: channels
  }
}

const attachAssociationDetails = async (association) => {
  const withSepa = await attachSepaAccounts(association)
  return await attachCommunicationChannels(withSepa)
}

const normalizeContactChannel = (channel, contactId) => ({
  id: channel.id && !String(channel.id).startsWith('temp_')
    ? channel.id
    : `${generateId()}_${Math.floor(Math.random() * 1000000)}`,
  contact_id: contactId,
  type: channel.type || '',
  label: channel.label || '',
  value: channel.value || '',
  is_primary: channel.is_primary ? 1 : 0
})

const replaceContactChannels = async (contactId, channels = []) => {
  await database.query('DELETE FROM contact_communication WHERE contact_id = ?', [contactId])

  const savedChannels = []
  for (const channel of channels) {
    const normalized = normalizeContactChannel(channel, contactId)
    if (normalized.type && normalized.value) {
      savedChannels.push(await database.insert('contact_communication', normalized))
    }
  }

  return savedChannels
}

const replaceSepaAccounts = async (associationId, accounts = []) => {
  await database.query('DELETE FROM association_sepa WHERE association_id = ?', [associationId])

  const savedAccounts = []
  for (const account of accounts) {
    const normalized = normalizeSepaAccount(account, associationId)
    const hasContent = normalized.bank_name || normalized.iban || normalized.bic || normalized.usage_purpose

    if (hasContent) {
      const saved = await database.insert('association_sepa', normalized)
      savedAccounts.push({
        ...saved,
        is_public: Boolean(saved.is_public)
      })
    }
  }

  return savedAccounts
}

const replaceCommunicationChannels = async (associationId, channels = []) => {
  await database.query('DELETE FROM association_communication WHERE association_id = ?', [associationId])

  const savedChannels = []
  for (const channel of channels) {
    const normalized = normalizeCommunicationChannel(channel, associationId)

    if (normalized.type && normalized.value) {
      savedChannels.push(await database.insert('association_communication', normalized))
    }
  }

  return savedChannels
}

// GET association (single record)
app.get('/api/association', asyncHandler(async (req, res) => {
  const data = await database.getFirst('association')
  res.json(await attachAssociationDetails(data))
}))

// POST - Create association (first time)
app.post('/api/association', asyncHandler(async (req, res) => {
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const { sepaAccounts = [], communicationChannels = [] } = data

  // Add ID and timestamp
  const newData = {
    id: generateId(),
    ...pickFields(data, associationFields)
  }

  const result = await database.insert('association', newData)
  const savedSepaAccounts = await replaceSepaAccounts(result.id, sepaAccounts)
  const savedCommunicationChannels = await replaceCommunicationChannels(result.id, communicationChannels)
  res.status(201).json({
    ...result,
    sepaAccounts: savedSepaAccounts,
    communicationChannels: savedCommunicationChannels
  })
}))

// PUT - Update association
app.put('/api/association/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const { sepaAccounts, communicationChannels } = data
  const associationData = pickFields(data, associationFields)
  const result = Object.keys(associationData).length > 0
    ? await database.update('association', id, associationData)
    : await database.getById('association', id)
  const savedSepaAccounts = Array.isArray(sepaAccounts)
    ? await replaceSepaAccounts(id, sepaAccounts)
    : await database.getWhere('association_sepa', 'association_id = ?', [id])
  const savedCommunicationChannels = Array.isArray(communicationChannels)
    ? await replaceCommunicationChannels(id, communicationChannels)
    : await database.getWhere('association_communication', 'association_id = ?', [id])

  res.json({
    ...result,
    sepaAccounts: savedSepaAccounts.map(account => ({
      ...account,
      is_public: Boolean(account.is_public)
    })),
    communicationChannels: savedCommunicationChannels
  })
}))

// GET SEPA accounts for an association
app.get('/api/association/:id/sepa', asyncHandler(async (req, res) => {
  const { id } = req.params
  const accounts = await database.getWhere('association_sepa', 'association_id = ?', [id])
  res.json(accounts.map(account => ({
    ...account,
    is_public: Boolean(account.is_public)
  })))
}))

// POST - Add SEPA account
app.post('/api/association/:id/sepa', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = pickFields(req.body, sepaFields)
  const result = await database.insert('association_sepa', normalizeSepaAccount(data, id))
  res.status(201).json({
    ...result,
    is_public: Boolean(result.is_public)
  })
}))

// PUT - Update SEPA account
app.put('/api/association_sepa/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = pickFields(req.body, sepaFields)
  const payload = {
    ...data
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'is_public')) {
    payload.is_public = payload.is_public ? 1 : 0
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'No valid data provided' })
  }

  const result = await database.update('association_sepa', id, payload)
  res.json({
    ...result,
    is_public: Boolean(result.is_public)
  })
}))

// DELETE - Delete SEPA account
app.delete('/api/association_sepa/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  await database.delete('association_sepa', id)
  res.json({ success: true, id })
}))

// GET communication channels for an association
app.get('/api/association/:id/communication', asyncHandler(async (req, res) => {
  const { id } = req.params
  const channels = await database.getWhere('association_communication', 'association_id = ?', [id])
  res.json(channels)
}))

// POST - Add communication channel
app.post('/api/association/:id/communication', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = pickFields(req.body, communicationFields)
  const normalized = normalizeCommunicationChannel(data, id)

  if (!normalized.type || !normalized.value) {
    return res.status(400).json({ error: 'Type and value are required' })
  }

  const result = await database.insert('association_communication', normalized)
  res.status(201).json(result)
}))

// PUT - Update communication channel
app.put('/api/association_communication/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = pickFields(req.body, communicationFields)

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No valid data provided' })
  }

  const result = await database.update('association_communication', id, data)
  res.json(result)
}))

// DELETE - Delete communication channel
app.delete('/api/association_communication/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  await database.delete('association_communication', id)
  res.json({ success: true, id })
}))

// ===== CONTACTS ENDPOINTS =====

// GET all contacts
app.get('/api/contacts', asyncHandler(async (req, res) => {
  const contacts = await database.getAll('contacts')
  res.json(contacts)
}))

// GET single contact by ID
app.get('/api/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const contact = await database.getById('contacts', id)
  
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' })
  }
  
  res.json(contact)
}))

// POST - Create new contact
app.post('/api/contacts', asyncHandler(async (req, res) => {
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const { communicationChannels } = data
  const newData = {
    // Client-supplied ids are preserved (used by the vendor migration from lw002)
    id: data.id || generateId(),
    ...pickFields(data, contactFields)
  }

  const result = await database.insert('contacts', newData)
  const savedChannels = Array.isArray(communicationChannels)
    ? await replaceContactChannels(result.id, communicationChannels)
    : []
  res.status(201).json({ ...result, communicationChannels: savedChannels })
}))

// PUT - Update contact
app.put('/api/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const { communicationChannels } = data
  const contactData = pickFields(data, contactFields)
  const result = Object.keys(contactData).length > 0
    ? await database.update('contacts', id, contactData)
    : await database.getById('contacts', id)
  const savedChannels = Array.isArray(communicationChannels)
    ? await replaceContactChannels(id, communicationChannels)
    : await database.getWhere('contact_communication', 'contact_id = ?', [id])

  res.json({ ...result, id, communicationChannels: savedChannels })
}))

// DELETE - Delete contact
app.delete('/api/contacts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  await database.delete('contacts', id)
  res.json({ success: true, id })
}))

// ===== CONTACT COMMUNICATION ENDPOINTS =====

// GET all communication channels of all contacts (bulk read for lw002)
app.get('/api/contact_communication', asyncHandler(async (req, res) => {
  const channels = await database.getAll('contact_communication')
  res.json(channels)
}))

// GET all communication channels for a contact
app.get('/api/contacts/:id/communication', asyncHandler(async (req, res) => {
  const { id } = req.params
  const channels = await database.getWhere('contact_communication', 'contact_id = ?', [id])
  res.json(channels)
}))

// POST - Add communication channel
app.post('/api/contacts/:id/communication', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const newData = {
    id: generateId(),
    contact_id: id,
    ...data
  }

  const result = await database.insert('contact_communication', newData)
  res.status(201).json(result)
}))

// PUT - Update communication channel
app.put('/api/communication/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!data) {
    return res.status(400).json({ error: 'No data provided' })
  }

  const result = await database.update('contact_communication', id, data)
  res.json(result)
}))

// DELETE - Delete communication channel
app.delete('/api/communication/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  await database.delete('contact_communication', id)
  res.json({ success: true, id })
}))

// ===== CATEGORY FRAMEWORK ENDPOINTS =====
// Generic CRUD for category_types, categories and categorization
// (used by the lw001 frontend and read by lw002 for partner/retail planning)

const categoryEntities = ['category_types', 'categories', 'categorization']

for (const entity of categoryEntities) {
  app.get(`/api/${entity}`, asyncHandler(async (req, res) => {
    res.json(await database.getAll(entity))
  }))

  app.get(`/api/${entity}/:id`, asyncHandler(async (req, res) => {
    const record = await database.getById(entity, req.params.id)
    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json(record)
  }))

  app.post(`/api/${entity}`, asyncHandler(async (req, res) => {
    const data = req.body
    if (!data) {
      return res.status(400).json({ error: 'No data provided' })
    }
    // categorization is a pure join table: re-linking the same
    // (entityType, entityId, categoryId) must be idempotent, not a 500
    if (entity === 'categorization') {
      const existing = await database.getWhere(
        'categorization',
        'entityType = ? AND entityId = ? AND categoryId = ?',
        [data.entityType ?? '', data.entityId ?? '', data.categoryId ?? '']
      )
      if (existing && existing.length > 0) {
        return res.status(200).json(existing[0])
      }
    }
    const result = await database.insert(entity, { id: data.id || generateId(), ...data })
    res.status(201).json(result)
  }))

  app.put(`/api/${entity}/:id`, asyncHandler(async (req, res) => {
    const data = req.body
    if (!data) {
      return res.status(400).json({ error: 'No data provided' })
    }
    const result = await database.update(entity, req.params.id, data)
    res.json(result)
  }))

  app.delete(`/api/${entity}/:id`, asyncHandler(async (req, res) => {
    await database.delete(entity, req.params.id)
    res.json({ success: true, id: req.params.id })
  }))
}

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

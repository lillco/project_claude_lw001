/**
 * API Client
 * Detects environment and routes requests to appropriate backend
 * - Development: Uses Node.js backend with SQLite
 * - Production: Uses PHP backend with MySQL
 */

// Detect if we're running in production (served from web server)
const isProduction = window.location.protocol === 'https:' ||
                     window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1'

// API base URL
const API_BASE_URL = isProduction
  ? '/association/api/index.php'  // Production: PHP backend in /association/ subdirectory
  : 'http://localhost:3000/api'  // Development: Node.js backend

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

/**
 * Association API
 */
export const associationAPI = {
  // Get the association (single record)
  get: () => apiRequest('/association'),

  // Create association (first time)
  create: (data) => apiRequest('/association', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Update association
  update: (id, data) => apiRequest(`/association/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Export environment info for debugging
export const apiInfo = {
  isProduction,
  baseURL: API_BASE_URL,
  backend: isProduction ? 'PHP/MySQL' : 'Node.js/SQLite'
}

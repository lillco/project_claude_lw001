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
  : 'http://localhost:3002/api'  // Development: Node.js backend (port 3002, see src/db/local.js)

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

/**
 * Association SEPA Accounts API
 */
export const associationSepaAPI = {
  getAll: (associationId) => apiRequest(`/association/${associationId}/sepa`),

  create: (associationId, data) => apiRequest(`/association/${associationId}/sepa`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiRequest(`/association_sepa/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiRequest(`/association_sepa/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Association Communication API
 */
export const associationCommunicationAPI = {
  getAll: (associationId) => apiRequest(`/association/${associationId}/communication`),

  create: (associationId, data) => apiRequest(`/association/${associationId}/communication`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiRequest(`/association_communication/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiRequest(`/association_communication/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Category Types API
 */
export const categoryTypesAPI = {
  getAll: () => apiRequest('/category_types'),

  getById: (id) => apiRequest(`/category_types/${id}`),

  create: (data) => apiRequest('/category_types', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiRequest(`/category_types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiRequest(`/category_types/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Categories API
 */
export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),

  getById: (id) => apiRequest(`/categories/${id}`),

  create: (data) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Categorization API
 */
export const categorizationAPI = {
  getAll: () => apiRequest('/categorization'),

  getById: (id) => apiRequest(`/categorization/${id}`),

  getByEntity: (entityType, entityId) =>
    apiRequest(`/categorization?entityType=${entityType}&entityId=${entityId}`),

  getByCategory: (categoryId) =>
    apiRequest(`/categorization?categoryId=${categoryId}`),

  create: (data) => apiRequest('/categorization', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id, data) => apiRequest(`/categorization/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (id) => apiRequest(`/categorization/${id}`, {
    method: 'DELETE'
  })
}

/**
 * Generic API Client
 */
export const apiClient = {
  get: (endpoint) => apiRequest(endpoint),
  
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE'
  })
}

// Export environment info for debugging
export const apiInfo = {
  isProduction,
  baseURL: API_BASE_URL,
  backend: isProduction ? 'PHP/MySQL' : 'Node.js/SQLite'
}

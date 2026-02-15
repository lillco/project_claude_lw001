/**
 * Authentication API Client
 * Points to the CENTRAL auth endpoint at /api/auth_endpoints.php
 * This is shared across ALL modules for SSO
 */

const isProduction = import.meta.env.PROD
// CENTRAL auth endpoint - shared with lw000, lw002, lw003, etc.
const AUTH_BASE_URL = isProduction
  ? '/api/auth_endpoints.php'
  : 'http://localhost:3000/api/auth'

/**
 * Login user
 */
export async function login(username, password) {
  const url = `${AUTH_BASE_URL}/login`
  console.log('Fetching login from:', url)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify({ username, password }),
  })

  console.log('Login response status:', response.status)

  // Get response as text first to see what we're getting
  const responseText = await response.text()
  console.log('Login response text:', responseText)

  // Try to parse as JSON
  let data
  try {
    data = JSON.parse(responseText)
    console.log('Login response data:', data)
  } catch (e) {
    console.error('Failed to parse response as JSON:', e)
    throw new Error('Server returned invalid response (HTML error). Check server logs.')
  }

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  return data
}

/**
 * Logout user
 */
export async function logout() {
  const response = await fetch(`${AUTH_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Logout failed')
  }

  return data
}

/**
 * Check authentication status
 */
export async function checkAuthStatus() {
  try {
    const url = `${AUTH_BASE_URL}/me`
    console.log('Checking auth status at:', url)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    console.log('Auth check response status:', response.status)

    if (!response.ok) {
      return { authenticated: false }
    }

    // Get response as text first
    const responseText = await response.text()
    console.log('Auth check response text:', responseText)

    try {
      const data = JSON.parse(responseText)
      console.log('Auth check data:', data)
      return data
    } catch (e) {
      console.error('Failed to parse auth check response:', e)
      return { authenticated: false }
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return { authenticated: false }
  }
}

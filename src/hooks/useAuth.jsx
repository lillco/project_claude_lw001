import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import * as authAPI from '../api/auth'

// Create context for auth state
const AuthContext = createContext(null)

/**
 * AuthProvider component to wrap the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const status = await authAPI.checkAuthStatus()
      setAuthenticated(status.authenticated)
      setUser(status.user || null)
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      console.log('useAuth.login called with:', { username })
      const result = await authAPI.login(username, password)
      console.log('authAPI.login result:', result)

      if (result.success) {
        setAuthenticated(true)
        setUser(result.user)
        console.log('Login successful, user:', result.user)
        return { success: true }
      } else {
        console.log('Login failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Login exception:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setAuthenticated(false)
      setUser(null)
    }
  }, [])

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

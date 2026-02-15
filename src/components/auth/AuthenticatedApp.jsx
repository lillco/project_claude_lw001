import React from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import LoginPage from './LoginPage'

export default function AuthenticatedApp({ children }) {
  const { authenticated, loading, login } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#76b332] mx-auto mb-4"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!authenticated) {
    return <LoginPage onLogin={login} />
  }

  // Show the main app if authenticated
  return children
}

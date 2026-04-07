import React, { useState } from 'react'
import { LogIn } from 'lucide-react'
import TestBanner from '../TestBanner'
import { isTestEnvironment, TEST_COLOR, PROD_COLOR } from '../../config/environment'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const isTest = isTestEnvironment()
  const primaryColor = isTest ? TEST_COLOR : PROD_COLOR
  const primaryTextColor = isTest ? '#FFFFFF' : '#000000'
  const gradientFrom = isTest ? 'from-purple-50' : 'from-gray-50'
  const gradientTo = isTest ? 'to-purple-100' : 'to-gray-100'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Login attempt:', { username })

    try {
      const result = await onLogin(username, password)
      console.log('Login result:', result)
      if (!result.success) {
        setError(result.error || 'Login fehlgeschlagen')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TestBanner />
      <div className={`flex-1 bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center px-4`}>
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border border-black/15" style={{ backgroundColor: primaryColor }}>
              <LogIn className="w-8 h-8" style={{ color: primaryTextColor }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
              Vereinsverwaltung
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Bitte melden Sie sich an</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Benutzername
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="admin"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{ '--tw-ring-color': primaryColor }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-black/20"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                backgroundColor: primaryColor,
                color: primaryTextColor,
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  <span>Anmelden...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Anmelden</span>
                </>
              )}
            </button>
          </form>

          {/* Organization Info */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold">Lebendiges Weinheim e.V.</p>
            <p className="text-xs mt-1">&copy; {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Vereinsverwaltung &copy; {new Date().getFullYear()}
        </div>
      </div>
      </div>
    </div>
  )
}

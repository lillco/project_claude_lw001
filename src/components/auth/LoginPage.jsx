import React, { useState } from 'react'
import { LogIn } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#76b332] rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
              Vereinsverwaltung
            </h1>
            <p className="text-gray-600 mt-2">Bitte melden Sie sich an</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Benutzername
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#76b332] focus:border-transparent"
                placeholder="admin"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#76b332] focus:border-transparent"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#76b332] text-white py-3 rounded font-semibold hover:bg-[#5a8a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="font-semibold">Lebendiges Weinheim e.V.</p>
            <p className="text-xs mt-1">&copy; {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Vereinsverwaltung &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

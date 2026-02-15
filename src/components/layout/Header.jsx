import React from 'react'
import { LogOut, User, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-[#76b332] text-black shadow-lg">
      <div className="max-w-[1160px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title">
              Lebendiges Weinheim
            </h1>
            <p className="header-subtitle">
              Vereinsverwaltung
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Link - only visible for admins */}
            {user?.is_admin === 1 && (
              <a
                href="/admin.html"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                title="Benutzerverwaltung"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin</span>
              </a>
            )}

            {/* User Info and Logout */}
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.full_name || user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

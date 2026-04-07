import React from 'react'
import { ArrowLeft, Building2, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ThemeToggle from '../shared/ThemeToggle'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-[#BAF0DB] text-black shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
      <div className="max-w-[1160px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black/10 border border-black/15 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="header-title">Lebendiges Weinheim</h1>
              <p className="header-subtitle">Vereinsverwaltung</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-black/10 hover:bg-black/20 rounded transition-colors border border-black/15"
              title="Zurueck zum Launchpad"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Zurueck zum Launchpad</span>
            </a>

            <div className="flex items-center gap-3 bg-black/10 px-4 py-2 rounded border border-black/15">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.full_name || user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1 bg-black/10 hover:bg-black/20 rounded transition-colors border border-black/15"
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

import React, { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, Grid, LogOut, Moon, Sun, Monitor } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useTheme } from '../../hooks/useTheme'

function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = (user?.full_name || user?.username || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const themeIcons = { light: Sun, dark: Moon, system: Monitor }
  const themeOrder = ['light', 'dark', 'system']
  const ThemeIcon = themeIcons[theme] || Monitor
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  const themeLabel = { light: 'Hell', dark: 'Dunkel', system: 'System' }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-[#BAF0DB] dark:bg-gray-800 text-black dark:text-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.10)]">
      <div className="max-w-[1160px] mx-auto px-6 h-14 flex items-center justify-between">

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-black dark:text-gray-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-black dark:text-gray-100">Lebendiges Weinheim</span>
            <span className="text-black/40 dark:text-white/30 text-sm">·</span>
            <span className="text-sm text-black/70 dark:text-gray-400">Vereinsverwaltung</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(nextTheme)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={`Darstellung: ${themeLabel[theme]}`}
          >
            <ThemeIcon className="w-4 h-4 text-black dark:text-gray-100" />
          </button>

          {/* Back to Launchpad */}
          <a
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Zum Launchpad"
          >
            <Grid className="w-4 h-4 text-black dark:text-gray-100" />
          </a>

          {/* User menu */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-1.5 pl-1 pr-2 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-black/20 dark:bg-white/20 flex items-center justify-center text-xs font-semibold text-black dark:text-gray-100">
                {initials}
              </div>
              <ChevronDown className="w-3 h-3 text-black/60 dark:text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-black/10 dark:border-white/10 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Angemeldet</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); logout() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header

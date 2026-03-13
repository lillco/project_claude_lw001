import React from 'react'
import { Settings } from 'lucide-react'

function Navigation({ activeGroup, activeTab, onGroupChange, onTabChange }) {
  const groups = [
    { id: 'verwaltung', label: 'Verwaltung' },
    { id: 'einstellungen', icon: Settings, isSettings: true }
  ]

  const tabs = {
    verwaltung: [
      { id: 'verein', label: 'Verein' },
      { id: 'organe', label: 'Organe' },
      { id: 'mitglieder', label: 'Mitglieder' },
      { id: 'einzelhaendler', label: 'Einzelhändler' }
    ],
    einstellungen: [
      { id: 'categories', label: 'Kategorien' },
      { id: 'category_types', label: 'Typen' },
      { id: 'categorizations', label: 'Kategorisierung' }
    ]
  }

  const handleGroupChange = (groupId) => {
    onGroupChange(groupId)
    const firstTab = tabs[groupId][0].id
    onTabChange(firstTab)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="flex justify-between items-center border-b border-gray-200">
          <div className="flex gap-1">
            {groups.filter(group => !group.isSettings).map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={`px-6 py-4 font-semibold transition-all relative ${
                  activeGroup === group.id
                    ? 'text-[#76b332] border-b-2 border-[#76b332]'
                    : 'text-black hover:text-[#76b332] hover:bg-gray-50'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {group.label}
              </button>
            ))}
          </div>

          {groups.filter(group => group.isSettings).map((group) => {
            const Icon = group.icon
            return (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={`px-4 py-4 transition-all relative ${
                  activeGroup === group.id
                    ? 'text-[#76b332] border-b-2 border-[#76b332]'
                    : 'text-gray-600 hover:text-[#76b332] hover:bg-gray-50'
                }`}
                title="Einstellungen"
              >
                <Icon className="w-6 h-6" />
              </button>
            )
          })}
        </div>

        <div className="flex gap-1 py-2">
          {tabs[activeGroup].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-[#76b332] text-white shadow-md'
                  : 'text-black hover:bg-gray-100'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation

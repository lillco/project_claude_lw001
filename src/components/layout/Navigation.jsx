import React from 'react'

function Navigation({ activeGroup, activeTab, onGroupChange, onTabChange }) {
  const groups = [
    { id: 'verwaltung', label: 'Verwaltung' }
  ]

  const tabs = {
    verwaltung: [
      { id: 'verein', label: 'Verein' }
    ]
  }

  const handleGroupChange = (groupId) => {
    onGroupChange(groupId)
    // Switch to first tab of new group
    const firstTab = tabs[groupId][0].id
    onTabChange(firstTab)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-[1160px] mx-auto px-6">
        {/* Group level navigation */}
        <div className="flex justify-between items-center border-b border-gray-200">
          <div className="flex gap-1">
            {groups.map((group) => (
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
        </div>

        {/* Tab level navigation */}
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

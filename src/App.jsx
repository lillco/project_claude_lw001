import React, { useState } from 'react'
import { useApi } from './hooks/useApi'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import AssociationForm from './components/forms/AssociationForm'
import Modal from './components/shared/Modal'
import { Edit } from 'lucide-react'

function App() {
  // API Hook
  const api = useApi()

  // UI state
  const [activeGroup, setActiveGroup] = useState('verwaltung')
  const [activeTab, setActiveTab] = useState('verein')
  const [editMode, setEditMode] = useState(false)

  // Get the association (single record)
  const association = api.association

  const handleGroupChange = (groupId) => {
    setActiveGroup(groupId)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleSave = async (data) => {
    try {
      if (association) {
        // Update existing
        await api.updateAssociation(association.id, data)
      } else {
        // Create new (first time)
        await api.createAssociation(data)
      }
      setEditMode(false)
    } catch (err) {
      console.error('Failed to save association:', err)
      alert(`Fehler beim Speichern: ${err.message}`)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
  }

  // Show loading state
  if (api.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#76b332] mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Daten...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (api.error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Fehler beim Laden der Daten: {api.error}</p>
          <button
            onClick={api.reload}
            className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28]"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <Navigation
        activeGroup={activeGroup}
        activeTab={activeTab}
        onGroupChange={handleGroupChange}
        onTabChange={handleTabChange}
      />

      <main className="max-w-[1160px] mx-auto px-6 py-8">
        <div>
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeTab === 'verein' && 'Verein'}
            </h2>
            
            {/* Edit button - only show if not in edit mode and association exists */}
            {activeTab === 'verein' && !editMode && association && (
              <button
                onClick={handleEdit}
                className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28] transition-colors flex items-center gap-2 font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Edit className="w-5 h-5" />
                Bearbeiten
              </button>
            )}
          </div>

          {/* Form Modal */}
          <Modal
            isOpen={editMode}
            onClose={handleCancel}
            title={association ? 'Verein bearbeiten' : 'Verein anlegen'}
            size="large"
          >
            <AssociationForm
              association={association}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </Modal>

          {/* Content */}
          {activeTab === 'verein' && (
            <div>
              {association ? (
                // Display association data
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Name
                      </label>
                      <p className="text-lg text-gray-900">{association.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Straße
                      </label>
                      <p className="text-lg text-gray-900">{association.street || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        PLZ
                      </label>
                      <p className="text-lg text-gray-900">{association.zip || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Stadt
                      </label>
                      <p className="text-lg text-gray-900">{association.city || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Beschreibung
                      </label>
                      <p className="text-lg text-gray-900 whitespace-pre-wrap">{association.description || '-'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // No association yet - show create button
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-4">Noch kein Verein angelegt.</p>
                  <button
                    onClick={handleEdit}
                    className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28] transition-colors font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Verein anlegen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

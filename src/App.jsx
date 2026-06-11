import React, { useState } from 'react'
import { generateId } from './utils/dataHelpers'
import { useApi } from './hooks/useApi'
import TestBanner from './components/TestBanner'
import Header from './components/layout/Header'
import Navigation from './components/layout/Navigation'
import AssociationForm from './components/forms/AssociationForm'
import ContactForm from './components/forms/ContactForm'
import CategoryTypeForm from './components/forms/CategoryTypeForm'
import CategoryForm from './components/forms/CategoryForm'
import CategorizationForm from './components/forms/CategorizationForm'
import ContactsTable from './components/tables/ContactsTable'
import CategoryTypesTable from './components/tables/CategoryTypesTable'
import CategoriesTable from './components/tables/CategoriesTable'
import CategorizationsTable from './components/tables/CategorizationsTable'
import Modal from './components/shared/Modal'
import { Edit, Plus } from 'lucide-react'

function App() {
  const api = useApi()

  const [activeGroup, setActiveGroup] = useState('verwaltung')
  const [activeTab, setActiveTab] = useState('verein')
  const [editingId, setEditingId] = useState(null)
  const [viewMode, setViewMode] = useState(false)

  const association = api.association
  const contactTabs = ['organe', 'mitglieder', 'einzelhaendler']
  const settingsTabs = ['category_types', 'categories', 'categorizations']

  const handleGroupChange = (groupId) => {
    setActiveGroup(groupId)
    setEditingId(null)
    setViewMode(false)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setEditingId(null)
    setViewMode(false)
  }

  const handleEdit = (id) => {
    setEditingId(id)
    setViewMode(false)
  }

  const handleRowClick = (id) => {
    setEditingId(id)
    setViewMode(true)
  }

  const handleChangeToEdit = () => {
    setViewMode(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setViewMode(false)
  }

  const getEntityType = () => {
    switch (activeTab) {
      case 'category_types':
        return 'category_type'
      case 'categories':
        return 'category'
      case 'categorizations':
        return 'categorization'
      default:
        return null
    }
  }

  const addItem = async (type, data) => {
    switch (type) {
      case 'category_type': {
        const payload = {
          ...data,
          id: data.id || `type_${generateId()}`
        }
        await api.addCategoryType(payload)
        break
      }
      case 'category': {
        const payload = {
          ...data,
          id: data.id || `cat_${generateId()}`
        }
        await api.addCategory(payload)
        break
      }
      case 'categorization': {
        for (const categoryId of data.categoryIds) {
          await api.addCategorization({
            id: `link_${generateId()}_${Math.random().toString(36).slice(2, 7)}`,
            entityType: data.entityType,
            entityId: data.entityId,
            categoryId
          })
        }
        break
      }
      default:
        break
    }
  }

  const updateItem = async (type, id, data) => {
    switch (type) {
      case 'category_type':
        await api.updateCategoryType(id, data)
        break
      case 'category':
        await api.updateCategory(id, data)
        break
      case 'categorization': {
        const oldCategorizations = api.categorizations.filter(
          item => item.entityType === data.entityType && item.entityId === data.entityId
        )
        for (const item of oldCategorizations) {
          await api.deleteCategorization(item.id)
        }
        for (const categoryId of data.categoryIds) {
          await api.addCategorization({
            id: `link_${generateId()}_${Math.random().toString(36).slice(2, 7)}`,
            entityType: data.entityType,
            entityId: data.entityId,
            categoryId
          })
        }
        break
      }
      default:
        break
    }
  }

  const deleteItem = async (type, id) => {
    switch (type) {
      case 'category_type':
        await api.deleteCategoryType(id)
        break
      case 'category':
        await api.deleteCategory(id)
        break
      case 'categorization':
        await api.deleteCategorization(id)
        break
      default:
        break
    }
  }

  const handleDelete = (type, id) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      deleteItem(type, id)
    }
  }

  const handleAdd = () => {
    if (activeTab === 'verein') {
      setEditingId(association?.id || 'new')
      setViewMode(false)
      return
    }
    setEditingId('new')
    setViewMode(false)
  }

  const handleSave = async (data) => {
    try {
      if (activeTab === 'verein') {
        if (association?.id) {
          await api.updateAssociation(association.id, data)
        } else {
          await api.createAssociation(data)
        }
        setEditingId(null)
        return
      }

      // Handle contacts
      if (contactTabs.includes(activeTab)) {
        if (editingId === 'new') {
          await api.addContact(data)
        } else {
          await api.updateContact(editingId, data)
        }
        setEditingId(null)
        setViewMode(false)
        return
      }

      const type = getEntityType()
      if (!type) return

      if (editingId === 'new') {
        await addItem(type, data)
      } else {
        await updateItem(type, editingId, data)
      }
      setEditingId(null)
      setViewMode(false)
    } catch (error) {
      console.error('Failed to save item:', error)
      alert(`Fehler beim Speichern: ${error.message}`)
    }
  }

  const getContactType = () => {
    switch (activeTab) {
      case 'organe': return 'organ'
      case 'mitglieder': return 'member'
      case 'einzelhaendler': return 'retailer'
      default: return null
    }
  }

  const getEditingItem = () => {
    if (!editingId || editingId === 'new') return null

    switch (activeTab) {
      case 'verein':
        return association
      case 'organe':
      case 'mitglieder':
      case 'einzelhaendler':
        return api.contacts.find(item => item.id === editingId) || null
      case 'category_types':
        return api.categoryTypes.find(item => item.id === editingId) || null
      case 'categories':
        return api.categories.find(item => item.id === editingId) || null
      case 'categorizations':
        return api.categorizations.find(item => item.id === editingId) || null
      default:
        return null
    }
  }

  const getModalTitle = () => {
    if (activeTab === 'verein') {
      return association ? 'Verein bearbeiten' : 'Verein anlegen'
    }

    const action = viewMode ? '' : editingId === 'new' ? 'Neu: ' : 'Bearbeiten: '

    switch (activeTab) {
      case 'organe':
        return `${action}Organ`
      case 'mitglieder':
        return `${action}Mitglied`
      case 'einzelhaendler':
        return `${action}Einzelhändler`
      case 'category_types':
        return `${action}Kategorietyp`
      case 'categories':
        return `${action}Kategorie`
      case 'categorizations':
        return `${action}Kategorisierung`
      default:
        return ''
    }
  }

  const renderForm = () => {
    const item = getEditingItem()

    switch (activeTab) {
      case 'verein':
        return (
          <AssociationForm
            association={association}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      case 'organe':
      case 'mitglieder':
      case 'einzelhaendler':
        return (
          <ContactForm
            contact={item}
            contactType={getContactType()}
            categories={api.categories}
            onSave={handleSave}
            onCancel={handleCancel}
            viewMode={viewMode}
            onChangeToEdit={handleChangeToEdit}
          />
        )
      case 'category_types':
        return (
          <CategoryTypeForm
            categoryType={item}
            onSave={handleSave}
            onCancel={handleCancel}
            viewMode={viewMode}
            onChangeToEdit={handleChangeToEdit}
          />
        )
      case 'categories':
        return (
          <CategoryForm
            category={item}
            categoryTypes={api.categoryTypes}
            onSave={handleSave}
            onCancel={handleCancel}
            viewMode={viewMode}
            onChangeToEdit={handleChangeToEdit}
          />
        )
      case 'categorizations':
        return (
          <CategorizationForm
            categorization={item}
            categorizations={api.categorizations}
            categories={api.categories}
            association={association}
            onSave={handleSave}
            onCancel={handleCancel}
            viewMode={viewMode}
            onChangeToEdit={handleChangeToEdit}
          />
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'verein':
        return (
          <div>
            {association ? (
              <div className="space-y-6">
                <div className="bg-white border border-black/15 rounded-lg shadow-[0_8px_18px_rgba(0,0,0,0.12)] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black border-b border-black/20 pb-2">Firmierung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {association.logo && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Logo
                        </label>
                        <img
                          src={association.logo}
                          alt="Vereinslogo"
                          className="w-32 h-32 object-contain border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Name
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.name}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Beschreibung
                      </label>
                      <p className="text-lg text-gray-900 whitespace-pre-wrap">{association.description || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/15 rounded-lg shadow-[0_8px_18px_rgba(0,0,0,0.12)] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black border-b border-black/20 pb-2">Geschaeftsstelle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Straße
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.street || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        PLZ
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.zip || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ort
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.city || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ansprechpartner
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.contact_person || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Telefonnummer
                      </label>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{association.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/15 rounded-lg shadow-[0_8px_18px_rgba(0,0,0,0.12)] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black border-b border-black/20 pb-2">Web und Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Website
                      </label>
                      {association.website ? (
                        <a href={association.website} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                          {association.website}
                        </a>
                      ) : (
                        <p className="text-lg text-gray-900 dark:text-gray-100">-</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        E-Mail
                      </label>
                      {association.email ? (
                        <a href={`mailto:${association.email}`} className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                          {association.email}
                        </a>
                      ) : (
                        <p className="text-lg text-gray-900 dark:text-gray-100">-</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Facebook
                      </label>
                      {association.facebook ? (
                        <a href={association.facebook} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                          {association.facebook}
                        </a>
                      ) : (
                        <p className="text-lg text-gray-900 dark:text-gray-100">-</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Instagram
                      </label>
                      {association.instagram ? (
                        <a href={association.instagram} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 dark:text-blue-400 hover:underline">
                          {association.instagram}
                        </a>
                      ) : (
                        <p className="text-lg text-gray-900 dark:text-gray-100">-</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-black/15 rounded-lg shadow-[0_8px_18px_rgba(0,0,0,0.12)] p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black border-b border-black/20 pb-2">Bankverbindung</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    SEPA-Konten werden hier angezeigt (noch nicht implementiert)
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Noch kein Verein angelegt.</p>
                <button
                  onClick={handleAdd}
                  className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] transition-colors font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Verein anlegen
                </button>
              </div>
            )}
          </div>
        )
      case 'category_types':
        return (
          <CategoryTypesTable
            categoryTypes={api.categoryTypes}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete('category_type', id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      case 'categories':
        return (
          <CategoriesTable
            categories={api.categories}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete('category', id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      case 'organe':
        return (
          <ContactsTable
            contacts={api.contacts}
            contactType="organ"
            onEdit={handleEdit}
            onDelete={(id) => api.deleteContact(id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      case 'mitglieder':
        return (
          <ContactsTable
            contacts={api.contacts}
            contactType="member"
            onEdit={handleEdit}
            onDelete={(id) => api.deleteContact(id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      case 'einzelhaendler':
        return (
          <ContactsTable
            contacts={api.contacts}
            contactType="retailer"
            onEdit={handleEdit}
            onDelete={(id) => api.deleteContact(id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      case 'categorizations':
        return (
          <CategorizationsTable
            categorizations={api.categorizations}
            categories={api.categories}
            association={association}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete('categorization', id)}
            onRowClick={handleRowClick}
            showSearch={!editingId}
          />
        )
      default:
        return <div>Unbekannte Ansicht</div>
    }
  }

  if (api.loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Daten...</p>
        </div>
      </div>
    )
  }

  if (api.error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Fehler beim Laden der Daten: {api.error}</p>
          <button
            onClick={api.reload}
            className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9]"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <TestBanner />
      <div className="md:sticky md:top-0 md:z-40">
        <Header />

        <Navigation
          activeGroup={activeGroup}
          activeTab={activeTab}
          onGroupChange={handleGroupChange}
          onTabChange={handleTabChange}
        />
      </div>

      <main className="max-w-[1160px] mx-auto px-6 py-8">
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
              {activeTab === 'verein' && 'Verein'}
              {activeTab === 'organe' && 'Organe'}
              {activeTab === 'mitglieder' && 'Mitglieder'}
              {activeTab === 'einzelhaendler' && 'Einzelhändler'}
              {activeTab === 'category_types' && 'Kategorietypen'}
              {activeTab === 'categories' && 'Kategorien'}
              {activeTab === 'categorizations' && 'Kategorisierung'}
            </h2>

            {activeTab === 'verein' && association && (
              <button
                onClick={handleAdd}
                className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] transition-colors flex items-center gap-2 font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Edit className="w-5 h-5" />
                Bearbeiten
              </button>
            )}

            {(contactTabs.includes(activeTab) || settingsTabs.includes(activeTab)) && (
              <button
                onClick={handleAdd}
                className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] transition-colors flex items-center gap-2 font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Plus className="w-5 h-5" />
                Neu hinzufügen
              </button>
            )}
          </div>

          <Modal
            isOpen={!!editingId}
            onClose={handleCancel}
            title={getModalTitle()}
            size={activeTab === 'verein' ? 'large' : 'xlarge'}
          >
            {renderForm()}
          </Modal>

          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App



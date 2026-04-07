import React, { useState, useEffect } from 'react'
import { Save, X, Edit } from 'lucide-react'

function CategorizationForm({
  categorization,
  categorizations,
  categories,
  association,
  onSave,
  onCancel,
  viewMode,
  onChangeToEdit
}) {
  const [formData, setFormData] = useState({
    entityType: 'association',
    entityId: '',
    selectedCategories: []
  })

  useEffect(() => {
    if (categorization) {
      const entityCats = categorizations.filter(
        item => item.entityType === categorization.entityType && item.entityId === categorization.entityId
      )

      setFormData({
        entityType: categorization.entityType,
        entityId: categorization.entityId,
        selectedCategories: entityCats.map(item => item.categoryId)
      })
      return
    }

    setFormData({
      entityType: 'association',
      entityId: association?.id || '',
      selectedCategories: []
    })
  }, [categorization, categorizations, association])

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!association?.id) {
      alert('Bitte zuerst einen Verein anlegen.')
      return
    }

    if (formData.selectedCategories.length === 0) {
      alert('Bitte mindestens eine Kategorie auswaehlen.')
      return
    }

    onSave({
      entityType: 'association',
      entityId: association.id,
      categoryIds: formData.selectedCategories
    })
  }

  return (
    <div className="bg-green-50 dark:bg-gray-800 p-6 rounded mb-6 shadow-[6px_6px_9px_rgba(0,0,0,0.1)]">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
        {categorization ? (viewMode ? 'Kategorisierung anzeigen' : 'Kategorisierung bearbeiten') : 'Neue Kategorisierung'}
      </h3>

      {!association?.id && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 rounded">
          Bitte zuerst den Verein speichern, bevor eine Kategorisierung angelegt wird.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entitaet
            </label>
            <input
              type="text"
              value="Verein"
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={association?.name || '-'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategorien
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {categories.map(category => (
              <label
                key={category.id}
                className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                  formData.selectedCategories.includes(category.id)
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                } ${viewMode ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  disabled={viewMode || !association?.id}
                  className="mr-2"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Keine Kategorien verfuegbar. Bitte zuerst Kategorien anlegen.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {!viewMode && (
            <button
              type="submit"
              disabled={!association?.id}
              className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              Speichern
            </button>
          )}
          {viewMode && (
            <button
              type="button"
              onClick={onChangeToEdit}
              className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] flex items-center gap-2 font-semibold transition-colors"
            >
              <Edit className="w-5 h-5" />
              Aendern
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-3 rounded shadow-md hover:bg-gray-600 flex items-center gap-2 font-semibold transition-colors"
          >
            <X className="w-5 h-5" />
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategorizationForm


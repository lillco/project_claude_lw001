import React, { useState, useEffect } from 'react'

function CategoryTypeForm({ categoryType, onSave, onCancel, viewMode, onChangeToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    applicableEntities: [],
    description: ''
  })

  const availableEntities = ['association']
  const entityLabels = {
    association: 'Verein'
  }

  useEffect(() => {
    if (categoryType) {
      const entities = categoryType.applicableEntities
        ? categoryType.applicableEntities.split(',').map(entity => entity.trim()).filter(Boolean)
        : []

      setFormData({
        name: categoryType.name || '',
        applicableEntities: entities,
        description: categoryType.description || ''
      })
    } else {
      setFormData({
        name: '',
        applicableEntities: ['association'],
        description: ''
      })
    }
  }, [categoryType])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEntityToggle = (entity) => {
    setFormData(prev => ({
      ...prev,
      applicableEntities: prev.applicableEntities.includes(entity)
        ? prev.applicableEntities.filter(item => item !== entity)
        : [...prev.applicableEntities, entity]
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      ...formData,
      applicableEntities: formData.applicableEntities.join(',')
    }

    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={viewMode}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="z.B. Bereich, Sparte, Struktur"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Anwendbare Entitaeten
        </label>
        <div className="space-y-2">
          {availableEntities.map(entity => (
            <label key={entity} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.applicableEntities.includes(entity)}
                onChange={() => handleEntityToggle(entity)}
                disabled={viewMode}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{entityLabels[entity] || entity}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          disabled={viewMode}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Optionale Beschreibung des Kategorietyps"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {viewMode ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Schliessen
            </button>
            <button
              type="button"
              onClick={onChangeToEdit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Bearbeiten
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {categoryType ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export default CategoryTypeForm

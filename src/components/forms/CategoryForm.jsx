import React, { useState, useEffect } from 'react'
import { Save, X, Edit } from 'lucide-react'

function CategoryForm({ category, categoryTypes, onSave, onCancel, viewMode, onChangeToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    description: ''
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        typeId: category.typeId || '',
        description: category.description || ''
      })
      return
    }

    setFormData({
      name: '',
      typeId: categoryTypes[0]?.id || '',
      description: ''
    })
  }, [category, categoryTypes])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-green-50 p-6 rounded mb-6 shadow-[6px_6px_9px_rgba(0,0,0,0.1)]">
      <h3 className="text-2xl font-bold mb-4 text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
        {category ? (viewMode ? 'Kategorie anzeigen' : 'Kategorie bearbeiten') : 'Neue Kategorie'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ *
            </label>
            <select
              name="typeId"
              value={formData.typeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={viewMode || categoryTypes.length === 0}
            >
              {categoryTypes.length === 0 && (
                <option value="">Bitte erst Kategorietyp anlegen</option>
              )}
              {categoryTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {categoryTypes.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Ohne Kategorietypen kann keine Kategorie erstellt werden.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={viewMode}
              placeholder="z.B. Vorstand, Aktiv, Foerdermitglied"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={viewMode}
              placeholder="Optionale Beschreibung"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {!viewMode && (
            <button
              type="submit"
              className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28] flex items-center gap-2 font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              Speichern
            </button>
          )}
          {viewMode && (
            <button
              type="button"
              onClick={onChangeToEdit}
              className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28] flex items-center gap-2 font-semibold transition-colors"
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

export default CategoryForm

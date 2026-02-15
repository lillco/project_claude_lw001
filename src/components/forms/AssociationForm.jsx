import React, { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'

function AssociationForm({ association, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zip: '',
    city: '',
    description: ''
  })

  useEffect(() => {
    if (association) {
      setFormData({
        name: association.name || '',
        street: association.street || '',
        zip: association.zip || '',
        city: association.city || '',
        description: association.description || ''
      })
    }
  }, [association])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-green-50 p-6 rounded mb-6 shadow-[6px_6px_9px_rgba(0,0,0,0.1)]">
      <h3 className="text-2xl font-bold mb-4 text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
        {association ? 'Verein bearbeiten' : 'Verein anlegen'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
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
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Straße
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stadt
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#76b332] text-white px-6 py-3 rounded shadow-md hover:bg-[#5a8a28] flex items-center gap-2 font-semibold transition-colors"
          >
            <Save className="w-5 h-5" />
            Speichern
          </button>
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

export default AssociationForm

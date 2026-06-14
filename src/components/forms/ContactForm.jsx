import React, { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import CommunicationChannelsTable from '../tables/CommunicationChannelsTable'
import { contactsAPI } from '../../api/contacts'
import { CATEGORY_ID_ROLE, ROLE_CATEGORY_ID, applicableTo } from '../../utils/contactRoles'

function ContactForm({ contact, contactType, categoryTypes = [], contactCategorizations = [], categories, onSave, onCancel, viewMode, onChangeToEdit }) {
  const [formData, setFormData] = useState({
    contact_type: contactType,
    location_category_id: '',
    status: 'active',
    entry_date: '',
    company_name: '',
    salutation: '',
    contact_person: '',
    street: '',
    zip: '',
    city: '',
    alt_street: '',
    alt_zip: '',
    alt_city: ''
  })

  const [communicationChannels, setCommunicationChannels] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Kategorisierung (n:m): nur die für Kontakte anwendbaren Kategorietypen.
  // "Kontakttyp" liefert die Rollen (Mitglied/Einzelhandel/Marktbeschicker/Organ).
  const contactCategoryTypes = (categoryTypes || []).filter(t => applicableTo(t.applicableEntities, 'contact'))
  const contactCategoryTypeIds = new Set(contactCategoryTypes.map(t => t.id))
  const manageableCategories = (categories || []).filter(c => contactCategoryTypeIds.has(c.typeId))

  // vorbelegt aus den bestehenden Kontakt-Kategorisierungen; beim Anlegen mit
  // der Rolle des aktiven Reiters
  const initialSelectedIds = (contactCategorizations || []).map(c => c.categoryId)
  const selectedKey = initialSelectedIds.slice().sort().join(',')
  const defaultRoleId = contactType ? ROLE_CATEGORY_ID[contactType] : null
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    initialSelectedIds.length ? initialSelectedIds : (defaultRoleId ? [defaultRoleId] : [])
  )

  useEffect(() => {
    const base = initialSelectedIds.length
      ? initialSelectedIds
      : (defaultRoleId ? [defaultRoleId] : [])
    setSelectedCategoryIds(base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.id, selectedKey, contactType])

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  useEffect(() => {
    if (contact) {
      setFormData({
        contact_type: contact.contact_type || contactType,
        location_category_id: contact.location_category_id || '',
        status: contact.status || 'active',
        entry_date: contact.entry_date || '',
        company_name: contact.company_name || '',
        salutation: contact.salutation || '',
        contact_person: contact.contact_person || '',
        street: contact.street || '',
        zip: contact.zip || '',
        city: contact.city || '',
        alt_street: contact.alt_street || '',
        alt_zip: contact.alt_zip || '',
        alt_city: contact.alt_city || ''
      })
      // Load existing communication channels; saving replaces all channels,
      // so an empty list here would silently delete them
      let cancelled = false
      setCommunicationChannels([])
      contactsAPI.getCommunication(contact.id)
        .then(channels => {
          if (cancelled || !Array.isArray(channels)) return
          setCommunicationChannels(channels.map(ch => ({
            ...ch,
            is_primary: Boolean(ch.is_primary)
          })))
        })
        .catch(err => {
          console.error('Failed to load communication channels:', err)
        })
      return () => { cancelled = true }
    } else {
      setFormData(prev => ({ ...prev, contact_type: contactType }))
    }
  }, [contact, contactType])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddChannel = () => {
    setCommunicationChannels(prev => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        type: '',
        label: '',
        value: '',
        is_primary: false
      }
    ])
  }

  const handleChannelChange = (index, field, value) => {
    setCommunicationChannels(prev => {
      const updated = [...prev]
      
      // If setting is_primary to true, unset all others
      if (field === 'is_primary' && value === true) {
        updated.forEach((ch, i) => {
          if (i !== index) ch.is_primary = false
        })
      }
      
      updated[index][field] = value
      return updated
    })
  }

  const handleRemoveChannel = (index) => {
    setCommunicationChannels(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    // Mindestens eine Rolle (Kontakttyp-Kategorie), sonst taucht der Kontakt
    // in keinem Reiter auf
    const selectedRoleKeys = selectedCategoryIds.map(id => CATEGORY_ID_ROLE[id]).filter(Boolean)
    if (selectedRoleKeys.length === 0) {
      alert('Bitte mindestens eine Rolle (Kontakttyp) auswählen.')
      return
    }
    // Primärrolle als Kompatibilitäts-Schatten in contact_type (für lw002,
    // bis der Markt auf Rollen umgestellt ist): bevorzugt die Rolle des aktiven
    // Reiters, sonst die erste gewählte Rolle
    const primaryRole = selectedRoleKeys.includes(contactType) ? contactType : selectedRoleKeys[0]
    setSubmitting(true)
    try {
      await onSave({
        ...formData,
        contact_type: primaryRole,
        categoryIds: selectedCategoryIds,
        communicationChannels
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Filter location categories
  const locationCategories = categories.filter(cat => 
    cat.typeName === 'Lage' || cat.typeId?.includes('lage')
  )

  const getContactTypeLabel = () => {
    switch (contactType) {
      case 'organ': return 'Organ'
      case 'member': return 'Mitglied'
      case 'retailer': return 'Einzelhändler'
      case 'vendor': return 'Marktbeschicker'
      default: return 'Kontakt'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kategorisierung (inkl. Rollen über den Typ "Kontakttyp") */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2">
          Kategorisierung *
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Mehrfachauswahl. Der Typ „Kontakttyp" bestimmt die Rolle(n) — ein Partner
          kann z.&nbsp;B. zugleich Mitglied und Marktbeschicker sein.
        </p>
        {contactCategoryTypes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Keine für Kontakte anwendbaren Kategorietypen vorhanden.
          </p>
        ) : (
          <div className="space-y-4">
            {contactCategoryTypes.map(type => {
              const cats = manageableCategories.filter(c => c.typeId === type.id)
              if (cats.length === 0) return null
              return (
                <div key={type.id}>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {type.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cats.map(cat => (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer select-none text-sm ${
                          selectedCategoryIds.includes(cat.id)
                            ? 'bg-[#BAF0DB] border-black/20 text-black'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        } ${viewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          disabled={viewMode}
                          className="accent-green-600"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stammdaten */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Stammdaten</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Firma / Name *
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Anrede
            </label>
            <select
              name="salutation"
              value={formData.salutation}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Bitte wählen...</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
              <option value="Divers">Divers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ansprechpartner
            </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="terminated">Gekündigt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Eintrittsdatum
            </label>
            <input
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lage
            </label>
            <select
              name="location_category_id"
              value={formData.location_category_id}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Bitte wählen...</option>
              {locationCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Geschäftsadresse */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2">Geschäftsadresse</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Straße
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PLZ
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ort
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Abweichende Geschäftsadresse */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-2">
          Abweichende Geschäftsadresse <span className="text-sm font-normal text-gray-500">(optional)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Straße (abweichend)
            </label>
            <input
              type="text"
              name="alt_street"
              value={formData.alt_street}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PLZ (abweichend)
            </label>
            <input
              type="text"
              name="alt_zip"
              value={formData.alt_zip}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ort (abweichend)
            </label>
            <input
              type="text"
              name="alt_city"
              value={formData.alt_city}
              onChange={handleChange}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Kommunikationskanäle */}
      {!viewMode && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <CommunicationChannelsTable
            channels={communicationChannels}
            onAdd={handleAddChannel}
            onChange={handleChannelChange}
            onRemove={handleRemoveChannel}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        {viewMode ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Schließen
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#BAF0DB] text-black border border-black/20 rounded-md hover:bg-[#a8dec9] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Speichert…' : (contact ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export default ContactForm


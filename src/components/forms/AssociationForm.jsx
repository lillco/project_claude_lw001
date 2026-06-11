import React, { useState, useEffect } from 'react'
import { Save, X, Upload, Plus, Trash2 } from 'lucide-react'

const communicationTypes = [
  { value: 'telefon', label: 'Telefon' },
  { value: 'mobil', label: 'Mobil' },
  { value: 'email', label: 'E-Mail' },
  { value: 'web', label: 'Web' },
  { value: 'insta', label: 'Instagram' },
  { value: 'fb', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'sonstiges', label: 'Sonstiges' }
]

function AssociationForm({ association, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    street: '',
    zip: '',
    city: '',
    contact_person: ''
  })

  const [sepaAccounts, setSepaAccounts] = useState([])
  const [communicationChannels, setCommunicationChannels] = useState([])
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    if (association) {
      setFormData({
        name: association.name || '',
        description: association.description || '',
        logo: association.logo || '',
        street: association.street || '',
        zip: association.zip || '',
        city: association.city || '',
        contact_person: association.contact_person || ''
      })
      setLogoPreview(association.logo || '')
      setSepaAccounts(Array.isArray(association.sepaAccounts) ? association.sepaAccounts : [])
      setCommunicationChannels(getInitialCommunicationChannels(association))
    }
  }, [association])

  const getInitialCommunicationChannels = (data) => {
    if (Array.isArray(data.communicationChannels) && data.communicationChannels.length > 0) {
      return data.communicationChannels
    }

    return [
      data.phone ? { type: 'telefon', value: data.phone, note: '' } : null,
      data.email ? { type: 'email', value: data.email, note: '' } : null,
      data.website ? { type: 'web', value: data.website, note: '' } : null,
      data.instagram ? { type: 'insta', value: data.instagram, note: '' } : null,
      data.facebook ? { type: 'fb', value: data.facebook, note: '' } : null
    ].filter(Boolean)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
        setFormData({
          ...formData,
          logo: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview('')
    setFormData({
      ...formData,
      logo: ''
    })
  }

  const handleAddSepaAccount = () => {
    setSepaAccounts([
      ...sepaAccounts,
      {
        bank_name: '',
        iban: '',
        bic: '',
        is_public: false,
        usage_purpose: ''
      }
    ])
  }

  const handleSepaChange = (index, field, value) => {
    const updated = [...sepaAccounts]
    updated[index][field] = value
    setSepaAccounts(updated)
  }

  const handleRemoveSepaAccount = (index) => {
    const updated = sepaAccounts.filter((_, i) => i !== index)
    setSepaAccounts(updated)
  }

  const handleAddCommunicationChannel = () => {
    setCommunicationChannels([
      ...communicationChannels,
      {
        type: 'telefon',
        value: '',
        note: ''
      }
    ])
  }

  const handleCommunicationChange = (index, field, value) => {
    const updated = [...communicationChannels]
    updated[index][field] = value
    setCommunicationChannels(updated)
  }

  const handleRemoveCommunicationChannel = (index) => {
    const updated = communicationChannels.filter((_, i) => i !== index)
    setCommunicationChannels(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Include SEPA accounts in the save data
    onSave({
      ...formData,
      sepaAccounts,
      communicationChannels
    })
  }

  return (
    <div className="bg-green-50 dark:bg-gray-800 p-6 rounded mb-6 shadow-[6px_6px_9px_rgba(0,0,0,0.1)]">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
        {association ? 'Verein bearbeiten' : 'Verein anlegen'}
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Firmierung Group */}
        <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">Firmierung</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beschreibung
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo
              </label>
              {logoPreview ? (
                <div className="flex items-start gap-4">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-32 h-32 object-contain border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Entfernen
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 flex items-center gap-2 dark:text-gray-200">
                    <Upload className="w-4 h-4" />
                    <span>Logo hochladen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geschäftsstelle Group */}
        <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">Geschäftsstelle</h4>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              />
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Communication Group */}
        <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Kommunikation</h4>
            <button
              type="button"
              onClick={handleAddCommunicationChannel}
              className="bg-[#BAF0DB] text-black border border-black/20 px-3 py-1 rounded text-sm hover:bg-[#a8dec9] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Kanal hinzufuegen
            </button>
          </div>

          {communicationChannels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Typ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Link oder Wert</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notiz</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktion</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {communicationChannels.map((channel, index) => (
                    <tr key={channel.id || index}>
                      <td className="px-3 py-2">
                        <select
                          value={channel.type || 'telefon'}
                          onChange={(e) => handleCommunicationChange(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          {communicationTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={channel.value || ''}
                          onChange={(e) => handleCommunicationChange(index, 'value', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="https://..., info@..., +49 ..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={channel.note || ''}
                          onChange={(e) => handleCommunicationChange(index, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Notiz"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCommunicationChannel(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              Noch keine Kommunikationsdaten angelegt. Klicken Sie auf "Kanal hinzufuegen".
            </p>
          )}
        </div>

        {/* Bankverbindung Group */}
        <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bankverbindung</h4>
            <button
              type="button"
              onClick={handleAddSepaAccount}
              className="bg-[#BAF0DB] text-black border border-black/20 px-3 py-1 rounded text-sm hover:bg-[#a8dec9] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Konto hinzufügen
            </button>
          </div>
          
          {sepaAccounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IBAN</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">BIC</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Öffentlich</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verwendung</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktion</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {sepaAccounts.map((account, index) => (
                    <tr key={account.id || index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={account.bank_name || ''}
                          onChange={(e) => handleSepaChange(index, 'bank_name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Bankname"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={account.iban || ''}
                          onChange={(e) => handleSepaChange(index, 'iban', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="DE..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={account.bic || ''}
                          onChange={(e) => handleSepaChange(index, 'bic', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="BIC"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(account.is_public)}
                          onChange={(e) => handleSepaChange(index, 'is_public', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={account.usage_purpose || ''}
                          onChange={(e) => handleSepaChange(index, 'usage_purpose', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Verwendungszweck"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSepaAccount(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              Noch keine Bankverbindungen angelegt. Klicken Sie auf "Konto hinzufügen".
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#BAF0DB] text-black border border-black/20 px-6 py-3 rounded shadow-md hover:bg-[#a8dec9] flex items-center gap-2 font-semibold transition-colors"
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


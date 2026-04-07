import React from 'react'
import { Plus, Trash2, Star } from 'lucide-react'

function CommunicationChannelsTable({ channels, onAdd, onChange, onRemove }) {
  const typeLabels = {
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Website',
    social_media: 'Social Media'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Kommunikationskanäle</h4>
        <button
          type="button"
          onClick={onAdd}
          className="bg-[#BAF0DB] text-black border border-black/20 px-3 py-1 rounded text-sm hover:bg-[#a8dec9] flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Kanal hinzufügen
        </button>
      </div>

      {channels.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Typ</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bezeichnung</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wert</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hauptkontakt</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktion</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {channels.map((channel, index) => (
                <tr key={channel.id || index}>
                  <td className="px-3 py-2">
                    <select
                      value={channel.type}
                      onChange={(e) => onChange(index, 'type', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">Typ wählen...</option>
                      <option value="phone">Telefon</option>
                      <option value="email">E-Mail</option>
                      <option value="website">Website</option>
                      <option value="social_media">Social Media</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={channel.label || ''}
                      onChange={(e) => onChange(index, 'label', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="z.B. Zentrale, Mobil..."
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={channel.value || ''}
                      onChange={(e) => onChange(index, 'value', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder={
                        channel.type === 'phone' ? '+49 123 456789' :
                        channel.type === 'email' ? 'info@example.de' :
                        channel.type === 'website' ? 'https://...' :
                        channel.type === 'social_media' ? '@username' :
                        'Wert eingeben...'
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onChange(index, 'is_primary', !channel.is_primary)}
                      className={`p-1 rounded transition-colors ${
                        channel.is_primary
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                      title={channel.is_primary ? 'Hauptkontakt' : 'Als Hauptkontakt markieren'}
                    >
                      <Star className={`w-5 h-5 ${channel.is_primary ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Entfernen"
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
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4 bg-gray-50 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600">
          Noch keine Kommunikationskanäle angelegt. Klicken Sie auf "Kanal hinzufügen".
        </p>
      )}
    </div>
  )
}

export default CommunicationChannelsTable


import React, { useState, useMemo } from 'react'
import { Edit, Trash2, Search } from 'lucide-react'

function ContactsTable({ contacts, contactType, onEdit, onDelete, onRowClick, showSearch = true }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter contacts by type and search term
  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => contact.contact_type === contactType)
      .filter(contact => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
          contact.company_name?.toLowerCase().includes(search) ||
          contact.contact_person?.toLowerCase().includes(search) ||
          contact.city?.toLowerCase().includes(search) ||
          contact.status?.toLowerCase().includes(search)
        )
      })
  }, [contacts, contactType, searchTerm])

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    
    const statusLabels = {
      active: 'Aktiv',
      inactive: 'Inaktiv',
      terminated: 'Gekündigt'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  return (
    <div>
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Suchen nach Firma, Ansprechpartner, Ort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Keine Kontakte gefunden.' : 'Noch keine Kontakte angelegt.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ansprechpartner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Eintrittsdatum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => onRowClick(contact.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.company_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{contact.contact_person || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{contact.city || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(contact.entry_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(contact.id)
                      }}
                      className="text-black hover:text-[#a8dec9] mr-3"
                      title="Bearbeiten"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(contact.id)
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {filteredContacts.length} {filteredContacts.length === 1 ? 'Kontakt' : 'Kontakte'}
        {searchTerm && ` (gefiltert)`}
      </div>
    </div>
  )
}

export default ContactsTable


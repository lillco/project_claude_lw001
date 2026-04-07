import React, { useState, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'

function CategoryTypesTable({ categoryTypes, onEdit, onDelete, onRowClick, showSearch = false }) {
  const [searchFields, setSearchFields] = useState({
    name: ''
  })

  const filteredCategoryTypes = useMemo(() => {
    return categoryTypes.filter(type => {
      const matchesName = !searchFields.name ||
        type.name?.toLowerCase().includes(searchFields.name.toLowerCase())

      return matchesName
    })
  }, [categoryTypes, searchFields])

  if (categoryTypes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Keine Kategorietypen vorhanden. Klicken Sie auf "Neu hinzufügen", um einen Typ anzulegen.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {showSearch && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded mb-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h4 className="font-medium text-green-900 dark:text-green-300">Suche</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={searchFields.name}
              onChange={(event) => setSearchFields(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Typ suchen..."
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Anwendbare Entitaeten
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Beschreibung
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCategoryTypes.map((type) => (
            <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onRowClick(type.id)}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {type.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {type.applicableEntities || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {type.description || '-'}
              </td>
              <td className="px-6 py-4 text-right text-sm space-x-2" onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => onEdit(type.id)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(type.id)}
                  className="text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTypesTable

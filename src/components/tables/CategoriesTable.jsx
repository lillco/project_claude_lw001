import React, { useState, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'

function CategoriesTable({ categories, onEdit, onDelete, onRowClick, showSearch = false }) {
  const [searchFields, setSearchFields] = useState({
    name: '',
    type: ''
  })

  const categoryTypes = useMemo(() => {
    const types = new Set()
    categories.forEach((category) => {
      const typeName = category.typeName || '-'
      types.add(typeName)
    })
    return Array.from(types).sort()
  }, [categories])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesName = !searchFields.name ||
        category.name?.toLowerCase().includes(searchFields.name.toLowerCase())

      const typeName = category.typeName || '-'
      const matchesType = !searchFields.type || typeName === searchFields.type

      return matchesName && matchesType
    })
  }, [categories, searchFields])

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Keine Kategorien vorhanden. Klicken Sie auf "Neu hinzufügen", um eine Kategorie anzulegen.
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
              placeholder="Kategorie suchen..."
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <select
              value={searchFields.type}
              onChange={(event) => setSearchFields(prev => ({ ...prev, type: event.target.value }))}
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Alle Typen...</option>
              {categoryTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
              Typ
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
          {filteredCategories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onRowClick(category.id)}>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {category.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs font-medium">
                  {category.typeName || '-'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {category.description || '-'}
              </td>
              <td className="px-6 py-4 text-right text-sm space-x-2" onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => onEdit(category.id)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(category.id)}
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

export default CategoriesTable

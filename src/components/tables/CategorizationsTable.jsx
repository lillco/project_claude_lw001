import React, { useState, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'

function CategorizationsTable({ categorizations, categories, association, onEdit, onDelete, onRowClick, showSearch = false }) {
  const [searchFields, setSearchFields] = useState({
    entityName: '',
    categoryType: '',
    categoryName: ''
  })

  const groupedCategorizations = useMemo(() => {
    const grouped = {}

    const safeCategorizations = Array.isArray(categorizations) ? categorizations : []
    const safeCategories = Array.isArray(categories) ? categories : []

    safeCategorizations.forEach((item) => {
      if (!item || !item.entityType || !item.entityId) return

      const key = `${item.entityType}-${item.entityId}`
      if (!grouped[key]) {
        grouped[key] = {
          entityType: item.entityType,
          entityId: item.entityId,
          entityName: association && item.entityId === association.id ? association.name : 'Unbekannt',
          categories: [],
          categoryTypes: [],
          ids: []
        }
      }

      const category = safeCategories.find(cat => cat.id === item.categoryId)
      grouped[key].categories.push(category?.name || 'Unbekannt')
      grouped[key].categoryTypes.push(category?.typeName || '-')
      grouped[key].ids.push(item.id)
    })

    return Object.values(grouped)
  }, [categorizations, categories, association])

  const filteredData = useMemo(() => {
    return groupedCategorizations.filter((item) => {
      const matchesEntity = !searchFields.entityName ||
        item.entityName.toLowerCase().includes(searchFields.entityName.toLowerCase())

      const matchesType = !searchFields.categoryType ||
        item.categoryTypes.some(type => type.toLowerCase().includes(searchFields.categoryType.toLowerCase()))

      const matchesCategory = !searchFields.categoryName ||
        item.categories.some(cat => cat.toLowerCase().includes(searchFields.categoryName.toLowerCase()))

      return matchesEntity && matchesType && matchesCategory
    })
  }, [groupedCategorizations, searchFields])

  if (categorizations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Keine Kategorisierungen vorhanden. Klicken Sie auf "Neu hinzufuegen", um eine Kategorisierung anzulegen.
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
              value={searchFields.entityName}
              onChange={(event) => setSearchFields(prev => ({ ...prev, entityName: event.target.value }))}
              placeholder="Verein suchen..."
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="text"
              value={searchFields.categoryType}
              onChange={(event) => setSearchFields(prev => ({ ...prev, categoryType: event.target.value }))}
              placeholder="Kategorietyp suchen..."
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <input
              type="text"
              value={searchFields.categoryName}
              onChange={(event) => setSearchFields(prev => ({ ...prev, categoryName: event.target.value }))}
              placeholder="Kategorie suchen..."
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-md focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Entitaet
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Kategorietyp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Kategorien
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredData.map((item) => (
            <tr
              key={`${item.entityType}-${item.entityId}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onRowClick(item.ids[0])}
            >
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Verein
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {item.entityName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex flex-wrap gap-1">
                  {[...new Set(item.categoryTypes)].map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs font-medium">
                      {type}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex flex-wrap gap-1">
                  {item.categories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-right text-sm space-x-2" onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => onEdit(item.ids[0])}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Alle ${item.categories.length} Kategorisierung(en) fuer "${item.entityName}" loeschen?`)) {
                      item.ids.forEach(id => onDelete(id))
                    }
                  }}
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

export default CategorizationsTable

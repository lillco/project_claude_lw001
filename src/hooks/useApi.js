/**
 * API Hook
 * Handles all API interactions with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react'
import { associationAPI, categoryTypesAPI, categoriesAPI, categorizationAPI } from '../api/client'

export function useApi() {
  const [association, setAssociation] = useState(null)
  const [categoryTypes, setCategoryTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [categorizations, setCategorizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [associationData, categoryTypesData, categoriesData, categorizationsData] = await Promise.all([
        associationAPI.get().catch(err => {
          console.error('Failed to load association:', err)
          return null
        }),
        categoryTypesAPI.getAll().catch(err => {
          console.error('Failed to load category types:', err)
          return []
        }),
        categoriesAPI.getAll().catch(err => {
          console.error('Failed to load categories:', err)
          return []
        }),
        categorizationAPI.getAll().catch(err => {
          console.error('Failed to load categorizations:', err)
          return []
        })
      ])

      setAssociation(associationData)
      setCategoryTypes(Array.isArray(categoryTypesData) ? categoryTypesData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setCategorizations(Array.isArray(categorizationsData) ? categorizationsData : [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create association (first time)
  const createAssociation = useCallback(async (data) => {
    try {
      const newAssociation = await associationAPI.create(data)
      setAssociation(newAssociation)
      return newAssociation
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Update association
  const updateAssociation = useCallback(async (id, data) => {
    try {
      const updated = await associationAPI.update(id, data)
      setAssociation(updated)
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Category type operations
  const addCategoryType = useCallback(async (data) => {
    try {
      const created = await categoryTypesAPI.create(data)
      setCategoryTypes(prev => [...prev, created])
      return created
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateCategoryType = useCallback(async (id, data) => {
    try {
      const updated = await categoryTypesAPI.update(id, data)
      setCategoryTypes(prev => prev.map(item => item.id === id ? updated : item))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteCategoryType = useCallback(async (id) => {
    try {
      await categoryTypesAPI.delete(id)
      setCategoryTypes(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Category operations
  const addCategory = useCallback(async (data) => {
    try {
      const created = await categoriesAPI.create(data)
      setCategories(prev => [...prev, created])
      return created
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateCategory = useCallback(async (id, data) => {
    try {
      const updated = await categoriesAPI.update(id, data)
      setCategories(prev => prev.map(item => item.id === id ? updated : item))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoriesAPI.delete(id)
      setCategories(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Categorization operations
  const addCategorization = useCallback(async (data) => {
    try {
      const created = await categorizationAPI.create(data)
      setCategorizations(prev => [...prev, created])
      return created
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateCategorization = useCallback(async (id, data) => {
    try {
      const updated = await categorizationAPI.update(id, data)
      setCategorizations(prev => prev.map(item => item.id === id ? updated : item))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteCategorization = useCallback(async (id) => {
    try {
      await categorizationAPI.delete(id)
      setCategorizations(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    // Data
    association,
    categoryTypes,
    categories,
    categorizations,

    // State
    loading,
    error,

    // Operations
    createAssociation,
    updateAssociation,
    addCategoryType,
    updateCategoryType,
    deleteCategoryType,
    addCategory,
    updateCategory,
    deleteCategory,
    addCategorization,
    updateCategorization,
    deleteCategorization,

    // Utility
    reload: loadData
  }
}

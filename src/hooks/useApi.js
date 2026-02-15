/**
 * API Hook
 * Handles all API interactions with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react'
import { associationAPI } from '../api/client'

export function useApi() {
  const [association, setAssociation] = useState(null)
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
      const data = await associationAPI.get().catch(err => {
        console.error('Failed to load association:', err)
        return null
      })

      setAssociation(data)
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

  return {
    // Data
    association,

    // State
    loading,
    error,

    // Operations
    createAssociation,
    updateAssociation,

    // Utility
    reload: loadData
  }
}

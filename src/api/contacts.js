/**
 * Contacts API Client
 */

import { apiClient } from './client'

export const contactsAPI = {
  // Get all contacts
  getAll: async () => {
    const response = await apiClient.get('/contacts')
    return response
  },

  // Get single contact by ID
  getById: async (id) => {
    const response = await apiClient.get(`/contacts/${id}`)
    return response
  },

  // Create new contact
  create: async (data) => {
    const response = await apiClient.post('/contacts', data)
    return response
  },

  // Update contact
  update: async (id, data) => {
    const response = await apiClient.put(`/contacts/${id}`, data)
    return response
  },

  // Delete contact
  delete: async (id) => {
    const response = await apiClient.delete(`/contacts/${id}`)
    return response
  },

  // Get communication channels for a contact
  getCommunication: async (contactId) => {
    const response = await apiClient.get(`/contacts/${contactId}/communication`)
    return response
  },

  // Add communication channel
  addCommunication: async (contactId, data) => {
    const response = await apiClient.post(`/contacts/${contactId}/communication`, data)
    return response
  },

  // Update communication channel
  updateCommunication: async (id, data) => {
    const response = await apiClient.put(`/communication/${id}`, data)
    return response
  },

  // Delete communication channel
  deleteCommunication: async (id) => {
    const response = await apiClient.delete(`/communication/${id}`)
    return response
  }
}

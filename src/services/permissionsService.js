// src/services/permissionsService.js
import apiClient from '../api/axiosConfig';

const getPermissionsForRole = async (roleId) => {
  try {
    const response = await apiClient.get(`/permissions/role/${roleId}`);
    const data = response.data.data;

    // ✨ CORRECTION: Ensure the returned data is always an array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return Object.values(data); // Convert the object to an array
    }
    
    // If it's already an array or something else, return it or a safe fallback
    return data || [];

  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }
};

const assignPermissionsToRole = async (payload) => {
  try {
    const response = await apiClient.post('/permissions/assign-to-role', payload);
    return response.data;
  } catch (error) {
    console.error('Error assigning permissions:', error);
    throw error;
  }
};  

export const permissionsService = {
  getPermissionsForRole,
  assignPermissionsToRole,
};
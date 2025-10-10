import apiClient from '../api/axiosConfig';

const getRoles = async () => {
  try {
    const response = await apiClient.get('/roles/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};
const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/roles/create', roleData);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

const updateRole = async (roleData) => {
  try {
    const response = await apiClient.put('/roles/update', roleData);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/roles/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

export const rolesService = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
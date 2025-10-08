import apiClient from '../api/axiosConfig';

const getRoles = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.get('/roles/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const rolesService = {
  getRoles,
};

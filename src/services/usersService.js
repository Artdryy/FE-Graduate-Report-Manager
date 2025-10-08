import apiClient from '../api/axiosConfig';

const getUsers = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.get('/users/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const usersService = {
  getUsers,
};

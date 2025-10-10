import apiClient from '../api/axiosConfig';

const getUsers = async () => {
  try {
    // The interceptor now handles the token automatically. No headers needed here.
    const response = await apiClient.get('/users/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users/create', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/users/update/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/users/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const usersService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
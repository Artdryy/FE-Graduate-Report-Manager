import apiClient from '../api/axiosConfig';

const getKeywords = async () => {
  try {
    const response = await apiClient.get('/keywords/list');
    const data = response.data.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return Object.values(data);
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw error;
  }
};

const createKeyword = async (keyword) => {
  try {
    const response = await apiClient.post('/keywords/create', { keyword });
    return response.data.data; // Return the new keyword object with its ID
  } catch (error) {
    console.error('Error creating keyword:', error);
    throw error;
  }
};

const deleteKeyword = async (keywordId) => {
  try {
    await apiClient.delete(`/keywords/delete/${keywordId}`);
  } catch (error) {
    console.error(`Error deleting keyword ${keywordId}:`, error);
    throw error;
  }
};

export const keywordsService = {
  getKeywords,
  createKeyword,
  deleteKeyword,
};
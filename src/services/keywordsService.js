import apiClient from '../api/axiosConfig';

const getKeywords = async () => {
  try {
    const response = await apiClient.get('/keywords/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching keywords:', error);
    throw error;
  }
};

export const keywordsService = {
  getKeywords,
};
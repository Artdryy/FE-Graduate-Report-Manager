import apiClient from '../api/axiosConfig';

const getSemesters = async () => {
  try {
    const response = await apiClient.get('/semesters/list');
    const data = response.data.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return Object.values(data); 
    }
        return data || [];

  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
};

export const semestersService = {
  getSemesters,
};
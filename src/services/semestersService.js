import apiClient from '../api/axiosConfig';

const getSemesters = async () => {
  try {
    const response = await apiClient.get('/semesters/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
};

export const semestersService = {
  getSemesters
};
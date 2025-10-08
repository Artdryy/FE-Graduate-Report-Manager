import apiClient from '../api/axiosConfig';

const getCompanies = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.get('/companies/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const companiesService = {
  getCompanies,
};

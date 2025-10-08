import apiClient from '../api/axiosConfig';

const getReports = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await apiClient.get('/reports/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const reportsService = {
  getReports,
};

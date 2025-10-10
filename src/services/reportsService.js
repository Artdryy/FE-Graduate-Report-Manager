import apiClient from '../api/axiosConfig';

const getReports = async () => {
  try {
    const response = await apiClient.get('/reports/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

const createReport = async (formData) => {
  try {
    // For file uploads, we must use FormData and set the content type
    const response = await apiClient.post('/reports/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

const updateReport = async (id, reportData) => {
  try {
    const response = await apiClient.put(`/reports/update/${id}`, reportData);
    return response.data;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

const deleteReport = async (id) => {
  try {
    const response = await apiClient.delete(`/reports/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const reportsService = {
  getReports,
  createReport,
  updateReport,
  deleteReport,
};
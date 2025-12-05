import apiClient, { apiClientPdf } from '../api/axiosConfig';

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
    if (!(formData instanceof FormData)) {
      throw new Error('Data must be an instance of FormData');
    }

    const response = await apiClientPdf.post('/reports/create', formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

const updateReport = async (id, formData) => {
  try {
    const response = await apiClientPdf.put(`/reports/update/${id}`, formData);
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
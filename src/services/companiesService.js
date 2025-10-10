import apiClient from '../api/axiosConfig';

const getCompanies = async () => {
  try {
    const response = await apiClient.get('/companies/list');
    const data = response.data.data;
    return data && typeof data === 'object' ? Object.values(data) : [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

const createCompany = async (companyData) => {
  try {
    const response = await apiClient.post('/companies/create', companyData);
    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

const updateCompany = async (id, companyData) => {
  try {
    const response = await apiClient.put(`/companies/update/${id}`, companyData);
    return response.data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

const deleteCompany = async (id) => {
  try {
    const response = await apiClient.delete(`/companies/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

export const companiesService = {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
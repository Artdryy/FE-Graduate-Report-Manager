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

const createSemester = async (semesterData) => {
  try {
    const response = await apiClient.post('/semesters/create', semesterData);
    return response.data;
  } catch (error) {
    console.error('Error creating semester:', error);
    throw error;
  }
};

const updateSemester = async (semesterData) => {
  try {
    const response = await apiClient.put('/semesters/update', semesterData);
    return response.data;
  } catch (error) {
    console.error('Error updating semester:', error);
    throw error;
  }
};

const deleteSemester = async (id) => {
  try {
    const response = await apiClient.delete(`/semesters/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting semester:', error);
    throw error;
  }
};

export const semestersService = {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
};

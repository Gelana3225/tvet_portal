import api from '../lib/axios';

// Profile API
export const profileApi = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  createProfile: async (data: any) => {
    const response = await api.post('/profile', data);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Reference Data API
export const referenceApi = {
  getDepartments: async () => {
    const response = await api.get('/reference/departments');
    return response.data;
  },

  getDepartment: async (id: number) => {
    const response = await api.get(`/reference/departments/${id}`);
    return response.data;
  },

  getOccupations: async (departmentId?: number) => {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get('/reference/occupations', { params });
    return response.data;
  },

  getQualificationLevels: async () => {
    // Mock data for now since endpoint doesn't exist yet
    return {
      qualification_levels: [
        { id: 1, name: 'Grade 10', code: 'GR10' },
        { id: 2, name: 'Grade 12', code: 'GR12' },
      ]
    };
  },

  getAdmissionPeriods: async () => {
    const response = await api.get('/reference/admission-periods');
    return response.data;
  },

  getActiveAdmissionPeriod: async () => {
    const response = await api.get('/reference/admission-periods/active');
    return response.data;
  },
};

// Application API
export const applicationApi = {
  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplication: async (id: number) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  createApplication: async (data: any) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  updateApplication: async (id: number, data: any) => {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  submitApplication: async (id: number) => {
    const response = await api.post(`/applications/${id}/submit`);
    return response.data;
  },

  uploadDocument: async (applicationId: number, documentType: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (description) formData.append('description', description);

    const response = await api.post(`/applications/${applicationId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteDocument: async (applicationId: number, documentId: number) => {
    const response = await api.delete(`/applications/${applicationId}/documents/${documentId}`);
    return response.data;
  },
};

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
    const response = await api.get('/reference/qualification-levels');
    return response.data;
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

// Admin & Registrar API
export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getApplications: async (params?: { status?: string; department_id?: number; search?: string }) => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  getApplication: async (id: number) => {
    const response = await api.get(`/admin/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (
    id: number,
    payload: {
      status: 'under_review' | 'approved' | 'rejected' | 'correction_required';
      notes?: string;
      rejection_reason?: string;
      correction_notes?: string;
    }
  ) => {
    const response = await api.post(`/admin/applications/${id}/status`, payload);
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  getAdmissionPeriods: async () => {
    const response = await api.get('/admin/admission-periods');
    return response.data;
  },

  createAdmissionPeriod: async (data: any) => {
    const response = await api.post('/admin/admission-periods', data);
    return response.data;
  },

  updateAdmissionPeriod: async (id: number, data: any) => {
    const response = await api.put(`/admin/admission-periods/${id}`, data);
    return response.data;
  },
};

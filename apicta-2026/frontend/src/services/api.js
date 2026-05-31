import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Registration services
export const registrationService = {
  registerExco: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'executive_summary' && data[key]) {
        formData.append('executive_summary', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    
    const response = await api.post('/register/exco', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  registerJury: async (data) => {
    const response = await api.post('/register/jury', data);
    return response.data;
  },

  registerOfficial: async (data) => {
    const response = await api.post('/register/official', data);
    return response.data;
  },

  registerParticipant: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if ((key === 'executive_summary' || key === 'pitch_deck') && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    
    const response = await api.post('/register/participant', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  registerCommittee: async (data) => {
    const response = await api.post('/register/committee', data);
    return response.data;
  },

  getAllRegistrations: async () => {
    const response = await api.get('/registrations');
    return response.data;
  },

  getRegistration: async (id) => {
    const response = await api.get(`/registrations/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/registrations/${id}/status`, { status });
    return response.data;
  },
};

// Dashboard services
export const dashboardService = {
  getExecutiveDashboard: async () => {
    const response = await api.get('/dashboard/executive');
    return response.data;
  },

  getOperationalDashboard: async () => {
    const response = await api.get('/dashboard/operational');
    return response.data;
  },
};

// Accreditation services
export const accreditationService = {
  generateQR: async (registrationId) => {
    const response = await api.post('/accreditation/generate-qr', { registration_id: registrationId });
    return response.data;
  },

  getQRCode: async (regId) => {
    const response = await api.get(`/accreditation/qr/${regId}`);
    return response.data;
  },

  syncVerification: async () => {
    const response = await api.post('/ai/sync-verification');
    return response.data;
  },

  getInfo: async () => {
    const response = await api.get('/accreditation/info');
    return response.data;
  },
};

export default api;

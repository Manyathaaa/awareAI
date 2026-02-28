import client from './client.js';

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login:    (data) => client.post('/auth/login', data),
  getMe:    ()     => client.get('/auth/me'),
  updateMe: (data) => client.patch('/auth/me', data),
};

export const campaignAPI = {
  getAll:  ()         => client.get('/campaigns'),
  getOne:  (id)       => client.get(`/campaigns/${id}`),
  create:  (data)     => client.post('/campaigns', data),
  update:  (id, data) => client.patch(`/campaigns/${id}`, data),
  remove:  (id)       => client.delete(`/campaigns/${id}`),
};

export const phishingAPI = {
  getEvents:     (params) => client.get('/phishing/events', { params }),
  getCampaignStats: (id)  => client.get(`/phishing/stats/${id}`),
};

export const riskAPI = {
  getAll:      ()     => client.get('/risk'),
  getUser:     (id)   => client.get(`/risk/${id}`),
  recalculate: (id)   => client.post(`/risk/calculate/${id}`),
};

export const trainingAPI = {
  getAll:   ()         => client.get('/training'),
  getOne:   (id)       => client.get(`/training/${id}`),
  create:   (data)     => client.post('/training', data),
  update:   (id, data) => client.patch(`/training/${id}`, data),
  remove:   (id)       => client.delete(`/training/${id}`),
  submit:   (id, data) => client.post(`/training/${id}/submit`, data),
};

export const aiAPI = {
  analyze:         (userId) => client.get(`/ai/analyze/${userId}`),
  recommendations: (userId) => client.get(`/ai/recommendations/${userId}`),
  chat:            (message) => client.post('/ai/chat', { message }),
};

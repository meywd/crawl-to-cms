import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, name: string, password: string) => {
  const response = await api.post('/auth/register', { email, name, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

// Languages API

export const getLanguages = async () => {
  const response = await api.get('/languages');
  return response.data;
};

// Menu API

export const getMenu = async (languageCode = 'en') => {
  const response = await api.get(`/menu?languageCode=${languageCode}`);
  return response.data;
};

// Pages API

export const getPage = async (slug: string, languageCode = 'en') => {
  const response = await api.get(`/pages/${slug}?languageCode=${languageCode}`);
  return response.data;
};

// Settings API

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Admin API

export const getAdminPages = async () => {
  const response = await api.get('/admin/pages');
  return response.data;
};

export const createPage = async (data: any) => {
  const response = await api.post('/admin/pages', data);
  return response.data;
};

export const updatePage = async (id: number, data: any) => {
  const response = await api.put(`/admin/pages/${id}`, data);
  return response.data;
};

export const deletePage = async (id: number) => {
  const response = await api.delete(`/admin/pages/${id}`);
  return response.data;
};

// More API methods omitted for brevity

export default api;

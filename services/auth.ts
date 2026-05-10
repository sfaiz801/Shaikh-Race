import api from './api';

export const authService = {
  async register(username: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', data.access_token);
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data;
  },
};

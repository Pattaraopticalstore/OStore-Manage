// src/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async login(credentials) {
      const response = await axios.post('http://localhost:3001/api/users/login', credentials);
      const { token, user } = response.data;

      this.token = token;
      this.user = user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // ตั้งค่า header ของ axios สำหรับทุก request ต่อไป
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      // บังคับให้ไปหน้า login
      this.router.push('/login');
    },

    async register(userInfo) {
      // ใช้ token ของ admin ที่ login อยู่ในการยืนยันสิทธิ์
      await axios.post('http://localhost:3001/api/users/register', userInfo);
        },
    },
});
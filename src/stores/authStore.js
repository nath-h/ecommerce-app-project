//add toen time validation
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.token,
    currentUser: (state) => state.user,
    userFullName: (state) => {
      if (state.user) {
        return `${state.user.firstName} ${state.user.lastName}`.trim();
      }
      return '';
    },
    isAdmin: (state) => state.isAdmin || false,
  },

  actions: {
    initializeAuth() {
      this.loadAuthFromStorage();
    },

    loadAuthFromStorage() {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          this.token = token;
          this.user = JSON.parse(userData);
          this.isAuthenticated = true;
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        this.clearAuth();
      }
    },

    saveAuthToStorage() {
      try {
        if (this.token && this.user) {
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (error) {
        console.error('Error saving auth to storage:', error);
      }
    },

    login(userData, token) {
      this.user = userData;
      this.token = token;
      this.isAuthenticated = true;
      this.saveAuthToStorage();
    },

    logout() {
      this.clearAuth();
      this.clearAuthFromStorage();
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
    },

    clearAuthFromStorage() {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing auth from storage:', error);
      }
    },

    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      this.saveAuthToStorage();
    },

    validateToken() {
      if (!this.token) {
        this.clearAuth();
        return false;
      }
      try {
        return true;
      } catch (error) {
        console.error('Token validation failed:', error);
        this.clearAuth();
        return false;
      }
    },

    getAuthHeaders() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },
  },
});

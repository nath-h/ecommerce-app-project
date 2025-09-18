import { defineStore } from 'pinia';
import { useEcommerceStore } from '@/stores/ecommerce';
const sessionDuration = 30 * 60 * 1000;
const warningMessageTimer = 25 * 60 * 1000;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    tokenExpirationTimer: null,
    warningTimer: null,
    loginTime: null,
  }),

  getters: {
    isLoggedIn: (state) => !!(state.isAuthenticated && state.token),
    currentUser: (state) => state.user,
    userFullName: (state) => {
      if (state.user) {
        return `${state.user.firstName} ${state.user.lastName}`.trim();
      }
      return '';
    },
    isAdmin: (state) => {
      if (!state.user) return false;
      return state.user.isAdmin || false;
    },
    timeUntilExpiration: (state) => {
      if (!state.loginTime) return 0;
      const elapsed = Date.now() - state.loginTime;
      const remaining = sessionDuration - elapsed;
      return Math.max(0, remaining);
    },
  },

  actions: {
    initializeAuth() {
      this.loadAuthFromStorage();
      if (this.isAuthenticated) {
        this.setupTokenExpiration();
      }
    },

    setUser(userData, token) {
      this.user = userData;
      this.token = token;
      this.loginTime = Date.now();
      this.isAuthenticated = true;
      this.saveAuthToStorage();
      this.setupTokenExpiration();

      try {
        const ecommerceStore = useEcommerceStore();
        ecommerceStore.syncWithAuthStore(
          userData ? JSON.parse(JSON.stringify(userData)) : null
        );
      } catch (error) {
        console.error('Failed to sync ecommerce store in setUser', error);
      }
    },

    loadAuthFromStorage() {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');

        if (token && userData && loginTime) {
          const timeElapsed = Date.now() - parseInt(loginTime);
          if (timeElapsed < sessionDuration) {
            this.token = token;
            this.user = JSON.parse(userData);
            this.loginTime = parseInt(loginTime);
            this.isAuthenticated = true;
            const ecommerceStore = useEcommerceStore();
            ecommerceStore.syncWithAuthStore(this.user);
          } else {
            this.clearAuthFromStorage();
          }
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
          localStorage.setItem('loginTime', this.loginTime.toString());
        }
      } catch (error) {
        console.error('Error saving auth to storage:', error);
      }
    },

    logout() {
      this.clearTimers();
      this.clearAuth();
      this.clearAuthFromStorage();
      const ecommerceStore = useEcommerceStore();
      ecommerceStore.syncWithAuthStore(null);
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.loginTime = null;
    },

    clearAuthFromStorage() {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
      } catch (error) {
        console.error('Error clearing auth from storage:', error);
      }
    },

    clearTimers() {
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
        this.tokenExpirationTimer = null;
      }
      if (this.warningTimer) {
        clearTimeout(this.warningTimer);
        this.warningTimer = null;
      }
    },

    setupTokenExpiration() {
      this.clearTimers();
      if (!this.loginTime) return;
      const now = Date.now();
      let timeElapsed = now - this.loginTime;
      if (timeElapsed < 0) timeElapsed = 0;
      const timeUntilWarning = warningMessageTimer - timeElapsed;
      const timeUntilExpiration = sessionDuration - timeElapsed;

      if (timeUntilWarning > 0) {
        this.warningTimer = setTimeout(() => {
          this.showExpirationWarning();
        }, timeUntilWarning);
      } else if (timeUntilExpiration > 0) {
        this.showExpirationWarning();
      }
      if (timeUntilExpiration > 0) {
        this.tokenExpirationTimer = setTimeout(() => {
          this.handleTokenExpiration();
        }, timeUntilExpiration);
      } else {
        this.handleTokenExpiration();
      }
    },

    showExpirationWarning() {
      if (typeof window !== 'undefined') {
        const timeRemaining = this.timeUntilExpiration;
        window.dispatchEvent(
          new CustomEvent('tokenExpirationWarning', {
            detail: {
              timeRemaining: timeRemaining,
            },
          })
        );
      }
    },

    handleTokenExpiration() {
      this.logout();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    },

    async refreshToken() {
      if (!this.token) return false;

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token }),
        });
        const data = await response.json();

        if (response.ok) {
          this.setUser(data.user, data.token);
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('Token refresh error', error);
        this.logout();
        return false;
      }
    },

    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      this.saveAuthToStorage();
    },

    validateToken() {
      if (!this.token || !this.loginTime) {
        this.clearAuth();
        return false;
      }

      const timeElapsed = Date.now() - this.loginTime;

      if (timeElapsed > sessionDuration) {
        this.clearAuth();
        return false;
      }
      return true;
    },

    getAuthHeaders() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },
  },
});

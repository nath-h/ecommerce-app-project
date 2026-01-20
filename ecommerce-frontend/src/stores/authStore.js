import { defineStore } from 'pinia'

const sessionDuration = 30 * 60 * 1000
const warningMessageTimer = 25 * 60 * 1000

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    tokenExpirationTimer: null,
    warningTimer: null,
    loginTime: null,
    userPreferences: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  }),

  getters: {
    isLoggedIn: (state) => !!(state.user && state.token),
    userFullName: (state) => {
      if (state.user) {
        return `${state.user.firstName} ${state.user.lastName}`.trim()
      }
      return ''
    },
    isAdmin: (state) => {
      if (!state.user) return false
      return state.user.isAdmin || false
    },
    timeUntilExpiration: (state) => {
      if (!state.loginTime) return 0
      const elapsed = Date.now() - state.loginTime
      const remaining = sessionDuration - elapsed
      return Math.max(0, remaining)
    },
  },

  actions: {
    initializeAuth() {
      this.loadAuthFromStorage()
      this.loadUserPreferencesFromStorage()
      if (this.isLoggedIn) {
        this.setupTokenExpiration()
      }
    },

    setUser(userData, token) {
      this.user = userData
      this.token = token
      this.loginTime = Date.now()
      this.saveAuthToStorage()
      this.setupTokenExpiration()
    },

    loadAuthFromStorage() {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        const loginTime = localStorage.getItem('loginTime')

        if (token && userData && loginTime) {
          const timeElapsed = Date.now() - parseInt(loginTime)
          if (timeElapsed < sessionDuration) {
            this.token = token
            this.user = JSON.parse(userData)
            this.loginTime = parseInt(loginTime)
          } else {
            this.clearAuthFromStorage()
          }
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error)
        this.clearAuth()
      }
    },

    loadUserPreferencesFromStorage() {
      try {
        const savedPreferences = localStorage.getItem('auth-userPreferences')
        if (savedPreferences) {
          this.userPreferences = JSON.parse(savedPreferences)
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error)
        this.userPreferences = {
          name: '',
          email: '',
          phone: '',
          address: '',
        }
      }
    },

    saveAuthToStorage() {
      try {
        if (this.token && this.user) {
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('loginTime', this.loginTime.toString())
        }
      } catch (error) {
        console.error('Error saving auth to storage:', error)
      }
    },

    saveUserPreferencesToLocalStorage() {
      try {
        localStorage.setItem('auth-userPreferences', JSON.stringify(this.userPreferences))
      } catch (error) {
        console.error(`Error saving user preferences to local storage:`, error)
      }
    },

    updateUserPreferences(preferences) {
      this.userPreferences = { ...this.userPreferences, ...preferences }
      this.saveUserPreferencesToLocalStorage()
    },

    logout() {
      this.clearTimers()
      this.clearAuth()
      this.clearAuthFromStorage()
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.loginTime = null
      this.userPreferences = {
        name: '',
        email: '',
        phone: '',
        address: '',
      }
    },

    clearAuthFromStorage() {
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('loginTime')
      } catch (error) {
        console.error('Error clearing auth from storage:', error)
      }
    },

    clearAllStoredData() {
      try {
        clearAuthFromStorage()
        localStorage.removeItem('auth-userPreferences')
        this.clearAuth()
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    },

    clearTimers() {
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer)
        this.tokenExpirationTimer = null
      }
      if (this.warningTimer) {
        clearTimeout(this.warningTimer)
        this.warningTimer = null
      }
    },

    setupTokenExpiration() {
      this.clearTimers()
      if (!this.loginTime) return
      const now = Date.now()
      const timeElapsed = now - this.loginTime
      const timeUntilWarning = warningMessageTimer - timeElapsed
      const timeUntilExpiration = sessionDuration - timeElapsed

      if (timeUntilWarning > 0) {
        this.warningTimer = setTimeout(() => {
          this.showExpirationWarning()
        }, timeUntilWarning)
      } else if (timeUntilExpiration > 0) {
        this.showExpirationWarning()
      }
      if (timeUntilExpiration > 0) {
        this.tokenExpirationTimer = setTimeout(() => {
          this.handleTokenExpiration()
        }, timeUntilExpiration)
      } else {
        this.handleTokenExpiration()
      }
    },

    showExpirationWarning() {
      if (typeof window !== 'undefined') {
        const timeRemaining = this.timeUntilExpiration

        window.dispatchEvent(
          new CustomEvent('tokenExpirationWarning', {
            detail: {
              timeRemaining: timeRemaining,
            },
          }),
        )
      }
    },

    handleTokenExpiration() {
      this.logout()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenExpired'))
      }
    },

    async refreshToken() {
      if (!this.token) return false

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token }),
        })
        const data = await response.json()

        if (response.ok) {
          this.setUser(data.user, data.token)
          this.fetchUserFavorites()
          return true
        } else {
          this.logout()
          return false
        }
      } catch (error) {
        console.error('Token refresh error', error)
        this.logout()
        return false
      }
    },

    async fetchUserFavorites() {
      if (!this.user) return

      try {
        const response = await fetch(`/api/users/${this.user.id}`)
        if (response.ok) {
          const userData = await response.json()
          this.user = {
            ...userData.user,
            favorites: userData.favorites || [],
          }
          this.saveAuthToStorage()
        }
      } catch (error) {
        console.error('Error fetching user favorites:', error)
      }
    },

    getAuthHeaders() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },
  },
})

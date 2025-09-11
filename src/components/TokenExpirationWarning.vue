<template>
  <div v-if="showWarning" class="warning-overlay">
    <div class="warning-modal">
      <div class="warning-header">
        <h3>Session Expiring Soon</h3>
        <button @click="dismissWarning" class="close-btn">&times;</button>
      </div>

      <div class="warning-content">
        <h1>
          For security reasons, sessions expire after 30 minutes. Your session
          will expire in
          <strong>{{ timeRemaining }}</strong> seconds.
        </h1>
        <h1>Would you like to extend your session?</h1>
      </div>

      <div class="warning-actions">
        <button @click="logoutNow" class="logout-btn">Logout Now</button>
        <button
          @click="refreshSession"
          class="refresh-btn"
          :disabled="refreshing"
        >
          {{ refreshing ? 'Refreshing...' : 'Extend session' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showExpiredModal" class="expired-overlay">
    <div class="expired-modal">
      <div class="expired-header">
        <h3>Session Expired</h3>
      </div>

      <div class="expired-content">
        <h1>Your session has expired. Please log back in to continue.</h1>
      </div>

      <div class="expired-actions">
        <button @click="goToLogin" class="login-btn">Log back in</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'TokenExpirationWarning',

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const showWarning = ref(false);
    const showExpiredModal = ref(false);
    const timeRemaining = ref(0);
    const refreshing = ref(false);
    let countdownInterval = null;

    const handleTokenWarning = (event) => {
      timeRemaining.value = Math.floor(event.detail.timeRemaining / 1000);
      showWarning.value = true;

      countdownInterval = setInterval(() => {
        timeRemaining.value--;
        if (timeRemaining.value <= 0) {
          clearInterval(countdownInterval);
          showWarning.value = false;
          showExpiredModal.value = true;
        }
      }, 1000);
    };

    const handleTokenExpired = () => {
      showWarning.value = false;
      router.push('/login?logoutSuccess=true');
      showExpiredModal.value = true;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };

    const dismissWarning = () => {
      showWarning.value = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };

    const refreshSession = async () => {
      refreshing.value = true;
      try {
        const success = await authStore.refreshToken();
        if (success) {
          showWarning.value = false;
        } else {
          showWarning.value = false;
          showExpiredModal.value = true;
        }
      } catch (error) {
        console.error('Error refreshing session', error);
        showWarning.value = false;
        showExpiredModal.value = true;
      } finally {
        refreshing.value = false;
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      }
    };

    const logoutNow = () => {
      authStore.logout();
      showWarning.value = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      router.push('/login?logoutSuccess=true');
    };

    const goToLogin = () => {
      showExpiredModal.value = false;
      authStore.logout();
      router.push('/login');
    };

    onMounted(() => {
      window.addEventListener('tokenExpirationWarning', handleTokenWarning);
      window.addEventListener('tokenExpired', handleTokenExpired);
    });

    onUnmounted(() => {
      window.removeEventListener('tokenExpirationWarning', handleTokenWarning);
      window.removeEventListener('tokenExpired', handleTokenExpired);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });

    return {
      showWarning,
      showExpiredModal,
      timeRemaining,
      refreshing,
      dismissWarning,
      refreshSession,
      logoutNow,
      goToLogin,
    };
  },
};
</script>

<style scoped>
.warning-overlay,
.expired-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.warning-modal,
.expired-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.warning-header,
.expired-header {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expired-header {
  background-color: #dc3545;
  color: white;
  justify-content: center;
}

.warning-header h3,
.expired-header h3 {
  margin: 0;
  font-size: 1.2rem;
  flex: 1;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.warning-content,
.expired-content {
  overflow: visible;
  padding: 1.5rem;
  text-align: center;
}

.warning-content h1,
.expired-content h1 {
  font-size: 18px;
  font-family: Arial, sans-serif;
  font-weight: 500;
  text-align: center;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  color: #333;
  background-color: transparent;
}

.warning-content h1:last-child,
.expired-content h1:last-child {
  margin-bottom: 0;
}

.warning-actions,
.expired-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.refresh-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #218838;
}

.refresh-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.login-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 480px) {
  .warning-actions,
  .expired-actions {
    flex-direction: column;
  }

  .warning-modal,
  .expired-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>

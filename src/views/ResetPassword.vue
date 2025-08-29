<template>
  <main class="wrapper">
    <div class="reset-container">
      <div class="reset-card">
        <h1>Reset Password</h1>
        <form
          v-if="step === 1"
          @submit.prevent="handleVerifyIdentity"
          class="reset-form"
        >
          <h3>Verify your identity</h3>
          <p>Enter your email and phone number to verify your account.</p>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :disabled="loading"
              class="form-input"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              :disabled="loading"
              class="form-input"
              autocomplete="off"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !isStep1Valid"
            class="reset-button"
          >
            {{ loading ? 'Verifying...' : 'Verify Identity' }}
          </button>
        </form>

        <form
          v-if="step === 2"
          @submit.prevent="handleReset"
          class="reset-form"
        >
          <h1>Set New Password</h1>
          <p>Create a new password for your account.</p>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="formData.newPassword"
              type="password"
              required
              :disabled="loading"
              class="form-input"
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              v-model="formData.confirmNewPassword"
              type="password"
              required
              :disabled="loading"
              class="form-input"
              minlength="6"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>

          <div class="button-group">
            <button
              type="button"
              @click="goBackToStep1"
              class="back-button"
              :disabled="loading"
            >
              Back
            </button>
            <button
              type="submit"
              :disabled="loading || !isStep2Valid"
              class="reset-button"
            >
              {{ loading ? 'Resetting password...' : 'Reset Password' }}
            </button>
          </div>
        </form>

        <div class="login-link">
          Remembered your password?
          <router-link to="/login">Login Here</router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter();
    const step = ref(1);
    const formData = ref({
      email: '',
      phone: '',
      newPassword: '',
      confirmNewPassword: '',
    });

    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    const isStep1Valid = computed(() => {
      return formData.value.email.trim() && formData.value.phone.trim();
    });

    const isStep2Valid = computed(() => {
      return (
        formData.value.newPassword &&
        formData.value.confirmNewPassword &&
        formData.value.newPassword.length >= 6 &&
        formData.value.confirmNewPassword.length >= 6
      );
    });

    const isFormValid = computed(() => {
      return (
        formData.value.email.trim() &&
        formData.value.phone.trim() &&
        formData.value.newPassword &&
        formData.value.confirmNewPassword &&
        formData.value.newPassword.length >= 6
      );
    });

    const handleVerifyIdentity = async () => {
      error.value = '';
      loading.value = true;

      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/verify-identity',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.value.email.trim().toLowerCase(),
              phone: formData.value.phone.trim(),
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          step.value = 2;
        } else {
          error.value = data.error || 'Identity Verification Failed';
        }
      } catch (err) {
        console.error('Identity verification error:', err);
        error.value = 'Network error. Please try again';
      } finally {
        loading.value = false;
      }
    };

    const handleReset = async () => {
      error.value = '';
      success.value = '';

      if (formData.value.newPassword !== formData.value.confirmNewPassword) {
        error.value = 'Passwords do not match';
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/reset-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.value.email.trim().toLowerCase(),
              newPassword: formData.value.newPassword,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          success.value =
            'Password reset successfully! Redirecting to login page...';

          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else {
          error.value = data.error || 'Password reset failed';
        }
      } catch (err) {
        console.error('Password reset error:', err);
        error.value = 'Network error. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const goBackToStep1 = () => {
      step.value = 1;
      error.value = '';
      success.value = '';
    };

    return {
      step,
      goBackToStep1,
      formData,
      loading,
      error,
      success,
      isStep1Valid,
      isStep2Valid,
      isFormValid,
      handleReset,
      handleVerifyIdentity,
    };
  },
};
</script>

<style scoped>
.reset-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px;
}

.reset-card {
  background: var(--topBarLinkHoverBackground);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.reset-card h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.reset-button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 1.5s ease 0.25s;
  margin-top: 1rem;
}
.reset-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transition: background-color 1.5s ease 0.25s;
}

.reset-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.back-button {
  padding: 0.75rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.back-button:hover:not(:disabled) {
  background-color: #545b62;
}

.back-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .reset-card {
    padding: 1.5rem;
  }
}
</style>

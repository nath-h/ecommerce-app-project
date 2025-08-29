<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Log In</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            :disabled="loading"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            :disabled="loading"
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading || !formData.email || !formData.password"
          class="login-button"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="register-link">
        Don't have an account?
        <router-link to="/register">Register Here</router-link>
      </div>
      <div class="register-link">
        Forgot password?
        <router-link to="/reset-password">Reset Password</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter();

    const formData = ref({
      email: '',
      password: '',
    });

    const loading = ref(false);
    const error = ref('');

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.value.email.trim().toLowerCase(),
            password: formData.value.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/');
        } else {
          error.value = data.error || 'Login failed';
        }
      } catch (err) {
        console.error('Login error:', err);
        error.value = 'Network error. Please check if the server is running.';
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      error,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.login-card {
  background-color: var(--topBarLinkHoverBackground);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.login-button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
.reset-link a {
  color: #007bff;
  text-decoration: none;
}

.reset-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>

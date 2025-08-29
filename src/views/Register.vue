<template>
  <main class="wrapper">
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              required
              :disabled="loading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              required
              :disabled="loading"
              class="form-input"
            />
          </div>

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
            <label for="phone">Phone</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              :disabled="loading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <textarea
              id="address"
              v-model="formData.address"
              required
              :disabled="loading"
              class="form-input"
              rows="3"
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
              minLength="6"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              :disabled="loading"
              class="form-input"
              minLength="6"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>

          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="register-button"
          >
            {{ loading ? 'Creating Account' : 'Register' }}
          </button>
        </form>

        <div class="login-link">
          Already have an account?
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
  name: 'RegisterPage',
  setup() {
    const router = useRouter();

    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    });

    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    const isFormValid = computed(() => {
      return (
        formData.value.firstName.trim() &&
        formData.value.lastName.trim() &&
        formData.value.email.trim() &&
        formData.value.phone.trim() &&
        formData.value.address.trim() &&
        formData.value.password &&
        formData.value.confirmPassword &&
        formData.value.password === formData.value.confirmPassword &&
        formData.value.password.length >= 6
      );
    });

    const handleRegister = async () => {
      error.value = '';
      success.value = '';

      if (formData.value.password !== formData.value.confirmPassword) {
        error.value = 'Passwords do not match';
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/register',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: formData.value.firstName.trim(),
              lastName: formData.value.lastName.trim(),
              email: formData.value.email.trim().toLowerCase(),
              phone: formData.value.phone.trim(),
              address: formData.value.address.trim(),
              password: formData.value.password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          success.value = 'Account created successfully! Redirecting...';

          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          error.value = data.error || 'Registration failed';
        }
      } catch (err) {
        console.error('Registration error:', err);
        if (err.message.includes('Backend server')) {
          error.value = 'Backend server is not running';
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          error.value = 'Unable to connect to server.';
        } else {
          error.value = 'Network error. Please try again.';
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      error,
      success,
      isFormValid,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.register-card {
  background-color: var(--topBarLinkHoverBackground);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.register-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.register-button:disabled {
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
  .register-card {
    padding: 1.5rem;
  }
}
</style>

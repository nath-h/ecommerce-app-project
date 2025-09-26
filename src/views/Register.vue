<template>
  <main class="wrapper">
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>
        <form
          @submit.prevent="handleRegister"
          class="register-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              required
              :disabled="loading"
              class="form-input"
              :class="{ error: validationErrors.firstName }" />
            <div
              v-if="validationErrors.firstName"
              class="field-error">
              {{ validationErrors.firstName }}
            </div>
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
              :class="{ error: validationErrors.lastName }" />
            <div
              v-if="validationErrors.lastName"
              class="field-error">
              {{ validationErrors.lastName }}
            </div>
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
              :class="{ error: validationErrors.email }" />
            <div
              v-if="validationErrors.email"
              class="field-error">
              {{ validationErrors.email }}
            </div>
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
              :class="{ error: validationErrors.phone }"
              @input="formatPhoneInput" />
            <div
              v-if="validationErrors.phone"
              class="field-error">
              {{ validationErrors.phone }}
            </div>
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <textarea
              id="address"
              v-model="formData.address"
              required
              :disabled="loading"
              class="form-input"
              :class="{ error: validationErrors.address }"
              rows="3" />
            <div
              v-if="validationErrors.address"
              class="field-error">
              {{ validationErrors.address }}
            </div>
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
              :class="{ error: validationErrors.password }"
              minLength="6" />
            <div
              v-if="validationErrors.password"
              class="field-error">
              {{ validationErrors.password }}
            </div>
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
              :class="{ error: validationErrors.confirmPassword }"
              minLength="6" />
            <div
              v-if="validationErrors.confirmPassword"
              class="field-error">
              {{ validationErrors.confirmPassword }}
            </div>
          </div>

          <div
            v-if="error"
            class="error-message">
            {{ error }}
          </div>

          <div
            v-if="success"
            class="success-message">
            {{ success }}
          </div>

          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="register-button">
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
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';

  export default {
    name: 'RegisterPage',
    setup() {
      const router = useRouter();
      const authStore = useAuthStore();

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

      const validationErrors = ref({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
      });

      const formatPhoneInput = event => {
        let value = event.target.value.replace(/[^0-9]/g, '');

        value = value.substring(0, 10);

        if (value.length >= 6) {
          value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length >= 3) {
          value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        }

        formData.value.phone = value;
      };

      const validateField = (fieldName, value) => {
        switch (fieldName) {
          case 'firstName':
            return value.trim().length < 2 ? 'First name must be at least 2 characters' : '';

          case 'lastName':
            return value.trim().length < 2 ? 'Last name must be at least 2 characters' : '';

          case 'email':
            return !value.trim() ? 'Email is required' : '';

          case 'phone':
            if (!value.trim()) return 'Phone number is required';

            return value.length < 14 ? 'Phone number must be at least 10 digits' : '';

          case 'address':
            return value.trim().length < 8 ? 'Address must be at least 8 characters' : '';

          case 'password':
            if (!value) return 'Password is required';
            if (value.length < 6) return 'Password must be at least 6 characters';
            return '';

          case 'confirmPassword':
            if (!value) return 'Please confirm your password';
            return value !== formData.value.password ? 'Passwords do not match' : '';

          default:
            return '';
        }
      };

      Object.keys(formData.value).forEach(fieldName => {
        watch(
          () => formData.value[fieldName],
          newValue => {
            if (error.value) {
              error.value = '';
            }

            validationErrors.value[fieldName] = validateField(fieldName, newValue);

            if (fieldName === 'password' && formData.value.confirmPassword) {
              validationErrors.value.confirmPassword = validateField('confirmPassword', formData.value.confirmPassword);
            }
          },
          { immediate: false }
        );
      });

      const isFormValid = computed(() => {
        const hasValues = Object.values(formData.value).every(value => value.trim());
        const hasNoErrors = Object.values(validationErrors.value).every(error => !error);
        return hasValues && hasNoErrors;
      });

      const handleRegister = async () => {
        error.value = '';
        success.value = '';

        let hasErrors = false;
        Object.keys(formData.value).forEach(fieldName => {
          const fieldError = validateField(fieldName, formData.value[fieldName]);
          validationErrors.value[fieldName] = fieldError;

          if (fieldError) hasErrors = true;
        });

        if (hasErrors) {
          error.value = 'Please fix the errors above';
          return;
        }
        loading.value = true;
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
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
          });

          const data = await response.json();

          if (response.ok) {
            authStore.setUser(data.user, data.token);
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
        validationErrors,
        formatPhoneInput,
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
  background-color: lightcyan;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.field-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
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

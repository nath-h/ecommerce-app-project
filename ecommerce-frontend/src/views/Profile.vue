<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>User Profile</h1>
    </div>

    <div
      v-if="isLoggedIn"
      class="profile-content">
      <div class="profile-info">
        <div class="info-row">
          <label>First Name:</label>
          <span>{{ user.firstName }}</span>
        </div>

        <div class="info-row">
          <label>Last Name:</label>
          <span>{{ user.lastName }}</span>
        </div>

        <div class="info-row">
          <label>Email:</label>
          <span>{{ user.email }}</span>
        </div>

        <div
          v-if="user.phone"
          class="info-row">
          <label>Phone:</label>
          <span>{{ user.phone }}</span>
        </div>

        <div class="info-row">
          <label>Account Type:</label>
          <span>{{ isAdmin ? 'Administrator' : 'Customer' }}</span>
        </div>

        <div
          v-if="user.createdAt"
          class="info-row">
          <label>Member Since:</label>
          <span>{{ formatDate(user.createdAt) }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn btn-primary">Edit Profile</button>
        <button class="btn btn-secondary">Change Password</button>
      </div>
    </div>

    <div
      v-else
      class="not-logged-in">
      <p>Please log in to view your profile.</p>
      <router-link
        to="/login"
        class="btn btn-primary">
        Log In
      </router-link>
    </div>
  </div>
</template>

<script>
  import { useAuthStore } from '@/stores/authStore';
  import { storeToRefs } from 'pinia';

  export default {
    name: 'Profile',
    setup() {
      const authStore = useAuthStore();
      const { user, isLoggedIn, isAdmin } = storeToRefs(authStore);

      const formatDate = dateString => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      return {
        user,
        isLoggedIn,
        isAdmin,
        formatDate,
      };
    },
  };
</script>

<style scoped>
  .profile-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--topNavBackground);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  color: #2c3e50;
  margin: 0;
}

.profile-content {
  text-align: left;
}

.profile-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.info-row span {
  color: #2c3e50;
  flex: 1;
  text-align: right;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #369870;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.not-logged-in {
  text-align: center;
  padding: 2rem;
}

.not-logged-in p {
  margin-bottom: 1rem;
  color: #666;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.debug-info h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.debug-info pre {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.875rem;
  overflow-x: auto;
  text-align: left;
  margin: 0;
}
</style>

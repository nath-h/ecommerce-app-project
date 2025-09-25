<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <h1>Admin Dashboard</h1>
      <p>Manage users and monitor system activities</p>
    </header>

    <div
      v-if="!authStore.isAdmin"
      class="access-denied">
      <h2>Access denied</h2>
      <p>You need administrator privileges to access this page.</p>
    </div>

    <div
      v-else
      class="admin-content">
      <nav class="tab-nav">
        <button
          :class="['tab-btn', { active: activeTab === 'users' }]"
          @click="setActiveTab('users')">
          User Management
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'coupons' }]"
          @click="setActiveTab('coupons')">
          Coupon Management
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'actions' }]"
          @click="setActiveTab('actions')">
          Admin Actions Log
        </button>
      </nav>

      <section
        v-if="activeTab === 'users'"
        class="tab-content">
        <div class="form-section">
          <h2>{{ editMode ? 'Edit User' : 'Add new user' }}</h2>

          <form
            @submit.prevent="handleUserSubmit"
            class="user-form">
            <div class="form-grid">
              <div class="form-field">
                <label>First Name *</label>
                <input
                  v-model="userForm.firstName"
                  type="text"
                  required
                  :disabled="isLoading" />
              </div>

              <div class="form-field">
                <label>Last Name *</label>
                <input
                  v-model="userForm.lastName"
                  type="text"
                  required
                  :disabled="isLoading" />
              </div>

              <div class="form-field">
                <label>Email *</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  required
                  :disabled="isLoading" />
              </div>

              <div class="form-field">
                <label>Phone *</label>
                <input
                  v-model="userForm.phone"
                  type="tel"
                  required
                  :disabled="isLoading" />
              </div>

              <div class="form-field">
                <label>Address *</label>
                <input
                  v-model="userForm.address"
                  type="text"
                  required
                  :disabled="isLoading" />
              </div>

              <div
                v-if="!editMode"
                class="form-field">
                <label>Password *</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  required
                  minlength="6"
                  :disabled="isLoading" />
              </div>
            </div>

            <div class="form-checkboxes">
              <label class="checkbox-label">
                <input
                  v-model="userForm.isAdmin"
                  type="checkbox"
                  :disabled="isLoading" />
                <span>Administrator</span>
              </label>

              <label
                v-if="editMode"
                class="checkbox-label">
                <input
                  v-model="userForm.isActive"
                  type="checkbox"
                  :disabled="isLoading" />
                <span>Active</span>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary">
                {{ isLoading ? 'Saving...' : editMode ? 'Update User' : 'Create User' }}
              </button>

              <button
                v-if="editMode"
                type="button"
                @click="cancelEdit"
                :disabled="isLoading"
                class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="users-section">
          <h2>All Users</h2>
          <div
            v-if="loadingUsers"
            class="loading-state">
            Loading users...
          </div>

          <div
            v-else
            class="table-wrapper">
            <table class="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone }}</td>
                  <td>
                    <span :class="['badge', user.isActive ? 'badge-active' : 'badge-inactive']">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', user.isAdmin ? 'badge-admin' : 'badge-user']">
                      {{ user.isAdmin ? 'Admin' : 'User' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>{{ formatDate(user.updatedAt) }}</td>
                  <td>
                    <button
                      @click="editUser(user)"
                      :disabled="isLoading"
                      class="btn btn-sb btn-outline">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        v-if="activeTab === 'coupons'"
        class="tab-content">
        <div class="form-section">
          <h2>{{ editingCouponId ? 'Edit Coupon' : 'Add new coupon' }}</h2>

          <form
            @submit.prevent="handleCouponSubmit"
            class="coupon-form">
            <div class="form-grid">
              <div class="form-field">
                <label>Code *</label>
                <input
                  v-model="couponForm.code"
                  type="text"
                  required
                  :disabled="isLoading"
                  placeholder="Coupon Code" />
              </div>

              <div class="form-field">
                <label>Type *</label>
                <select
                  v-model="couponForm.type"
                  required
                  :disabled="isLoading">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              <div class="form-field">
                <label>Value *</label>
                <input
                  v-model="couponForm.value"
                  type="number"
                  step="0.01"
                  required
                  :disabled="isLoading"
                  :placeholder="couponForm.type === 'PERCENTAGE' ? '10(%)' : '10.00'" />
              </div>

              <div class="form-field">
                <label>Minimum Order Amount</label>
                <input
                  v-model="couponForm.minOrder"
                  type="number"
                  step="0.01"
                  :disabled="isLoading"
                  placeholder="50.00" />
              </div>

              <div class="form-field">
                <label>Maximum Discount</label>
                <input
                  v-model="couponForm.maxDiscount"
                  type="number"
                  step="0.01"
                  :disabled="isLoading"
                  placeholder="100.00" />
              </div>

              <div class="form-field">
                <label>Expires At</label>
                <input
                  v-model="couponForm.expiresAt"
                  type="datetime-local"
                  :disabled="isLoading" />
              </div>
            </div>

            <div class="form-field full-width">
              <label>Description</label>
              <textarea
                v-model="couponForm.description"
                :disabled="isLoading"
                rows="3"
                placeholder="Enter coupon description..."></textarea>
            </div>

            <div class="form-checkboxes">
              <label class="checkbox-label">
                <input
                  v-model="couponForm.isActive"
                  type="checkbox"
                  :disabled="isLoading" />
                <span>Active</span>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary">
                {{ isLoading ? 'Saving...' : editingCouponId ? 'Update coupon' : 'Create coupon' }}
              </button>

              <button
                v-if="editingCouponId"
                type="button"
                @click="cancelCouponEdit"
                :disabled="isLoading"
                class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="coupons-section">
          <h2>All coupons</h2>
          <div
            v-if="loadingCoupons"
            class="loading-state">
            Loading coupons...
          </div>

          <div
            v-else
            class="table-wrapper">
            <table class="coupons-table">
              <thead>
                <tr>
                  <th>Coupon ID</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order Amount</th>
                  <th>Max Discount</th>
                  <th>Status</th>
                  <th>Expires At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="coupon in coupons"
                  :key="coupon.id">
                  <td>{{ coupon.id }}</td>
                  <td>{{ coupon.code }}</td>
                  <td>{{ formatCouponType(coupon.type) }}</td>
                  <td>{{ formatCouponValue(coupon) }}</td>
                  <td>{{ coupon.minOrder === '0' ? '' : `$${coupon.minOrder}` }}</td>
                  <td>{{ coupon.maxDiscount === null ? '' : `$${coupon.maxDiscount}` }}</td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        {
                          'badge-active': coupon.isActive && !isCouponExpired(coupon.expiresAt),
                          'badge-inactive': !coupon.isActive,
                          'badge-expired': isCouponExpired(coupon.expiresAt),
                        },
                      ]">
                      {{ isCouponExpired(coupon.expiresAt) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never' }}</td>
                  <td>
                    <button
                      @click="editCoupon(coupon)"
                      :disabled="isLoading"
                      class="btn btn-sb btn-outline">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        v-if="activeTab === 'actions'"
        class="tab-content">
        <h2>Admin Actions Log</h2>
        <div
          v-if="loadingActions"
          class="loading-state">
          Loading actions...
        </div>

        <div
          v-else-if="adminActions.length === 0"
          class="empty-state">
          No admin actions recorded
        </div>

        <div
          v-else
          class="table-wrapper">
          <table class="actions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin</th>
                <th>Admin UserID</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="action in adminActions"
                :key="action.id">
                <td>{{ formatDate(action.createdAt) }}</td>
                <td>{{ action.admin.firstName }} {{ action.admin.lastName }}</td>
                <td>{{ action.admin.id }}</td>
                <td>
                  <span :class="['badge', getBadgeClass(action.action)]">
                    {{ formatActionType(action.action) }}
                  </span>
                </td>
                <td>{{ action.entityType }}</td>
                <td>{{ action.entityId }}</td>
                <td v-html="formatActionDetails(action.details)"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div
      v-if="message.show"
      :class="['toast', `toast-${message.type}`]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/authStore';

  const authStore = useAuthStore();

  const activeTab = ref('users');
  const users = ref([]);
  const adminActions = ref([]);
  const isLoading = ref(false);
  const loadingUsers = ref(false);
  const loadingActions = ref(false);
  const editMode = ref(false);
  const editingUserId = ref(null);
  const coupons = ref([]);
  const loadingCoupons = ref(false);
  const editingCouponId = ref(null);

  const couponForm = reactive({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    description: '',
    minOrder: 0,
    maxDiscount: '',
    expiresAt: '',
    isActive: true,
  });

  const message = reactive({
    show: false,
    text: '',
    type: 'success',
  });

  const userForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    isAdmin: false,
    isActive: true,
  });

  const getBadgeClass = action => {
    const actionType = action.toLowerCase();
    if (actionType.includes('create')) return 'badge-created';
    if (actionType.includes('update')) return 'badge-updated';
    if (actionType.includes('disable')) return 'badge-disabled';
    if (actionType.includes('reactivated')) return 'badge-reactivated';
  };

  const setActiveTab = tab => {
    activeTab.value = tab;
    if (tab === 'actions' && adminActions.value.length === 0) {
      fetchAdminActions();
    } else if (tab === 'coupons' && coupons.value.length === 0) {
      fetchCoupons();
    }
  };

  const showMessage = (text, type = 'success') => {
    message.show = true;
    message.text = text;
    message.type = type;
    setTimeout(() => {
      message.show = false;
    }, 4000);
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...authStore.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      authStore.logout();
      throw new Error('Authentication failed - please log in again');
    }
    return response;
  };

  const fetchUsers = async () => {
    loadingUsers.value = true;
    try {
      const response = await makeAuthenticatedRequest('/api/admin/users');
      const data = await response.json();

      if (response.ok) {
        users.value = data.users;
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage(error.message, 'error');
    } finally {
      loadingUsers.value = false;
    }
  };

  const fetchCoupons = async () => {
    loadingCoupons.value = true;

    try {
      const response = await makeAuthenticatedRequest('/api/coupon/admin');
      const data = await response.json();

      if (response.ok) {
        coupons.value = data.coupons;
      } else {
        throw new Error(data.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons', error);
      showMessage(error.message, 'error');
    } finally {
      loadingCoupons.value = false;
    }
  };

  const handleCouponSubmit = async () => {
    isLoading.value = true;

    try {
      const url = editingCouponId.value ? `/api/coupon/admin/${editingCouponId.value}` : '/api/coupon/admin';
      const formData = {
        ...couponForm,
        maxDiscount: couponForm.maxDiscount === '' ? null : parseFloat(couponForm.maxDiscount),
        minOrder: couponForm.minOrder === '' ? 0 : parseFloat(couponForm.minOrder),
        value: parseFloat(couponForm.value),
      };
      const response = await makeAuthenticatedRequest(url, {
        method: editingCouponId.value ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }
      showMessage(data.message);
      resetCouponForm();
      await Promise.all([fetchCoupons(), fetchAdminActions()]);
    } catch (error) {
      console.error('Error submitting coupon:', error);
      showMessage(error.message, 'error');
    } finally {
      isLoading.value = false;
    }
  };

  const editCoupon = coupon => {
    editingCouponId.value = coupon.id;
    Object.assign(couponForm, {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description || '',
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
      isActive: coupon.isActive,
    });
  };

  const isCouponExpired = expiresAt => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const resetCouponForm = () => {
    editingCouponId.value = null;
    Object.assign(couponForm, {
      code: '',
      type: 'PERCENTAGE',
      value: '',
      description: '',
      minOrder: 0,
      maxDiscount: '',
      expiresAt: '',
      isActive: true,
    });
  };

  const cancelCouponEdit = () => {
    resetCouponForm();
  };

  const formatCouponValue = coupon => {
    return coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`;
  };

  const formatCouponType = type => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const fetchAdminActions = async () => {
    loadingActions.value = true;
    try {
      const response = await makeAuthenticatedRequest('/api/admin/actions');
      const data = await response.json();

      if (response.ok) {
        adminActions.value = data.actions;
      } else {
        throw new Error(data.error || 'Failed to fetch admin actions');
      }
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      showMessage(error.message, 'error');
    } finally {
      loadingActions.value = false;
    }
  };

  const resetForm = () => {
    userForm.firstName = '';
    userForm.lastName = '';
    userForm.email = '';
    userForm.phone = '';
    userForm.address = '';
    userForm.password = '';
    userForm.isAdmin = false;
    userForm.isActive = false;
    editMode.value = false;
    editingUserId.value = null;
  };

  const handleUserSubmit = async () => {
    isLoading.value = true;

    try {
      const url = editMode.value ? `/api/admin/users/${editingUserId.value}` : '/api/admin/users';
      const method = editMode.value ? 'PUT' : 'POST';
      const body = { ...userForm };

      let changes = {};
      if (editMode.value) {
        const currentUser = users.value.find(u => u.id === editingUserId.value);
        if (currentUser) {
          Object.keys(body).forEach(key => {
            if (body[key] !== currentUser[key]) {
              changes[key] = {
                from: currentUser[key],
                to: body[key],
              };
            }
          });
        }
        delete body.password;
      }

      const response = await makeAuthenticatedRequest(url, {
        method,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('remove your own administrator privileges')) {
          userForm.isAdmin = true;
        }
        if (data.error?.includes('deactivate your own account')) {
          userForm.isActive = true;
        }
      }

      if (response.ok) {
        showMessage(data.message);
        resetForm();
        await Promise.all([fetchUsers(), fetchAdminActions()]);
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting user:', error);
      showMessage(error.message, 'error');
    } finally {
      isLoading.value = false;
    }
  };

  const editUser = user => {
    editMode.value = true;
    editingUserId.value = user.id;
    userForm.firstName = user.firstName;
    userForm.lastName = user.lastName;
    userForm.email = user.email;
    userForm.phone = user.phone;
    userForm.address = user.address;
    userForm.isAdmin = user.isAdmin;
    userForm.isActive = user.isActive;
    userForm.password = '';
  };

  const cancelEdit = () => {
    resetForm();
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatActionType = actionType => {
    if (!actionType) return 'Unknown Action';
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatActionDetails = details => {
    if (!details) return 'No details available';

    try {
      const parsed = JSON.parse(details);

      if (parsed.changes) {
        return Object.entries(parsed.changes)
          .map(([field, { from, to }]) => {
            return `${field}: ${from} → ${to}`;
          })
          .join('<br>');
      }

      if (parsed.userId || typeof parsed === 'string') {
        const message = typeof parsed === 'string' ? parsed : `Created user with ID: ${parsed.userId}`;
        return message;
      }

      if (parsed.code && parsed.type) {
        const value = parsed.type === 'PERCENTAGE' ? `${parsed.value}%` : `$${parsed.value}`;
        return `Created coupon: ${parsed.code}<br>Type: ${parsed.type}<br>Value: ${value}`;
      }
      return JSON.stringify(parsed, null, 2).replace(/\n/g, '<br>');
    } catch (error) {
      return details;
    }
  };

  onMounted(() => {
    if (authStore.isAdmin) {
      fetchUsers();
    }
  });
</script>

<style scoped>
  .body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.admin-header {
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid slategray;
}

.admin-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.admin-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.access-denied {
  text-align: center;
  padding: 3rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
}

.tab-nav {
  display: flex;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 1rem;
  border-bottom: 2px solid slategray;
}

.tab-content {
  width: 100%;
}

.tab-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: bold;
  color: darkcyan;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.form-section {
  background: #f8f9fa;
   border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 100%;
  max-width: none;
}

.form-section h2 {
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
  font-weight: 600;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}


.form-field label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-field input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-field input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-checkboxes {
  display: flex;
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input {
  margin: 0;
}

.form-actions {
  justify-content: flex-start;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-outline {
  background: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.users-section, .coupons-section, h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.admin-content {
  width: 100%;
  margin: 0 auto;
  padding: 0;
}

.users-section, .coupons-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #dee2e6;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.users-table, .actions-table, .coupons-table {
  width: 100%;
  min-width: 800px;
  table-layout: auto;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid gray;
  background: white;
  margin: 0;
}
.users-table th, .actions-table th, .users-table th {
  text-align: center;
}
.users-table th, .users-table td,
.actions-table th, .actions-table td, 
.coupons-table th, .coupons-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid gray;
  border-right: 1px solid gray;
  text-align: center;
  vertical-align: middle;
  background: inherit;
}

.users-table th, .actions-table th, .coupons-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1;
}

.users-table tbody tr:nth-child(even),
.actions-table tbody tr:nth-child(even),
.coupons-table tbody tr:nth-child(even) {
  background-color: lightgrey;
}

.users-table tbody tr:hover,
.actions-table tbody tr:hover,
.coupons-table tbody tr:hover {
   background-color: #e3f2fd;
  transition: background-color 0.2s ease;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
}

.badge-active {
  background-color: #d4edda;
  color: #155724;
}

.badge-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.badge-expired {
  background-color: darkgrey;
  color: #495057;
  text-shadow: 0 0.5px 0.5px rgba(0,0,0,0.6);
  border: 1px solid #ced4da;
}

.badge-admin {
  background-color: #fff3cd;
  color: #856404;
}

.badge-user {
  background-color: #cfe2ff;
  color: #084298;
}

.coupon-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.coupon-form select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.badge-reactivated {
  background-color: #d1e7dd;
  color: #0f5132;
}

.badge-created {
  background-color: lightgreen;
  color: #0f5132
}

.badge-updated {
  background-color: #cfe2ff;
  color: #084298;
}

.badge-disabled {
  background-color: #f8d7da;
  color: #842029
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-checkboxes {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tab-nav {
    flex-direction: column;
  }
}
</style>

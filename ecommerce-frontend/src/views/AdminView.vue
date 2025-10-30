<template>
  <main class="wrapper">
      <div v-if="!authStore.isAdmin" class="access-denied">
        <h2>Access denied</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    <div v-else class="admin-dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users and monitor system activities</p>
      </header>
      <div class="admin-content">
        <nav class="tab-nav">
          <button
            :class="['tab-btn', { active: activeTab === 'users' }]"
            @click="setActiveTab('users')"
          >
            User Management
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'products' }]"
            @click="setActiveTab('products')"
          >
            Product Management
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'coupons' }]"
            @click="setActiveTab('coupons')"
          >
            Coupon Management
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'orders' }]"
            @click="setActiveTab('orders')"
          >
            Order Management
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'actions' }]"
            @click="setActiveTab('actions')"
          >
            Admin Actions Log
          </button>
        </nav>

        <section v-if="activeTab === 'users'" class="tab-content">
          <div class="form-section">
            <h2>{{ editingUserId ? 'Edit User' : 'Add new user' }}</h2>

            <form @submit.prevent="handleUserSubmit" class="user-form">
              <div class="form-grid">
                <div class="form-field">
                  <label>First Name *</label>
                  <input v-model="userForm.firstName" type="text" required :disabled="isLoading" />
                </div>

                <div class="form-field">
                  <label>Last Name *</label>
                  <input v-model="userForm.lastName" type="text" required :disabled="isLoading" />
                </div>

                <div class="form-field">
                  <label>Email *</label>
                  <input v-model="userForm.email" type="email" required :disabled="isLoading" />
                </div>

                <div class="form-field">
                  <label>Phone *</label>
                  <input v-model="userForm.phone" type="tel" required :disabled="isLoading" />
                </div>

                <div class="form-field">
                  <label>Address *</label>
                  <input v-model="userForm.address" type="text" required :disabled="isLoading" />
                </div>

                <div v-if="!editingUserId" class="form-field">
                  <label>Password *</label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    required
                    minlength="6"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input v-model="userForm.isAdmin" type="checkbox" :disabled="isLoading" />
                  <span>Administrator</span>
                </label>

                <label class="checkbox-label">
                  <input v-model="userForm.isActive" type="checkbox" :disabled="isLoading" />
                  <span>Active</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isLoading" class="btn btn-primary">
                  {{ isLoading ? 'Saving...' : editingUserId ? 'Update User' : 'Create User' }}
                </button>

                <button
                  v-if="editingUserId"
                  type="button"
                  @click="resetUserForm"
                  :disabled="isLoading"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div class="users-section">
            <h2>All Users</h2>
            <div v-if="loadingUsers" class="loading-state">Loading users...</div>

            <div v-else class="table-wrapper">
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
                  <tr v-for="user in users" :key="user.id">
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
                        class="btn btn-sb btn-outline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'coupons'" class="tab-content">
          <div class="form-section">
            <h2>{{ editingCouponId ? 'Edit Coupon' : 'Add new coupon' }}</h2>

            <form @submit.prevent="handleCouponSubmit" class="coupon-form">
              <div class="form-grid">
                <div class="form-field">
                  <label>Code *</label>
                  <input
                    v-model="couponForm.code"
                    type="text"
                    required
                    :disabled="isLoading"
                    placeholder="Coupon Code"
                  />
                </div>

                <div class="form-field">
                  <label>Type *</label>
                  <select v-model="couponForm.type" required :disabled="isLoading">
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
                    :max="couponForm.type === 'PERCENTAGE' ? 100 : 9999.99"
                    :placeholder="couponForm.type === 'PERCENTAGE' ? '10(%)' : '10.00'"
                     @blur="couponForm.value = toTwoDecimals(couponForm['value'])"
                  />
                </div>

                <div class="form-field">
                  <label>Minimum Order Amount</label>
                  <input
                    v-model="couponForm.minOrder"
                    type="number"
                    step="0.01"
                    :disabled="isLoading"
                    placeholder="50.00"
                    max="9999.99"
                    @blur="couponForm.minOrder = toTwoDecimals(couponForm['minOrder'])"
                  />
                </div>

                <div class="form-field">
                  <label>Maximum Discount</label>
                  <input
                    v-model="couponForm.maxDiscount"
                    type="number"
                    step="0.01"
                    :disabled="isLoading"
                    placeholder="100.00"
                    max="9999.99"
                    @blur="couponForm.maxDiscount = toTwoDecimals(couponForm['maxDiscount'])"
                  />
                </div>

                <div class="form-field">
                  <label>Expires At (local time)</label>
                  <input
                    v-model="couponForm.expiresAt"
                    type="datetime-local"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="form-field">
                <label>Description</label>
                <textarea
                  v-model="couponForm.description"
                  :disabled="isLoading"
                  rows="3"
                  placeholder="Enter coupon description..."
                ></textarea>
              </div>

              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input v-model="couponForm.isActive" type="checkbox" :disabled="isLoading" />
                  <span>Active</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isLoading" class="btn btn-primary">
                  {{
                    isLoading ? 'Saving...' : editingCouponId ? 'Update coupon' : 'Create coupon'
                  }}
                </button>

                <button
                  v-if="editingCouponId"
                  type="button"
                  @click="resetCouponForm"
                  :disabled="isLoading"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div class="coupons-section">
            <h2>All coupons</h2>
            <div v-if="loadingCoupons" class="loading-state">Loading coupons...</div>

            <div v-else class="table-wrapper">
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
                    <th>Expires At (local time)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="coupon in coupons" :key="coupon.id">
                    <td>{{ coupon.id }}</td>
                    <td>{{ coupon.code }}</td>
                    <td>{{ formatCouponType(coupon.type) }}</td>
                    <td>{{ formatCouponValue(coupon) }}</td>
                    <td>
                      {{
                        coupon.minOrder === null
                          ? ''
                          : coupon.minOrder === '0'
                            ? ''
                            : `$${parseFloat(coupon.minOrder).toFixed(2)}`
                      }}
                    </td>
                    <td>{{ coupon.maxDiscount === null ? '' : `$${parseFloat(coupon.maxDiscount).toFixed(2)}` }}</td>
                    <td>
                      <span
                        :class="[
                          'badge',
                          {
                            'badge-active': coupon.isActive && !isCouponExpired(coupon.expiresAt),
                            'badge-inactive': !coupon.isActive,
                            'badge-expired': isCouponExpired(coupon.expiresAt),
                          },
                        ]"
                      >
                        {{
                          isCouponExpired(coupon.expiresAt)
                            ? 'Expired'
                            : coupon.isActive
                              ? 'Active'
                              : 'Inactive'
                        }}
                      </span>
                    </td>
                    <td>{{ coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never' }}</td>
                    <td>
                      <button
                        @click="editCoupon(coupon)"
                        :disabled="isLoading"
                        class="btn btn-sb btn-outline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'products'" class="tab-content">
          <div class="form-section">
            <h2>{{ editingProductId ? 'Edit Product' : 'Add new product' }}</h2>

            <form @submit.prevent="handleProductSubmit" class="product-form">
              <div class="form-grid">
                <div class="form-field">
                  <label>Name *</label>
                  <input
                    v-model="productForm.name"
                    type="text"
                    required
                    :disabled="isLoading"
                    placeholder="Product Name"
                  />
                </div>

                <div class="form-field">
                  <label>Type *</label>
                  <select v-model="productForm.type" required :disabled="isLoading">
                    <option value="" disabled>Select product type...</option>
                    <option value="MEAT">MEAT</option>
                    <option value="FRUIT">FRUIT</option>
                    <option value="VEGETABLE">VEGETABLE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Price (USD) *</label>
                  <input
                    v-model="productForm.price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    :disabled="isLoading"
                    placeholder="0.00"
                    @blur="productForm.price = toTwoDecimals(productForm['price'])"
                  />
                </div>

                <div class="form-field">
                  <label>Icon</label>
                  <input
                    v-model="productForm.icon"
                    type="text"
                    :disabled="isLoading"
                    placeholder="Product Icon (Icofont)"
                  />
                </div>

                <div class="form-field">
                  <label>Stock *</label>
                  <input
                    v-model="productForm.stock"
                    type="number"
                    step="1"
                    :disabled="isLoading"
                    placeholder="0"
                  />
                </div>

                <div class="form-field">
                  <label>Description</label>
                  <textarea
                    v-model="productForm.description"
                    :disabled="isLoading"
                    rows="1"
                    placeholder="Enter product description..."
                  ></textarea>
                </div>
              </div>

              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input v-model="productForm.isActive" type="checkbox" :disabled="isLoading" />
                  <span>Active</span>
                </label>

                <label class="checkbox-label">
                  <input v-model="productForm.isFeatured" type="checkbox" :disabled="isLoading" />
                  <span>Featured</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isLoading" class="btn btn-primary">
                  {{
                    isLoading ? 'Saving...' : editingProductId ? 'Update product' : 'Create product'
                  }}
                </button>

                <button
                  v-if="editingProductId"
                  type="button"
                  @click="resetProductForm"
                  :disabled="isLoading"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div class="products-section">
            <h2>All products</h2>
            <div v-if="loadingProducts" class="loading-state">Loading products...</div>

            <div v-else class="table-wrapper">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in products" :key="product.id">
                    <td>{{ product.id }}</td>
                    <td style="white-space: nowrap;">{{ product.icon }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ formatProductType(product.type) }}</td>
                    <td>${{ toTwoDecimals(product.price) }}</td>
                    <!-- \u00A0 is unicode for a non-line breaking space 
                     to fix wrapping of parentheses in negative stock -->
                    <td>{{ product.stock < 0 ? `(\u00A0${product.stock}\u00A0)` : product.stock}}</td>
                    <td>
                      <span
                        :class="[
                          'badge',
                          {
                            'badge-active': product.isActive,
                            'badge-inactive': !product.isActive,
                          },
                        ]"
                      >
                        {{ product.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <span
                        :class="[
                          'badge',
                          {
                            'badge-featured': product.isFeatured,
                            'badge-notfeatured': !product.isFeatured,
                          },
                        ]"
                      >
                        {{ product.isFeatured ? 'Featured' : 'Not Featured' }}
                      </span>
                    </td>
                    <td>
                      <button
                        @click="editProduct(product)"
                        :disabled="isLoading"
                        class="btn btn-sb btn-outline"
                      >
                        Edit
                      </button>
                      <router-link :to="`/products/${product.id}`">
                      <button
                        class="btn btn-sb btn-outline"
                      >
                        View
                      </button>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'orders'" class="tab-content">
          <div class="form-section">
            <h2>{{ editingOrderId ? 'Edit Order' : 'Create new order' }}</h2>

            <form @submit.prevent="handleOrderSubmit" class="order-form">
              <div class="form-grid">
                <div class="form-field">
                  <label>User ID (Empty will be guest order)</label>
                  <input
                    v-model="orderForm.userId"
                    type="number"
                    :disabled="isLoading"
                    placeholder="UserID for customer order"
                  />
                </div>

                <div class="form-field">
                  <label>Subtotal *</label>
                  <input v-model="orderForm.subtotal"
                  type="number"
                  step="0.01"
                  required 
                  :disabled="isLoading"
                  placeholder="Subtotal for order"
                  @blur="orderForm.subtotal = toTwoDecimals(orderForm['subtotal'])">
                  </input>
                </div>

                 <div class="form-field">
                  <label>Discount</label>
                  <input v-model="orderForm.discount"
                  type="number"
                  step="0.01"
                  :disabled="isLoading"
                  placeholder="Discount for order"
                  @blur="orderForm.discount = toTwoDecimals(orderForm['discount'])">
                  </input>
                </div>

                <div class="form-field">
                  <label>Total *</label>
                  <input v-model="orderForm.total"
                  type="number"
                  step="0.01"
                  required 
                  :disabled="isLoading"
                  placeholder="Total for order"
                  @blur="orderForm.total = toTwoDecimals(orderForm['total'])">
                  </input>
                </div>

              <div class="form-field">
                  <label>Order Status *</label>
                  <select v-model="orderForm.status" required :disabled="isLoading">
                    <option value="" disabled>Select order status...</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                 <div class="form-field">
                  <label>Notes</label>
                  <input v-model="orderForm.notes"
                  type="text"
                  :disabled="isLoading"
                  placeholder="Notes for order">
                  </input>
                </div>

                 <div class="form-field">
                  <label>Coupon code</label>
                  <input v-model="orderForm.couponCode"
                  type="text"
                  :disabled="isLoading"
                  placeholder="Coupon code for order">
                  </input>
                </div>

                <div class="form-field">
                  <label>Customer Name *</label>
                  <textarea
                    v-model="orderForm.customerName"
                    required
                    :disabled="isLoading"
                    rows="1"
                    placeholder="Enter customers first and last name..."
                  ></textarea>
                </div>

              <div class="form-field">
            <label>Customer Email *</label>
            <input
              v-model="orderForm.customerEmail"
              type="email"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-field">
            <label for="phone">Customer Phone *</label>
            <input
              v-model="orderForm.customerPhone"
              type="tel"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-field">
            <label for="phone">Customer Address *</label>
            <input
              v-model="orderForm.customerAddress"
              type="text"
              required
              :disabled="isLoading"
            />
          </div>
          </div>

              <div class="form-actions">
                <button type="submit" :disabled="isLoading" class="btn btn-primary">
                  {{
                    isLoading ? 'Saving...' : editingOrderId ? 'Update order' : 'Create order'
                  }}
                </button>

                <button
                  v-if="editingOrderId"
                  type="button"
                  @click="resetOrderForm"
                  :disabled="isLoading"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div class="orders-section">
            <h2>All orders</h2>
            <div v-if="loadingOrders" class="loading-state">Loading products...</div>

            <div v-else class="table-wrapper">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Subtotal</th>
                    <th>Total</th>
                    <th>Notes</th>
                    <th>Coupon Code</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Customer Phone</th>
                    <th>Customer Address</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in orders" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ order.userId }}</td>
                    <td>${{ parseFloat(order.subtotal).toFixed(2) }}</td>
                    <td>${{ parseFloat(order.total).toFixed(2) }}</td>
                    <td>{{ order.notes }}</td>
                    <td>{{ order.couponCode }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>{{ order.customerEmail }}</td>
                    <td>{{ order.customerPhone }}</td>
                    <td>{{ order.customerAddress }}</td>
                    <td>
                      <span :class="getOrderStatusBadge(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>
                      <button
                        @click="editOrder(order)"
                        :disabled="isLoading"
                        class="btn btn-sb btn-outline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'actions'" class="tab-content">
          <h2>Admin Actions Log</h2>
          <div v-if="loadingActions" class="loading-state">Loading actions...</div>

          <div v-else-if="adminActions.length === 0" class="empty-state">
            No admin actions recorded
          </div>

          <div v-else class="table-wrapper">
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
                <tr v-for="action in adminActions" :key="action.id">
                  <td>{{ formatDate(action.createdAt) }}</td>
                  <td>{{ action.admin.firstName }} {{ action.admin.lastName }}</td>
                  <td>{{ action.admin.id }}</td>
                  <td>
                    <span :class="getBadgeClass(action.action)">
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

      <div v-if="message.show" :class="['toast', `toast-${message.type}`]">
        {{ message.text }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEcommerceStore } from '@/stores/ecommerce'

const authStore = useAuthStore()
const store = useEcommerceStore()

const activeTab = ref('users')
const users = ref([])
const products = ref([])
const orders = ref([])
const adminActions = ref([])
const isLoading = ref(false)
const loadingUsers = ref(false)
const loadingActions = ref(false)
const loadingProducts = ref(false)
const loadingOrders = ref(false)
const editingUserId = ref(null)
const coupons = ref([])
const loadingCoupons = ref(false)
const editingCouponId = ref(null)
const editingProductId = ref(null)
const editingOrderId = ref(null)

const couponForm = reactive({
  code: '',
  type: 'PERCENTAGE',
  value: '',
  description: '',
  minOrder: '',
  maxDiscount: '',
  expiresAt: '',
  isActive: '',
})

const productForm = reactive({
  name: '',
  type: '',
  price: '',
  icon: '',
  description: '',
  isActive: false,
  isFeatured: false,
  stock: '',
})

const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  isAdmin: '',
  isActive: '',
})

const orderForm = reactive({
  userId: null,
  subtotal: '',
  discount: null,
  total: '',
  status: '',
  notes: null,
  couponCode: null,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
})

const message = reactive({
  show: false,
  text: '',
  type: 'success',
})

const getBadgeClass = (action) => {
  const actionType = action.toLowerCase()
  if (actionType.includes('create')) return 'badge badge-created'
  if (actionType.includes('update')) return 'badge badge-updated'
  if (actionType.includes('cancel')) return 'badge badge-cancelled'
  if (actionType.includes('deactivated')) return 'badge badge-deactivated'
  if (actionType.includes('reactivated')) return 'badge badge-reactivated'
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  if (tab === 'actions' && adminActions.value.length === 0) {
    fetchAllAdminActionsAsAdmin()
  } else if (tab === 'coupons' && coupons.value.length === 0) {
    fetchAllCouponsAsAdmin()
  } else if (tab === 'products' && products.value.length === 0) {
    fetchAllProductsAsAdmin()
  }
  else if (tab === 'orders' && orders.value.length === 0) {
    fetchAllOrdersAsAdmin()
  }
}

const showMessage = (text, type = 'success') => {
  message.show = true
  message.text = text
  message.type = type
  setTimeout(() => {
    message.show = false
  }, 4000)
}

const scrollFormIntoView = () => {
  const formSection = document.querySelector('.form-section')

  formSection.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })

}

const makeAuthenticatedRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...authStore.getAuthHeaders(),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401 || response.status === 403) {
    authStore.logout()
    throw new Error('Authentication failed - please log in again')
  }
  return response
}

const fetchAllUsersAsAdmin = async () => {
  loadingUsers.value = true
  try {
    const response = await makeAuthenticatedRequest('/api/users/admin')
    const data = await response.json()

    if (response.ok) {
      users.value = data.users
    } else {
      throw new Error(data.error || 'Failed to fetch users as admin')
    }
  } catch (error) {
    console.error('Error fetching users as admin:', error)
    showMessage(error.message, 'error')
  } finally {
    loadingUsers.value = false
  }
}

const fetchAllCouponsAsAdmin = async () => {
  loadingCoupons.value = true

  try {
    const response = await makeAuthenticatedRequest('/api/coupon/admin')
    const data = await response.json()

    if (response.ok) {
      coupons.value = data.coupons
    } else {
      throw new Error(data.error || 'Failed to fetch coupons as admin')
    }
  } catch (error) {
    console.error('Error fetching coupons as admin:', error)
    showMessage(error.message, 'error')
  } finally {
    loadingCoupons.value = false
  }
}

const fetchAllProductsAsAdmin = async () => {
  loadingProducts.value = true

  try {
    const response = await makeAuthenticatedRequest('/api/products/admin')
    const data = await response.json()

    if (response.ok) {
      products.value = data.products
    } else {
      throw new Error(data.error || 'Failed to fetch products as admin')
    }
  } catch (error) {
    console.error('Error fetching products as admin:', error)
    showMessage(error.message, 'error')
  } finally {
    loadingProducts.value = false
  }
}

const fetchAllOrdersAsAdmin = async () => {
  loadingOrders.value = true

  try {
    const response = await makeAuthenticatedRequest('/api/orders/admin')
    const data = await response.json()

    if (response.ok) {
      orders.value = data.orders
    } else {
      throw new Error(data.error || 'Failed to fetch orders as admin')
    }
  } catch (error) {
    console.error('Error fetching orders as admin:', error)
    showMessage(error.message, 'error')
  } finally {
    loadingOrders.value = false
  }
}

const handleOrderSubmit = async () => {
  isLoading.value = true

  try {
    const url = editingOrderId.value ? `/api/orders/admin/${editingOrderId.value}` : '/api/orders/admin'
    const method = editingOrderId.value ? 'PUT' : 'POST'
    const body = { ...orderForm }

    if(body.userId === '') {
      body.userId = null
    }

    let changes = {}
    if (editingOrderId.value) {
      const currentOrder = orders.value.find((o) => o.id === editingOrderId.value)
      if (currentOrder) {
        Object.keys(body).forEach((key) => {
          if (body[key] !== currentOrder[key]) {
            changes[key] = {
              from: currentOrder[key],
              to: body[key],
            }
          }
        })
      }
    }

    const response = await makeAuthenticatedRequest(url, {
      method,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      showMessage(data.message)
      resetOrderForm()
      scrollFormIntoView();
      await Promise.all([fetchAllOrdersAsAdmin(), fetchAllAdminActionsAsAdmin()])
    } else {
      throw new Error(data.error || 'Operation failed')
    }
  } catch (error) {
    console.error('Error submitting order:', error)
    showMessage(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return 'badge status-pending'
    case 'PREPARING':
      return 'badge status-preparing'
    case 'CONFIRMED':
      return 'badge status-confirmed'
    case 'SHIPPED':
      return 'badge status-shipped'
    case 'DELIVERED':
      return 'badge status-delivered'
    case 'CANCELLED':
      return 'badge status-cancelled'
  }
}


const handleCouponSubmit = async () => {
  isLoading.value = true

  try {
    const url = editingCouponId.value
      ? `/api/coupon/admin/${editingCouponId.value}`
      : '/api/coupon/admin'

    const formData = {
      code: couponForm.code,
      type: couponForm.type,
      value: parseFloat(couponForm.value),
      description: couponForm.description,
      minOrder: couponForm.minOrder === null ? 0 : parseFloat(couponForm.minOrder),
      maxDiscount: couponForm.maxDiscount === '' ? null : parseFloat(couponForm.maxDiscount),
      isActive: couponForm.isActive,
      expiresAt: couponForm.expiresAt,
    }

    const response = await makeAuthenticatedRequest(url, {
      method: editingCouponId.value ? 'PUT' : 'POST',
      body: JSON.stringify(formData),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Operation failed')
    }

    if (data.isExisting && !editingCouponId.value) {
      showMessage(data.message)
      editCoupon(data.coupon)
      return

    }
    showMessage(data.message)
    resetCouponForm()
    scrollFormIntoView();
    await Promise.all([fetchAllCouponsAsAdmin(), fetchAllAdminActionsAsAdmin()])
  } catch (error) {
    console.error('Error submitting coupon:', error)
    showMessage(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const editCoupon = (coupon) => {
  editingCouponId.value = coupon.id

  let formattedDate = ''
  if (coupon.expiresAt) {
    const utcDate = new Date(coupon.expiresAt)
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
    formattedDate = localDate.toISOString().slice(0, 16)
  }

    couponForm.code = coupon.code,
    couponForm.type = coupon.type,
    couponForm.value = toTwoDecimals(coupon.value),
    couponForm.description = coupon.description || '',
    couponForm.minOrder = coupon.minOrder === 0 || coupon.minOrder === '0' ? null : toTwoDecimals(coupon.minOrder),
    couponForm.maxDiscount =
      parseFloat(coupon.maxDiscount) > 0
        ? toTwoDecimals(coupon.maxDiscount)
        : null,
    couponForm.expiresAt = formattedDate,
    couponForm.isActive = coupon.isActive,
  scrollFormIntoView();
}

const editProduct = (product) => {
  editingProductId.value = product.id
  
  productForm.name = product.name,
  productForm.type = product.type,
  productForm.price = toTwoDecimals(product.price),
  productForm.icon = product.icon,
  productForm.description = product.description || '',
  productForm.isActive = product.isActive,
  productForm.isFeatured = product.isFeatured,
  productForm.stock = product.stock,

  scrollFormIntoView();
}


const handleProductSubmit = async () => {
  isLoading.value = true

  try {
    const url = editingProductId.value
      ? `/api/products/admin/${editingProductId.value}`
      : '/api/products/admin'

    const formData = {
      name: productForm.name,
      type: productForm.type,
      price: parseFloat(productForm.price),
      icon: productForm.icon || 'spoon-and-fork',
      description: productForm.description,
      isActive: productForm.isActive,
      isFeatured: productForm.isFeatured,
      stock: productForm.stock,
    }

    const response = await makeAuthenticatedRequest(url, {
      method: editingProductId.value ? 'PUT' : 'POST',
      body: JSON.stringify(formData),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Operation failed')
    }

    if (data.isExisting && !editingProductId.value) {
      showMessage(data.message, 'info')
      editProduct(data.product)
      return
    }
    showMessage(data.message)
    resetProductForm()
    scrollFormIntoView();
    await Promise.all([fetchAllProductsAsAdmin(), fetchAllAdminActionsAsAdmin(), store.initializeStore()])
  } catch (error) {
    console.error('Error submitting product:', error)
    showMessage(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const resetProductForm = () => {
    productForm.name = '',
    productForm.type = '',
    productForm.price = '',
    productForm.icon = '',
    productForm.description = '',
    productForm.isActive = false,
    productForm.isFeatured = false,
    productForm.stock = '',
    editingProductId.value = null
}

const formatProductType = (type) => {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

const isCouponExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const resetCouponForm = () => {
    couponForm.code = '',
    couponForm.type = 'PERCENTAGE',
    couponForm.value = '',
    couponForm.description = '',
    couponForm.minOrder = '',
    couponForm.maxDiscount = '',
    couponForm.expiresAt = '',
    couponForm.isActive = true,
    editingCouponId.value = null
}

const formatCouponValue = (coupon) => {
  return coupon.type === 'PERCENTAGE' ? `${parseFloat(coupon.value).toFixed(2)}%` : `$${parseFloat(coupon.value).toFixed(2)}`
}

const formatCouponType = (type) => {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

const fetchAllAdminActionsAsAdmin = async () => {
  loadingActions.value = true
  try {
    const response = await makeAuthenticatedRequest('/api/admin/actions')
    const data = await response.json()

    if (response.ok) {
      adminActions.value = data.actions
    } else {
      throw new Error(data.error || 'Failed to fetch admin actions')
    }
  } catch (error) {
    console.error('Error fetching admin actions:', error)
    showMessage(error.message, 'error')
  } finally {
    loadingActions.value = false
  }
}

const resetUserForm = () => {
  userForm.firstName = ''
  userForm.lastName = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.address = ''
  userForm.password = ''
  userForm.isAdmin = false
  userForm.isActive = false
  editingUserId.value = null
}

const resetOrderForm = () => {
  orderForm.userId = null
  orderForm.subtotal = ''
  orderForm.discount = null
  orderForm.total = ''
  orderForm.status = ''
  orderForm.notes = null
  orderForm.couponCode = null
  orderForm.customerName = ''
  orderForm.customerEmail = ''
  orderForm.customerPhone = ''
  orderForm.customerAddress = ''
  editingOrderId.value = null
}

const handleUserSubmit = async () => {
  isLoading.value = true

  try {
    const url = editingUserId.value ? `/api/users/admin/${editingUserId.value}` : '/api/users/admin'
    const method = editingUserId.value ? 'PUT' : 'POST'
    const body = { ...userForm }

    let changes = {}
    if (editingUserId.value) {
      const currentUser = users.value.find((u) => u.id === editingUserId.value)
      if (currentUser) {
        Object.keys(body).forEach((key) => {
          if (body[key] !== currentUser[key]) {
            changes[key] = {
              from: currentUser[key],
              to: body[key],
            }
          }
        })
      }
      delete body.password
    }

    const response = await makeAuthenticatedRequest(url, {
      method,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error?.includes('remove your own administrator privileges')) {
        userForm.isAdmin = true
      }
      if (data.error?.includes('deactivate your own account')) {
        userForm.isActive = true
      }
    }

    if (response.ok) {
      showMessage(data.message)
      resetUserForm()
      scrollFormIntoView();
      await Promise.all([fetchAllUsersAsAdmin(), fetchAllAdminActionsAsAdmin()])
    } else {
      throw new Error(data.error || 'Operation failed')
    }
  } catch (error) {
    console.error('Error submitting user:', error)
    showMessage(error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const editUser = (user) => {
  editingUserId.value = user.id
  userForm.firstName = user.firstName
  userForm.lastName = user.lastName
  userForm.email = user.email
  userForm.phone = user.phone
  userForm.address = user.address
  userForm.isAdmin = user.isAdmin
  userForm.isActive = user.isActive
  userForm.password = ''

  scrollFormIntoView();
}

const editOrder = (order) => {
  orderForm.userId = order.userId
  orderForm.subtotal = parseFloat(order.subtotal).toFixed(2)
  orderForm.discount = order.discount
  orderForm.total = order.total
  orderForm.status = order.status
  orderForm.notes = order.notes
  orderForm.couponCode = order.couponCode
  orderForm.customerName = order.customerName
  orderForm.customerEmail = order.customerEmail
  orderForm.customerPhone = order.customerPhone
  orderForm.customerAddress = order.customerAddress
  editingOrderId.value = order.id

  scrollFormIntoView();
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

const toTwoDecimals = (value) => {
  if (value !== '' && value !== null && value !== undefined && value !== NaN);
      return Number(value).toFixed(2)
}


const formatActionType = (actionType) => {
  if (!actionType) return 'Unknown Action'
  return actionType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatActionDetails = (details) => {
  if (!details) return 'No details available'

  try {
    const parsed = JSON.parse(details)

    if (parsed.changes) {
      return Object.entries(parsed.changes)
        .map(([field, { from, to }]) => {
          if (field === 'expiresAt') {
            return `<strong>Expires At: </strong>${formatDate(from)} → ${formatDate(to)}`
          }
          if (field === 'price') {
            return `<strong>Price: </strong>$${toTwoDecimals(from)} → $${toTwoDecimals(to)}`
          }
          return `<strong>${field}: </strong>${from}\u00A0→\u00A0${to}`
        })
        .join('<br>')
    }

    if (parsed.id) {
      return `<strong>First Name: </strong>${parsed.firstName}<br><strong>Last name: </strong>${parsed.lastName}<br><strong>Email: </strong>${parsed.email}<br> <strong>Admin: </strong>${parsed.isAdmin}<br><strong>Active: </strong>${parsed.isActive}`
    }

    if (parsed.code && parsed.type) {
      const value = parsed.type === 'PERCENTAGE' ? `${parsed.value}%` : `$${parsed.value}`
      let expirationText

      if (parsed.expiresAt === null || parsed.expiresAt === undefined) {
        expirationText = 'Never'
      } else {
        try {
          expirationText = formatDate(parsed.expiresAt)
        } catch (error) {
          expirationText = 'Never'
        }
      }

      return `<strong>Created coupon: </strong>${parsed.code}<br> <strong>Type: </strong>${parsed.type}<br><strong>Value: </strong>${value}<br> <strong>Expires:</strong> ${expirationText}<br> <strong>Active:</strong> ${parsed.isActive}`
    }

     if (parsed.orderId) {
      const lines = [
      parsed.userId != null ? `<strong>User ID: </strong>${parsed.userId}` : null,
      parsed.total != null ? `
      <strong>Total: </strong>$${toTwoDecimals(
        parsed.total
      )}` : '', 
      parsed.status != null ? `<strong>Status:</strong> ${parsed.status}` : '',
      parsed.couponCode != null ? `<strong>Coupon code: </strong>${parsed.couponCode}` : '',
      parsed.subtotal != null ? `<strong>Subtotal: </strong>$${toTwoDecimals(parsed.subtotal)}` : '',
      parsed.discount != null ? `<strong>Discount: </strong>$${toTwoDecimals(parsed.discount)}` : ''
     ].filter(Boolean)

     return lines.join('<br>')
    }

    if (parsed.name) {
      return `<strong>Created product: </strong>${parsed.name}<br> <strong>Icon: </strong>${
        parsed.icon
      }<br><strong>Type: </strong>${parsed.type}<br> <strong>Price: </strong>$${toTwoDecimals(
        parsed.price
      )}<br> <strong>Active:</strong> ${parsed.isActive} <br> <strong>Featured:</strong> ${parsed.isFeatured}`
    }
    return JSON.stringify(parsed, null, 2).replace(/\n/g, '<br>')
  } catch (error) {
    return details
  }
}

onMounted(() => {
  if (authStore.isAdmin) {
    fetchAllUsersAsAdmin()
    fetchAllCouponsAsAdmin()
    fetchAllAdminActionsAsAdmin()
    fetchAllProductsAsAdmin()
    fetchAllOrdersAsAdmin()
  }
})
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-width: 100%;
}

.form-section h2 {
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
  font-weight: 600;
}

.user-form,
.product-form,
.coupon-form,
.order-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-grid > .form-field:last-child:nth-child(odd) {
  grid-column: 1 / span 2;
  justify-self: center;
  width: 50%;
  margin-bottom: 0px;
}

.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
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
  gap: 1rem;
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
  display: flex;
  justify-content: center;
  gap: 1rem;
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

.users-section h2,
.coupons-section h2,
.products-section h2,
.actions-section h2,
.actions-section,
.orders-section {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.admin-content {
  width: 100%;
  margin: 0 auto;
  padding: 0;
}

.users-section,
.coupons-section,
.products-section,
.actions-section,
.orders-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  width: 100%;
  min-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.users-table,
.actions-table,
.coupons-table,
.products-table,
.orders-table {
  width: 100%;
  min-width: 800px;
  table-layout: auto;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid gray;
  background: white;
  margin: 0;
}
.users-table th,
.actions-table th,
.users-table th,
.products-table th,
.orders-table th {
  text-align: center;
}
.users-table th,
.users-table td,
.actions-table th,
.actions-table td,
.coupons-table th,
.coupons-table td,
.products-table th,
.products-table td,
.orders-table th,
.orders-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid gray;
  border-right: 1px solid gray;
  text-align: center;
  vertical-align: middle;
  background: inherit;
}

.users-table th,
.actions-table th,
.coupons-table th,
.products-table th,
.orders-table th {
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
.coupons-table tbody tr:nth-child(even),
.products-table tbody tr:nth-child(even),
.orders-table tbody tr:nth-child(even) {
  background-color: lightgrey;
}

.users-table tbody tr:hover,
.actions-table tbody tr:hover,
.coupons-table tbody tr:hover,
.products-table tbody tr:hover,
.orders-table tbody tr:hover {
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

.badge-featured {
  background-color: #d4edda;
  color: #155724;
}

.badge-notfeatured {
  display: none;
  background-color: #f8d7da;
  color: #721c24;
}

.badge-expired {
  background-color: darkgrey;
  color: #495057;
  text-shadow: 0 0.5px 0.5px rgba(0, 0, 0, 0.6);
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


.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-preparing {
  background-color: #fd7e14;
  color: #fff9c4;
}

.status-confirmed {
  background-color: #17a2b8;
  color: darkblue;
}

.status-shipped {
  background-color: #6f42c1;
  color: #fce4ec;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.coupon-form textarea,
.product-form textarea,
.order-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.product-form select option[value=''] {
  display: none;
}

.product-form select option:not([value='']) {
  color: #333;
}

.product-form select:invalid {
  color: #999;
}

.coupon-form select,
.product-form select,
.order-form select {
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
  color: #0f5132;
}

.badge-updated {
  background-color: #cfe2ff;
  color: #084298;
}

.badge-cancelled {
  background-color: #f8d7da;
  color: #842029;
}

.badge-deactivated {
  background-color: #f8d7da;
  color: #842029;
}

.loading-state,
.empty-state {
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

.toast-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
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

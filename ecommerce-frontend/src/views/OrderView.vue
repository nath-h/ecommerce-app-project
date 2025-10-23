<template>
  <main class="wrapper">
    <GuestVerificationModal
      :show="showEmailModal"
      :loading="emailVerifying"
      :error="emailError"
      @verify="verifyEmail"
      @cancel="handleModalCancel"
      @close="handleModalClose"
    />
    <div v-if="loading" class="loading-container">
      <p>Loading your order...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h1>Order Not Found</h1>
      <p>{{ error }}</p>
      <router-link to="/" class="btn btn-primary"> Back to Home </router-link>
    </div>

    <div v-else-if="order" class="confirmation-container">
      <div class="order-section">
        <h2>Order Details</h2>
        <div class="order-info">
          <div class="info-row">
            <span class="label">Order ID:</span>
            <span class="value">{{ order.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">Order Date:</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value status" :class="order.status.toLowerCase()">
              {{ formatStatus(order.status) }}
            </span>
          </div>
          <div v-if="order.notes" class="info-row">
            <span class="label">Special Instructions:</span>
            <span class="value">{{ order.notes }}</span>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="customer-section">
        <h2>Delivery Information</h2>
        <div class="customer-info">
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">{{ order.customerName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ order.customerEmail }}</span>
          </div>
          <div v-if="order.customerPhone" class="info-row">
            <span class="label">Phone:</span>
            <span class="value">{{ order.customerPhone }}</span>
          </div>
          <div class="info-row">
            <span class="label">Address:</span>
            <span class="value address">{{ order.customerAddress }}</span>
          </div>
        </div>
      </div>

      <div class="items-section">
        <h2>Order Items</h2>
        <table class="order-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.orderItems" :key="item.id">
              <td>
                <i :class="`icofont-2x icofont-${item.product.icon}`"></i>
                {{ item.product.name }}
              </td>
              <td>${{ formatPrice(item.price) }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ formatPrice(item.price * item.quantity) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Subtotal:</strong></td>
              <td>
                <strong>${{ formatPrice(order.subtotal) }}</strong>
              </td>
            </tr>
            <tr v-if="order.discount && order.discount > 0" class="discount-row">
              <td colspan="3">
                <div class="coupon-info">
                  <strong>Coupon Applied:</strong>
                  {{ order.couponCode }}
                  <div v-if="order.couponDescription" class="coupon-description">
                    {{ order.couponDescription }}
                  </div>
                </div>
              </td>
              <td class="discount-amount">
                <strong>-${{ formatPrice(order.discount) }}</strong>
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="3"><strong>Total:</strong></td>
              <td>
                <strong>${{ formatPrice(order.total) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div v-if="cancelError" class="error-message">
        <p>{{ cancelError }}</p>
        <button @click="cancelError = null" class="close-error">x</button>
      </div>

      <div class="actions-section">
        <router-link to="/" class="btn btn-secondary"> Continue Shopping </router-link>
        <router-link v-if="authStore.user" to="/past-orders" class="btn btn-outline">
          View Order History
        </router-link>
        <button
          v-if="canCancelOrder"
          @click="cancelOrder"
          class="btn btn-danger"
          :disabled="isCancelling"
        >
          {{ isCancelling ? 'Cancelling...' : 'Cancel Order' }}
        </button>
      </div>

      <div v-if="order.status !== 'CANCELLED'" class="status-info">
        <h3>What happens next?</h3>
        <div class="status-steps">
          <div class="step" :class="{ active: isStepActive('PENDING') }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Order Received</h4>
              <p>We've received your order and will review it shortly.</p>
            </div>
          </div>
          <div class="step" :class="{ active: isStepActive('CONFIRMED') }">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Order Confirmed</h4>
              <p>
                Your order has been confirmed and we're preparing it for delivery. Check back here
                for updates!
              </p>
            </div>
          </div>

          <div class="step" :class="{ active: isStepActive('SHIPPED') }">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Out for Delivery</h4>
              <p>Your order is on its way to you!</p>
            </div>
          </div>
          <div class="step" :class="{ active: isStepActive('DELIVERED') }">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Delivered</h4>
              <p>Your order has been delivered. Enjoy!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'
import GuestVerificationModal from '@/components/GuestVerificationModal.vue'

export default {
  components: {
    GuestVerificationModal,
  },
  name: 'OrderView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const ecommerceStore = useEcommerceStore()
    const authStore = useAuthStore()
    const order = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const cancelError = ref(null)
    const isCancelling = ref(false)
    const showEmailModal = ref(false)
    const emailVerifying = ref(false)
    const emailError = ref(null)

    const canCancelOrder = computed(() => {
      if (!order.value) return false
      return ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.value.status)
    })

    const fetchOrder = async (customerEmail = null) => {
      loading.value = true
      error.value = null
      emailError.value = ''

      try {
        const orderId = route.params.id
        let url = `/api/orders/${orderId}`

        if (authStore && authStore.userId) {
          url += `?userId=${authStore.userId}`
        } else if (customerEmail) {
          url += `?customerEmail=${encodeURIComponent(customerEmail)}`
        } else {
          showEmailModal.value = true
          loading.value = false
          return
        }

        const response = await fetch(url)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found')
          } else if (response.status === 403) {
            if (!authStore.user) {
              emailError.value = 'Invalid email address for this order'
              showEmailModal.value = true
              loading.value = false
              return
            }
            throw new Error('Access denied - this order does not belong to you')
          } else if (response.status === 401) {
            showEmailModal.value = true
            loading.value = false
            return
          } else {
            throw new Error('Failed to load order')
          }
        }

        order.value = await response.json()
        showEmailModal.value = false
      } catch (err) {
        error.value = err.message
        showEmailModal.value = false
      } finally {
        loading.value = false
      }
    }

    const verifyEmail = async (email) => {
      emailVerifying.value = true
      emailError.value = ''
      await fetchOrder(email)
      emailVerifying.value = false
    }

    const handleModalCancel = () => {
      router.push('/')
    }

    const handleModalClose = () => {
      router.push('/')
    }

    const cancelOrder = async () => {
      if (!order.value || isCancelling.value) return

      isCancelling.value = true
      cancelError.value = null
      try {
        await ecommerceStore.cancelOrder(order.value.id)
        order.value.status = 'CANCELLED'
      } catch (err) {
        console.error('Failed to cancel order:', err)
        cancelError.value = 'Failed to cancel order. Order has already been cancelled.'
        order.value.status = 'CANCELLED'
      } finally {
        isCancelling.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    const formatStatus = (status) => {
      return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const isStepActive = (stepStatus) => {
      if (!order.value) return false

      const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']
      const currentIndex = statusOrder.indexOf(order.value.status)
      const stepIndex = statusOrder.indexOf(stepStatus)

      return stepIndex <= currentIndex
    }

    onMounted(() => {
      fetchOrder()
    })

    return {
      order,
      loading,
      error,
      cancelError,
      isCancelling,
      canCancelOrder,
      authStore,
      cancelOrder,
      showEmailModal,
      emailVerifying,
      emailError,
      verifyEmail,
      handleModalCancel,
      handleModalClose,
      formatDate,
      formatPrice,
      formatStatus,
      isStepActive,
    }
  },
}
</script>

<style scoped>
.wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 50px 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-message p {
  margin: 0;
  flex: 1;
}

.close-error {
  background: none;
  border: none;
  font-size: 20px;
  color: #721c24;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-error:hover {
  background-color: rgba(114, 28, 36, 0.1);
  border-radius: 50%;
}

.confirmation-container {
  text-align: center;
}

.success-header {
  margin-bottom: 40px;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.success-header h1 {
  color: #28a745;
  margin-bottom: 15px;
}

.confirmation-message {
  font-size: 18px;
  color: #6c757d;
  margin: 0;
}

.order-section,
.customer-section,
.items-section,
.actions-section,
.status-info {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: left;
}

.order-section h2,
.customer-section h2,
.items-section h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
}

.order-info,
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-row .label {
  font-weight: bold;
  color: #555;
  min-width: 120px;
}

.info-row .value {
  flex: 1;
  text-align: right;
}

.address {
  text-align: right !important;
  white-space: pre-line;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status.pending {
  background-color: #ffc107;
  color: #000;
  margin-left: 10px;
}

.status.confirmed {
  background-color: #17a2b8;
  color: white;
}

.status.preparing {
  background-color: #fd7e14;
  color: white;
}

.status.shipped {
  background-color: #6f42c1;
  color: white;
}

.status.delivered {
  background-color: #28a745;
  color: white;
}

.status.cancelled {
  background-color: #dc3545;
  color: white;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.order-table th,
.order-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.order-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.discount-row {
  background-color: #e8f5e8;
}

.coupon-info {
  text-align: left;
}

.coupon-description {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
  margin-top: 5px;
}

.discount-amount {
  color: #28a745;
  font-weight: bold;
}

.total-row {
  border-top: 2px solid #333;
  font-size: 18px;
  font-weight: bold;
}

.actions-section {
  text-align: center;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-info h3 {
  margin-bottom: 20px;
  color: #333;
}

.status-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 30px;
  height: 30px;
  background-color: #ddd;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step.active .step-number {
  background-color: #42b983;
  color: white;
}

.step-content h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.step-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .wrapper {
    padding: 10px;
  }

  .info-row {
    flex-direction: column;
    gap: 5px;
  }

  .info-row .value {
    text-align: left;
  }

  .actions-section {
    flex-direction: column;
  }

  .order-table {
    font-size: 14px;
  }

  .order-table th,
  .order-table td {
    padding: 8px 4px;
  }
}
</style>

<template>
  <main class="wrapper">
    <h1>Past Orders</h1>
    <div v-if="loading" class="loading-state">
      <p>Loading your orders...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/login" class="btn btn-primary"> Login </router-link>
    </div>

    <div v-else-if="orders.length > 0">
      <div class="orders-header">
        <p>Showing {{ orders.length }} of {{ totalOrders }} orders</p>
        <button
          v-if="pagination.pages > 1 && pagination.page < pagination.pages"
          @click="loadMore"
          class="btn btn-secondary"
          :disabled="loadingMore"
        >
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>

      <div v-for="order in orders" :key="order.id" class="order-section">
        <div class="order-header">
          <div class="order-header-top">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
              <p class="order-customer">
                <strong>Customer:</strong>
                {{ order.customerName }}
              </p>
              <p class="order-status">
                <strong>Status:</strong>
                <span :class="['status-badge', `status-${order.status.toLowerCase()}`]">
                  {{ formatStatus(order.status) }}
                </span>
              </p>

              <div v-if="hasOrderDiscount(order)">
                <p class="order-total-header">
                  <strong>
                    Order Subtotal:
                    <del style="color: red; margin-right: 8px">
                      {{ $formatCurrency(order.subtotal) }}
                    </del>
                  </strong>
                </p>
                <p class="order-total-header">
                  <strong>Order Total: {{ $formatCurrency(order.total) }}</strong>
                </p>
              </div>
              <div v-else>
                <p class="order-total-header">
                  <strong>Order total: {{ $formatCurrency(order.total) }}</strong>
                </p>
              </div>
            </div>

            <div class="order-actions">
              <router-link :to="`/order/${order.id}`" class="btn btn-outline">
                View Details
              </router-link>
              <button
                v-if="canCancelOrder(order)"
                @click="cancelOrder(order.id)"
                class="btn btn-danger"
                :disabled="cancellingOrders.includes(order.id)"
              >
                {{ cancellingOrders.includes(order.id) ? 'Cancelling...' : 'Cancel order' }}
              </button>
            </div>
          </div>
        </div>

        <table class="product-table">
          <thead>
            <tr>
              <td><span class="sr-only">Product Image</span></td>
              <td>Product</td>
              <td>Price (each)</td>
              <td>Quantity</td>
              <td>Total</td>
              <td><span class="sr-only">Actions</span></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.orderItems" :key="`{order.id}-${item.id}`">
              <td><i :class="`icofont-${item.product.icon} icofont-4x`"></i></td>
              <td>{{ item.product.name }}</td>
              <td>${{ formatPrice(item.price) }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ formatPrice(item.price * item.quantity) }}</td>
              <td>
                <button class="btn btn-dark" @click="addToCart(item.product.id, item.quantity)">
                  Add to Cart
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <button class="btn btn-dark" @click="addAllToCart(order)">
          Add all items to your cart
        </button>

        <div v-if="order.discount && order.discount > 0" class="savings-display">
          You saved: {{ $formatCurrency(order.discount) }}
          <span v-if="order.couponCode">using {{ order.couponCode }}!</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No past orders to display</p>
      <router-link to="/" class="btn btn-primary"> Start Shopping </router-link>
    </div>

    <div v-if="message.show" :class="['toast', `toast-${message.type}`]">
      {{ message.text }}
    </div>
  </main>
</template>

<script>
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted, computed, reactive } from 'vue'

export default {
  name: 'PastOrders',
  setup() {
    const store = useEcommerceStore()
    const authStore = useAuthStore()

    const orders = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const error = ref(null)
    const cancellingOrders = ref([])
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    })
    const message = reactive({
      show: false,
      text: '',
      type: 'success',
      timeoutId: null,
    })

    const totalOrders = computed(() => pagination.value.total)

    const fetchOrders = async (page = 1, append = false) => {
      if (page === 1) {
        loading.value = true
      } else {
        loadingMore.value = true
      }

      error.value = null

      try {
        const data = await store.storeFetchUserOrders(page, pagination.value.limit)

        if (append) {
          orders.value = [...orders.value, ...data.orders]
        } else {
          orders.value = data.orders
        }

        pagination.value = data.pagination
      } catch (error) {
        console.error('Error fetching orders:', error)
        error.value = error.message || 'Failed to load orders'
      } finally {
        loading.value = false
        loadingMore.value = false
      }
    }

    const loadMore = () => {
      if (pagination.value.page < pagination.value.pages) {
        fetchOrders(pagination.value.page + 1, true)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString()
    }

    const formatStatus = (status) => {
      return status.charAt(0) + status.slice(1).toLowerCase()
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    const addToCart = (productId, quantity) => {
      const success = store.addToCart(productId, quantity)
      if (!success) {
        showMessage('Unable to add item to cart. Check stock availability.', 'error')
      }
    }

    const addAllToCart = (order) => {
      let failedItems = []
      order.orderItems.forEach((item) => {
        const success = store.addToCart(item.product.id, item.quantity)
        if (!success) {
          failedItems.push(item.product.name)
        }
      })

      if (failedItems.length > 0) {
        showMessage(
          `Could not add some items to cart: ${failedItems.join(', ')}. Check stock availability.`,
          'error',
        )
      }
    }

    const hasOrderDiscount = (order) => {
      return order.discount && parseFloat(order.discount) > 0
    }

    const showMessage = (text, type = 'success') => {
      if (message.timeoutId) {
        clearTimeout(message.timeoutId)
      }

      message.show = true
      message.text = text
      message.type = type
      message.timeoutId = setTimeout(() => {
        message.show = false
        message.timeoutId = null
      }, 3000)
    }

    const canCancelOrder = (order) => {
      return ['PENDING'].includes(order.status)
    }

    const cancelOrder = async (orderId) => {
      if (cancellingOrders.value.includes(orderId)) return

      cancellingOrders.value.push(orderId)

      try {
        await store.cancelOrder(orderId)

        const order = orders.value.find((o) => o.id === orderId)
        if (order) {
          order.status = 'CANCELLED'
        }
        showMessage('Order cancelled successfully', 'success')
      } catch (error) {
        showMessage(error.message, 'error')
      } finally {
        cancellingOrders.value = cancellingOrders.value.filter((id) => id !== orderId)
      }
    }

    onMounted(() => {
      if (authStore.user) {
        fetchOrders()
      } else {
        error.value = 'Please log in to view your orders'
        loading.value = false
      }
    })

    return {
      orders,
      loading,
      loadingMore,
      error,
      message,
      cancellingOrders,
      pagination,
      totalOrders,
      fetchOrders,
      loadMore,
      formatDate,
      formatStatus,
      formatPrice,
      addAllToCart,
      addToCart,
      hasOrderDiscount,
      canCancelOrder,
      cancelOrder,
    }
  },
}
</script>

<style scoped>
.wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
}

.order-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 6px solid #ddd;
  border-radius: 8px;
}

.order-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ccc;
}

.order-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.order-header-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.order-date,
.order-customer,
.order-status,
.order-total-header {
  margin: 5px 0;
  color: #333;
}

.order-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.order-total-header {
  color: #42b983;
  font-size: 1.1em;
}

.status-badge {
  padding: 4px 6px;
  margin-left: 3px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-pending {
  background-color: #ffc107;
  color: #000;
}

.status-confirmed {
  background-color: #17a2b8;
  color: white;
}

.status-preparing {
  background-color: #fd7e14;
  color: white;
}

.status-shipped {
  background-color: #6f42c1;
  color: white;
}

.status-delivered {
  background-color: #28a745;
  color: white;
}

.status-cancelled {
  background-color: #dc3545;
  color: white;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.product-table th,
.product-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 3px solid #ddd;
}

.product-table thead td {
  background-color: #e9ecef;
  font-weight: bold;
}

.savings-display {
  color: #42b983;
  font-weight: bold;
  padding-top: 15px;
  font-size: 1.1em;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-dark {
  background-color: #343a40;
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .wrapper {
    padding: 10px;
  }

  .order-header-top {
    flex-direction: column;
    gap: 15px;
  }

  .order-actions {
    align-items: stretch;
  }

  .orders-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .product-table {
    font-size: 14px;
  }

  .product-table th,
  .product-table td {
    padding: 8px 4px;
  }
}
</style>

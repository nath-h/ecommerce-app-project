<template>
  <main class="wrapper">
    <h1>Checkout</h1>

    <div v-if="!authStore.user" class="guest-notice">
      <p>You are checking out as a guest.</p>
      <p>
        <router-link to="/login" class="login-link"> Login </router-link>
        or
        <router-link to="/register" class="register-link"> Register </router-link>
        to save your preferences and view order history.
      </p>
    </div>

    <div v-if="orderError" class="error-message" v-html="orderError"></div>

    <div v-if="cart.length === 0">
      <div class="empty-cart">
        <p>Your cart is empty!</p>
      </div>
      <div style="text-align: center; margin-top: 16px"></div>
      <router-link to="/products" class="btn btn-primary"> Go Shopping </router-link>
    </div>

    <div v-else>
      <div class="checkout-section">
        <h2>Order Summary</h2>
        <table class="checkout-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in enrichedCartItems" :key="item.productId">
              <td>
                <i
                  :class="getIconClass(item.icon)"
                  :ref="(el) => setIconRef(el, `${item.productId}`)"
                ></i
                >{{ item.name }}
              </td>
              <td>${{ item.price }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ $formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Subtotal:</strong></td>
              <td>
                <strong>{{ $formatCurrency(cartSubtotal) }}</strong>
              </td>
            </tr>
            <tr v-if="activeCoupon" class="coupon-row">
              <td colspan="3">
                <div class="coupon-applied">
                  <strong>Coupon applied:</strong>
                  {{ activeCoupon.code }}
                  <button
                    @click="ecommerceStore.removeCoupon()"
                    class="btn-remove-coupon"
                    title="Remove coupon"
                  >
                    &times;
                  </button>
                </div>
                <div class="coupon-description">
                  {{ activeCoupon.description }}
                </div>
              </td>
              <td class="discount-amount">
                <strong>-{{ $formatCurrency(couponDiscount) }}</strong>
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="3"><strong>Total:</strong></td>
              <td>
                <strong>{{ $formatCurrency(cartTotal) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        <div class="coupon-section">
          <h3>Have a coupon code?</h3>
          <div class="coupon-input-container">
            <input
              id="coupon"
              type="text"
              v-model="couponCode"
              placeholder="Enter coupon code"
              class="coupon-input"
              :class="{ error: couponError }"
              @input="ecommerceStore.clearCouponError()"
              @keyup.enter="applyCoupon"
            />
            <button
              @click="applyCoupon"
              class="btn btn-secondary"
              :disabled="!couponCode.trim() || (activeCoupon && !couponError)"
            >
              Apply
            </button>
          </div>
          <div v-if="couponError" class="error-message">
            {{ couponError }}
          </div>
          <div v-if="activeCoupon && !couponError" class="success-message">
            Coupon applied successfully! You saved
            {{ $formatCurrency(couponDiscount) }}
          </div>
        </div>
      </div>

      <div class="checkout-section">
        <h2>
          {{ authStore.user ? 'Customer Information' : 'Your information' }}
        </h2>
        <form @submit.prevent="submitOrder" class="checkout-form">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input
              type="text"
              id="name"
              v-model="customerInfo.name"
              required
              class="form-input"
              :placeholder="authStore.user ? '' : 'Enter your full name'"
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              v-model="customerInfo.email"
              required
              class="form-input"
              :placeholder="authStore.user ? '' : 'Enter your email address'"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              v-model="customerInfo.phone"
              class="form-input"
              :placeholder="authStore.user ? '' : 'Enter your phone number'"
              @input="formatPhoneInput"
              minlength="14"
            />
          </div>

          <div class="form-group">
            <label for="address">Delivery Address *</label>
            <textarea
              id="address"
              v-model="customerInfo.address"
              required
              class="form-input"
              rows="3"
              :placeholder="authStore.user ? '' : 'Enter your delivery address'"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Special Instructions</label>
            <textarea
              id="notes"
              v-model="customerInfo.notes"
              class="form-input"
              rows="2"
              placeholder="Any special delivery instructions? (Optional)"
            ></textarea>
          </div>

          <div class="checkout-actions">
            <router-link to="/" class="btn btn-secondary"> Continue Shopping </router-link>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Processing...' : 'Place Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'Checkout',
  setup() {
    const ecommerceStore = useEcommerceStore()
    const authStore = useAuthStore()
    const router = useRouter()

    const {
      cart,
      cartSubtotal,
      enrichedCartItems,
      cartTotal,
      activeCoupon,
      couponDiscount,
      couponError,
    } = storeToRefs(ecommerceStore)

    const { userPreferences } = storeToRefs(authStore)

    const isSubmitting = ref(false)
    const orderError = ref('')
    const couponCode = ref('')
    const customerInfo = ref({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    })
    const iconElements = ref({})
    const getIconClass = (icon) => {
      return `icofont-2x icofont-${icon}`
    }
    const setIconRef = (el, key) => {
      if (el) {
        iconElements.value[key] = el
      }
    }
    const validateIcons = () => {
      {
        Object.values(iconElements.value).forEach((iconElement) => {
          if (iconElement) {
            const computed = window.getComputedStyle(iconElement, '::before')
            const content = computed.getPropertyValue('content')

            if (content === 'none' || content === '""' || !content) {
              iconElement.className = 'icofont-2x icofont-spoon-and-fork'
            }
          }
        })
      }
    }

    onMounted(async () => {
      validateIcons()
      if (authStore.user && userPreferences.value) {
        customerInfo.value = {
          name: userPreferences.value.name || '',
          email: userPreferences.value.email || '',
          phone: userPreferences.value.phone || '',
          address: userPreferences.value.address || '',
          notes: '',
        }
      } else {
        customerInfo.value = {
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: '',
        }
      }
      await ecommerceStore.validateCartStock()

      if (ecommerceStore.stockValidationErrors && ecommerceStore.stockValidationErrors.length > 0) {
        orderError.value = `Cart validation error(s): <br>${ecommerceStore.stockValidationErrors.join('<br>')}`
      }

      if (couponError) {
        ecommerceStore.clearCouponError()
      }
    })

    const formatPhoneInput = (event) => {
      let value = event.target.value.replace(/[^0-9]/g, '')

      value = value.substring(0, 10)

      if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
      } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`
      }

      customerInfo.value.phone = value
    }

    const applyCoupon = () => {
      if (!couponCode.value.trim()) return

      if (ecommerceStore.applyCoupon(couponCode.value)) {
        couponCode.value = couponCode.value.toUpperCase()
      } else {
        couponCode.value = ''
      }
    }

    const submitOrder = async () => {
      isSubmitting.value = true
      orderError.value = ''

      try {
        if (!cart.value || cart.value.length === 0) {
          orderError.value = 'Your cart is empty. Please add items before checking out.'
        }

        const validationErrors = await ecommerceStore.validateCartStock()

        if (validationErrors && validationErrors.length > 0) {
          const errorMessage = validationErrors.join('')

          orderError.value = `Cart validation failed: ${errorMessage}`
          return
        }
        const orderData = ecommerceStore.createOrderData({
          customer: { ...customerInfo.value },
          cartItems: enrichedCartItems.value,
        })
        const result = await ecommerceStore.createOrder(orderData)
        if (result.success) {
          router.push(`/order-confirmation/${result.order.id}`)
        }
      } catch (error) {
        console.error('Order submission failed:', error)
        if (
          error.message.includes('Cart items are required') ||
          error.message.includes('cart was empty')
        ) {
          orderError.value = 'Your cart is empty. Please add items before checking out.'
        } else if (error.message.includes('Insufficient stock')) {
          orderError.value = `Order failed: ${error.message}`
        } else if (error.message.includes('Name, email, and address are required')) {
          orderError.value = 'Please fill in all required fields (Name, Email, Address).'
        } else {
          orderError.value = `Order submission failed: ${error.message || 'Please try again.'}`
        }
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      ecommerceStore,
      authStore,
      cart,
      cartTotal,
      cartSubtotal,
      enrichedCartItems,
      activeCoupon,
      couponDiscount,
      couponError,
      userPreferences,
      getIconClass,
      setIconRef,
      isSubmitting,
      couponCode,
      customerInfo,
      applyCoupon,
      submitOrder,
      formatPhoneInput,
      orderError,
    }
  },
}
</script>

<style scoped>
.guest-notice {
  background-color: #79a206;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.guest-notice p {
  color: white;
  opacity: 90%;
  text-align: center;
  margin: 0;
  font-weight: bold;
}

.login-link,
.register-link {
  color: #0e4379;
  text-decoration: none;
  font-weight: bold;
}

.login-link:hover,
.register-link:hover {
  text-decoration: underline;
}

.checkout-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkout-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.checkout-table th,
.checkout-table td {
  vertical-align: middle;
  padding: 10px 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  font-size: 18px;
}

.checkout-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.coupon-row {
  background-color: #e8f5e8;
}

.coupon-applied {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-remove-coupon {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-remove-coupon:hover {
  color: #c82333;
}

.coupon-description {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.discount-amount {
  color: #28a745;
  font-weight: bold;
}

.total-row {
  border-top: 2px solid #333;
  font-size: 18px;
}

.coupon-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.coupon-section h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.coupon-input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.coupon-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.coupon-input.error {
  border-color: #dc3545;
}

.coupon-input:focus {
  outline: none;
  border-color: #42b983;
}

.error-message {
  background-color: #f8d7da;
  color: rgb(115, 13, 13);
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  font-weight: bold;
}

.success-message {
  color: #28a745;
  font-size: 14px;
  margin-top: 5px;
  font-weight: bold;
}

.checkout-form {
  max-width: 500px;
  text-align: left;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
}

.checkout-actions {
  display: flex;
  gap: 15px;
  justify-content: space-between;
  margin-top: 30px;
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
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-cart {
  background-color: #79a206;
  border: 1px solid #2196f3;
  margin-bottom: -10px;
  border-radius: 8px;
  text-align: center;
  color: white;
  opacity: 90%;
  font-weight: bold;
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
</style>

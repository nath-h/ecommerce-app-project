<template>
  <div class="sidebar-overlay" @click.self="store.toggleSidebar">
    <aside class="cart-container" @click.stop>
      <div class="cart">
        <h1 class="cart-title spread">
          <span>
            Cart
            <i class="icofont-cart-alt icofont-1x"></i>
          </span>
          <button class="cart-close" @click="store.toggleSidebar">&times;</button>
        </h1>

        <div class="cart-body">
          <table class="cart-table">
            <thead>
              <tr>
                <th><span class="sr-only">Product Image</span></th>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in store.enrichedCartItems"
                :key="item.productId"
                style="font-size: 15px"
              >
                <td>
                  <i
                    :class="getIconClass(item.icon)"
                    :ref="(el) => setIconRef(el, item.productId)"
                  ></i>
                </td>
                <td>{{ item.name }}</td>
                <td>{{ $formatCurrency(item.price) }}</td>
                <td class="center">
                  <div class="quantity-controls">
                    <button
                      @click="decrementQuantity(item.productId)"
                      :disabled="item.quantity <= 1"
                      class="btn btn-light"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      :value="item.quantity"
                      @change="updateQuantity(item.productId, $event.target.value)"
                      @blur="$event.target.value = item.quantity"
                      min="1"
                      :max="item.product.stock"
                      class="qty-input"
                    />
                    <button
                      @click="incrementQuantity(item.productId)"
                      :disabled="item.quantity >= item.product.stock"
                      class="btn btn-light"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  {{ $formatCurrency(item.total) }}
                </td>
                <td class="center">
                  <button
                    @click="store.removeFromCart(item.productId)"
                    class="btn btn-light cart-remove"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p class="center" v-if="!store.enrichedCartItems.length">
            <em>No items in cart</em>
          </p>
          <hr v-if="store.enrichedCartItems.length" style="border: 2px solid #ccc" />
          <div style="margin-top: 15px">
            <span v-if="store.cartSubtotal - store.cartTotal > 0">
              Order total:
              <del style="color: red; margin-right: 8px">
                {{ $formatCurrency(store.cartSubtotal) }}
              </del>
              {{ $formatCurrency(store.cartTotal) }}
            </span>
            <span v-else>
              <strong>Total:</strong>
              {{ $formatCurrency(store.cartTotal) }}
            </span>
          </div>
          <p v-if="store.cartSubtotal - store.cartTotal > 0" style="color: green">
            You are saving {{ $formatCurrency(store.cartSubtotal - store.cartTotal) }} with coupon
            code <strong>'{{ store.activeCoupon.code }}'!</strong>
          </p>
        </div>
        <div class="cart-buttons">
          <button @click="store.clearCart" class="btn btn-light">Clear cart</button>
          <router-link to="/checkout" @click="store.toggleSidebar">
            <button class="btn btn-light">Checkout</button>
          </router-link>
        </div>
        <div v-if="store.error" style="color: red; padding-top: 20px">
          {{ store.error }}
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import { useEcommerceStore } from '@/stores/ecommerce'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const store = useEcommerceStore()
    const iconElements = ref({})

    const getIconClass = (icon) => {
      return `icofont-3x icofont-${icon}`
    }

    const setIconRef = (el, productId) => {
      if (el) {
        iconElements.value[productId] = el
      }
    }

    const validateIcons = () => {
      {
        Object.values(iconElements.value).forEach((iconElement) => {
          if (iconElement) {
            const computed = window.getComputedStyle(iconElement, '::before')
            const content = computed.getPropertyValue('content')

            if (content === 'none' || content === '""' || !content) {
              iconElement.className = 'icofont-3x icofont-spoon-and-fork'
            }
          }
        })
      }
    }

    const updateQuantity = (productId, newQuantity) => {
      store.updateCartItemQuantity(productId, newQuantity)
    }

    const incrementQuantity = (productId) => {
      const cartItem = store.cart.find((item) => item.productId === productId)
      if (cartItem) {
        store.updateCartItemQuantity(productId, cartItem.quantity + 1)
      }
    }

    const decrementQuantity = (productId) => {
      const cartItem = store.cart.find((item) => item.productId === productId)
      if (cartItem && cartItem.quantity > 1) {
        store.updateCartItemQuantity(productId, cartItem.quantity - 1)
      }
    }

    onMounted(() => {
      validateIcons()
    })

    return {
      store,
      getIconClass,
      setIconRef,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
    }
  },
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-end;
}
.cart-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.qty-btn {
  width: 25px;
  height: 25px;
  border: 1px solid #ccc;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: bold;
  border-radius: 3px;
}

.qty-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 40px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 3px;
}
</style>

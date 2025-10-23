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
                <td class="center">{{ $formatNumber(item.quantity) }}</td>
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
          <div class="spread">
            <span>
              <strong>Total:</strong>
              {{ $formatCurrency(store.cartTotal) }}
            </span>
            <button @click="store.clearCart" class="btn btn-light">Clear cart</button>
            <router-link to="/checkout" @click="store.toggleSidebar">
              <button class="btn btn-light">Checkout</button>
            </router-link>
          </div>
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

    onMounted(() => {
      validateIcons()
    })

    return {
      store,
      getIconClass,
      setIconRef,
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
</style>

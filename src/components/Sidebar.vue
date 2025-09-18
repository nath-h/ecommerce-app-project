<template>
  <aside class="cart-container">
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
            <tr v-for="item in store.enrichedCartItems" :key="item.productId">
              <td>
                <i :class="`icofont-${item.icon} icofont-3x`"></i>
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
          <span
            ><strong>Total:</strong>
            {{ $formatCurrency(store.cartTotal) }}</span
          >
          <router-link to="/checkout" @click="store.toggleSidebar">
            <button class="btn btn-light">Checkout</button>
          </router-link>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  setup() {
    const store = useEcommerceStore();

    return {
      store,
    };
  },
};
</script>

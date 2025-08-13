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
            <tr v-for="(quantity, key, i) in store.cart" :key="i">
              <td>
                <i
                  :class="`icofont-${store.getProductIcon(key)} icofont-3x`"
                ></i>
              </td>
              <td>{{ key }}</td>
              <td>{{ $formatCurrency(store.getProductPrice(key)) }}</td>
              <td class="center">{{ $formatNumber(quantity) }}</td>
              <td>
                {{ $formatCurrency(quantity * store.getProductPrice(key)) }}
              </td>
              <td class="center">
                <button
                  @click="store.removeFromCart(key)"
                  class="btn btn-light cart-remove"
                >
                  &times;
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="center" v-if="!Object.keys(store.cart).length">
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

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
              <td>${{ store.getProductPrice(key).toFixed(2) }}</td>
              <td class="center">{{ quantity }}</td>
              <td>${{ (quantity * store.getProductPrice(key)).toFixed(2) }}</td>
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
          <span><strong>Total:</strong> ${{ store.cartTotal }}</span>
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

<!-- Sidebar.vue, previous

<template>
  <aside class="cart-container">
    <div class="cart">
      <h1 class="cart-title spread">
        <span>
          Cart
          <i class="icofont-cart-alt icofont-1x"></i>
        </span>
        <button class="cart-close" @click="toggle">&times;</button>
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
            <tr v-for="(quantity, key, i) in cart" key="i">
              <td><i :class="`icofont-${getIcon(key)} icofont-3x`"></i></td>
              <td>{{ key }}</td>
              <td>${{ getPrice(key).toFixed(2) }}</td>
              <td class="center">{{ quantity }}</td>
              <td>${{ (quantity * getPrice(key)).toFixed(2) }}</td>
              <td class="center">
                <button @click="remove(key)" class="btn btn-light cart-remove">
                  &times;
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="center" v-if="!Object.keys(cart).length">
          <em>No items in cart</em>
        </p>
        <div class="spread">
          <span><strong>Total:</strong> ${{ calculateTotal() }}</span>
          <router-link to="/checkout" @click="toggle">
            <button class="btn btn-light">Checkout</button>
          </router-link>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    toggle: Function,
    cart: Object,
    inventory: Array,
    remove: Function,
  },
  methods: {
    getIcon(name) {
      const product = this.inventory.find(
        (product) => product.name.toLowerCase() === name.toLowerCase()
      );
      return product ? product.icon : 'question';
    },
    getPrice(name) {
      const product = this.inventory.find((p) => {
        return p.name === name;
      });
      return product.price.USD;
    },
    calculateTotal() {
      const total = Object.entries(this.cart).reduce((acc, curr) => {
        const price = this.getPrice(curr[0]);
        const itemTotal = price * curr[1];
        return acc + itemTotal;
      }, 0);
      return total.toFixed(2);
    },
  },
};
</script>
-->

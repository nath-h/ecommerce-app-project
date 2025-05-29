<!-- TODO: Display icon images with the ProductCard on Home and PastOrders. I believe we will only need to modify the ProductCard to get it working on both pages. -->

<template>
  <header class="top-bar spread">
    <nav class="top-bar-nav">
      <router-link to="/" class="top-bar-link">
        <i class="icofont-spoon-and-fork"></i>
        <span>Home</span>
      </router-link>
      <router-link to="/products" class="top-bar-link">
        <span>Products</span>
      </router-link>
      <router-link to="/past-orders" class="top-bar-link">
        <span>Past Orders</span>
      </router-link>
    </nav>
    <a href="#" class="top-bar-cart-link" @click.prevent="toggleSidebar">
      <i class="icofont-cart-alt icofont-1x"></i>
      <span>Cart ({{ totalQuantity }})</span>
    </a>
  </header>
  <router-view :inventory="inventory" :addToCart="addToCart" />
  <Sidebar
    v-if="showSidebar"
    :toggle="toggleSidebar"
    :cart="cart"
    :inventory="inventory"
    :remove="removeItem"
  />
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import food from '@/food.json';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      showSidebar: false,
      inventory: food,
      cart: {},
    };
  },
  computed: {
    totalQuantity() {
      return Object.values(this.cart).reduce((acc, curr) => {
        return acc + curr;
      }, 0);
    },
  },
  methods: {
    addToCart(name, quantity) {
      if (quantity === undefined) {
        quantity = 0;
      }
      if (quantity <= 0) {
        return;
      }
      if (!this.cart[name]) this.cart[name] = 0;
      this.cart[name] += quantity;
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    removeItem(name) {
      delete this.cart[name];
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>

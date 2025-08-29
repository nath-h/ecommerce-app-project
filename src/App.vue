<!-- TODO:              
              USER FUNCTIONALITY:
          Filter by: type, price(low-high, high-low). Should be able to copy some of the functionality in ProductSearch
          Cancel/edit orders (if not complete, simulate timeframe)
          Order confirmation and email receipt - status updates? (EmailJS or Vercel backend with Nodemailer, sendgrid, or mailgun)
          Guest checkout (should just be able to edit the checkout page)         
          Fake payment integration (stripe test mode?)
          Individual product pages with description of product
          
          ADMIN FUNCTIONALITY:
          Cancel/edit orders
          Add/disable/edit discount codes
          Set flag for an admin account to give access to admin dashboard
          Add/remove items from display
          Add/delete accounts (or disable for data integrity)
          Order status tracking/updates (may not be worth it)
          Basic analytics such as sales, popular products
          
          DATABASE FUNCTIONALITY:   
          Order history saved to user account
          Inventory tracking (can't order more than in stock, enforce stock in product)
          Check to ensure 2 orders don't go through at once and out of stock things because of a double order

-->

<template>
  <header class="top-bar spread">
    <nav class="top-bar-nav">
      <router-link
        to="/"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <i class="icofont-spoon-and-fork"></i>
        <span>Home</span>
      </router-link>
      <router-link
        to="/products"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <span>Products</span>
      </router-link>
      <router-link
        to="/past-orders"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <span>Past Orders</span>
      </router-link>
      <router-link
        to="/checkout"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <span>Checkout</span>
      </router-link>
      <router-link
        to="/register"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <span>Register</span>
      </router-link>
      <router-link
        to="/login"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()"
      >
        <span>Log In</span>
      </router-link>
    </nav>
    <a
      href="#"
      class="top-bar-cart-link"
      @click.prevent="store.toggleSidebar()"
    >
      <i class="icofont-cart-alt icofont-1x"></i>
      <span>Cart ({{ store.totalQuantity }})</span>
    </a>
  </header>
  <router-view />
  <Sidebar v-if="store.showSidebar" />
</template>

<script>
import { onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  components: {
    Sidebar,
  },
  setup() {
    const store = useEcommerceStore();

    onMounted(() => {
      store.initializeStore();
    });

    return {
      store,
    };
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

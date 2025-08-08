<!-- TODO:              
              HOUSEKEEPING:
          Lots of duplicate code leftover from modifying the checkout page. Discount logic per item and for entire order total is
          likely duplicated in several places
          Coupon BIGORDER allows you to make your cart total $50+, add another item to cart, and remove previous items making total
          <$50 but still allows use of that coupon. Will need to add a check every time you go back to checkout or when placing order.
          
              USER FUNCTIONALITY:
          Cancel/edit orders (if not complete, simulate timeframe)
          Order confirmation and email receipt
          Login, registration, password reset
          Order history saved to user account
          Guest checkout (should just be able to edit the checkout page)         
          Form validation for above login, registration, password reset (may already be included in Vue such as on checkout page)
          Search, sort, filter capabilites on product/recommended page 
          Individual product pages with description of product
          Fake payment integration (stripe test mode?)

              ADMIN FUNCTIONALITY:
          Cancel/edit orders
          Add/disable/edit discount codes
          Set flag for an admin account to give access to admin dashboard
          Add/remove items from display
          Add/delete accounts (or disable for data integrity)
          Order status tracking/updates (may not be worth it)
          Basic analytics such as sales, popular products
          Integrate an api somehow (could be stripe test)

              DATABASE FUNCTIONALITY:
          Inventory tracking (can't order more than in stock)
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

<!-- App.vue, previous 

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
      <router-link to="/checkout" class="top-bar-link">
        <span>Checkout</span>
      </router-link>
    </nav>
    <a href="#" class="top-bar-cart-link" @click.prevent="toggleSidebar">
      <i class="icofont-cart-alt icofont-1x"></i>
      <span>Cart ({{ totalQuantity }})</span>
    </a>
  </header>
  <router-view
    :inventory="inventory"
    :addToCart="addToCart"
    :cart="cart"
    :completeOrder="completeOrder"
    :pastOrders="pastOrders"
    @clear-orders="clearOrders"
    @delete-order="deleteOrder"
  />
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
      pastOrders: [],
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
      this.showSidebar = true;
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    removeItem(name) {
      delete this.cart[name];
    },
    completeOrder(orderData) {
      this.pastOrders.push(orderData);
      this.cart = {};
      this.showSidebar = false;
      return Promise.resolve();
    },
    deleteOrder(orderId) {
      this.pastOrders = this.pastOrders.filter((order) => order.id !== orderId);
    },
    clearOrders() {
      this.pastOrders = [];
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
-->

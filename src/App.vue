<!-- TODO:              
              USER FUNCTIONALITY:
          User dropdown under/above cart (find default profile picture logo, take out Profile from navbar and reintegrate)        
          Filter by: type, price(low-high, high-low). Should be able to copy some of the functionality in ProductSearch
          Add pagination to ProductSearch (only show 20 items at a time)
          The above pagination may break ProductSearch so will need to find a workaround as it may only search the 20 currently displayed products
          Cancel/edit orders (if not complete, simulate timeframe)
          Order confirmation and email receipt - status updates? (EmailJS or Vercel backend with Nodemailer, sendgrid, or mailgun)
          Guest checkout (should just be able to edit the checkout page)         
          Fake payment integration (stripe test mode?)
          Eventually, a complete UI overhaul (Vue TransitionGroup conditional rendering animations?)
          
          ADMIN FUNCTIONALITY:
          Admin dashboard(Admin.vue, already have an /admin route)
          Cancel/edit orders (Order OrderStatus Enum AdminAction AdminActionType UPDATED/CANCELLED_ORDER Order.status = CANCELLED)
          Add/disable/edit discount codes (AdminAction AdminActionType CREATED_COUPON )
          Disable user account (AdminAction AdminActionType UPDATED_USER User.isActive = false)
          Add/remove items from display (AdminAction AdminActionType DISABLED/UPDATED_PRODUCT product.isActive = false)
          Add/delete accounts (or disable for data integrity)
          Order status tracking/updates (may not be worth it)
          Basic analytics such as sales, popular products
          
          DATABASE FUNCTIONALITY: 
          Add discount per item (search by item name, find by name, apply to id)  
          Order history saved to user account
          Inventory tracking (can't order more than in stock, enforce stock in product)
          Check to ensure 2 orders don't go through at once and out of stock things because of a double order

-->

<template>
  <header class="top-bar spread">
    <nav class="top-bar-nav">
      <TokenExpirationWarning />
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

      <template v-if="!authStore.isLoggedIn">
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
      </template>

      <template v-if="authStore.isLoggedIn">
        <router-link to="/profile" class="top-bar-link">
          <span>Profile</span>
        </router-link>
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="top-bar-link"
          @click="store.toggleSidebar()"
        >
          <span>Admin</span>
        </router-link>
        <a
          href="#"
          class="top-bar-link logout-link"
          @click.prevent="handleLogout"
        >
          <span>Logout</span>
        </a>
      </template>
    </nav>

    <div class="cart-section">
      <a
        href="#"
        class="top-bar-cart-link"
        @click.prevent="store.toggleSidebar()"
      >
        <i class="icofont-cart-alt icofont-1x"></i>
        <span>Cart ({{ store.totalQuantity }})</span>
      </a>
      <div v-if="authStore.isLoggedIn" class="user-info">
        <span class="welcome-text"
          >Welcome, {{ authStore.user.firstName }}!</span
        >
      </div>
    </div>
  </header>
  <router-view />
  <Sidebar v-if="store.showSidebar" />
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEcommerceStore } from '@/stores/ecommerce';
import { useAuthStore } from './stores/authStore';
import Sidebar from '@/components/Sidebar.vue';
import TokenExpirationWarning from './components/TokenExpirationWarning.vue';

export default {
  components: {
    Sidebar,
    TokenExpirationWarning,
  },
  setup() {
    const store = useEcommerceStore();
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
      authStore.logout();
      router.push('/login?logoutSuccess=true');
    };

    onMounted(() => {
      store.initializeStore();
      authStore.initializeAuth();
    });

    return {
      store,
      authStore,
      handleLogout,
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
  padding: 25px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.cart-section {
  display: flex;
  align-items: center;
}
</style>

<!-- TODO:              
              USER FUNCTIONALITY:
          Homepage: Selectable Recommended | Favorites link to toggle between them (will need favorited flag in db)         
          Edit orders (if not complete, simulate timeframe)
          Breadcrumb links that sort by type of item, favorites
          Filter by: type, price(low-high, high-low). Should be able to copy some of the functionality in ProductSearch
          Add pagination to ProductSearch (only show 20 items at a time) *might be done? add >20 and try to search*
          The above pagination may break ProductSearch so will need to find a workaround as it may only search the 20 currently displayed products
          Change ProductSearch to save the search query in router link - watch: (search value, route.query) for constant update - lodash debounce to avoid lag
          Order confirmation and email receipt - status updates? (EmailJS or Vercel backend with Nodemailer, sendgrid, or mailgun)
          User dropdown under/above cart (find default profile picture logo, take out Profile from navbar and reintegrate)        
          Fake payment integration (stripe test mode?)
          
          ADMIN FUNCTIONALITY:
          Admin product view UI (ProductView page except an admin version) - clicking on it can open admin actions such as disabling, changing stock, updating price
          Allow admin to add a product to recommended, will need to add a isRecommended flag in db
          Cancel/edit orders (Order OrderStatus Enum AdminAction AdminActionType UPDATED/CANCELLED_ORDER Order.status = CANCELLED)
          Add/remove items from display (AdminAction AdminActionType DISABLED/UPDATED_PRODUCT product.isActive = false)
          Order status tracking/updates (may not be worth it)
          Basic analytics such as sales, popular products (cron job)
          
          DATABASE FUNCTIONALITY: 
          Add and test pagination for every relevant page (we'll want a multiple of 3 for products since they display in rows of 3)
          Add discount per item (search by item name, find by name, apply to id)  
          Add scheduled backup using pg_dump and pg_restore (cron job on server)

          Visuals/frontend/css:
          Toast/snack bar notifications for actions (Vue Toastification?)
          Eventually, a complete UI overhaul (Vue TransitionGroup conditional rendering animations?)

-->

<template>
  <header class="top-bar spread">
    <nav class="top-bar-nav">
      <TokenExpirationWarning />
      <router-link
        to="/"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()">
        <i class="icofont-spoon-and-fork"></i>
        <span>Home</span>
      </router-link>
      <router-link
        to="/products"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()">
        <span>Products</span>
      </router-link>
      <router-link
        to="/past-orders"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()">
        <span>Past Orders</span>
      </router-link>
      <router-link
        to="/checkout"
        class="top-bar-link"
        @click="store.showSidebar && store.toggleSidebar()">
        <span>Checkout</span>
      </router-link>

      <template v-if="!authStore.isLoggedIn">
        <router-link
          to="/register"
          class="top-bar-link"
          @click="store.showSidebar && store.toggleSidebar()">
          <span>Register</span>
        </router-link>
        <router-link
          to="/login"
          class="top-bar-link"
          @click="store.showSidebar && store.toggleSidebar()">
          <span>Log In</span>
        </router-link>
      </template>

      <template v-if="authStore.isLoggedIn">
        <router-link
          to="/profile"
          class="top-bar-link">
          <span>Profile</span>
        </router-link>
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="top-bar-link"
          @click="store.showSidebar && store.toggleSidebar()">
          <span>Admin</span>
        </router-link>
        <a
          href="#"
          class="top-bar-link logout-link"
          @click.prevent="handleLogout">
          <span>Logout</span>
        </a>
      </template>
    </nav>

    <div class="cart-section">
      <a
        href="#"
        class="top-bar-cart-link"
        @click.prevent="store.toggleSidebar()">
        <i class="icofont-cart-alt icofont-1x"></i>
        <span>Cart ({{ store.totalQuantity }})</span>
      </a>
      <div
        v-if="authStore.isLoggedIn"
        class="user-info">
        <span class="welcome-text">Welcome, {{ authStore.user.firstName }}!</span>
      </div>
    </div>
  </header>
  <router-view />
  <Sidebar v-if="store.showSidebar" />
</template>

<script>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import { useEcommerceStore } from '@/stores/ecommerce';
  import Sidebar from '@/components/Sidebar.vue';
  import TokenExpirationWarning from './components/TokenExpirationWarning.vue';

  export default {
    components: {
      Sidebar,
      TokenExpirationWarning,
    },

    setup() {
      const authStore = useAuthStore();
      const store = useEcommerceStore();
      const router = useRouter();

      const handleLogout = async () => {
        authStore.logout();
        router.push('/login?logoutSuccess=true');
      };

      onMounted(async () => {
        try {
          authStore.initializeAuth();
          await store.initializeStore();
        } catch (error) {
          console.error('Failed to initialize', error);
        }
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

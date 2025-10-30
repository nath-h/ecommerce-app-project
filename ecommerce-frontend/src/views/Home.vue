<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Nathan's Necessities</h1>
      </div>
    </div>
    <main class="wrapper">
      <div v-if="dataCleared" class="success-message">Data cleared!</div>

      <button @click="handleClearAll" class="btn btn-danger">Clear All Locally Stored Data</button>

      <div class="product-content">
        <nav class="tab-nav">
          <button
            :class="['tab-btn', { active: activeTab === 'featured' }]"
            @click="setActiveTab('featured')"
          >
            Featured
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'favorites' }]"
            @click="setActiveTab('favorites')"
          >
            Favorites
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'all' }]"
            @click="setActiveTab('all')"
          >
            All Products
          </button>
        </nav>

        <section v-if="activeTab === 'featured'" class="tab-content">
          <ProductSearch
            :products="store.featuredProducts"
            :searchCategory="activeTab"
            title="Featured Products"
            @search-update="handleSearchUpdate"
          />
          <router-link to="/products" class="btn btn-primary" style="margin-bottom: 10px"
            >Shop all products</router-link
          >
        </section>
        <section v-if="activeTab === 'favorites'" class="tab-content">
          <div v-if="authStore.user === null" class="not-logged-in">
            <div class="not-logged-in-group">
              <h4 class="login-message">You must be logged in to view this tab.</h4>
              <div class="button-row">
                <router-link to="/products" class="btn btn-primary" style="margin-bottom: 10px"
                  >Shop all products</router-link
                >
                <router-link to="/login" class="btn btn-primary" style="margin-bottom: 10px"
                  >Login</router-link
                >
              </div>
            </div>
          </div>
          <div v-if="authStore.user !== null">
            <ProductSearch
              :products="authStore.user.favorites"
              :searchCategory="activeTab"
              title="Favorited Products"
              @search-update="handleSearchUpdate"
            />
            <router-link to="/products" class="btn btn-primary" style="margin-bottom: 10px">
              Shop all products
            </router-link>
          </div>
        </section>
        <section v-if="activeTab === 'all'" class="tab-content">
          <div v-if="authStore.user && authStore.user.isAdmin">
            <ProductSearch
              :products="store.products"
              :searchCategory="activeTab"
              title="All Products"
              @search-update="handleSearchUpdate"
            />
          </div>
          <div v-else>
            <ProductSearch
              :products="store.inventory"
              :searchCategory="activeTab"
              title="All Products"
              @search-update="handleSearchUpdate"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import ProductSearch from '@/components/ProductSearch.vue'
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted } from 'vue'

export default {
  name: 'Home',
  components: {
    ProductCard,
    ProductSearch,
  },
  setup() {
    const store = useEcommerceStore()
    const authStore = useAuthStore()
    const activeTab = ref('featured')
    const searchState = ref({ isActive: false, hasResults: false })
    const sortBy = ref('')

    const setActiveTab = (tab) => {
      if (tab !== activeTab.value) {
        searchState.value = { isActive: false, hasResults: false }
        activeTab.value = tab
      }
    }
    onMounted(() => {
      store.storeFetchProducts()
    })

    return {
      store,
      authStore,
      activeTab,
      setActiveTab,
      searchState,
      sortBy,
    }
  },
  data() {
    return {
      dataCleared: false,
    }
  },
  methods: {
    handleSearchUpdate(state) {
      this.searchState = state
    },

    async handleClearAll() {
      await this.store.clearAllStoredData()
      this.dataCleared = true
      setTimeout(() => {
        this.dataCleared = false
      }, 2000)
    },
  },
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.success-message {
  display: flex;
  justify-content: center;
  justify-self: center;
  background-color: #d4edda;
  color: #155724;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
  min-width: 25%;
}
.not-logged-in-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.login-message {
  background-color: #f8d7da;
  color: rgb(115, 13, 13);
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  text-align: center;
  width: auto;
  min-width: 320px;
  max-width: 100%;
}
.button-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
.tab-nav {
  display: flex;
  justify-content: center;
  font-weight: bold;
}

.tab-content h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: bold;
  color: darkcyan;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #d4d600;
  color: #495057;
}

.tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}
</style>

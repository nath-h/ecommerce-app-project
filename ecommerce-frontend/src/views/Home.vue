<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Nathan's Necessities</h1>
      </div>
    </div>

    <main class="wrapper">
      <div v-if="dataCleared" class="success-message">Data cleared!</div>

      <button
        @click="handleClearAll"
        class="btn btn-danger"
        style="margin-bottom: 20px; margin-left: 8px"
      >
        Clear All Locally Stored Data
      </button>

      <ProductSearch :products="store.inventory" @search-active="handleSearchActive" />

      <div v-if="!isSearching">
        <h1>Featured Products</h1>

        <div class="recommended">
          <ProductCard
            v-for="(product, index) in store.featuredProducts"
            :key="product.id"
            class="card"
            :index="index"
            :product="product"
          />
        </div>
      </div>
      <router-link to="/products" class="btn btn-primary"> Shop all products </router-link>
    </main>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import ProductSearch from '@/components/ProductSearch.vue'
import { useEcommerceStore } from '@/stores/ecommerce'

export default {
  name: 'Home',
  components: {
    ProductCard,
    ProductSearch,
  },
  setup() {
    const store = useEcommerceStore()

    return {
      store,
    }
  },
  data() {
    return {
      isSearching: false,
      dataCleared: false,
    }
  },
  methods: {
    handleSearchActive(isActive) {
      this.isSearching = isActive
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
.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
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
</style>

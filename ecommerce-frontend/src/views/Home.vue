<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Nathan's Necessities</h1>
      </div>
    </div>

    <main class="wrapper">
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
    }
  },
  methods: {
    handleSearchActive(isActive) {
      this.isSearching = isActive
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
</style>

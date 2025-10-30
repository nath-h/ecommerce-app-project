<template>
  <main class="wrapper">
    <h1>All Products</h1>

    <div v-if="authStore.user && authStore.user.isAdmin">
      <ProductSearch
        :products="store.products"
        :searchCategory="'all'"
        title="All Products"
        @search-update="handleSearchActive"
      />
    </div>
    <div v-else>
      <ProductSearch
        :products="store.inventory"
        :searchCategory="'all'"
        title="All Products"
        @search-update="handleSearchActive"
      />
    </div>
  </main>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import ProductSearch from '@/components/ProductSearch.vue'
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'

export default {
  components: {
    ProductCard,
    ProductSearch,
  },
  setup() {
    const store = useEcommerceStore()
    const authStore = useAuthStore()

    return {
      store,
      authStore,
    }
  },
  data() {
    return {
      isSearching: false,
      sortBy: '',
    }
  },
  methods: {
    handleSearchActive() {
      this.isSearching = isSearching
      this.sortBy = sortBy
    },
  },
  onMounted() {
    this.store.initializeStore()
  },
}
</script>

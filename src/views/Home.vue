<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Splendid Food</h1>
      </div>
    </div>

    <main class="wrapper">
      <ProductSearch
        :products="store.inventory"
        @search-active="handleSearchActive"
      />

      <div v-if="!isSearching">
        <h1>Recommended</h1>

        <div class="recommended">
          <ProductCard
            v-for="(product, index) in store.highestPricedItems"
            :key="product.id"
            class="card"
            :index="index"
            :product="product"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
import ProductSearch from '@/components/ProductSearch.vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  name: 'Home',
  components: {
    ProductCard,
    ProductSearch,
  },
  setup() {
    const store = useEcommerceStore();

    return {
      store,
    };
  },
  data() {
    return {
      isSearching: false,
    };
  },
  methods: {
    handleSearchActive(isActive) {
      this.isSearching = isActive;
    },
  },
};
</script>

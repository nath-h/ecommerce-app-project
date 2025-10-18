<template>
  <main class="wrapper">
    <h1>Products</h1>

    <ProductSearch
      :products="store.inventory"
      @search-active="handleSearchActive" />

    <div
      v-if="!isSearching"
      class="card-container">
      <ProductCard
        v-for="(product, index) in store.inventory"
        :key="product.id"
        class="card"
        :index="index"
        :product="product" />
    </div>
  </main>
</template>

<script>
  import ProductCard from '@/components/ProductCard.vue';
  import ProductSearch from '@/components/ProductSearch.vue';
  import { useEcommerceStore } from '@/stores/ecommerce';

  export default {
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
    onMounted() {
      this.store.initializeStore();
    },
  };
</script>

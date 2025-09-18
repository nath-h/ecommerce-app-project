<template>
  <div class="search-container">
    <div class="search-controls">
      <select v-model="searchBy" class="search-dropdown">
        <option value="name">Search by name</option>
        <option value="type">Search by type</option>
      </select>
      <input
        v-model="searchTerm"
        type="text"
        :placeholder="searchPlaceholder"
        class="search-input"
        id="searchTerm"
        name="searchTerm"
        @input="handleSearch"
      />
    </div>

    <div
      v-if="searchTerm && filteredProducts.length > 0"
      class="search-results"
    >
      <ProductCard
        v-for="(product, index) in filteredProducts"
        :key="product.id"
        class="card"
        :index="index"
        :product="product"
      />
    </div>

    <p v-if="searchTerm && filteredProducts.length === 0" class="no-results">
      No products found for "{{ searchTerm }}"
    </p>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';

export default {
  name: 'ProductSearch',
  components: {
    ProductCard,
  },
  props: {
    products: {
      type: Array,
      required: true,
    },
  },
  emits: ['search-active'],
  data() {
    return {
      searchTerm: '',
      searchBy: 'name',
    };
  },
  computed: {
    searchPlaceholder() {
      return this.searchBy === 'name'
        ? 'Search products by name...'
        : 'Search products by type...';
    },
    filteredProducts() {
      if (!this.searchTerm.trim()) return [];

      return this.products.filter((product) => {
        if (this.searchBy === 'name') {
          return product.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase());
        } else {
          return product.type
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase());
        }
      });
    },
  },
  methods: {
    handleSearch() {
      this.$emit('search-active', !!this.searchTerm.trim());
    },
  },
};
</script>

<style scoped>
.search-dropdown {
  min-width: 170px;
  padding: 12px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 16px;
  background-color: slategray;
  color: black;
  cursor: pointer;
}

.search-container {
  margin-bottom: 2rem;
}

.search-input {
  min-width: 240px;
  padding: 12px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 16px;
  background-color: slategrey;
}

.search-input::placeholder {
  color: black;
  opacity: 1;
}

.search-results {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
.search-controls {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
}

.no-results {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}
</style>

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
    <div class="sort-by">
      <select v-model="sortBy" class="sort-dropdown">
        <option value="" disabled hidden>Filter by</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
        <option value="type-asc">Type: A-Z</option>
        <option value="type-desc">Type: Z-A</option>
        <option value="name-asc">Name: A-Z</option>
        <option value="name-desc">Name: Z-A</option>
      </select>
      <button @click="resetFilter" class="btn btn-primary">Reset Filter</button>
    </div>

    <h1 v-if="title" class="product-category-title">{{ title }}</h1>
    <div v-if="filteredProducts.length > 0" class="search-results">
      <ProductCard
        v-for="(product, index) in filteredProducts"
        :key="product.id"
        class="card"
        :index="index"
        :product="product"
      />
    </div>
    <p v-if="!searchTerm && filteredProducts.length === 0" class="no-results">
      No products were returned
    </p>

    <p v-if="searchTerm && filteredProducts.length === 0" class="no-results">
      No products found for "{{ searchTerm }}"
      {{ searchCategory !== 'all' ? `in ${searchCategory}` : '' }}
    </p>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'ProductSearch',
  components: {
    ProductCard,
  },
  props: {
    products: Array,
    searchCategory: String,
    title: String,
  },

  emits: ['search-update'],
  data() {
    return {
      searchTerm: '',
      searchBy: 'name',
      sortBy: '',
    }
  },
  computed: {
    searchPlaceholder() {
      return this.searchBy === 'name' ? 'Search products by name...' : 'Search products by type...'
    },
    filteredProducts() {
      let products = this.products
      if (this.searchTerm.trim()) {
        products = products.filter((product) => {
          if (this.searchBy === 'name') {
            return product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          } else {
            return product.type.toLowerCase().includes(this.searchTerm.toLowerCase())
          }
        })
      }
      return this.sortedProducts(products)
    },
  },
  methods: {
    handleSearch() {
      const isActive = !!this.searchTerm.trim()
      const hasResults = isActive && this.filteredProducts.length > 0

      this.$emit('search-update', {
        isSearching: !!this.searchTerm.trim(),
        isActive,
        hasResults,
        sortBy: this.sortBy,
      })
    },
    sortedProducts(products) {
      let sortedProducts = products.slice()
      switch (this.sortBy) {
        case 'low-high':
          sortedProducts.sort((a, b) => a.price - b.price)
          break
        case 'high-low':
          sortedProducts.sort((a, b) => b.price - a.price)
          break
        case 'type-asc':
          sortedProducts.sort((a, b) => a.type.localeCompare(b.type))
          break
        case 'type-desc':
          sortedProducts.sort((a, b) => b.type.localeCompare(a.type))
          break
        case 'name-asc':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name-desc':
          sortedProducts.sort((a, b) => b.name.localeCompare(a.name))
          break
        default:
          break
      }
      return sortedProducts
    },
    resetFilter() {
      this.sortBy = ''
    },
  },
}
</script>

<style scoped>
.search-dropdown,
.sort-dropdown {
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.product-category-title {
  margin-top: 20px;
  margin-bottom: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  color: #dc3545;
  margin: 10px auto 0 auto;
  padding: 8px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 18px;
  text-align: center;
  word-break: break-word;
}
.sort-by {
  padding-top: 15px;
}
.btn {
  padding: 16px 20px;
  border: none;
  border-radius: 8px;
  margin-left: 20px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}
</style>

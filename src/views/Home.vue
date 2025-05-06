<!-- TODO: Fix home display with inventory.slice where 4 items breaks the grid
  layout. -->

<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Splendid Food</h1>
      </div>
    </div>

    <main class="wrapper">
      <h2>Recommended</h2>

      <div class="recommended">
        <ProductCard
          v-for="(product, index) in inventory.slice(0, 3)"
          :key="product.id"
          class="card"
          :index="index"
          :product="product"
          :addToCart="addToCart"
        />
      </div>
    </main>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
export default {
  name: 'Home',
  props: ['inventory', 'addToCart'],
  components: {
    ProductCard,
  },
  mounted() {
    this.inventory.forEach((item) => {
      if (item.quantity === undefined) {
        item.quantity = 0;
      }
    });
  },
};
</script>

<style>
.recommended-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 15px;
}

.product-item {
  flex: 0 0 calc(33.333% - 20px);
  min-width: 250px;
  max-width: 350px;
  margin-bottom: 20px;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .product-item {
    flex: 0 0 calc(50% - 20px);
  }
}

@media (max-width: 640px) {
  .product-item {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>

<!-- TODO:  -->

<template>
  <div class="home">
    <div class="splash-container">
      <div class="splash">
        <h1>Splendid Food</h1>
      </div>
    </div>

    <main class="wrapper">
      <h1>Recommended</h1>

      <div class="recommended">
        <ProductCard
          v-for="(product, index) in inventory.slice(0, 6)"
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

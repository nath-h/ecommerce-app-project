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
          v-for="(product, index) in store.highestPricedItems"
          :key="product.id"
          class="card"
          :index="index"
          :product="product"
        />
      </div>
    </main>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  name: 'Home',
  components: {
    ProductCard,
  },
  setup() {
    const store = useEcommerceStore();

    return {
      store,
    };
  },
};
</script>

<!-- Home.vue, previous 

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
          v-for="(product, index) in highestPricedItems"
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
  computed: {
    highestPricedItems() {
      return this.inventory
        .slice()
        .sort((a, b) => b.price.USD - a.price.USD)
        .slice(0, 6);
    },
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
-->

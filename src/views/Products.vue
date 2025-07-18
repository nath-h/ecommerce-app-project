<template>
  <main class="wrapper">
    <h1>Products</h1>

    <div class="card-container">
      <ProductCard
        v-for="(product, index) in store.inventory"
        :key="product.id"
        class="card"
        :index="index"
        :product="product"
      />
    </div>
  </main>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
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

<!-- Products.vue, previous 

<template>
  <main class="wrapper">
    <h1>Products</h1>

    <div class="card-container">
      <ProductCard
        v-for="(product, index) in inventory"
        :key="product.id"
        class="card"
        :index="index"
        :product="product"
        :addToCart="addToCart"
      />
    </div>
  </main>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
export default {
  props: ['inventory', 'addToCart'],
  components: {
    ProductCard,
  },
};
</script>

-->

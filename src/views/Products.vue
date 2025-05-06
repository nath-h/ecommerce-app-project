<!-- TODO: Lets you add a quantity of zero. Have this check somewhere else so should be an easy fix. Clicking on 
 cart to open the sidebar on this page brings you to homepage again, ideally it leaves you on the same page.
 Also need to disallow negative quantities. -->

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

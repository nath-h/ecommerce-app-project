<template>
  <div class="card">
    <div class="card-title">{{ product.name }}</div>
    <div class="card-body">
      <i :class="`icofont-5x icofont-${product.icon}`"></i>
      <form>
        <div class="row">
          <div class="cell">
            <label>Type:</label>
          </div>
          <div class="cell">
            <em>{{ product.type }}</em>
          </div>
        </div>

        <div class="row">
          <div class="cell">
            <label>Price:</label>
          </div>
          <div class="cell">${{ product.price.USD.toFixed(2) }}</div>
        </div>
        <div class="row">
          <div class="cell">
            <label>Quantity:</label>
          </div>
          <div class="cell">
            <input type="number" v-model.number="quantity" min="0" />
          </div>
        </div>
      </form>
    </div>
    <div class="card-footer">
      <button
        @click="store.addToCart(product.name, quantity)"
        class="btn btn-light"
      >
        Add to cart
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  props: ['product', 'index'],
  setup() {
    const store = useEcommerceStore();
    const quantity = ref(0);

    return {
      store,
      quantity,
    };
  },
};
</script>

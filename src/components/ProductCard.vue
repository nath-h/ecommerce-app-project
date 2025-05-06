<template>
  <div class="card">
    <div class="card-title">{{ product.name }}</div>
    <div class="card-body">
      <i class="icofont-10x icofont-{{ product.icon }}"></i>
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
          <div class="cell">${{ product.price.USD }}</div>
        </div>
        <div class="row">
          <div class="cell">
            <label>Quantity:</label>
          </div>
          <div class="cell">
            <input type="number" v-model.number="quantity" />
          </div>
        </div>
      </form>
    </div>
    <div class="card-footer">
      <button @click="addToCart(product.name, quantity)" class="btn btn-light">
        Add to cart
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['product', 'index', 'addToCart'],
  data() {
    return {
      quantity: 0,
    };
  },
};
</script>

<style>
.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-title {
  background-color: #f8f9fa;
  padding: 10px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.card-body {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.product-details {
  width: 100%;
  margin-top: 10px;
}

.detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.label {
  font-weight: bold;
}

.quantity-input {
  display: flex;
  align-items: center;
}

input.quantity {
  width: 60px;
  padding: 4px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.card-footer {
  padding: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.add-to-cart-btn {
  width: 100%;
  padding: 8px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: #45a049;
}
</style>

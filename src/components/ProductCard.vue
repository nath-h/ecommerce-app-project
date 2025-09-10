<template>
  <div class="card">
    <div class="card-title">
      <router-link :to="`/products/${product.id}`" class="product-title-link">
        {{ product.name }}
      </router-link>
    </div>
    <div class="card-body">
      <router-link :to="`/products/${product.id}`" class="product-icon-link">
        <i :class="`icofont-5x icofont-${product.icon}`"></i>
      </router-link>
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
          <div class="cell">{{ $formatCurrency(product.price) }}</div>
        </div>
        <div class="row">
          <div class="cell">
            <label>Stock:</label>
          </div>
          <div class="cell">
            <span :class="{ 'low-stock': product.stock <= 5 }">
              {{ product.stock }} available
            </span>
          </div>
        </div>
        <div class="row">
          <div class="cell">
            <label>Quantity:</label>
          </div>
          <div class="cell">
            <input
              type="number"
              v-model.number="quantity"
              min="0"
              :max="product.stock"
              @input="validateQuantity"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
    </div>

    <div class="card-footer">
      <router-link
        :to="`/products/${product.id}`"
        class="btn btn-secondary view-details-btn"
      >
        View Details
      </router-link>
      <button
        @click="handleAddToCart"
        class="btn btn-light"
        :disabled="
          quantity <= 0 || quantity > product.stock || product.stock <= 0
        "
      >
        <span v-if="product.stock <= 0">Out of stock</span>
        <span v-else>Add to cart</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  props: ['product', 'index'],
  setup(props) {
    const store = useEcommerceStore();
    const quantity = ref(0);
    const errorMessage = ref('');
    const successMessage = ref('');
    const validateQuantity = () => {
      errorMessage.value = '';
      successMessage.value = '';
      if (quantity.value > props.product.stock) {
        quantity.value = props.product.stock;
      }
      if (quantity.value < 0) {
        quantity.value = 0;
      }
    };
    const handleAddToCart = () => {
      errorMessage.value = '';
      successMessage.value = '';

      const existingCartItem = store.cart.find(
        (item) => item.name === props.product.name
      );
      const currentCartQuantity = existingCartItem
        ? existingCartItem.quantity
        : 0;
      const remainingStock = props.product.stock - currentCartQuantity;

      if (remainingStock === 0) {
        errorMessage.value = `Cannot add ${quantity.value} item(s). This item is out of stock. (${currentCartQuantity} already in cart.)`;
        quantity.value = 0;
        return;
      } else if (quantity.value > remainingStock) {
        errorMessage.value = `Cannot add ${quantity.value} item(s). Only ${remainingStock} more in stock. (${currentCartQuantity} already in cart)`;
        quantity.value = 0;
        return;
      }
      const success = store.addToCart(props.product.name, quantity.value);
      if (success) {
        const addedQuantity = quantity.value;
        quantity.value = 0;
        errorMessage.value = '';
        successMessage.value = `Successfully added ${addedQuantity} item(s) to cart!`;
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } else {
        errorMessage.value = 'Unable to add item to cart. Please try again.';
      }
    };

    return {
      store,
      quantity,
      validateQuantity,
      errorMessage,
      handleAddToCart,
      successMessage,
    };
  },
};
</script>

<style scoped>
.product-title-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s;
}

.product-title-link:hover {
  color: #3498db;
}

.product-icon-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: color 0.3s;
}

.product-icon-link:hover {
  color: #3498db;
}

.card-footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-footer .btn {
  flex: 1;
  min-width: 120px;
}

.view-details-btn {
  background: #95a5a6;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.3s;
}

.view-details-btn:hover {
  background: #7f8c8d;
}

.low-stock {
  color: #e74c3c;
  font-weight: bold;
}
.error-message {
  background-color: #f8d7da;
  color: rgb(115, 13, 13);
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
}
</style>

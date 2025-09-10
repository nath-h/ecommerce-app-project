<template>
  <main class="wrapper">
    <div v-if="loading" class="loading">
      <p>Loading product...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>Product Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/products" class="btn btn-primary">
        Back to Products
      </router-link>
    </div>

    <div v-else-if="product" class="product-page">
      <nav class="breadcrumb">
        <router-link to="/">Home</router-link>
        <span class="separator">/</span>
        <router-link to="/products">Products</router-link>
        <span class="separator">/</span>
        <span class="current"> {{ product.name }}</span>
      </nav>

      <div class="product-container">
        <div class="product-image">
          <i :class="`icofont-10x icofont-${product.icon}`"></i>
        </div>

        <div class="product-details">
          <h1 class="product-title">{{ product.name }}</h1>

          <div class="product-info">
            <div class="info-row">
              <label>Type:</label>
              <span class="product-type">{{ product.type }}</span>
            </div>

            <div class="info-row">
              <label>Price:</label>
              <span class="product-price">
                {{ $formatCurrency(product.price) }}</span
              >
            </div>

            <div class="info-row">
              <label>Stock:</label>
              <span
                class="product-stock"
                :class="{ 'low-stock': product.stock <= 5 }"
                >{{ product.stock }} available</span
              >
            </div>
          </div>

          <div v-if="product.description" class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="add-to-cart-section">
            <div class="quantity-selector">
              <label for="quantity">Quantity:</label>
              <div class="quantity-controls">
                <button
                  @click="decrementQuantity"
                  :disabled="quantity <= 0"
                  class="quantity-btn"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  v-model.number="quantity"
                  min="0"
                  :max="product.stock"
                  class="quantity-input"
                />
                <button
                  @click="incrementQuantity"
                  :disabled="quantity >= product.stock"
                  class="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <button
              @click="handleAddToCart"
              class="add-to-cart-btn"
              :disabled="
                quantity <= 0 || quantity > product.stock || product.stock <= 0
              "
            >
              <span v-if="product.stock <= 0">Out of stock</span>
              <span v-else>Add to cart</span>
            </button>
          </div>

          <div class="navigation-section">
            <router-link to="/products" class="btn btn-secondary">
              Back to products
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  name: 'ProductView',
  setup() {
    const route = useRoute();
    const store = useEcommerceStore();

    const product = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const quantity = ref(1);
    const errorMessage = ref('');
    const successMessage = ref('');

    const productId = computed(() => route.params.id);

    const fetchProduct = async () => {
      try {
        loading.value = true;
        error.value = null;

        const response = await fetch(`/api/products/${productId.value}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        product.value = await response.json();
      } catch (err) {
        console.error('Error fetching product:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const incrementQuantity = () => {
      if (quantity.value < product.value.stock) {
        quantity.value++;
      }
    };

    const decrementQuantity = () => {
      if (quantity.value > 0) {
        quantity.value--;
      }
    };

    const handleAddToCart = () => {
      errorMessage.value = '';
      successMessage.value = '';

      const existingCartItem = store.cart.find(
        (item) => item.name === product.value.name
      );
      const currentCartQuantity = existingCartItem
        ? existingCartItem.quantity
        : 0;
      const remainingStock = product.value.stock - currentCartQuantity;

      if (remainingStock === 0) {
        errorMessage.value = `Cannot add ${quantity.value} item(s). This item is out of stock. (${currentCartQuantity} already in cart.)`;
        quantity.value = 0;
        return;
      } else if (quantity.value > remainingStock) {
        errorMessage.value = `Cannot add ${quantity.value} item(s). Only ${remainingStock} more in stock. (${currentCartQuantity} already in cart)`;
        quantity.value = 0;
        return;
      }
      const success = store.addToCart(product.value.name, quantity.value);
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

    onMounted(() => {
      fetchProduct();
    });

    return {
      product,
      loading,
      error,
      quantity,
      incrementQuantity,
      decrementQuantity,
      store,
      handleAddToCart,
      errorMessage,
      successMessage,
    };
  },
};
</script>

<style scoped>
.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
}

.error h2 {
  color: #e74c3c;
  margin-bottom: 10px;
}

.breadcrumb {
  margin-bottom: 30px;
  font-size: 14px;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 10px;
  color: #7f8c8d;
}

.current {
  color: #2c3e50;
  font-weight: 500;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: start;
}

.product-image {
  text-align: center;
  padding: 40px;
  border-radius: 8px;
}

.product-image i {
  color: var(--bodyTextColor);
  opacity: 0.8;
}

.product-title {
  font-size: 2.5rem;
  color: var(--cardTextColor);
  margin-bottom: 20px;
  background: var(--cardHeaderBackground);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  margin: 0 0 20px 0;
}

.product-info {
  background: var(--cardBackground);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid var(--cardBorder);
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row label {
  font-weight: 600;
  color: #2c3e50;
}

.product-type {
  background: var(--cardHeaderBackground);
  color: var(--cardTextColor);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #27ae60;
}

.product-stock {
  color: #27ae60;
  font-weight: 500;
}

.product-stock.low-stock {
  color: #e74c3c;
}

.product-description {
  margin-bottom: 30px;
}

.product-description h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.product-description p {
  line-height: 1.6;
  color: #5d6d7e;
}

.add-to-cart-section {
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.quantity-selector {
  margin-bottom: 20px;
}

.quantity-selector label {
  display: block;

  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.quantity-btn {
  background: var(--topNavBackground);
  color: var(--topNavColor);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--topBarLinkHoverBackground);
}

.quantity-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.quantity-input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 1px solid var(--cardBorder);
  border-radius: 4px;
  font-size: 16px;
  background: var(--bodyBackground);
}

.add-to-cart-btn {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  background: var(--topNavBackground);
  color: var(--topNavColor);
  cursor: pointer;
}
.add-to-cart-btn:hover:not(:disabled) {
  background: var(--topBarLinkHoverBackground);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background: var(--topNavBackground);
  color: var(--topNavColor);
}

.btn-primary:hover:not(:disabled) {
  background: var(--topBarLinkHoverBackground);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.navigation-section {
  text-align: center;
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

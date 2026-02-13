<template>
  <main class="wrapper">
    <div v-if="loading" class="loading">
      <p>Loading product...</p>
    </div>

    <div v-else-if="error" class="error">
      <h2>Product Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/products" class="btn btn-primary"> Back to Products </router-link>
    </div>

    <div v-else-if="product" class="product-page">
      <nav class="breadcrumb">
        <router-link to="/">Home</router-link>
        <span class="separator">/</span>
        <router-link to="/products">Products</router-link>
        <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <div class="product-container">
        <div class="product-image">
          <i :class="`icofont-10x icofont-${product.icon}`"></i>
        </div>

        <div class="product-details">
          <h1 class="product-title">
            {{ product.name }}
            <span class="favorite-star" @click="toggleFavorite">
              {{ isFavorited ? '★' : '☆' }}
              <span class="favorite-tooltip">
                {{ isFavorited ? 'Click to remove favorite' : 'Click to add favorite' }}
              </span>
            </span>
          </h1>

          <div class="product-info">
            <div class="info-row">
              <label>Type:</label>
              <span class="product-type">{{ product.type }}</span>
            </div>

            <div class="info-row">
              <label>Price:</label>
              <span class="product-price">{{ $formatCurrency(product.price) }}</span>
            </div>

            <div class="info-row">
              <label>Stock:</label>
              <span class="product-stock" :class="{ 'low-stock': product.stock <= 5 }">
                {{ product.stock }} available
              </span>
            </div>

            <div v-if="user && user.isAdmin" class="info-row">
              <label>Active:</label>
              <span :class="product.isActive ? 'product-active' : 'product-inactive'">
                {{ product.isActive }}
              </span>
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
                <button @click="decrementQuantity" :disabled="quantity <= 1" class="quantity-btn">
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  v-model.number="quantity"
                  min="1"
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
            <div v-if="store.error" class="error-message">
              {{ store.error }}
            </div>
            <div v-if="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <button @click="handleAddToCart" class="add-to-cart-btn">
              <span v-if="product.stock <= 0">Out of stock</span>
              <span v-else>Add to cart</span>
            </button>
          </div>

          <div class="navigation-section">
            <router-link to="/products" class="btn btn-primary"> Back to products </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEcommerceStore } from '@/stores/ecommerce'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

export default {
  name: 'ProductView',
  setup() {
    const route = useRoute()
    const store = useEcommerceStore()
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)
    const product = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const quantity = ref(1)
    const errorMessage = ref('')
    const successMessage = ref('')

    const productId = computed(() => route.params.id)

    const fetchProduct = async () => {
      try {
        let response
        loading.value = true
        error.value = null
        if (authStore.isAdmin) {
          response = await fetch(`/api/products/admin/${productId.value}`, {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              'Content-Type': 'application/json',
            },
          })
        } else {
          response = await fetch(`/api/products/${productId.value}`)
        }
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found')
          }
          throw new Error('Failed to fetch product')
        }
        product.value = await response.json()
      } catch (err) {
        console.error('Error fetching product:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const isFavorited = computed(() => {
      if (!user.value?.favorites) return false
      return user.value.favorites.some((fav) => fav.id === product.value?.id)
    })

    const toggleFavorite = async () => {
      if (!authStore.user) {
        errorMessage.value = 'You must be logged in to favorite products'
        return
      }
      const success = await store.toggleFavorite(product.value.id)
      if (success) {
        await authStore.fetchUserFavorites()
      }
    }

    const incrementQuantity = () => {
      if (quantity.value < product.value.stock) {
        quantity.value++
      }
    }

    const decrementQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const handleAddToCart = () => {
      errorMessage.value = ''
      successMessage.value = ''

      const existingCartItem = store.enrichedCartItems.find((item) => item.id === product.id)
      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0
      const remainingStock = product.value.stock - currentCartQuantity

      // if (remainingStock <= 0) {
      //   quantity.value = remainingStock - currentCartQuantity
      //   console.log(remainingStock - currentCartQuantity)
      //   console.log(`${currentCartQuantity}`)
      //   console.log(`${remainingStock}`)
      // } else if (quantity.value > remainingStock) {
      //   console.log(remainingStock - currentCartQuantity)

      //   console.log(`${currentCartQuantity}`)
      //   console.log(`${remainingStock}`)
      //   quantity.value = remainingStock - currentCartQuantity
      // }
      const success = store.addToCart(product.value.id, quantity.value)
      if (remainingStock <= 0) {
        quantity.value = 0
      } else if (quantity.value > remainingStock) {
        quantity.value = remainingStock - currentCartQuantity
      }
      if (success) {
        const addedQuantity = quantity.value
        quantity.value = 1
        errorMessage.value = ''
        successMessage.value = `Successfully added ${addedQuantity} item(s) to cart!`
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } else {
        errorMessage.value = 'Unable to add item to cart. Please try again.'
      }
    }

    onMounted(() => {
      fetchProduct()
    })

    return {
      product,
      loading,
      error,
      quantity,
      incrementQuantity,
      decrementQuantity,
      store,
      user,
      handleAddToCart,
      errorMessage,
      successMessage,
      isFavorited,
      toggleFavorite,
    }
  },
}
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
  position: relative;
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
.product-active {
  color: #27ae60;
  font-weight: 600;
}
.product-inactive {
  color: #e74c3c;
  font-weight: 600;
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
.favorite-star {
  position: absolute;
  right: 18px;
  cursor: pointer;
  font-size: 2rem;
  color: #280d14;
  z-index: 2;
  transition: color 0.2s;
}

.favorite-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: -10px;
  right: 0;
  background: #333;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: opacity 0.2s;
  pointer-events: none;
}

.favorite-star:hover .favorite-tooltip {
  visibility: visible;
  opacity: 1;
}
</style>

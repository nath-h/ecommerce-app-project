import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export const useEcommerceStore = defineStore('ecommerce', {
  state: () => ({
    products: [],
    featuredProducts: [],
    cart: [],
    loading: false,
    error: null,
    showSidebar: false,
    activeCoupon: null,
    couponError: '',
    stockValidationErrors: [],
  }),

  getters: {
    enrichedCartItems: (state) => {
      return state.cart.map((cartItem) => {
        const product = state.products.find((p) => p.id === cartItem.productId)
        return {
          productId: cartItem.productId,
          name: product ? product.name : 'Unknown',
          quantity: cartItem.quantity,
          price: (product ? parseFloat(product.price) : 0).toFixed(2),
          total: (cartItem.quantity * (product ? parseFloat(product.price) : 0)).toFixed(2),
          icon: product ? product.icon : 'spoon-and-fork',
          product,
        }
      })
    },

    totalQuantity: (state) => {
      return state.cart.reduce((total, item) => total + item.quantity, 0)
    },

    cartSubtotal: (state) => {
      const total = state.cart.reduce((acc, cartItem) => {
        const product = state.products.find((p) => p.id === cartItem.productId)
        const price = product ? parseFloat(product.price) : 0
        return acc + price * cartItem.quantity
      }, 0)
      return parseFloat(total.toFixed(2))
    },

    cartTotal: (state) => {
      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.products.find((p) => p.id === cartItem.productId)
        const price = product ? parseFloat(product.price) : 0
        return acc + price * cartItem.quantity
      }, 0)
      let discount = 0
      if (state.activeCoupon) {
        const coupon = state.activeCoupon
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * coupon.value) / 100
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount
          }
        } else if (coupon.type === 'FIXED') {
          discount = coupon.value
        }
        discount = Math.min(discount, subtotal)
      }
      const total = subtotal - discount
      return parseFloat(total.toFixed(2))
    },

    couponDiscount: (state) => {
      if (!state.activeCoupon) return 0

      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.products.find((p) => p.id == cartItem.productId)
        const price = product ? parseFloat(product.price) : 0
        return acc + price * cartItem.quantity
      }, 0)
      const coupon = state.activeCoupon
      let discount = 0
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount
        }
      } else if (coupon.type === 'FIXED') {
        discount = coupon.value
      }
      return parseFloat(Math.min(discount, subtotal).toFixed(2))
    },
  },

  actions: {
    async storeFetchProducts() {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        let response
        if (authStore.isAdmin) {
          response = await fetch('/api/products/admin', {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              contentType: 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
          }
          const data = await response.json()
          this.products = data.products
        } else {
          response = await fetch('/api/products')
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
          }
          const data = await response.json()
          this.products = data.products
        }
        this.featuredProducts = this.products.filter((p) => p.isFeatured)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async validateCartStock() {
      this.stockValidationErrors = []
      let hasChanges = false

      try {
        await this.storeFetchProducts()

        for (let i = this.cart.length - 1; i >= 0; i--) {
          const cartItem = this.cart[i]
          const product = this.products.find((p) => p.id === cartItem.productId)

          if (!product) {
            this.cart.splice(i, 1)
            this.stockValidationErrors.push(
              'A product in your cart was no longer available and was removed.',
            )
            hasChanges = true
            continue
          }

          if (product.stock < cartItem.quantity) {
            const oldQuantity = cartItem.quantity
            cartItem.quantity = product.stock

            if (cartItem.quantity === 0) {
              this.cart.splice(i, 1)
              this.stockValidationErrors.push(
                `${product.name} is out of stock and was removed from your cart.`,
              )
            } else {
              this.stockValidationErrors.push(
                `Cart quantity of ${product.name} reduced from ${oldQuantity} to ${cartItem.quantity} due to limited stock.`,
              )
            }
            hasChanges = true
          }
        }

        if (hasChanges) {
          this.saveCartToLocalStorage()
        }
        return this.stockValidationErrors
      } catch (error) {
        console.error('Error validating cart stock:', error)
        this.error = 'Failed to validate cart stock'
        return []
      }
    },

    async initializeStore() {
      const authStore = useAuthStore()
      await this.storeFetchProducts()
      await authStore.fetchUserFavorites()

      this.loadFromLocalStorage()
    },

    loadFromLocalStorage() {
      try {
        this.cart = []
        const savedCart = localStorage.getItem('ecommerce-cart')
        if (savedCart) {
          this.cart = JSON.parse(savedCart)
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        this.cart = []
      }
    },

    saveCartToLocalStorage() {
      try {
        localStorage.setItem('ecommerce-cart', JSON.stringify(this.cart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    },

    addToCart(productId, quantity) {
      this.error = null
      const product = this.products.find((p) => p.id === productId)
      if (!product) {
        this.error = `Product not found: ${productId}`
        return false
      }

      const existingItem = this.cart.find((item) => item.productId === productId)
      const currentCartQuantity = existingItem ? existingItem.quantity : 0
      const totalRequestedQuantity = currentCartQuantity + quantity

      if (quantity <= 0) {
        this.error = 'Quantity must be at least 1.'
        return false
      }
      if (totalRequestedQuantity > product.stock) {
        this.error = `Insufficient stock. Requested total (includes cart quantity): ${totalRequestedQuantity}, Available to add to cart: ${product.stock - currentCartQuantity}`
        return false
      }

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cart.push({
          productId: productId,
          quantity: quantity,
        })
      }
      this.saveCartToLocalStorage()
      return true
    },

    updateCartItemQuantity(productId, newQuantity) {
      const qty = parseInt(newQuantity)
      if (isNaN(qty) || qty < 1) {
        this.error = 'Invalid quantity'
        setTimeout(() => {
          this.error = null
        }, 3000)
        return false
      }
      const cartItem = this.cart.find((item) => item.productId === productId)
      const product = this.products.find((p) => p.id === productId)

      if (!cartItem || !product) {
        this.error = 'Product not found'
        setTimeout(() => {
          this.error = null
        }, 3000)
        return false
      }

      if (qty > product.stock) {
        this.error = `We're sorry, there are only ${product.stock} of this item available in stock`
        setTimeout(() => {
          this.error = null
        }, 3000)

        return false
      }
      cartItem.quantity = qty
      this.saveCartToLocalStorage()
      this.validateActiveCoupon()
      return true
    },

    async toggleFavorite(productId) {
      try {
        const authStore = useAuthStore()
        const response = await fetch(`/api/users/favorite/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authStore.user.id,
            productId,
          }),
        })

        if (!response.ok) {
          this.error = 'Failed to favorite product'
          return false
        }

        const data = await response.json()
        authStore.user = {
          ...authStore.user,
          favorites: data.user.favorites,
        }
        authStore.saveAuthToStorage()
        await authStore.fetchUserFavorites()
        return true
      } catch (error) {
        console.error('Error favoriting product:', error)
        this.error = 'Failed to favorite product'
        return false
      }
    },

    validateActiveCoupon() {
      if (!this.activeCoupon) return

      const subtotal = this.cartSubtotal
      if (subtotal < this.activeCoupon.minOrder) {
        this.couponError = `A minimum order of $${this.activeCoupon.minOrder.toFixed(2)} is required for this coupon.`
        this.activeCoupon = null
      }
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => item.productId !== productId)
      this.saveCartToLocalStorage()
      this.validateActiveCoupon()
    },

    clearCart() {
      this.cart = []
      this.saveCartToLocalStorage()
      this.removeCoupon()
    },

    getAvailableStock(productId) {
      const product = this.products.find((p) => p.id === productId)
      if (!product) return 0

      const cartItem = this.cart.find((item) => item.productId === productId)
      const reservedInCart = cartItem ? cartItem.quantity : 0

      return Math.max(0, product.stock - reservedInCart)
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar
    },

    async applyCoupon(couponCode) {
      this.couponError = ''

      if (!couponCode || !couponCode.trim()) {
        this.couponError = 'Please enter a coupon code.'
        return false
      }

      if (!this.cart.length) {
        this.couponError =
          'Your cart is empty. Please add an item to your cart to apply this coupon.'
        return false
      }

      try {
        const response = await fetch(
          `/api/coupon/${couponCode}/validate?subtotal=${this.cartSubtotal}`,
        )
        const data = await response.json()

        if (!response.ok) {
          this.couponError = data.error
          return false
        }
        this.activeCoupon = {
          ...data,
          value: parseFloat(data.value),
          minOrder: parseFloat(data.minOrder),
          maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        }
        return true
      } catch (error) {
        console.error('Error applying coupon:', error)
        this.couponError = 'Failed to validate coupon'
        return false
      }
    },

    removeCoupon() {
      this.activeCoupon = null
      this.couponError = ''
    },

    clearCouponError() {
      this.couponError = ''
    },

    async createOrder(orderData) {
      const authStore = useAuthStore()

      try {
        if (this.activeCoupon) {
          const isValid = await this.applyCoupon(this.activeCoupon.code)
          if (!isValid) {
            throw new Error(
              this.couponError || 'Coupon is no longer valid or does not meet the requirements',
            )
          }
        }
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authStore.user.id || null,
            customerInfo: orderData.customer,
            cartItems: this.enrichedCartItems,
            couponCode: this.activeCoupon
              ? {
                  couponCode: this.activeCoupon.code,
                  discount: this.couponDiscount,
                  description: this.activeCoupon.description,
                  type: this.activeCoupon.type,
                  value: this.activeCoupon.value,
                }
              : null,
            subtotal: this.cartSubtotal,
            discount: this.couponDiscount,
            total: this.cartTotal,
            notes: orderData.customer.notes,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
          throw new Error(errorMessage)
        }
        const result = await response.json()
        this.clearCart()
        return result
      } catch (error) {
        console.error('Error creating order:', error)
        this.error = error.message
        throw error
      }
    },

    async storeFetchUserOrders(page = 1, limit = 20) {
      const authStore = useAuthStore()

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      try {
        const response = await fetch(
          `/api/orders?userId=${authStore.user.id}&page=${page}&limit=${limit}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },

    async cancelOrder(orderId) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authStore.user ? authStore.user.id : null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to cancel order')
        }
        const result = await response.json()
        return result
      } catch (error) {
        console.error('Error cancelling order:', error)
        throw error
      }
    },

    createOrderData({ customer, cartItems }) {
      const authStore = useAuthStore()
      if (authStore.user) {
        authStore.updateUserPreferences({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
        })
      }
      return {
        customer,
        items: cartItems,
      }
    },

    async clearAllStoredData() {
      try {
        localStorage.removeItem('ecommerce-cart')
        this.cart = []
        const authStore = useAuthStore()
        authStore.clearAuthFromStorage()
      } catch (error) {
        console.error('Error clearing localStorage', error)
      }
    },
  },
})

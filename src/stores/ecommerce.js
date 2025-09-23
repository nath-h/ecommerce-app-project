import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

export const useEcommerceStore = defineStore('ecommerce', {
  state: () => ({
    inventory: [],
    cart: [],
    loading: false,
    error: null,
    coupons: [],
    showSidebar: false,
    activeCoupon: null,
    couponError: '',
    stockValidationErrors: [],
  }),

  getters: {
    enrichedCartItems: state => {
      return state.cart.map(cartItem => {
        const product = state.inventory.find(p => p.id === cartItem.productId);
        return {
          productId: cartItem.productId,
          name: product ? product.name : 'Unknown',
          quantity: cartItem.quantity,
          price: (product ? parseFloat(product.price) : 0).toFixed(2),
          total: (cartItem.quantity * (product ? parseFloat(product.price) : 0)).toFixed(2),
          icon: product ? product.icon : 'spoon-and-fork',
          product,
        };
      });
    },

    totalQuantity: state => {
      return state.cart.reduce((total, item) => total + item.quantity, 0);
    },

    cartSubtotal: state => {
      const total = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find(p => p.id === cartItem.productId);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      return parseFloat(total.toFixed(2));
    },

    cartTotal: state => {
      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find(p => p.id === cartItem.productId);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      let discount = 0;
      if (state.activeCoupon) {
        const coupon = state.activeCoupon;
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.type === 'FIXED') {
          discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
      }
      const total = subtotal - discount;
      return total.toFixed(2);
    },

    couponDiscount: state => {
      if (!state.activeCoupon) return 0;

      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find(p => p.id == cartItem.productId);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      const coupon = state.activeCoupon;
      let discount = 0;
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'FIXED') {
        discount = coupon.value;
      }
      return parseFloat(Math.min(discount, subtotal).toFixed(2));
    },

    highestPricedItems: state => {
      return state.inventory
        .slice()
        .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        .slice(0, 6);
    },
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        const products = await response.json();
        this.inventory = products;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchCoupons() {
      try {
        const response = await fetch('/api/coupons');
        if (response.ok) {
          this.coupons = await response.json();
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    },

    async validateCartStock() {
      this.stockValidationErrors = [];
      let hasChanges = false;

      try {
        await this.fetchProducts();

        for (let i = this.cart.length - 1; i >= 0; i--) {
          const cartItem = this.cart[i];
          const product = this.inventory.find(p => p.id === cartItem.productId);

          if (!product) {
            this.cart.splice(i, 1);
            this.stockValidationErrors.push(
              `${cartItem.name || 'Unknown product'} is no longer available and was removed from your cart.`
            );
            hasChanges = true;
            continue;
          }
          if (!product.isActive) {
            this.cart.splice(i, 1);
            this.stockValidationErrors.push(`${product.name} is no longer available and was removed from your cart.`);
            hasChanges = true;
            continue;
          }

          if (product.stock < cartItem.quantity) {
            const oldQuantity = cartItem.quantity;
            cartItem.quantity = Math.max(0, product.stock);

            if (cartItem.quantity === 0) {
              this.cart.splice(i, 1);
              this.stockValidationErrors.push(`${product.name} is out of stock and was removed from your cart.`);
            } else {
              this.stockValidationErrors.push(
                `${product.name} quantity reduced from ${oldQuantity} to ${cartItem.quantity} due to limited stock.`
              );
            }
            hasChanges = true;
          }
        }

        if (hasChanges) {
          this.saveCartToLocalStorage();
        }
        return this.stockValidationErrors;
      } catch (error) {
        console.error('Error validating cart stock:', error);
        this.error = 'Failed to validate cart stock';
        return [];
      }
    },

    async initializeStore() {
      await this.fetchProducts();
      await this.fetchCoupons();

      const savedCart = localStorage.getItem('ecommerce-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          this.cart = parsedCart;
        } catch (error) {
          console.error('Error parsing saved cart:', error);
          this.cart = [];
        }
      }
    },

    loadFromLocalStorage() {
      try {
        this.cart = [];
        const savedCart = localStorage.getItem('ecommerce-cart');
        if (savedCart) {
          this.cart = JSON.parse(savedCart);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.cart = [];
      }
    },

    saveCartToLocalStorage() {
      try {
        localStorage.setItem('ecommerce-cart', JSON.stringify(this.cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    },

    addToCart(productId, quantity) {
      const product = this.inventory.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        return false;
      }

      if (quantity > product.stock) {
        console.log(`Insufficient stock. Requested: ${quantity}, Available: ${product.stock}`);
        return false;
      }

      const existingItem = this.cart.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
        product.stock -= quantity;
        console.log(`Adding ${quantity} to cart. ${product.stock} remaining`);
      } else {
        this.cart.push({
          productId: productId,
          quantity: quantity,
        });

        product.stock -= quantity;
      }
      this.saveCartToLocalStorage();
      return true;
    },

    validateActiveCoupon() {
      if (!this.activeCoupon) return;

      const subtotal = this.cartSubtotal;
      if (subtotal < this.activeCoupon.minOrder) {
        this.couponError = `Minimum order of $${this.activeCoupon.minOrder.toFixed(2)} required for this coupon`;
        this.activeCoupon = null;
      }
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.productId !== productId);
      this.saveCartToLocalStorage();
      this.validateActiveCoupon();
    },

    //need to implement this clear cart in sidebar
    clearCart() {
      this.cart = [];
      this.saveCartToLocalStorage();
      this.removeCoupon();
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },

    applyCoupon(couponCode) {
      this.couponError = '';

      if (!couponCode || !couponCode.trim()) {
        this.couponError = 'Please enter a coupon code';
        return false;
      }

      const coupon = this.coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive);

      if (!coupon) {
        this.couponError = 'Invalid coupon code';
        return false;
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        this.couponError = 'This coupon has expired';
        return false;
      }

      const subtotal = this.cartSubtotal;
      if (subtotal < parseFloat(coupon.minOrder)) {
        this.couponError = `Minimum order of $${parseFloat(coupon.minOrder).toFixed(2)} required for this coupon`;
        return false;
      }
      this.activeCoupon = coupon;
      return true;
    },

    //Might still need to implement this
    removeCoupon() {
      this.activeCoupon = null;
      this.couponError = '';
    },

    clearCouponError() {
      this.couponError = '';
    },

    async createOrder(orderData) {
      const authStore = useAuthStore();
      console.log('User object:', authStore.user);
      console.log('User ID:', authStore.user?.id);
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authStore.userId || null,
            customerInfo: orderData.customer,
            cartItems: this.enrichedCartItems,
            coupon: this.activeCoupon
              ? {
                  code: this.activeCoupon.code,
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
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        const result = await response.json();
        this.clearCart();
        return result;
      } catch (error) {
        console.error('Error creating order:', error);
        this.error = error.message;
        throw error;
      }
    },

    async fetchUserOrders(page = 1, limit = 20) {
      const authStore = useAuthStore();

      if (!authStore.user) {
        throw new Error('User not authenticated');
      }

      try {
        const response = await fetch(`/api/orders?userId=${authStore.userId}&page=${page}&limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
    },

    async cancelOrder(orderId) {
      const authStore = useAuthStore();
      try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authStore.userId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel order');
        }
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
      }
    },

    createOrderData({ customer, cartItems }) {
      const authStore = useAuthStore();
      if (authStore.user && authStore.updateUserPreferences) {
        authStore.updateUserPreferences({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
        });
      }
      return {
        customer,
        items: cartItems,
      };
    },

    async completeOrder(orderData) {
      try {
        const result = await this.createOrder(orderData);
        return result;
      } catch (error) {
        throw error;
      }
    },

    deleteOrder(orderId) {
      this.pastOrders = this.pastOrders.filter(order => order.id !== orderId);
    },

    clearOrders() {
      this.pastOrders = [];
    },

    clearAllStoredData() {
      try {
        localStorage.removeItem('ecommerce-cart');
        this.cart = [];
        const authStore = useAuthStore();
        authStore.clearAllStoredData();
      } catch (error) {
        console.error('Error clearing localStorage', error);
      }
    },

    initializeInventory() {
      this.inventory.forEach(item => {
        if (item.quantity === undefined) {
          item.quantity = 0;
        }
      });
    },
  },
});

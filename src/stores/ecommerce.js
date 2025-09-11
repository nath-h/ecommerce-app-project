import { defineStore } from 'pinia';

export const useEcommerceStore = defineStore('ecommerce', {
  state: () => ({
    inventory: [],
    cart: [],
    loading: false,
    error: null,
    pastOrders: [],
    userPreferences: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    showSidebar: false,
    activeCoupon: null,
    couponError: '',
    availableCoupons: [
      {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        description: '10% off order',
        minOrder: 0,
        maxDiscount: null,
        isActive: true,
      },
      {
        code: 'BIGORDER',
        type: 'percentage',
        value: 15,
        description: '15% off orders over $50. Maximum discount is $500.',
        minOrder: 50,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'EXPIRED',
        type: 'percentage',
        value: 20,
        description: '20% off (expired)',
        minOrder: 0,
        maxDiscount: null,
        isActive: false,
      },
    ],
  }),

  getters: {
    enrichedCartItems: (state) => {
      return state.cart.map((cartItem) => {
        const product = state.inventory.find((p) => p.name === cartItem.name);
        return {
          name: cartItem.name,
          quantity: cartItem.quantity,
          price: (product ? parseFloat(product.price) : 0).toFixed(2),
          total: (
            cartItem.quantity * (product ? parseFloat(product.price) : 0)
          ).toFixed(2),
          icon: product ? product.icon : 'spoon-and-fork',
          product,
        };
      });
    },

    totalQuantity: (state) => {
      return state.cart.reduce((total, item) => total + item.quantity, 0);
    },

    cartSubtotal: (state) => {
      const total = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find((p) => p.name === cartItem.name);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      return parseFloat(total.toFixed(2));
    },

    cartTotal: (state) => {
      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find((p) => p.name === cartItem.name);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      let discount = 0;
      if (state.activeCoupon) {
        const coupon = state.activeCoupon;
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.type === 'fixed') {
          discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
      }
      const total = subtotal - discount;
      return total.toFixed(2);
    },

    couponDiscount: (state) => {
      if (!state.activeCoupon) return 0;

      const subtotal = state.cart.reduce((acc, cartItem) => {
        const product = state.inventory.find((p) => p.name == cartItem.name);
        const price = product ? parseFloat(product.price) : 0;
        return acc + price * cartItem.quantity;
      }, 0);
      const coupon = state.activeCoupon;
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }
      return parseFloat(Math.min(discount, subtotal).toFixed(2));
    },

    highestPricedItems: (state) => {
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
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }
        const products = await response.json();
        this.inventory = products;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async initializeStore() {
      this.cart = [];
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
      await this.fetchProducts();
    },

    loadFromLocalStorage() {
      try {
        this.cart = [];
        this.pastOrders = [];
        this.userPreferences = {
          name: '',
          email: '',
          phone: '',
          address: '',
        };
        const savedCart = localStorage.getItem('ecommerce-cart');
        if (savedCart) {
          this.cart = JSON.parse(savedCart);
        }

        const savedOrders = localStorage.getItem('ecommerce-pastOrders');
        if (savedOrders) {
          this.pastOrders = JSON.parse(savedOrders);
        }

        const savedPreferences = localStorage.getItem(
          'ecommerce-userPreferences'
        );
        if (savedPreferences) {
          this.userPreferences = JSON.parse(savedPreferences);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.cart = [];
        this.pastOrders = [];
        this.userPreferences = {
          name: '',
          email: '',
          phone: '',
          address: '',
        };
      }
    },

    saveCartToLocalStorage() {
      try {
        localStorage.setItem('ecommerce-cart', JSON.stringify(this.cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    },

    savePastOrdersToLocalStorage() {
      try {
        localStorage.setItem(
          'ecommerce-pastOrders',
          JSON.stringify(this.pastOrders)
        );
      } catch (error) {
        console.error('Error saving past orders to localStorage:', error);
      }
    },

    saveUserPreferencesToLocalStorage() {
      try {
        localStorage.setItem(
          'ecommerce-userPreferences',
          JSON.stringify(this.userPreferences)
        );
      } catch (error) {
        console.error('Error saving user preferences to localStorage:', error);
      }
    },

    addToCart(productName, quantity) {
      const product = this.inventory.find((p) => p.name === productName);
      if (!product) {
        console.error('Product not found:', productName);
        return false;
      }

      if (quantity > product.stock) {
        console.log(
          `Insufficient stock. Requested: ${quantity}, Available: ${product.stock}`
        );
        return false;
      }

      const existingItem = this.cart.find((item) => item.name === productName);

      if (existingItem) {
        existingItem.quantity += quantity;
        product.stock -= quantity;
        console.log(`Adding ${quantity} to cart. ${product.stock} remaining`);
      } else {
        this.cart.push({
          name: productName,
          price: product.price,
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
        this.couponError = `Minimum order of $${this.activeCoupon.minOrder.toFixed(
          2
        )} required for this coupon`;
        this.activeCoupon = null;
      }
    },

    removeFromCart(name) {
      this.cart = this.cart.filter((item) => item.name !== name);
      this.saveCartToLocalStorage();
      this.validateActiveCoupon();
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },

    getProductPrice(name) {
      const product = this.inventory.find((p) => p.name === name);
      return product ? parseFloat(product.price) : 0;
    },

    getProductIcon(name) {
      const product = this.inventory.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      return product ? product.icon : 'spoon-and-fork';
    },

    applyCoupon(couponCode) {
      this.couponError = '';

      if (!couponCode || !couponCode.trim()) {
        this.couponError = 'Please enter a coupon code';
        return false;
      }

      const coupon = this.availableCoupons.find(
        (c) => c.code.toLowerCase() === couponCode.toLowerCase()
      );

      if (!coupon) {
        this.couponError = 'Invalid coupon code';
        return false;
      }
      if (!coupon.isActive) {
        this.couponError = 'This coupon has expired';
        return false;
      }

      const subtotal = this.cartSubtotal;
      if (subtotal < coupon.minOrder) {
        this.couponError = `Minimum order of $${coupon.minOrder.toFixed(
          2
        )} required for this coupon`;
        return false;
      }
      this.activeCoupon = coupon;
      return true;
    },

    removeCoupon() {
      this.activeCoupon = null;
      this.couponError = '';
    },

    clearCouponError() {
      this.couponError = '';
    },

    calculateItemDiscount(item, coupon = this.activeCoupon) {
      if (!coupon) return 0;

      const itemProportion = item.total / this.cartSubtotal;
      let itemDiscount = 0;

      if (coupon.type === 'percentage') {
        itemDiscount = this.couponDiscount * itemProportion;
      } else if (coupon.type === 'fixed') {
        itemDiscount = this.couponDiscount * itemProportion;
      }
      return Math.min(itemDiscount, item.total);
    },

    generateOrderID() {
      let id;
      do {
        id = `${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`;
      } while (this.pastOrders.some((order) => order.id === id));
      return id;
    },

    createOrderData({ customer, cartItems }) {
      this.userPreferences = {
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      };
      this.saveUserPreferencesToLocalStorage();
      return {
        id: this.generateOrderID(),
        date: new Date().toISOString(),
        customer,
        items: cartItems.map((item) => {
          const itemDiscount = this.calculateItemDiscount(item);
          const discountedTotal = item.total - itemDiscount;

          return {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: discountedTotal / item.quantity,
            originalTotal: item.total,
            discountedTotal: parseFloat(discountedTotal.toFixed(2)),
            icon: item.icon,
          };
        }),
        total: parseFloat(this.cartTotal),
      };
    },

    async completeOrder(orderData) {
      try {
        const orderWithCoupon = {
          ...orderData,
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
        };
        this.pastOrders.push(orderWithCoupon);
        this.cart = [];
        this.showSidebar = false;
        this.activeCoupon = null;
        this.couponError = '';
        this.saveCartToLocalStorage();
        this.savePastOrdersToLocalStorage();
        return Promise.resolve();
      } catch (error) {
        console.error('Error completing order:', error);
        return Promise.reject(error);
      }
    },

    deleteOrder(orderId) {
      this.pastOrders = this.pastOrders.filter((order) => order.id !== orderId);
      this.savePastOrdersToLocalStorage();
    },

    clearOrders() {
      this.pastOrders = [];
      this.savePastOrdersToLocalStorage();
    },

    clearAllStoredData() {
      try {
        localStorage.removeItem('ecommerce-cart');
        localStorage.removeItem('ecommerce-pastOrders');
        localStorage.removeItem('ecommerce-userPreferences');

        this.cart = [];
        this.pastOrders = [];
        this.userPreferences = {
          name: '',
          email: '',
          phone: '',
          address: '',
        };
      } catch (error) {
        console.error('Error clearing localStorage', error);
      }
    },

    initializeInventory() {
      this.inventory.forEach((item) => {
        if (item.quantity === undefined) {
          item.quantity = 0;
        }
      });
    },
  },
});

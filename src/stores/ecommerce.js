// stores/ecommerce.js
import { defineStore } from 'pinia';
import food from '@/food.json';

export const useEcommerceStore = defineStore('ecommerce', {
  state: () => ({
    inventory: food,
    cart: {},
    pastOrders: [],
    showSidebar: false,
    activeCoupon: null,
    couponError: '',
    availableCoupons: [
      {
        code: 'WELCOME10',
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
        description: '15% off orders over $50',
        minOrder: 50,
        maxDiscount: 20,
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
    totalQuantity: (state) => {
      return Object.values(state.cart).reduce((acc, curr) => {
        return acc + curr;
      }, 0);
    },

    cartSubtotal: (state) => {
      const total = Object.entries(state.cart).reduce(
        (acc, [name, quantity]) => {
          const product = state.inventory.find((p) => p.name === name);
          const price = product ? product.price.USD : 0;
          return acc + price * quantity;
        },
        0
      );
      return parseFloat(total.toFixed(2));
    },

    cartTotal: (state) => {
      const subtotal = Object.entries(state.cart).reduce(
        (acc, [name, quantity]) => {
          const product = state.inventory.find((p) => p.name === name);
          const price = product ? product.price.USD : 0;
          return acc + price * quantity;
        },
        0
      );
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

      const subtotal = Object.entries(state.cart).reduce(
        (acc, [name, quantity]) => {
          const product = state.inventory.find((p) => p.name == name);
          const price = product ? product.price.USD : 0;
          return acc + price * quantity;
        },
        0
      );
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
      return Math.min(discount, subtotal);
    },

    highestPricedItems: (state) => {
      return state.inventory
        .slice()
        .sort((a, b) => b.price.USD - a.price.USD)
        .slice(0, 6);
    },
  },

  actions: {
    addToCart(name, quantity = 1) {
      if (quantity <= 0) return;

      if (!this.cart[name]) {
        this.cart[name] = 0;
      }
      this.cart[name] += quantity;
      this.showSidebar = true;
    },

    removeFromCart(name) {
      delete this.cart[name];
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },

    getProductPrice(name) {
      const product = this.inventory.find((p) => p.name === name);
      return product ? product.price.USD : 0;
    },

    getProductIcon(name) {
      const product = this.inventory.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      return product ? product.icon : 'question';
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

    async completeOrder(orderData) {
      const orderWithCoupon = {
        ...orderData,
        coupon: this.activeCoupon
          ? {
              code: this.activeCoupon.code,
              discount: this.activeCoupon.discount,
              description: this.activeCoupon.description,
            }
          : null,
        subtotal: this.cartSubtotal,
        discount: this.couponDiscount,
      };
      this.pastOrders.push(orderWithCoupon);
      this.cart = {};
      this.showSidebar = false;
      this.activeCoupon = null;
      this.couponError = '';
      return Promise.resolve();
    },

    deleteOrder(orderId) {
      this.pastOrders = this.pastOrders.filter((order) => order.id !== orderId);
    },

    clearOrders() {
      this.pastOrders = [];
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

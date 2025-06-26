<!-- TODO: Edit to personalize, rewrite entirely. Used AI to get functionality up and would like to rewrite it myself to learn. -->

<template>
  <main class="wrapper">
    <h1>Checkout</h1>

    <div v-if="Object.keys(cart).length === 0" class="empty-cart">
      <p>Your cart is empty!</p>
      <router-link to="/products" class="btn btn-primary"
        >Go Shopping</router-link
      >
    </div>

    <div v-else>
      <!-- Order Summary -->
      <div class="checkout-section">
        <h2>Order Summary</h2>
        <table class="checkout-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(quantity, name) in cart" :key="name">
              <td>{{ name }}</td>
              <td>${{ getPrice(name).toFixed(2) }}</td>
              <td>{{ quantity }}</td>
              <td>${{ (quantity * getPrice(name)).toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Total:</strong></td>
              <td>
                <strong>${{ calculateTotal() }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Customer Information Form -->
      <div class="checkout-section">
        <h2>Customer Information</h2>
        <form @submit.prevent="submitOrder" class="checkout-form">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input
              type="text"
              id="name"
              v-model="customerInfo.name"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              v-model="customerInfo.email"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              v-model="customerInfo.phone"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="address">Delivery Address *</label>
            <textarea
              id="address"
              v-model="customerInfo.address"
              required
              class="form-input"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Special Instructions</label>
            <textarea
              id="notes"
              v-model="customerInfo.notes"
              class="form-input"
              rows="2"
            ></textarea>
          </div>

          <div class="checkout-actions">
            <router-link to="/" class="btn btn-secondary"
              >Continue Shopping</router-link
            >
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Processing...' : 'Place Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Checkout',
  props: ['cart', 'inventory', 'completeOrder'],
  data() {
    return {
      isSubmitting: false,
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      },
    };
  },
  methods: {
    getPrice(name) {
      const product = this.inventory.find((p) => p.name === name);
      return product ? product.price.USD : 0;
    },

    calculateTotal() {
      const total = Object.entries(this.cart).reduce(
        (acc, [name, quantity]) => {
          const price = this.getPrice(name);
          return acc + price * quantity;
        },
        0
      );
      return total.toFixed(2);
    },

    async submitOrder() {
      this.isSubmitting = true;

      try {
        const orderData = {
          id: Date.now(),
          date: new Date().toISOString(),
          customer: { ...this.customerInfo },
          items: Object.entries(this.cart).map(([name, quantity]) => {
            const product = this.inventory.find((p) => p.name === name);
            return {
              name,
              quantity,
              price: product.price.USD,
              total: quantity * product.price.USD,
              icon: product.icon,
            };
          }),
          total: parseFloat(this.calculateTotal()),
        };

        // Call parent method to handle the order
        await this.completeOrder(orderData);

        // Redirect to success page or past orders
        this.$router.push('/past-orders');
      } catch (error) {
        console.error('Order submission failed:', error);
        alert('There was an error processing your order. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.checkout-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.checkout-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.checkout-table th,
.checkout-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.checkout-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.checkout-form {
  max-width: 500px;
  text-align: left;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
}

.checkout-actions {
  display: flex;
  gap: 15px;
  justify-content: space-between;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-cart {
  text-align: center;
  padding: 50px;
}
</style>

<!-- TODO: -->
<template>
  <main class="wrapper">
    <h1>Past Orders</h1>
    <div v-if="pastOrders.length > 0">
      <button
        @click="clearOrders()"
        class="btn btn-danger"
        style="margin-bottom: 20px"
      >
        Clear All Orders
      </button>

      <!-- Display each order -->
      <div v-for="order in pastOrders" :key="order.id" class="order-section">
        <div class="order-header">
          <div class="order-header-top">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.date) }}</p>
              <p class="order-customer">
                <strong>Customer:</strong> {{ order.customer.name }}
              </p>
              <p class="order-total-header">
                <strong>Order Total: ${{ order.total.toFixed(2) }}</strong>
              </p>
            </div>
            <button
              @click="deleteOrder(order.id)"
              class="btn btn-danger delete-order-btn"
              title="Delete this order"
            >
              Delete Order
            </button>
          </div>
        </div>

        <!-- Items table for this order -->
        <table class="product-table">
          <thead>
            <tr>
              <td><span class="sr-only">Product Image</span></td>
              <td>Product</td>
              <td>Price</td>
              <td>Quantity</td>
              <td>Total</td>
              <td><span class="sr-only">Actions</span></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="`${order.id}-${item.name}`">
              <td><i :class="`icofont-${item.icon} icofont-4x`"></i></td>
              <td>{{ item.name }}</td>
              <td>${{ item.price.toFixed(2) }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.total.toFixed(2) }}</td>
              <td>
                <button
                  class="btn btn-dark"
                  @click="addToCart(item.name, item.quantity)"
                >
                  Add to Cart
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-dark" @click="addAllToCart(order)">
          Add all items to your cart
        </button>
      </div>
    </div>
    <div v-else>
      <p>No past orders to display.</p>
    </div>
  </main>
</template>

<script>
export default {
  name: 'PastOrders',
  props: ['pastOrders', 'addToCart'], // Accept pastOrders and addToCart from parent
  methods: {
    clearOrders() {
      // Emit event to parent to clear orders
      this.$emit('clear-orders');
    },
    deleteOrder(orderId) {
      this.$emit('delete-order', orderId);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    },
    addAllToCart(order) {
      order.items.forEach((item) => {
        this.addToCart(item.name, item.quantity);
      });
    },
  },
};
</script>

<style scoped>
.order-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: rgb(88, 139, 72);
}

.order-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ccc;
}

.order-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.order-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-date,
.order-customer,
.order-total-header {
  margin: 5px 0;
  color: #333;
}

.delete-order-btn {
  margin-left: 20px;
  flex-shrink: 0;
}

.order-total-header {
  color: #42b983;
  font-size: 1.1em;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  background-color: rgb(88, 139, 72);
  margin-bottom: 10px;
}

.product-table th,
.product-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.product-table thead td {
  background-color: rgb(88, 139, 72);
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-dark {
  background-color: #343a40;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

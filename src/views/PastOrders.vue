<template>
  <main class="wrapper">
    <h1>Past Orders</h1>
    <div v-if="store.pastOrders.length > 0">
      <button
        @click="store.clearOrders()"
        class="btn btn-danger"
        style="margin-bottom: 20px"
      >
        Clear All Orders
      </button>
      <button
        @click="store.clearAllStoredData()"
        class="btn btn-danger"
        style="margin-bottom: 20px; margin-left: 8px"
      >
        Clear All Locally Stored Data
      </button>

      <div
        v-for="order in store.pastOrders"
        :key="order.id"
        class="order-section"
      >
        <div class="order-header">
          <div class="order-header-top">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.date) }}</p>
              <p class="order-customer">
                <strong>Customer:</strong> {{ order.customer.name }}
              </p>

              <div v-if="hasOrderDiscount(order)">
                <p class="order-total-header">
                  <strong
                    >Order Subtotal:
                    <del style="color: red; margin-right: 8px">
                      {{ $formatCurrency(order.subtotal) }}
                    </del>
                  </strong>
                </p>
                <p class="order-total-header">
                  <strong>
                    New Order Total: {{ $formatCurrency(order.total) }}
                  </strong>
                </p>
              </div>
              <div v-else>
                <p class="order-total-header">
                  <strong
                    >Order Total: {{ $formatCurrency(order.total) }}</strong
                  >
                </p>
              </div>
            </div>
            <button
              @click="store.deleteOrder(order.id)"
              class="btn btn-danger delete-order-btn"
              title="Delete this order"
            >
              Delete Order
            </button>
          </div>
        </div>

        <table class="product-table">
          <thead>
            <tr>
              <td><span class="sr-only">Product Image</span></td>
              <td>Product</td>
              <td>Price (each)</td>
              <td>Quantity</td>
              <td v-if="hasDiscounts(order)">Total After Coupon</td>
              <td v-else>Total</td>
              <td><span class="sr-only">Actions</span></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="`${order.id}-${item.name}`">
              <td><i :class="`icofont-${item.icon} icofont-4x`"></i></td>
              <td>{{ item.name }}</td>
              <td>
                <span v-if="hasItemDiscount(item)">
                  <del style="color: red; margin-right: 8px">
                    {{ $formatCurrency(item.price) }}
                  </del>
                  <span style="color: #42b983; font-weight: bold">
                    {{ $formatCurrency(item.discountedPrice) }}
                  </span>
                </span>
                <span v-else> {{ $formatCurrency(item.price) }} </span>
              </td>
              <td>{{ $formatNumber(item.quantity) }}</td>
              <template v-if="hasDiscounts(order)">
                <td>
                  <span v-if="hasItemDiscount">
                    <del style="color: red; margin-right: 8px"
                      >{{ $formatCurrency(item.originalTotal) }}
                    </del>
                    <span style="color: #42b983; font-weight: bold">
                      <strong
                        >{{ $formatCurrency(item.discountedTotal) }}
                      </strong>
                    </span>
                  </span>
                </td>
              </template>
              <td v-else>{{ $formatCurrency(item.originalTotal) }}</td>
              <td>
                <button
                  class="btn btn-dark"
                  @click="store.addToCart(item.name, item.quantity)"
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
        <div
          v-if="order.subtotal - order.total > 0"
          style="color: #42b983; font-weight: bold; padding-top: 15px"
        >
          You saved: {{ $formatCurrency(order.subtotal - order.total) }} using
          {{ order.coupon?.code }}!
        </div>
      </div>
    </div>

    <div v-else>
      <p>No past orders to display.</p>
      <button
        @click="store.clearAllStoredData()"
        class="btn btn-danger"
        style="margin-bottom: 20px"
      >
        Clear All Locally Stored Data
      </button>
    </div>
  </main>
</template>

<script>
import { useEcommerceStore } from '@/stores/ecommerce';

export default {
  name: 'PastOrders',
  setup() {
    const store = useEcommerceStore();

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    const addAllToCart = (order) => {
      order.items.forEach((item) => {
        store.addToCart(item.name, item.quantity);
      });
    };

    const hasItemDiscount = (item) => {
      const tolerance = 0.01;
      return Math.abs(item.originalTotal - item.discountedTotal) > tolerance;
    };

    const hasDiscounts = (order) => {
      return order.items.some((item) => hasItemDiscount(item));
    };

    const hasOrderDiscount = (order) => {
      const tolerance = 0.01;
      return Math.abs(order.subtotal - order.total) > tolerance;
    };

    return {
      store,
      formatDate,
      addAllToCart,
      hasDiscounts,
      hasItemDiscount,
      hasOrderDiscount,
    };
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

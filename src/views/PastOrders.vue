<!-- TODO: Dynamically display pastOrders, I believe the html is correct but the data return is currently hard coded.
      Clearing pastorders resets after navigating to any other page. We want this to be persistent once we clear orders. -->

<template>
  <main class="wrapper">
    <h1>Past Orders</h1>
    <div v-if="pastOrders.length > 0">
      <button
        @click="clearOrders"
        class="btn btn-danger"
        style="margin-bottom: 20px"
      >
        Clear All Orders
      </button>
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
          <tr v-for="order in pastOrders" :key="order.id">
            <td><i :class="`icofont-${order.icon} icofont-4x`"></i></td>
            <td>{{ order.name }}</td>
            <td>${{ order.price.toFixed(2) }}</td>
            <td>{{ order.quantity }}</td>
            <td>${{ order.total.toFixed(2) }}</td>
            <td><button class="btn btn-dark">Add</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No past orders to display.</p>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      pastOrders: [
        {
          id: 1,
          icon: 'raddish',
          name: 'Raddishes',
          price: 1.0,
          quantity: 1,
          total: 1.0,
        },
        {
          id: 2,
          icon: 'artichoke',
          name: 'Artichokes',
          price: 0.5,
          quantity: 10,
          total: 5.0,
        },
      ],
    };
  },
  methods: {
    clearOrders() {
      this.pastOrders = [];
    },
  },
};
</script>
<!--
<template>
  <main class="wrapper">
    <h1>Past Orders</h1>
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
        <tr>
          <td><i class="icofont-carrot icofont-4x"></i></td>
          <td>Carrot</td>
          <td>$1.00</td>
          <td>1</td>
          <td>$1.00</td>
          <td><button class="btn btn-dark">Add</button></td>
        </tr>
        <tr>
          <td><i class="icofont-banana icofont-4x"></i></td>
          <td>Banana</td>
          <td>$0.50</td>
          <td>10</td>
          <td>$5.00</td>
          <td><button class="btn btn-dark">Add</button></td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
!-->

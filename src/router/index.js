//index.js

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Products from '../views/Products.vue';
import PastOrders from '../views/PastOrders.vue';
import Checkout from '../views/Checkout.vue';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
  },
  {
    path: '/past-orders',
    name: 'PastOrders',
    component: PastOrders,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

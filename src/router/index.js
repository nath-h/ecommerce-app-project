import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Products from '../views/Products.vue';
import PastOrders from '../views/PastOrders.vue';
import Checkout from '../views/Checkout.vue';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ProductView from '@/views/ProductView.vue';
import Profile from '@/views/Profile.vue';
import AdminView from '@/views/AdminView.vue';
import OrderConfirmation from '@/views/OrderConfirmation.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
  },
  {
    path: '/products/:id',
    name: 'ProductView',
    component: ProductView,
    props: true,
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
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/admin',
    name: 'AdminView',
    component: AdminView,
  },
  {
    path: '/order-confirmation/:id',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

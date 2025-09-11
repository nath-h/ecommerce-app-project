import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/style.scss';
import { useAuthStore } from '@/stores/authStore';

const app = createApp(App);

app.config.globalProperties.$formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

app.config.globalProperties.$formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};
const pinia = createPinia();
app.use(pinia);
app.use(router);
const authStore = useAuthStore();
authStore.initializeAuth();
app.mount('#app');

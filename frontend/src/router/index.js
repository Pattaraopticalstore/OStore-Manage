// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

// --- นำเข้า Views ทั้งหมด ---
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import SalesView from '../views/SalesView.vue'
import InvoiceHistoryView from '../views/InvoiceHistoryView.vue'
import InvoiceDetailView from '../views/InvoiceDetailView.vue'
import ShopInfoView from '../views/ShopInfoView.vue'
import CustomerDetailView from '../views/CustomerDetailView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ArchivedProductsView from '../views/ArchivedProductsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- เพิ่ม Route สำหรับ Login และ Register ---
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: true, isAdmin: true }
    },

    // --- Routes เดิมที่ต้องมีการ Login ---
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/customers',
      name: 'customers',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:id',
      name: 'customer-detail',
      component: CustomerDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true }
    },
    {
        path: '/products/archived',
        name: 'archived-products',
        component: ArchivedProductsView,
        meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: InvoiceHistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoice/:id',
      name: 'invoice-detail',
      component: InvoiceDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/shop-info',
      name: 'shop-info',
      component: ShopInfoView,
      meta: { requiresAuth: true }
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView,
      meta: { requiresAuth: true }
    }
  ]
})

// --- Navigation Guard (โค้ดเดิม) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
} else {
    next();
  }
});

export default router
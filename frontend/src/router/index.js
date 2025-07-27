// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import SalesView from '../views/SalesView.vue';
import InvoiceHistoryView from '../views/InvoiceHistoryView.vue';
import InvoiceDetailView from '../views/InvoiceDetailView.vue';
import ShopInfoView from '../views/ShopInfoView.vue';
import CustomerDetailView from '../views/CustomerDetailView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import ReportsView from '../views/ReportsView.vue';
import ArchivedProductsView from '../views/ArchivedProductsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
    path: '/login',
    name: 'login',
    component: LoginView,
    },
    {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: true, isAdmin: true } // หน้านี้ต้อง Login และเป็น Admin
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'แดชบอร์ด', requiresAuth: true }
    },
    {
      path: '/customers', 
      name: 'customers',    
      component: HomeView,
      meta: { title: 'จัดการลูกค้า', requiresAuth: true }
    },
    // 2. ตรวจสอบว่ามี object นี้อยู่ครบถ้วน
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { title: 'จัดการสินค้า', requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
      meta: { title: 'ทำการขาย', requiresAuth: true }
    },
    {
    path: '/invoices',
    name: 'invoices',
    component: InvoiceHistoryView,
    meta: { title: 'ประวัติการขาย', requiresAuth: true }
    },
    {
    path: '/invoice/:id', // :id คือพารามิเตอร์
    name: 'invoice-detail',
    component: InvoiceDetailView,
    },
    {
    path: '/shop-info',
    name: 'shop-info',
    component: ShopInfoView,
    meta: { title: 'ข้อมูลร้านค้า', requiresAuth: true }
    },
    {
    path: '/customers/:id', // :id คือ ID ของลูกค้า
    name: 'customer-detail',
    component: CustomerDetailView,
    },
    {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView,
    meta: { title: 'บันทึกรายจ่าย', requiresAuth: true }
    },
    {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { title: 'รายงาน', requiresAuth: true, isAdmin: true } // อาจจะจำกัดให้ Admin ดูได้
    },
    {
    path: '/products/archived',
    name: 'archived-products',
    component: ArchivedProductsView,
    meta: { title: 'สินค้าที่ซ่อนอยู่', requiresAuth: true }
    }
  ]
})

  router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // ถ้าหน้านี้ต้อง login แต่ยังไม่ได้ login ให้ไปที่หน้า login
    next('/login');
  } else {
    next(); // ไปยังหน้าที่ต้องการตามปกติ
  }
});

export default router
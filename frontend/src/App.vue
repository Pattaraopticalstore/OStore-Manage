<template>
  <div class="app-layout" v-if="authStore.isAuthenticated">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">OStore Manage</h1>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/"><i class="icon">📊</i> แดชบอร์ด</RouterLink>
        <RouterLink to="/sales"><i class="icon">🛒</i> ทำการขาย</RouterLink>
        <RouterLink to="/invoices"><i class="icon">🧾</i> ประวัติการขาย</RouterLink>
        <RouterLink to="/reports"><i class="icon">📈</i> รายงาน</RouterLink>
        <hr>
        <RouterLink to="/customers"><i class="icon">👥</i> จัดการลูกค้า</RouterLink>
        <RouterLink to="/products"><i class="icon">📦</i> จัดการสินค้า</RouterLink>
        <hr>
        <RouterLink to="/shop-info"><i class="icon">🏠</i> ข้อมูลร้านค้า</RouterLink>
        <RouterLink to="/expenses"><i class="icon">💸</i> บันทึกรายจ่าย</RouterLink> 
        <RouterLink v-if="authStore.isAdmin" to="/register"><i class="icon">👤</i> เพิ่มผู้ใช้งาน</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
            <div class="user-name">{{ authStore.user?.fullName }}</div>
            <div class="user-role">{{ authStore.user?.role }}</div>
        </div>
        <button @click="handleLogout" class="btn logout-button">ออกจากระบบ</button>
      </div>
    </aside>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #004d40; /* var(--primary-darker) */
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  margin: 0;
  font-size: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.sidebar-nav a {
  color: white;
  text-decoration: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.sidebar-nav a:hover {
  background-color: #00695c; /* var(--primary-color) */
}

.sidebar-nav a.router-link-exact-active {
  background-color: #009688; /* var(--secondary-color) */
  font-weight: bold;
}

.sidebar-nav .icon {
  margin-right: 1rem;
  font-style: normal;
}

.sidebar-nav hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.5rem 1rem;
}

.main-content {
  flex-grow: 1;
  background-color: #e0f2f1; /* var(--background-color) */
  padding: 2rem;
  overflow-y: auto;
}
.sidebar-footer {
    margin-top: auto; /* ดันลงไปข้างล่างสุด */
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.user-info {
    margin-bottom: 1rem;
    text-align: center;
}
.user-name {
    font-weight: bold;
}
.user-role {
    font-size: 0.8rem;
    color: #ccc;
    text-transform: capitalize;
}
.logout-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}
.logout-button:hover {
    background-color: #d32f2f;
}
</style>
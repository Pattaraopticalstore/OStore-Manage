// src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

// ทำให้ store สามารถใช้ router ได้ (สำหรับ this.router.push)
pinia.use(({ store }) => {
  store.router = router
})

app.use(pinia)
app.use(router)

// ตรวจสอบ token ทุกครั้งที่โหลดแอป
const authStore = useAuthStore()
if (authStore.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
}

app.mount('#app')
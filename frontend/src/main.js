// src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupInterceptors } from './api'

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
  store.router = router
});

app.use(pinia)
app.use(router)

setupInterceptors(pinia);

app.mount('#app')
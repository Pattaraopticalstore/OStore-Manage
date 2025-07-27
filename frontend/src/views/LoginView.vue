<template>
  <div class="login-container">
    <div class="login-box card">
      <h2>เข้าสู่ระบบ OStore Manage</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้</label>
          <input id="username" v-model="username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input id="password" type="password" v-model="password" class="form-control" required>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%;">เข้าสู่ระบบ</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login({ username: username.value, password: password.value });
    router.push('/'); // ไปยังหน้าแดชบอร์ดหลัง login สำเร็จ
  } catch (error) {
    errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    console.error('Login failed:', error);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}
.login-box {
  width: 100%;
  max-width: 400px;
}
.error-message {
  color: #f44336;
  margin-bottom: 1rem;
}
</style>
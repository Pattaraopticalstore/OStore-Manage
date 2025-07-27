<template>
  <div class="page-container">
    <div class="card form-container">
      <h2>เพิ่มผู้ใช้งานใหม่</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullName">ชื่อ-นามสกุล</label>
          <input id="fullName" v-model="form.full_name" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้ (Username)</label>
          <input id="username" v-model="form.username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input id="password" type="password" v-model="form.password" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="role">บทบาท (Role)</label>
          <select id="role" v-model="form.role" class="form-control">
            <option value="staff">พนักงาน (Staff)</option>
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
          </select>
        </div>
        <p v-if="message" :class="isError ? 'error-message' : 'success-message'">{{ message }}</p>
        <button type="submit" class="btn btn-primary" style="width: 100%;">สร้างผู้ใช้งาน</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const form = ref({
  username: '',
  password: '',
  full_name: '',
  role: 'staff'
});

const message = ref('');
const isError = ref(false);
const authStore = useAuthStore();

const handleRegister = async () => {
  if (!form.value.password) {
    message.value = 'กรุณากรอกรหัสผ่าน';
    isError.value = true;
    return;
  }
  try {
    await authStore.register(form.value);
    message.value = `สร้างผู้ใช้งาน "${form.value.username}" สำเร็จ!`;
    isError.value = false;
    // Reset form
    form.value = { username: '', password: '', full_name: '', role: 'staff' };
  } catch (error) {
    message.value = 'ไม่สามารถสร้างผู้ใช้งานได้ อาจมีชื่อผู้ใช้นี้ในระบบแล้ว';
    isError.value = true;
    console.error('Registration failed:', error);
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* จัดให้อยู่บนสุด */
  padding-top: 4rem;
}
.form-container {
  width: 100%;
  max-width: 500px;
}
.error-message {
  color: #f44336;
  margin-bottom: 1rem;
}
.success-message {
  color: #00695c;
  margin-bottom: 1rem;
}
</style>
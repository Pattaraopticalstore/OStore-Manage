<template>
  <div class="customer-form-container">
    <h2 class="form-title">
      {{ customer.id ? `📝 แก้ไขข้อมูลลูกค้า ID: ${customer.id}` : '📝 บันทึกข้อมูลลูกค้าใหม่' }}
    </h2>

    <form @submit.prevent="saveCustomer">
      <div class="form-grid">
        <div class="form-group"><label for="firstName">ชื่อ</label><input type="text" id="firstName" v-model="customer.firstName" required></div>
        <div class="form-group"><label for="lastName">นามสกุล</label><input type="text" id="lastName" v-model="customer.lastName" required></div>
        <div class="form-group"><label for="phone">เบอร์โทรศัพท์</label><input type="tel" id="phone" v-model="customer.phone"></div>
        <div class="form-group"><label for="birthDate">วัน/เดือน/ปีเกิด</label><input type="date" id="birthDate" v-model="customer.birthDate"></div>
      </div>
      
      <hr class="form-divider">
      <h3>ที่อยู่</h3>

      <div class="form-grid-detailed">
        <div class="form-group"><label>บ้านเลขที่</label><input v-model="customer.address.houseNumber" class="form-control"></div>
        <div class="form-group"><label>หมู่ที่</label><input v-model="customer.address.moo" class="form-control"></div>
        <div class="form-group"><label>ซอย</label><input v-model="customer.address.soi" class="form-control"></div>
        <div class="form-group"><label>ถนน</label><input v-model="customer.address.road" class="form-control"></div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>ตำบล/แขวง</label>
          <input v-model="customer.address.subdistrict" class="form-control">
        </div>
        <div class="form-group">
          <label>อำเภอ/เขต</label>
          <input v-model="customer.address.district" class="form-control">
        </div>
        <div class="form-group">
          <label>จังหวัด</label>
          <input v-model="customer.address.province" class="form-control">
        </div>
        <div class="form-group">
          <label>รหัสไปรษณีย์</label>
          <input v-model="customer.address.postalCode" class="form-control">
        </div>
      </div>

      <div class="form-actions">
        <button v-if="customer.id" type="button" @click="cancelEdit" class="btn btn-cancel">
          ยกเลิก
        </button>
        <button type="submit" class="btn btn-primary">บันทึกข้อมูล</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  customerToEdit: Object
});

const emit = defineEmits(['customer-saved']);

// 1. กำหนด state เริ่มต้นสำหรับที่อยู่
const initialAddress = { province: '', district: '', subdistrict: '', postalCode: '', houseNumber: '', moo: '', soi: '', road: '' };
const customer = ref({
  id: null,
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  address: { ...initialAddress } // 2. เพิ่ม address เข้าไปใน customer state
});

// 4. อัปเดต resetForm ให้ล้างข้อมูลที่อยู่ด้วย
const resetForm = () => {
  customer.value = { 
    id: null, 
    firstName: '', 
    lastName: '', 
    phone: '', 
    birthDate: '', 
    address: { ...initialAddress } 
  };
};

// 3. อัปเดต watch ให้รองรับ address
watch(() => props.customerToEdit, (newVal) => {
  if (newVal) {
    // รวม address ที่มีอยู่กับ initialAddress เพื่อให้แน่ใจว่ามี key ครบ
    customer.value = { ...newVal, address: { ...initialAddress, ...(newVal.address || {}) } };
  } else {
    resetForm();
  }
}, { immediate: true });


const saveCustomer = async () => {
  try {
    if (customer.value.id) {
      await axios.put(`http://localhost:3001/api/customers/${customer.value.id}`, customer.value);
    } else {
      await axios.post('http://localhost:3001/api/customers', customer.value);
    }
    alert('บันทึกข้อมูลสำเร็จ!');
    emit('customer-saved');
    resetForm();
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    alert("ไม่สามารถบันทึกข้อมูลได้");
  }
};

const cancelEdit = () => {
  emit('customer-saved');
  resetForm();
};
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&display=swap');
  .customer-form-container {
    background-color: #ffffff; padding: 2rem; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-family: 'Noto Sans Thai', sans-serif;
    width: 100%; max-width: 800px;
  }
  .form-title { color: #00695c; margin-bottom: 1.5rem; text-align: center; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
  .form-group { display: flex; flex-direction: column; }
  .form-group label { margin-bottom: 0.5rem; font-weight: bold; color: #333; }
  .form-group input { padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; font-family: 'Noto Sans Thai', sans-serif; width:100; box-sizing: border-box }
  .form-actions { margin-top: 2rem; text-align: right; }
  .btn-save { background-color: #00695c; color: white; padding: 0.8rem 2rem; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s; }
  .btn-save:hover { background-color: #009688; }
  .btn-cancel { background-color: #757575; color: white; margin-right: 1rem; padding: 0.8rem 2rem; border: none; border-radius: 4px; cursor: pointer; } 
  .form-divider { border: none; border-top: 1px solid #e0e0e0;  margin: 2rem 0; }
</style>
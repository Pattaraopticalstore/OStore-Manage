<template>
  <div class="card">
    <h2>👥 รายชื่อลูกค้าทั้งหมด</h2>

    <div class="form-group">
      <input 
        v-model="searchTerm" 
        type="text" 
        class="form-control" 
        placeholder="ค้นหาจากชื่อ หรือเบอร์โทร..."
      />
    </div>

    <div class="table-responsive">
      <table class="app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>เบอร์โทรศัพท์</th>
            <th>อายุ</th> <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCustomers.length === 0">
            <td colspan="6" style="text-align: center;">ไม่พบข้อมูลลูกค้า</td>
          </tr>
          <tr v-for="customer in filteredCustomers" :key="customer.id">
            <td>{{ customer.id }}</td>
            <td>
              <RouterLink :to="{ name: 'customer-detail', params: { id: customer.id }}">
                {{ customer.first_name }}
              </RouterLink>
            </td>
            <td>
              <RouterLink :to="{ name: 'customer-detail', params: { id: customer.id }}">
                {{ customer.last_name }}
              </RouterLink>
            </td>
            <td>{{ customer.phone }}</td>
            <td>{{ calculateAge(customer.birth_date) }}</td>
            <td>
              <button @click="$emit('edit-customer', customer)" class="btn btn-edit">แก้ไข</button>
              <button @click="deleteCustomer(customer.id)" class="btn btn-danger">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // 1. เพิ่ม computed
import api from '@/api.js';
import { RouterLink } from 'vue-router';

const emit = defineEmits(['edit-customer']);
const customers = ref([]);
const searchTerm = ref(''); // 2. สร้าง ref สำหรับเก็บคำค้นหา

// 3. สร้างฟังก์ชันสำหรับคำนวณอายุ
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// 4. สร้าง computed property สำหรับกรองข้อมูล
const filteredCustomers = computed(() => {
  if (!searchTerm.value) {
    return customers.value;
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return customers.value.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(lowerCaseSearch) ||
    (customer.phone && customer.phone.includes(lowerCaseSearch))
  );
});

// --- ฟังก์ชันเดิม ---
const fetchCustomers = async () => {
  try {
    const response = await api.get('/api/customers');
    customers.value = response.data;
  } catch (error) {
    console.error("ไม่สามารถดึงข้อมูลลูกค้าได้:", error);
  }
};

const deleteCustomer = async (id) => {
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้า ID: ${id}?`)) {
    try {
      await api.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error(`ไม่สามารถลบข้อมูลลูกค้า ID: ${id} ได้`, error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  }
};

onMounted(fetchCustomers);
defineExpose({
  fetchCustomers 
});
</script>

<style scoped>
    .customer-list-container {
        margin-top: 2rem;
        background-color: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 800px;
        font-family: 'Noto Sans Thai', sans-serif;
    }
    .list-title {
        color: #00695c;
        margin-bottom: 1.5rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 12px 15px;
        border: 1px solid #ddd;
        text-align: left;
    }
    th {
        background-color: #009688;
        color: white;
    }
    tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    .btn-delete {
        background-color: #f44336; /* สีแดง */
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    .btn-delete:hover {
        background-color: #d32f2f;
    }
    .btn-edit {
        background-color: #ff9800; /* สีส้ม */
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px; /* เพิ่มระยะห่าง */
        transition: background-color 0.3s;
    }
    .btn-edit:hover {
        background-color: #f57c00;
    }
     .btn-danger { border: none; padding: 8px 12px; border-radius: 4px; color: white; cursor: pointer; margin-right: 5px; }
</style>
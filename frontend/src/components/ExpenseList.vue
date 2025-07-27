<template>
  <div class="card">
    <h2>รายการรายจ่ายทั้งหมด</h2>
    <div class="table-responsive">
      <table class="app-table">
        <thead><tr><th>วันที่</th><th>หมวดหมู่</th><th>คำอธิบาย</th><th>จำนวนเงิน</th><th>จัดการ</th></tr></thead>
        <tbody>
          <tr v-for="exp in expenses" :key="exp.id">
            <td>{{ new Date(exp.expense_date).toLocaleDateString('th-TH') }}</td>
            <td>{{ exp.category }}</td>
            <td>{{ exp.description }}</td>
            <td>{{ parseFloat(exp.amount).toFixed(2) }}</td>
            <td>
              <button @click="$emit('edit-expense', exp)" class="btn-edit">แก้ไข</button>
              <button @click="deleteExpense(exp.id)" class="btn-danger">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const emit = defineEmits(['edit-expense']);
const expenses = ref([]);
const fetchExpenses = async () => { try { const res = await axios.get('http://localhost:3001/api/expenses'); expenses.value = res.data; } catch (e) { console.error(e); } };
const deleteExpense = async (id) => { if (confirm('ยืนยันการลบรายการ?')) { try { await axios.delete(`http://localhost:3001/api/expenses/${id}`); fetchExpenses(); } catch (e) { console.error(e); } } };
onMounted(fetchExpenses);
defineExpose({ fetchExpenses });
</script>
<style scoped>
.table-responsive { overflow-x: auto; }
.btn-edit { background-color: #ff9800; color: white; margin-right: 0.5rem; }
.btn-edit, .btn-danger { border: none; padding: 8px 12px; border-radius: 4px; color: white; cursor: pointer; margin-right: 5px; }
</style>
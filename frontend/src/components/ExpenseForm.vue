<template>
  <div class="card">
    <h2>{{ form.id ? 'แก้ไขรายการ' : 'เพิ่มรายการรายจ่ายใหม่' }}</h2>
    <form @submit.prevent="saveExpense">
      <div class="form-grid">
        <div class="form-group">
          <label>วันที่</label>
          <input type="date" v-model="form.expense_date" class="form-control" required>
        </div>
        <div class="form-group">
          <label>หมวดหมู่</label>
          <select v-model="form.category" class="form-control" required>
            <option>ต้นทุนกรอบ</option>
            <option>ต้นทุนเลนส์</option>
            <option>ต้นทุนผ้าเช็ดแว่น</option>
            <option>ต้นทุนกล่องแว่น</option>
            <option>ค่าเช่า</option>
            <option>ค่าสาธารณูปโภค (น้ำ/ไฟ/เน็ต)</option>
            <option>เงินเดือน</option>
            <option>ค่าการตลาด</option>
            <option>ค่าซ่อมบำรุง</option>
            <option>อื่นๆ</option>
          </select>
        </div>
        <div class="form-group">
          <label>จำนวนเงิน (บาท)</label>
          <input type="number" step="0.01" v-model="form.amount" class="form-control" required>
        </div>
        <div class="form-group full-width">
          <label>คำอธิบาย</label>
          <input v-model="form.description" class="form-control">
        </div>
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button v-if="form.id" @click="cancelEdit" type="button" class="btn btn-cancel">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึก</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/api';
const props = defineProps({ expenseToEdit: Object });
const emit = defineEmits(['expense-saved']);
const form = ref({ id: null, expense_date: new Date().toISOString().slice(0, 10), category: 'อื่นๆ', description: '', amount: '' });
watch(() => props.expenseToEdit, (newVal) => { form.value = newVal ? { ...newVal, expense_date: newVal.expense_date.slice(0, 10) } : { id: null, expense_date: new Date().toISOString().slice(0, 10), category: 'อื่นๆ', description: '', amount: '' }; });
const saveExpense = async () => {
  try {
    if (form.value.id) {
      await api.put(`/api/expenses/${form.value.id}`, form.value);
    } else {
      await api.post('/api/expenses', form.value);
    }
    emit('expense-saved');
  } catch (error) { console.error("Error saving expense:", error); alert('เกิดข้อผิดพลาด'); }
};
const cancelEdit = () => { emit('expense-saved'); };
</script>
<style scoped>
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.full-width { grid-column: 1 / -1; }
.btn-cancel { background-color: #757575; color: white; margin-right: 1rem; }
</style>
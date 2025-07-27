<template>
  <div class="card">
    <h2 class="form-title">{{ product.id ? `แก้ไขสินค้า ID: ${product.id}` : 'เพิ่มสินค้าใหม่' }}</h2>
    <form @submit.prevent="saveProduct">
      <div class="form-grid">
        <div class="form-group"><label>ชื่อสินค้า</label><input v-model="product.name" required class="form-control"></div>
        <div class="form-group"><label>ยี่ห้อ</label><input v-model="product.brand" class="form-control"></div>
        <div class="form-group"><label>ประเภท</label><input v-model="product.category" class="form-control"></div>
        <div class="form-group"><label>ราคาทุน</label><input type="number" step="0.01" v-model="product.cost_price" required class="form-control"></div>
        <div class="form-group"><label>ราคาขาย</label><input type="number" step="0.01" v-model="product.selling_price" required class="form-control"></div>
        
        <div class="form-group">
            <label>จำนวนคงคลัง</label>
            <input type="number" step="0.5" v-model="product.quantity_on_hand" required class="form-control">
        </div>
        <div class="form-group">
            <label>หน่วยนับ</label>
            <select v-model="product.unit_name" class="form-control">
                <option>ชิ้น</option>
                <option>อัน</option>
                <option>ตัว</option>
                <option>ข้าง</option>
                <option>คู่</option>
                <option>กล่อง</option>
                <option>ชุด</option>
            </select>
        </div>
        
        <div class="form-group full-width">
            <label>คุณสมบัติ </label>
            <textarea v-model="product.properties" class="form-control" rows="4"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button v-if="product.id" type="button" @click="cancelEdit" class="btn btn-cancel">ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึกสินค้า</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/api';

const props = defineProps({ productToEdit: Object });
const emit = defineEmits(['product-saved']);

// 👇 เพิ่ม unit_name เข้าไปใน state เริ่มต้น
const product = ref({ 
  id: null, name: '', brand: '', category: '', 
  cost_price: 0, selling_price: 0, quantity_on_hand: 0, 
  properties: '', unit_name: 'ชิ้น' 
});

// 👇 เพิ่ม unit_name เข้าไปใน watch ด้วย
watch(() => props.productToEdit, (newVal) => { 
  product.value = newVal 
    ? { ...newVal } 
    : { 
        id: null, name: '', brand: '', category: '', 
        cost_price: 0, selling_price: 0, quantity_on_hand: 0, 
        properties: '', unit_name: 'ชิ้น' 
      }; 
});

const saveProduct = async () => {
  try {
    if (product.value.id) {
      await api.put(`/api/products/${product.value.id}`, product.value);
    } else {
      await api.post('/api/products', product.value);
    }
    emit('product-saved');
  } catch (error) { 
    console.error("Error saving product:", error); 
    alert('เกิดข้อผิดพลาดในการบันทึก');
  }
};

const cancelEdit = () => { emit('product-saved'); };
</script>

<style scoped>
/* ใช้ CSS คล้ายกับ CustomerForm ได้เลย */
.form-container { background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.form-title { color: #00695c; margin-bottom: 1.5rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.form-actions { margin-top: 1.5rem; text-align: right; }
.btn-save, .btn-cancel { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; color: white; }
.btn-save { background-color: #00695c; }
.btn-cancel { background-color: #757575; margin-right: 1rem; }
</style>
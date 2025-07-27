<template>
  <div class="card">
    <h2>รายการสินค้าทั้งหมด</h2>

    <div class="form-group">
      <input 
        v-model="searchTerm" 
        type="text" 
        class="form-control" 
        placeholder="ค้นหาสินค้าจากชื่อ, ยี่ห้อ, หรือประเภท..."
      />
    </div>

    <div class="table-responsive">
      <table class="app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ</th>
            <th>ยี่ห้อ</th>
            <th>ประเภท</th>
            <th>ราคาขาย</th>
            <th>คงคลัง</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.category }}</td>
            <td>{{ parseFloat(product.selling_price).toFixed(2) }}</td>
            <td>{{ product.quantity_on_hand }}</td>
            <td>
              <button @click="receiveStock(product)" class="btn btn-receive">รับของ</button>
              <button @click="$emit('edit-product', product)" class="btn btn-edit">แก้ไข</button>
              <button @click="deleteProduct(product.id)" class="btn btn-danger">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // 1. เพิ่ม computed
import axios from 'axios';

const emit = defineEmits(['edit-product']);
const products = ref([]);
const searchTerm = ref(''); // 2. สร้าง ref สำหรับเก็บคำค้นหา

// 3. สร้าง computed property สำหรับกรองข้อมูล
const filteredProducts = computed(() => {
  if (!searchTerm.value) {
    return products.value; // ถ้าไม่มีคำค้นหา ให้แสดงทั้งหมด
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return products.value.filter(product => 
    product.name.toLowerCase().includes(lowerCaseSearch) ||
    (product.brand && product.brand.toLowerCase().includes(lowerCaseSearch)) ||
    (product.category && product.category.toLowerCase().includes(lowerCaseSearch))
  );
});

// --- ฟังก์ชันเดิม (ไม่มีการเปลี่ยนแปลง) ---
const fetchProducts = async () => { try { const res = await axios.get('http://localhost:3001/api/products'); products.value = res.data; } catch (e) { console.error(e); } };
const deleteProduct = async (id) => {
  // 👇 เปลี่ยนข้อความใน confirm
  if (confirm('ยืนยันการซ่อนสินค้า?\nสินค้าจะไม่ถูกลบ แต่จะถูกซ่อนจากการขายและรายการทั้งหมด')) {
    try {
      await axios.delete(`http://localhost:3001/api/products/${id}`);
      fetchProducts();
    } catch (e) { console.error(e); }
  }
};
const receiveStock = async (product) => {
  const quantityStr = prompt(`รับสินค้า '${product.name}' เข้าสต็อกจำนวน:`, "1");

  if (quantityStr === null) return;

  // 👇 เปลี่ยนจาก parseInt เป็น parseFloat
  const quantityToAdd = parseFloat(quantityStr);

  if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
    alert("กรุณาใส่จำนวนเป็นตัวเลขที่มากกว่า 0");
    return;
  }

  try {
    await axios.post(`http://localhost:3001/api/products/${product.id}/add-stock`, { quantityToAdd });
    fetchProducts();
  } catch (error) {
    console.error("Failed to add stock:", error);
    alert("เกิดข้อผิดพลาดในการเพิ่มสต็อก");
  }
};

onMounted(fetchProducts);
defineExpose({ fetchProducts });
</script>

<style scoped>
 /* ใช้ CSS คล้ายกับ CustomerList ได้เลย */
.list-container { margin-top: 2rem; background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h2 { color: #00695c; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
th { background-color: #009688; color: white; }
.btn-edit, .btn-danger, .btn-receive { border: none; padding: 8px 12px; border-radius: 4px; color: white; cursor: pointer; margin-right: 5px; }
.btn-edit { background-color: #ff9800; }
.btn-delete { background-color: #f44336; }
.btn-receive { background-color: #0288d1; color: white; margin-right: 0.5rem; }
</style>
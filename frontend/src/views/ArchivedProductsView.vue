<template>
  <h1>สินค้าที่ซ่อนอยู่</h1>
  <p>รายการสินค้าเหล่านี้จะไม่ปรากฏในหน้าการขายหรือหน้ารายการสินค้าหลัก</p>
  <div class="card">
    <div class="table-responsive">
      <table class="app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อสินค้า</th>
            <th>คงคลัง</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="archivedProducts.length === 0">
            <td colspan="4" style="text-align: center;">ไม่มีสินค้าที่ซ่อนอยู่</td>
          </tr>
          <tr v-for="product in archivedProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.quantity_on_hand }} {{ product.unit_name }}</td>
            <td>
              <button @click="reactivateProduct(product.id)" class="btn btn-primary">นำกลับมาขาย</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api';

const archivedProducts = ref([]);

const fetchArchivedProducts = async () => {
  try {
    const res = await api.get('/api/products/inactive');
    archivedProducts.value = res.data;
  } catch (error) {
    console.error("Failed to fetch archived products:", error);
  }
};

const reactivateProduct = async (id) => {
  if (confirm('คุณต้องการนำสินค้านี้กลับมาขายใช่หรือไม่?')) {
    try {
      await api.put(`/api/products/${id}/reactivate`);
      alert('นำสินค้ากลับมาขายสำเร็จ');
      fetchArchivedProducts(); // โหลดรายการใหม่ (สินค้าที่เพิ่งกู้คืนจะหายไปจากหน้านี้)
    } catch (error) {
      console.error("Failed to reactivate product:", error);
      alert('เกิดข้อผิดพลาด');
    }
  }
};

onMounted(fetchArchivedProducts);
</script>
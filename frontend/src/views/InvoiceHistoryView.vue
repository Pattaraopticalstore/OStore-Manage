<template>
  <main class="page-container">
    <div class="list-container">
      <h2>ประวัติการขายทั้งหมด</h2>
      <table>
        <thead>
          <tr>
            <th>เลขที่บิล</th>
            <th>วันที่</th>
            <th>ลูกค้า</th>
            <th>ยอดสุทธิ (บาท)</th>
            <th>วิธีการชำระเงิน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td>#{{ invoice.id }}</td>
            <td>{{ new Date(invoice.invoice_date).toLocaleString('th-TH') }}</td>
            <td>{{ invoice.first_name ? `${invoice.first_name} ${invoice.last_name}` : 'ไม่มี' }}</td>
            <td>{{ parseFloat(invoice.total_amount).toFixed(2) }}</td>
            <td>{{ invoice.payment_method }}</td>
            <td>
              <button @click="viewInvoice(invoice.id)" class="btn btn-view">ดู/พิมพ์</button>
              <button @click="deleteInvoice(invoice.id)" class="btn btn-delete">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const invoices = ref([]);
const router = useRouter();

const fetchInvoices = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/invoices');
    invoices.value = res.data;
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
  }
};

const viewInvoice = (id) => {
  // เราจะสร้างหน้านี้ในขั้นตอนต่อไป
  // แต่ตอนนี้ยังไม่มี เราจะเปิดในแท็บใหม่
  const routeData = router.resolve({ name: 'invoice-detail', params: { id } });
  window.open(routeData.href, '_blank');
};

const deleteInvoice = async (id) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบิล #${id}?\nการกระทำนี้จะคืนสต็อกสินค้ากลับเข้าระบบ`)) {
        try {
            await axios.delete(`http://localhost:3001/api/invoices/${id}`);
            alert('ลบบิลสำเร็จ');
            fetchInvoices(); // โหลดรายการใหม่
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    }
};

onMounted(fetchInvoices);
</script>

<style scoped>
.page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.list-container { background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h2 { color: #00695c; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
th { background-color: #009688; color: white; }
.btn-view { background-color: #0288d1; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
.btn-view:hover { background-color: #0277bd; }
.btn-delete { background-color: #f44336;
  color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-left: 0.5rem; }
</style>
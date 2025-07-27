<template>
  <main>
    <h1>แดชบอร์ด</h1>
    
    <div class="stats-container">
      <div class="card stat-card">
        <h4>ยอดขายวันนี้</h4>
        <p>{{ stats.sales_today?.toFixed(2) || '0.00' }} บาท</p>
      </div>
      <div class="card stat-card">
        <h4>ยอดขายทั้งหมด</h4>
        <p>{{ stats.total_sales?.toFixed(2) || '0.00' }} บาท</p>
      </div>
      <div class="card stat-card">
        <h4>จำนวนบิลทั้งหมด</h4>
        <p>{{ stats.total_invoices || 0 }}</p>
      </div>
      <div class="card stat-card">
        <h4>จำนวนลูกค้า</h4>
        <p>{{ stats.total_customers || 0 }}</p>
      </div>
    </div>

   <div class="card stat-card">
            <h4>กำไรขั้นต้นวันนี้</h4>
            <p>{{ grossProfitToday.toFixed(2) }} บาท</p>
   </div>

    <div class="main-container">
      <div class="card chart-container">
        <h3>ยอดขาย 7 วันล่าสุด</h3>
        <Bar v-if="salesChartData.labels.length" :data="salesChartData" :options="chartOptions" />
        <p v-else>ไม่มีข้อมูลยอดขายในช่วง 7 วันที่ผ่านมา</p>
      </div>
      <div class="card list-container">
        <h3>สินค้าขายดี 5 อันดับแรก</h3>
        <ul v-if="topProducts.length">
          <li v-for="(product, index) in topProducts" :key="index">
            <span>{{ product.name }}</span>
            <span>ขายแล้ว {{ product.total_sold }} ชิ้น</span>
          </li>
        </ul>
        <p v-else>ยังไม่มีข้อมูลสินค้าขายดี</p>
      </div>
    </div>

    <div class="card list-container">
            <h3>สินค้าที่ต้องสั่งเพิ่ม (น้อยกว่า 2 ชิ้น)</h3>
            <ul v-if="lowStockProducts.length">
              <li v-for="product in lowStockProducts" :key="product.id">
                <span>{{ product.name }}</span>
                <span style="color: #f44336; font-weight: bold;">เหลือ {{ product.quantity_on_hand }} ชิ้น</span>
              </li>
            </ul>
            <p v-else>ไม่มีสินค้าใกล้หมด</p>
     </div>

  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const stats = ref({});
const salesData = ref([]);
const topProducts = ref([]);
const grossProfitToday = ref(0);
const lowStockProducts = ref([]);

const salesChartData = computed(() => {
  if (!salesData.value) return { labels: [], datasets: [] };
  return {
    labels: salesData.value.map(d => new Date(d.sale_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'ยอดขาย (บาท)',
        backgroundColor: '#009688',
        data: salesData.value.map(d => parseFloat(d.daily_sales))
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

onMounted(async () => {
  try {
    // 👇 เพิ่มการเรียก API ใหม่เข้าไปใน Promise.all
    const [statsRes, salesRes, topProductsRes, grossProfitRes, lowStockRes] = await Promise.all([
      axios.get('http://localhost:3001/api/dashboard/stats'),
      axios.get('http://localhost:3001/api/dashboard/sales-over-time'),
      axios.get('http://localhost:3001/api/dashboard/top-products'),
      axios.get('http://localhost:3001/api/dashboard/gross-profit-today'), // 👈 เรียก API ใหม่
      axios.get('http://localhost:3001/api/dashboard/low-stock-products')  // 👈 เรียก API ใหม่
    ]);
    stats.value = statsRes.data;
    salesData.value = salesRes.data;
    topProducts.value = topProductsRes.data;
    grossProfitToday.value = grossProfitRes.data.gross_profit_today; // 👈 กำหนดค่า
    lowStockProducts.value = lowStockRes.data;                         // 👈 กำหนดค่า
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
});
</script>

<style scoped>
h1 { color: var(--primary-darker); }

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 2rem 0;
}
.stat-card {
  flex: 1 1 200px;
}
.stat-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1rem;
}
.stat-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-darker);
}

.main-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
.chart-container {
  height: 400px;
}
.list-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.list-container li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}
.list-container li:last-child {
  border-bottom: none;
}
.list-container li span:last-child {
  font-weight: bold;
  color: var(--primary-color);
}
</style>
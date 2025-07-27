<template>
  <h1>รายงาน</h1>

  <div class="card report-controls">
    <div class="form-group">
      <label>เลือกประเภทรายงาน:</label>
      <select v-model="selectedReport" @change="reportData = null" class="form-control">
        <option value="sales">รายงานยอดขาย</option>
        <option value="profit-loss">รายงานกำไร-ขาดทุน</option>
        <option value="income-statement">รายงานสรุปรายรับ-รายจ่าย</option>
        <option value="inventory">รายงานสรุปสต็อกสินค้า</option>
      </select>
    </div>
    <div class="form-group" v-if="selectedReport !== 'inventory'">
      <label>ตั้งแต่วันที่:</label>
      <input type="date" v-model="startDate" class="form-control">
    </div>
    <div class="form-group" v-if="selectedReport !== 'inventory'">
      <label>ถึงวันที่:</label>
      <input type="date" v-model="endDate" class="form-control">
    </div>
    <button @click="generateReport" class="btn btn-primary">สร้างรายงาน</button>
  </div>

  <div class="card report-display" v-if="reportData">

    <div v-if="selectedReport === 'sales'">
      <h3>รายงานยอดขาย ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})</h3>
      <div class="sales-summary">
        <div>ยอดขายรวมสุทธิ: <strong>{{ totalSaleAmount.toFixed(2) }}</strong> บาท</div>
        <div>กำไรขั้นต้นรวม: <strong>{{ totalGrossProfit.toFixed(2) }}</strong> บาท</div>
        <div>จำนวนบิลทั้งหมด: <strong>{{ reportData.length }}</strong> ใบ</div>
        <div>ยอดขายเฉลี่ยต่อบิล: <strong>{{ averageSalePerInvoice.toFixed(2) }}</strong> บาท</div>
      </div>
      <div class="table-responsive">
        <table class="app-table">
          <thead>
            <tr>
              <th>เลขที่บิล</th><th>วันที่/เวลา</th><th>ลูกค้า</th><th>ยอดสุทธิ</th><th>กำไรขั้นต้น</th><th>กำไร (%)</th><th>พนักงานขาย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in reportData" :key="sale.id">
              <td>#{{ sale.id }}</td>
              <td>{{ new Date(sale.invoice_date).toLocaleString('th-TH') }}</td>
              <td>{{ sale.first_name ? `${sale.first_name} ${sale.last_name}` : 'ลูกค้าทั่วไป' }}</td>
              <td>{{ parseFloat(sale.total_amount).toFixed(2) }}</td>
              <td>{{ parseFloat(sale.gross_profit).toFixed(2) }}</td>
              <td>{{ parseFloat(sale.gross_profit_percentage || 0).toFixed(2) }}%</td>
              <td>{{ sale.user_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedReport === 'profit-loss'">
      <h3>สรุปผลประกอบการ ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})</h3>
      <div class="summary-grid" v-if="reportData">
        <span class="grid-header">รายการ</span><span class="grid-header amount-header">จำนวนเงิน (บาท)</span>
        <span>(+) รายรับรวมจากการขาย</span><strong>{{ reportData.totalRevenue?.toFixed(2) }}</strong>
        <span>(-) ต้นทุนสินค้าที่ขายไป (COGS)</span><strong>- {{ reportData.totalCogs?.toFixed(2) }}</strong>
        <span class="gross-profit">(=) กำไรขั้นต้น</span><strong class="gross-profit">{{ reportData.grossProfit?.toFixed(2) }}</strong>
        <span>(-) รายจ่ายในการดำเนินงาน</span><strong>- {{ reportData.totalExpenses?.toFixed(2) }}</strong>
        <span class="net-profit">(=) กำไรสุทธิ</span><strong class="net-profit">{{ reportData.netProfit?.toFixed(2) }}</strong>
      </div>
    </div>

    <div v-if="selectedReport === 'income-statement'">
      <h3>รายงานสรุปรายรับ-รายจ่าย ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})</h3>
      <div class="income-expense-grid">
        <div class="table-container">
          <h4>รายรับ</h4>
          <table class="app-table">
            <thead><tr><th>วันที่</th><th>รายการ</th><th class="amount-col">จำนวนเงิน</th></tr></thead>
            <tbody>
              <tr v-for="item in reportData.income_items" :key="`in-${item.id}`">
                <td>{{ formatDate(item.date) }}</td><td>{{ item.description }}</td><td class="amount-col">{{ parseFloat(item.amount).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-container">
          <h4>รายจ่าย</h4>
          <table class="app-table">
            <thead><tr><th>วันที่</th><th>รายการ</th><th class="amount-col">จำนวนเงิน</th></tr></thead>
            <tbody>
              <tr v-for="item in reportData.expense_items" :key="`ex-${item.id}`">
                <td>{{ formatDate(item.date) }}</td><td>{{ item.category }}: {{ item.description }}</td><td class="amount-col">{{ parseFloat(item.amount).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="reportData.summary" class="sales-summary" style="margin-top: 2rem;">
        <div>รายรับรวม: <strong>{{ reportData.summary.totalIncome?.toFixed(2) }}</strong> บาท</div>
        <div>รายจ่ายรวม: <strong>{{ reportData.summary.totalExpense?.toFixed(2) }}</strong> บาท</div>
        <div :class="reportData.summary.netResult >= 0 ? 'net-profit-style' : 'net-loss'">
          คงเหลือสุทธิ: <strong>{{ reportData.summary.netResult?.toFixed(2) }}</strong> บาท
        </div>
      </div>
    </div>

    <div v-if="selectedReport === 'inventory'">
        <h3>รายงานสรุปสต็อกสินค้า (ณ ปัจจุบัน)</h3>
        <div class="sales-summary">
            <div>มูลค่าสต็อกทั้งหมด (ทุน): <strong>{{ totalInventoryValue.toFixed(2) }}</strong> บาท</div>
        </div>
        <div class="table-responsive">
            <table class="app-table">
                <thead><tr><th>ID</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>คงคลัง</th><th>ราคาทุน</th><th>มูลค่า (ทุน)</th></tr></thead>
                <tbody>
                    <tr v-for="item in reportData" :key="item.id">
                        <td>{{ item.id }}</td><td>{{ item.name }}</td><td>{{ item.category }}</td><td>{{ item.quantity_on_hand }} {{ item.unit_name }}</td><td>{{ parseFloat(item.cost_price).toFixed(2) }}</td><td>{{ parseFloat(item.inventory_value).toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/api';

const selectedReport = ref('sales');
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const reportData = ref(null);

// --- Computed Properties ---
const totalSaleAmount = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value) || selectedReport.value !== 'sales') return 0;
  return reportData.value.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
});
const averageSalePerInvoice = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value) || reportData.value.length === 0 || selectedReport.value !== 'sales') return 0;
  return totalSaleAmount.value / reportData.value.length;
});
const totalGrossProfit = computed(() => {
    if (!reportData.value || !Array.isArray(reportData.value) || selectedReport.value !== 'sales') return 0;
    return reportData.value.reduce((sum, sale) => sum + parseFloat(sale.gross_profit || 0), 0);
});
const totalInventoryValue = computed(() => {
    if (!reportData.value || !Array.isArray(reportData.value) || selectedReport.value !== 'inventory') return 0;
    return reportData.value.reduce((sum, item) => sum + parseFloat(item.inventory_value), 0);
});

// --- Methods ---
const generateReport = async () => {
  reportData.value = null;
  const params = { startDate: startDate.value, endDate: endDate.value };
  try {
    const response = await api.get(`/api/reports/${selectedReport.value}`, { params });
    reportData.value = response.data;
  } catch (error) { console.error(`Failed to fetch ${selectedReport.value} report:`, error); alert('ไม่สามารถดึงข้อมูลรายงานได้'); }
};
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};
</script>

<style scoped>
.report-controls { display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap; }
.table-responsive { overflow-x: auto; margin-top: 1.5rem; }
.sales-summary { display: flex; flex-wrap: wrap; gap: 2rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px; margin: 1.5rem 0; font-size: 1.1rem; }
.sales-summary strong { color: var(--primary-darker); }
.summary-grid { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem 1rem; max-width: 600px; margin-top: 1.5rem; font-size: 1.1rem; }
.summary-grid span { padding: 0.5rem; border-bottom: 1px solid #eee; }
.summary-grid strong { text-align: right; padding: 0.5rem; border-bottom: 1px solid #eee; }
.grid-header { font-weight: bold; background-color: #f8f9fa; }
.amount-header { text-align: right; }
.summary-grid .gross-profit, .summary-grid .net-profit { font-weight: bold; }
.summary-grid .net-profit { font-size: 1.3rem; color: var(--primary-darker); border-top: 2px solid var(--primary-color); }
.income-expense-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem; }
.table-container h4 { color: var(--primary-darker); }
.amount-col { text-align: right; font-weight: bold; }
.net-profit-style, .net-loss { font-weight: bold; }
.net-profit-style strong { color: var(--primary-darker) !important; }
.net-loss { color: #f44336; }
.net-loss strong { color: #f44336 !important; }
</style>
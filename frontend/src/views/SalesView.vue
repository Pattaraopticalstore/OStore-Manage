<template>
  <main class="page-container">
    <div class="sales-grid">
      <div class="invoice-panel">
        <h2>ตะกร้าสินค้า</h2>

        <div class="form-group">
          <label>ลูกค้า: {{ selectedCustomerName || 'ยังไม่ได้เลือก' }}</label>
          <input v-model="customerSearch" placeholder="ค้นหาจาก รหัส, ชื่อ, หรือเบอร์โทร..." class="search-input"/>
          <ul v-if="customerSearch && filteredCustomers.length" class="search-results">
            <li v-for="c in filteredCustomers" :key="c.id" @click="selectCustomer(c)">
              #{{ c.id }} - {{ c.first_name }} {{ c.last_name }} ({{ c.phone }})
            </li>
          </ul>
        </div>

        <table class="invoice-items-table">
            <thead>
                <tr><th>สินค้า</th><th>จำนวน</th><th>ราคาต่อหน่วย</th><th>ราคารวม</th><th></th></tr>
            </thead>
            <tbody>
                <tr v-if="invoiceItems.length === 0"><td colspan="5" style="text-align: center;">-- ยังไม่มีสินค้าในตะกร้า --</td></tr>
                <tr v-for="item in invoiceItems" :key="item.product_id">
                <td>{{ item.name }}</td><td>{{ item.quantity }}</td><td>{{ item.selling_price }}</td><td>{{ (item.quantity * item.selling_price).toFixed(2) }}</td>
                <td><button @click="removeFromInvoice(item.product_id)" class="btn-remove">x</button></td>
                </tr>
            </tbody>
        </table>

        <div class="summary">
          <h4>ยอดรวม: {{ subTotal.toFixed(2) }} บาท</h4>
          
          <div class="form-group">
            <label>ส่วนลด (บาท)</label>
            <input type="number" v-model.number="discountAmount" placeholder="0.00" />
          </div>

          <hr class="summary-divider" />

          <h3>ยอดสุทธิ: <span>{{ finalTotal.toFixed(2) }} บาท</span></h3>

          <div class="form-group">
            <label>โปรโมชั่นที่ใช้:</label>
            <input type="text" v-model="promotionUsed" placeholder="เช่น โปรฯ เดือนเกิด" />
          </div>

          <div class="form-group">
             <label>วิธีการชำระเงิน:</label>
             <select v-model="paymentMethod" class="form-control">
                <option>เงินสด</option><option>โอนเงิน</option><option>บัตรเครดิต</option><option>QR Code</option>
             </select>
          </div>
          <button @click="completeSale" :disabled="invoiceItems.length === 0" class="btn btn-checkout">
            ยืนยันการขาย
          </button>
        </div>
      </div>

      <div class="product-selection-panel">
          <h2>เลือกสินค้า</h2>
          <input v-model="productSearchTerm" placeholder="ค้นหาสินค้า..." class="search-input form-control"/>
          <ul class="product-list">
            <li v-for="p in filteredProducts" :key="p.id" @click="addToInvoice(p)">
                <div class="product-info"><strong>{{ p.name }}</strong> ({{ p.brand }})</div>
                <div class="product-price"><span>ราคา: {{ p.selling_price }} บ.</span><span>คงคลัง: {{ p.quantity_on_hand }}</span></div>
            </li>
          </ul>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api'; // 👈 แก้ไข import จาก axios เป็น api

const allCustomers = ref([]);
const allProducts = ref([]);
const invoiceItems = ref([]);
const paymentMethod = ref('เงินสด');
const productSearchTerm = ref('');
const customerSearch = ref('');
const selectedCustomerId = ref(null);
const selectedCustomerName = ref('');
const discountAmount = ref(0);
const promotionUsed = ref('');

const subTotal = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0);
});

const finalTotal = computed(() => {
    const total = subTotal.value - (discountAmount.value || 0);
    return total < 0 ? 0 : total;
});

const filteredCustomers = computed(() => {
    if (!customerSearch.value || customerSearch.value.length < 1) return [];
    const search = customerSearch.value.toLowerCase();
    return allCustomers.value.filter(c =>
        String(c.id).includes(search) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search) ||
        (c.phone && c.phone.includes(search))
    );
});

const filteredProducts = computed(() => {
    if (!productSearchTerm.value) return allProducts.value;
    return allProducts.value.filter(p => 
        p.name.toLowerCase().includes(productSearchTerm.value.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(productSearchTerm.value.toLowerCase()))
    );
});

const selectCustomer = (customer) => {
    selectedCustomerId.value = customer.id;
    selectedCustomerName.value = `${customer.first_name} ${customer.last_name}`;
    customerSearch.value = '';
};

const addToInvoice = (product) => {
  if (product.quantity_on_hand <= 0) { alert('สินค้าหมดสต็อก!'); return; }
  const existingItem = invoiceItems.value.find(item => item.product_id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    invoiceItems.value.push({ product_id: product.id, name: product.name, quantity: 1, selling_price: parseFloat(product.selling_price) });
  }
};

const removeFromInvoice = (productId) => {
  invoiceItems.value = invoiceItems.value.filter(item => item.product_id !== productId);
};

const completeSale = async () => {
  if (invoiceItems.value.length === 0) { alert('กรุณาเพิ่มสินค้าก่อนทำการขาย'); return; }
  const saleData = {
    customer_id: selectedCustomerId.value,
    total_amount: finalTotal.value,
    payment_method: paymentMethod.value,
    items: invoiceItems.value.map(item => ({ product_id: item.product_id, quantity: item.quantity, selling_price: item.selling_price })),
    discount_amount: discountAmount.value || 0,
    promotion_used: promotionUsed.value
  };
  try {
    await api.post('/api/invoices', saleData); // 👈 แก้ไข axios เป็น api
    alert('บันทึกการขายสำเร็จ!');
    selectedCustomerId.value = null;
    selectedCustomerName.value = '';
    invoiceItems.value = [];
    paymentMethod.value = 'เงินสด';
    discountAmount.value = 0;
    promotionUsed.value = '';
    fetchProducts();
  } catch (error) {
    console.error('Sale failed:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกการขาย');
  }
};

const fetchCustomers = async () => { try { const res = await api.get('/api/customers'); allCustomers.value = res.data; } catch (e) { console.error(e); } }; // 👈 แก้ไข axios เป็น api
const fetchProducts = async () => { try { const res = await api.get('/api/products'); allProducts.value = res.data; } catch (e) { console.error(e); } }; // 👈 แก้ไข axios เป็น api
onMounted(() => { fetchCustomers(); fetchProducts(); });
</script>

<style scoped>
.page-container { padding: 2rem; }
.sales-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.invoice-panel, .product-selection-panel { background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h2 { color: #00695c; border-bottom: 2px solid #e0f2f1; padding-bottom: 0.5rem; margin-top: 0; }
.form-group { margin-bottom: 1rem; position: relative; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.form-group select, .form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.invoice-items-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.invoice-items-table th, .invoice-items-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
.invoice-items-table th { background-color: #f2f2f2; }
.btn-remove { background-color: #f44336; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; }
.summary { margin-top: 1.5rem; border-top: 2px solid #e0f2f1; padding-top: 1rem; }
.summary h3, .summary h4 { display: flex; justify-content: space-between; color: #00695c; margin: 0.5rem 0; }
.summary h4 { color: #333; font-size: 1.1rem; }
.summary h3 span, .summary h4 span { font-weight: bold; }
.summary-divider { border: none; border-top: 1px dashed #ccc; margin: 1rem 0; }
.btn-checkout { width: 100%; padding: 1rem; font-size: 1.2rem; background-color: #009688; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
.btn-checkout:disabled { background-color: #ccc; }
.search-input { width: 100%; box-sizing: border-box; }
.product-list { list-style: none; padding: 0; margin: 0; max-height: 70vh; overflow-y: auto; }
.product-list li { padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background-color 0.2s; }
.product-list li:hover { background-color: #e0f2f1; }
.product-info { font-size: 1rem; }
.product-price { display: flex; justify-content: space-between; color: #555; font-size: 0.9rem; margin-top: 0.5rem; }
.search-results { list-style: none; padding: 0; margin: 0; border: 1px solid #ccc; border-radius: 4px; position: absolute; background-color: white; width: 100%; z-index: 10; max-height: 200px; overflow-y: auto; }
.search-results li { padding: 0.75rem; cursor: pointer; }
.search-results li:hover { background-color: #e0f2f1; }
</style>
<template>
  <div class="receipt-container">
    <div v-if="invoice" class="receipt-box">
      <div class="receipt-header">
        <img v-if="shopInfo.logo_path" :src="`http://localhost:3001${shopInfo.logo_path}`" alt="Logo" class="receipt-logo"/>
        <h2>ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</h2>
        <h3>{{ shopInfo.shop_name || 'OStore Manage' }}</h3>
        <p v-html="shopInfo.address ? shopInfo.address.replace(/\n/g, '<br>') : ''"></p>
        <p>โทร: {{ shopInfo.phone || '' }} | เลขประจำตัวผู้เสียภาษี: {{ shopInfo.tax_id || '' }}</p>
      </div>

      <div class="receipt-info">
        <div><strong>เลขที่บิล:</strong> #{{ invoice.id }}</div>
        <div><strong>วันที่:</strong> {{ new Date(invoice.invoice_date).toLocaleString('th-TH') }}</div>
      </div>
      <div class="customer-info">
        <strong>ลูกค้า:</strong> {{ invoice.first_name ? `${invoice.first_name} ${invoice.last_name}` : 'ลูกค้าทั่วไป' }} <br>
        <strong>โทร:</strong> {{ invoice.phone || '-' }} <br>
        <strong>ที่อยู่:</strong> {{ formatAddress(invoice.address) }} </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th>จำนวน</th>
            <th>ราคา/หน่วย</th>
            <th>รวม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoice.items" :key="index">
            <td>{{ item.name }} ({{ item.brand }})</td>
            <td>{{ item.quantity }} {{ item.unit_name }}</td>
            <td>{{ parseFloat(item.price_per_unit).toFixed(2) }}</td>
            <td>{{ (item.quantity * item.price_per_unit).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="receipt-summary">
        <div><span>ยอดรวม</span><span>{{ subTotal.toFixed(2) }}</span></div>
        <div><span>ส่วนลด</span><span>{{ parseFloat(invoice.discount_amount).toFixed(2) }}</span></div>
        <div class="total">
            <span>ยอดสุทธิ</span><span>{{ parseFloat(invoice.total_amount).toFixed(2) }}</span>
        </div>
        <div class="total-words">
            <span>({{ totalInThaiWords }})</span>
        </div>
        <hr class="summary-divider">
        <div><span>ชำระโดย</span><span>{{ invoice.payment_method }}</span></div>
        <div v-if="invoice.promotion_used"><span>โปรโมชั่น</span><span>{{ invoice.promotion_used }}</span></div>
      </div>

      <div class="signature-section">
          <p>.................................................</p>
          <p>(ผู้รับเงิน)</p>
      </div>

      <div class="receipt-footer">
        <p>ขอบคุณที่ใช้บริการ</p>
      </div>
    </div>
    <div v-else>
      <p>กำลังโหลดข้อมูลใบเสร็จ...</p>
    </div>

    <div class="actions no-print">
      <button @click="printReceipt">พิมพ์ใบเสร็จ</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const invoice = ref(null);
const shopInfo = ref({});

const subTotal = computed(() => {
  if (!invoice.value || !invoice.value.items) return 0;
  return invoice.value.items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
});

function numberToThaiWords(number) {
    const numbers = "ศูนย์,หนึ่ง,สอง,สาม,สี่,ห้า,หก,เจ็ด,แปด,เก้า".split(",");
    const units = "สิบ,ร้อย,พัน,หมื่น,แสน,ล้าน".split(",");
    let [integer, fraction] = String(Number(number).toFixed(2)).split(".");
    integer = integer.replace(/^0+/, '');
    if (integer === '') return 'ศูนย์บาทถ้วน';
    let result = "";
    const len = integer.length;
    for (let i = 0; i < len; i++) {
        const digit = parseInt(integer[i]);
        const pos = len - 1 - i;
        if (digit > 0) {
            let unit = pos > 0 ? units[ (pos-1) % 6 ] : "";
            if (pos % 6 === 0 && pos > 0) unit = units[5];
            let numStr = numbers[digit];
            if (len > 1 && pos === 1 && digit === 2) numStr = "ยี่";
            else if (pos === 1 && digit === 1) numStr = "";
            else if (pos > 0 && digit === 1 && integer[i-1] !== '0') numStr = "หนึ่ง";
            result += numStr + unit;
        }
    }
    result += "บาท";
    if (fraction === "00") {
        result += "ถ้วน";
    } else {
        const fracLen = fraction.length;
        let fracResult = "";
        for (let i = 0; i < fracLen; i++) {
            const digit = parseInt(fraction[i]);
            if (digit > 0) {
                let unit = fracLen - 1 - i > 0 ? units[0] : "";
                let numStr = numbers[digit];
                 if (fracLen > 1 && i === 0 && digit === 2) numStr = "ยี่";
                 else if (i === 0 && digit === 1) numStr = "";
                 else if (i > 0 && digit === 1) numStr = "เอ็ด";
                fracResult += fracResult + numStr;
            }
        }
        result += fracResult + "สตางค์";
    }
    return result;
}

const totalInThaiWords = computed(() => {
    if (!invoice.value || !invoice.value.total_amount) return '';
    return numberToThaiWords(invoice.value.total_amount);
});


const fetchInvoiceDetail = async () => {
  const invoiceId = route.params.id;
  try {
    const res = await axios.get(`http://localhost:3001/api/invoices/${invoiceId}`);
    invoice.value = res.data;
  } catch (error) {
    console.error("Failed to fetch invoice detail:", error);
    invoice.value = { id: 'Error' };
  }
};

const fetchShopInfo = async () => {
    try {
        const res = await axios.get('http://localhost:3001/api/shop-info');
        shopInfo.value = res.data;
    } catch (error) { console.error(error); }
};

const printReceipt = () => {
  window.print();
};

const formatAddress = (address) => {
  if (!address || !address.province) return '-';
  const parts = [
    address.houseNumber,
    address.moo ? `หมู่ ${address.moo}` : '',
    address.soi ? `ซอย ${address.soi}` : '',
    address.road ? `ถ. ${address.road}` : '',
    address.subdistrict,
    address.district,
    address.province,
    address.postalCode
  ];
  // กรองส่วนที่ว่างเปล่าออกแล้วเชื่อมด้วยช่องว่าง
  return parts.filter(part => part).join(' ');
};

// 2. onMounted ที่ถูกต้อง จะต้องมีแค่อันเดียวและเรียกทุกฟังก์ชัน
onMounted(async () => {
  await fetchInvoiceDetail();
  await fetchShopInfo();
});
</script>

<style>
/* Global style for printing */
@media print {
  body * {
    visibility: hidden;
  }
  .receipt-container, .receipt-container * {
    visibility: visible;
  }
  .receipt-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .no-print {
    display: none !important;
  }
}

.receipt-container { max-width: 800px; margin: 2rem auto; font-family: 'Sarabun', 'Noto Sans Thai', sans-serif; }
.receipt-box { background: #fff; border: 1px solid #ccc; padding: 2rem; }
.receipt-header, .receipt-footer { text-align: center; }
.receipt-header h2 { margin-top: 0; }
.receipt-info { display: flex; justify-content: space-between; margin: 2rem 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 1rem 0; }
.items-table { width: 100%; border-collapse: collapse; }
.items-table th, .items-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
.items-table th { border-bottom: 2px solid #ccc; }
.actions { text-align: center; margin-top: 2rem; }
.actions button { padding: 1rem 2rem; font-size: 1rem; background: #00695c; color: white; border: none; cursor: pointer; }
.receipt-summary { margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #ccc; }
.receipt-summary div { display: flex; justify-content: space-between; margin-bottom: 0.5rem; line-height: 1.6; }
.receipt-summary .total { font-weight: bold; font-size: 1.2rem; }
.total-words { justify-content: flex-end !important; font-weight: bold; font-size: 1.1rem; color: #333; margin-top: -0.5rem; }
.summary-divider { border: none; border-top: 1px dashed #ccc; margin: 1rem 0; }
.signature-section { text-align: right; margin-top: 4rem; padding-right: 2rem; }
.signature-section p { margin: 0; line-height: 1.5; }
.receipt-logo { max-width: 120px; max-height: 120px; margin-bottom: 1rem; }
.customer-info { margin: 1rem 0; padding: 1rem 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; line-height: 1.8; }
</style>
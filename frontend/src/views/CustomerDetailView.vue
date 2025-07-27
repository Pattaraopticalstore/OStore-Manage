<template>
  <div v-if="customer">
    <div class="card">
      <h2>#{{ customer.id }} - {{ customer.first_name }} {{ customer.last_name }}</h2>
      <p><strong>เบอร์โทร:</strong> {{ customer.phone }}</p>
      <p><strong>วันเกิด:</strong> {{ customer.birth_date }}</p>
    </div>
    <div class="card">
        <h3>ข้อมูลสุขภาพและไลฟ์สไตล์</h3>
        <div class="form-group">
            <label>โรคประจำตัว / ปัญหาสุขภาพตา</label>
            <textarea v-model="customer.health_conditions" class="form-control" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>พฤติกรรมการใช้สายตา (อาชีพ / กิจกรรม)</label>
            <textarea v-model="customer.lifestyle_notes" class="form-control" rows="3"></textarea>
        </div>
        <button @click="saveHealthInfo" class="btn btn-primary">บันทึกข้อมูลสุขภาพ</button>
    </div>


    <div class="card">
      <h3>ประวัติค่าสายตา</h3>
      
      <h4>เพิ่มค่าสายตาใหม่</h4>
      <div class="prescription-form-grid">
        <div class="form-group">
            <label>วันที่ตรวจ</label>
            <input v-model="newPrescription.exam_date" type="date" class="form-control">
        </div>
        <div class="form-group">
            <label>ผู้ตรวจ</label>
            <input v-model="newPrescription.examiner_name" placeholder="ชื่อผู้ตรวจ" class="form-control">
        </div>
        <div class="form-group">
            <label>PD (ระยะห่างตาดำ)</label>
            <input v-model="newPrescription.pd" placeholder="เช่น 64" class="form-control">
        </div>

        <fieldset class="eye-fieldset">
            <legend>ตาขวา (OD)</legend>
            <div class="form-group"><label>SPH (สั้น/ยาว)</label><input v-model="newPrescription.od_sph" placeholder="-1.00" class="form-control"></div>
            <div class="form-group"><label>CYL (เอียง)</label><input v-model="newPrescription.od_cyl" placeholder="-0.50" class="form-control"></div>
            <div class="form-group"><label>AXIS (องศา)</label><input v-model="newPrescription.od_axis" placeholder="180" class="form-control"></div>
            <div class="form-group"><label>ADD (อ่านหนังสือ)</label><input v-model="newPrescription.od_add" placeholder="+2.00" class="form-control"></div>
        </fieldset>

        <fieldset class="eye-fieldset">
            <legend>ตาซ้าย (OS)</legend>
            <div class="form-group"><label>SPH (สั้น/ยาว)</label><input v-model="newPrescription.os_sph" placeholder="-1.25" class="form-control"></div>
            <div class="form-group"><label>CYL (เอียง)</label><input v-model="newPrescription.os_cyl" placeholder="-0.75" class="form-control"></div>
            <div class="form-group"><label>AXIS (องศา)</label><input v-model="newPrescription.os_axis" placeholder="175" class="form-control"></div>
            <div class="form-group"><label>ADD (อ่านหนังสือ)</label><input v-model="newPrescription.os_add" placeholder="+2.00" class="form-control"></div>
        </fieldset>
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button @click="saveNewPrescription" class="btn btn-primary">บันทึกค่าสายตา</button>
      </div>
      

      <h4 style="margin-top: 2rem;">ค่าสายตาเดิม</h4>
      <div class="table-responsive">
        <table class="app-table">
            <thead>
            <tr>
                <th>วันที่</th>
                <th>OD (SPH/CYL/AXIS/ADD)</th>
                <th>OS (SPH/CYL/AXIS/ADD)</th>
                <th>PD</th>
                <th>ผู้ตรวจ</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="rx in prescriptions" :key="rx.id">
                <td>{{ new Date(rx.exam_date).toLocaleDateString('th-TH') }}</td>
                <td>{{ [rx.od_sph, rx.od_cyl, rx.od_axis, rx.od_add].filter(Boolean).join('/') || '-' }}</td>
                <td>{{ [rx.os_sph, rx.os_cyl, rx.os_axis, rx.os_add].filter(Boolean).join('/') || '-' }}</td>
                <td>{{ rx.pd }}</td>
                <td>{{ rx.examiner_name }}</td>
            </tr>
            </tbody>
        </table>
      </div>
    </div>

    <div class="card">
    <h3>ประวัติการซื้อ</h3>
    <div class="table-responsive">
        <table class="app-table">
            <thead>
                <tr>
                    <th>เลขที่บิล</th>
                    <th>วันที่</th>
                    <th>ยอดสุทธิ (บาท)</th>
                    <th>วิธีการชำระเงิน</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="invoices.length === 0">
                    <td colspan="5" style="text-align: center;">ไม่มีประวัติการซื้อ</td>
                </tr>
                <tr v-for="invoice in invoices" :key="invoice.id">
                    <td>#{{ invoice.id }}</td>
                    <td>{{ new Date(invoice.invoice_date).toLocaleString('th-TH') }}</td>
                    <td>{{ parseFloat(invoice.total_amount).toFixed(2) }}</td>
                    <td>{{ invoice.payment_method }}</td>
                    <td>
                        <button @click="viewInvoice(invoice.id)" class="btn btn-primary" style="padding: 8px 12px;">ดูใบเสร็จ</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

  </div>
  <div v-else>
    <p>กำลังโหลดข้อมูลลูกค้า...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const customerId = route.params.id;

const customer = ref(null);
const prescriptions = ref([]);
const invoices = ref([]);

// 👇 โค้ดส่วนนี้ขาดหายไป
const newPrescription = ref({
  exam_date: new Date().toISOString().slice(0, 10),
  examiner_name: '',
  od_sph: '', od_cyl: '', od_axis: '', od_add: '', od_prism: '',
  os_sph: '', os_cyl: '', os_axis: '', os_add: '', os_prism: '',
  pd: '', sh: '', notes: ''
});

const resetPrescriptionForm = () => {
    newPrescription.value = {
        exam_date: new Date().toISOString().slice(0, 10),
        examiner_name: '',
        od_sph: '', od_cyl: '', od_axis: '', od_add: '', od_prism: '',
        os_sph: '', os_cyl: '', os_axis: '', os_add: '', os_prism: '',
        pd: '', sh: '', notes: ''
    };
};
// --- สิ้นสุดส่วนที่ขาดหายไป ---


const fetchCustomerData = async () => {
  try {
    const res = await api.get(`/api/customers/${customerId}`);
    customer.value = res.data;
  } catch (error) { 
    console.error("Failed to fetch customer", error); 
  }
};

const fetchPrescriptions = async () => {
  try {
    const res = await api.get(`/api/customers/${customerId}/prescriptions`);
    prescriptions.value = res.data;
  } catch (error) { 
    console.error("Failed to fetch prescriptions", error); 
  }
};

const fetchInvoices = async () => {
  try {
    const res = await api.get(`/api/customers/${customerId}/invoices`);
    invoices.value = res.data;
  } catch (error) { 
    console.error("Failed to fetch invoices", error); 
  }
};

const saveHealthInfo = async () => {
  try {
    await api.put(`/api/customers/${customerId}/health-info`, {
      health_conditions: customer.value.health_conditions,
      lifestyle_notes: customer.value.lifestyle_notes,
    });
    alert('บันทึกข้อมูลสุขภาพสำเร็จ!');
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการบันทึก');
    console.error(error);
  }
};

const saveNewPrescription = async () => {
  try {
    await api.post(`/api/customers/${customerId}/prescriptions`, newPrescription.value);
    alert('เพิ่มค่าสายตาสำเร็จ!');
    resetPrescriptionForm();
    fetchPrescriptions();
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการเพิ่มค่าสายตา');
    console.error(error);
  }
};

onMounted(() => {
  fetchCustomerData();
  fetchPrescriptions();
  fetchInvoices(); 
});

const viewInvoice = (id) => {
    const routeData = router.resolve({ name: 'invoice-detail', params: { id } });
    window.open(routeData.href, '_blank');
};
</script>

<style scoped>
/* ⭐️ เพิ่ม Style สำหรับฟอร์มใหม่ */
.prescription-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* แบ่งเป็น 3 คอลัมน์ */
  gap: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.eye-fieldset {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
}

.eye-fieldset legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.table-responsive {
    overflow-x: auto;
}
</style>
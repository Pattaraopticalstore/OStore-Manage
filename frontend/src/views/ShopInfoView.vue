<template>
  <main class="page-container">
    <div class="form-container">
      <h2>จัดการข้อมูลร้านค้า</h2>
      <form @submit.prevent="saveShopInfo">
        <div class="form-group">
            <label>โลโก้ร้านค้า</label>
            <div class="logo-preview">
                <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="Logo Preview" />
                <div v-else class="no-logo">ไม่มีโลโก้</div>
            </div>
            <div>
                <input 
                    type="file" 
                    @change="handleFileChange" 
                    accept="image/png, image/jpeg" 
                    id="logo-upload" 
                    class="file-input-hidden" 
                />
                <label for="logo-upload" class="btn btn-primary">เลือกไฟล์...</label>

                <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
            </div>
            <small>แนะนำขนาด 512x512 pixels, ไฟล์ .png หรือ .jpg</small>
        </div>
        <div class="form-group">
          <label for="shop_name">ชื่อร้าน</label>
          <input id="shop_name" v-model="shopInfo.shop_name" />
        </div>
        <div class="form-group">
          <label for="address">ที่อยู่</label>
          <textarea id="address" v-model="shopInfo.address" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์</label>
          <input id="phone" v-model="shopInfo.phone" />
        </div>
        <div class="form-group">
          <label for="tax_id">เลขประจำตัวผู้เสียภาษี</label>
          <input id="tax_id" v-model="shopInfo.tax_id" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">บันทึกข้อมูล</button>
        </div>
        <hr style="margin: 2rem 0;">
        <div class="backup-section">
          <h2>เครื่องมือผู้ดูแลระบบ</h2>
          <button type="button" @click="backupDatabase" class="btn btn-danger">สำรองข้อมูลฐานข้อมูลทั้งหมด</button>
          <p><small>การคลิกปุ่มนี้จะดาวน์โหลดไฟล์ .sql ซึ่งเป็นข้อมูลทั้งหมดของแอปพลิเคชัน</small></p>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api'; // 👈 แก้ไข import จาก axios เป็น api

const shopInfo = ref({});
const selectedFile = ref(null);
const logoPreviewUrl = ref('');

const fetchShopInfo = async () => {
  try {
    const res = await api.get('/api/shop-info'); // 👈 แก้ไข axios เป็น api
    if (res.data) {
      shopInfo.value = res.data;
      if (res.data.logo_path) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        logoPreviewUrl.value = `${apiUrl}${res.data.logo_path}`;
      }
    }
  } catch (error) { console.error('Failed to fetch shop info', error); }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    logoPreviewUrl.value = URL.createObjectURL(file);
  }
};

const saveShopInfo = async () => {
  const formData = new FormData();
  formData.append('shop_name', shopInfo.value.shop_name || '');
  formData.append('address', shopInfo.value.address || '');
  formData.append('phone', shopInfo.value.phone || '');
  formData.append('tax_id', shopInfo.value.tax_id || '');
  formData.append('existing_logo_path', shopInfo.value.logo_path || '');
  if (selectedFile.value) {
    formData.append('logo', selectedFile.value);
  }
  try {
    await api.put('/api/shop-info', formData, { // 👈 แก้ไข axios เป็น api
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('บันทึกข้อมูลร้านค้าสำเร็จ!');
    fetchShopInfo();
  } catch (error) {
    console.error('Failed to save shop info', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
};

const backupDatabase = async () => {
    if (confirm('คุณต้องการสำรองข้อมูลทั้งหมดหรือไม่?')) {
        try {
            const response = await api.get('/api/backup/database', { // 👈 แก้ไข axios เป็น api
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `backup-ostore-${new Date().toISOString().slice(0, 10)}.sql`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Backup failed:", error);
            alert("การสำรองข้อมูลล้มเหลว! (อาจต้องใช้สิทธิ์ Admin)");
        }
    }
};

onMounted(fetchShopInfo);
</script>

<style scoped>
.page-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
.form-container { background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
h2 { color: #00695c; margin-top: 0; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
}
.form-actions { text-align: right; margin-top: 1.5rem; }
.btn-save { background-color: #00695c; color: white; padding: 0.8rem 2rem; border: none; border-radius: 4px; cursor: pointer; }
.logo-preview {
    width: 150px;
    height: 150px;
    border: 2px dashed #ccc;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    overflow: hidden;
}
.logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.logo-preview .no-logo {
    color: #999;
}
input[type="file"] {
    border: none;
    padding: 0;
}
.file-input-hidden { display: none; }
.file-name { margin-left: 1rem; color: var(--text-color); font-style: italic; }
</style>
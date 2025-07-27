<template>
  <div>
    <div class="page-header">
      <h1>จัดการสินค้า</h1>
      <RouterLink to="/products/archived" class="btn btn-secondary">ดูสินค้าที่ซ่อนไว้</RouterLink>
    </div>

    <ProductForm :product-to-edit="productToEdit" @product-saved="handleProductSaved" />
    <ProductList :ref="productListRef" @edit-product="handleEditProduct" />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { ref } from 'vue';
import ProductForm from '../components/ProductForm.vue';
import ProductList from '../components/ProductList.vue';

// --- ส่วน script ของคุณถูกต้องดีแล้ว ไม่ต้องแก้ไข ---
const productListRef = ref(null);
const productToEdit = ref(null);

const handleEditProduct = (product) => {
  productToEdit.value = product;
  window.scrollTo(0, 0);
};

const handleProductSaved = () => {
  productToEdit.value = null;
  if (productListRef.value) {
    productListRef.value.fetchProducts();
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1 { 
  margin: 0;
  color: var(--primary-darker);
}

/* Style สำหรับปุ่มรอง (ใช้สีเทา) */
.btn-secondary {
    background-color: #6c757d;
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}
</style>
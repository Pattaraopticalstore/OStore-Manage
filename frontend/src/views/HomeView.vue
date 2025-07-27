<script setup>
import { ref } from 'vue';
import CustomerForm from '../components/CustomerForm.vue';
import CustomerList from '../components/CustomerList.vue';

const customerListRef = ref(null);
const customerToEdit = ref(null); 

const handleEditCustomer = (customer) => {
  customerToEdit.value = customer;
  window.scrollTo(0, 0); 
};

const handleCustomerSaved = () => {
  customerToEdit.value = null; // เคลียร์ฟอร์ม (ถ้าอยู่ในโหมดแก้ไข)
  if (customerListRef.value) {
    customerListRef.value.fetchCustomers(); // สั่งให้ List โหลดข้อมูลใหม่
  }
};
</script>

<template>
  <main>
    <div class="content-wrapper">
      <CustomerForm
        :customer-to-edit="customerToEdit"
        @customer-saved="handleCustomerSaved"
      />
      <CustomerList
        :ref="customerListRef"
        @edit-customer="handleEditCustomer"
      />
    </div>
  </main>
</template>

<style scoped>
  /* style ไม่มีการเปลี่ยนแปลง */
  main {
    display: flex;
    justify-content: center;
    padding: 2rem;
    background-color: #e0f2f1;
    min-height: 100vh;
  }
  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 800px;
  }
</style>
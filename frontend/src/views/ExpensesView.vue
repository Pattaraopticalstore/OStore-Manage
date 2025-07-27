<template>
  <h1>บันทึกรายจ่าย</h1>
  <ExpenseForm :expense-to-edit="expenseToEdit" @expense-saved="handleExpenseSaved" />
  <ExpenseList :ref="expenseListRef" @edit-expense="handleEditExpense" />
</template>

<script setup>
import { ref } from 'vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import ExpenseList from '../components/ExpenseList.vue';

const expenseListRef = ref(null);
const expenseToEdit = ref(null);

const handleEditExpense = (expense) => {
  expenseToEdit.value = expense;
  window.scrollTo(0, 0);
};

const handleExpenseSaved = () => {
  expenseToEdit.value = null;
  if (expenseListRef.value) {
    expenseListRef.value.fetchExpenses();
  }
};
</script>
<template>
  <div class="dashboard-page card">
    <h1>Dashboard Principal</h1>
    <p>Bienvenido a <strong>Contasoft ERP</strong>. Selecciona un módulo del menú superior.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCurrentUser } from '@/services/auth';

const user = ref({});
onMounted(() => {
  user.value = getCurrentUser();
});
</script>

<style scoped>
.card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

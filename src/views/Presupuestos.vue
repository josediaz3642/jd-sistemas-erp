<template>
  <div class="presupuestos-container">
    <header class="page-header">
      <div>
        <h2>Presupuestos</h2>
        <p class="subtitle">Gestión de cotizaciones y presupuestos a clientes.</p>
      </div>
      <button @click="router.push('/presupuestos/nuevo')" class="btn-nueva">
        <span>+</span> Nuevo Presupuesto
      </button>
    </header>

    <div class="table-container glass-card shadow-lg">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nro.</th>
            <th>Cliente</th>
            <th>Total</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in presupuestos" :key="p.id">
            <td>{{ new Date(p.fecha).toLocaleDateString() }}</td>
            <td class="font-mono">#{{ p.numero }}</td>
            <td class="font-bold">{{ p.cliente_nombre }}</td>
            <td class="text-blue-600 font-bold">${{ p.total.toLocaleString() }}</td>
            <td class="text-right actions-cell">
              <button class="btn-icon">👁️ Ver</button>
            </td>
          </tr>
          <tr v-if="presupuestos.length === 0">
            <td colspan="5" class="text-center p-4 text-gray-500">No hay presupuestos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asumiendo que guardamos los presupuestos en un storage local para esta demo,
// o podrías crear una tabla en supabase.
const router = useRouter();
const presupuestos = ref([]);

onMounted(() => {
  const saved = localStorage.getItem('contasoft_presupuestos');
  if (saved) {
    presupuestos.value = JSON.parse(saved);
  }
});
</script>

<style scoped>
.presupuestos-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.table-container { background: white; border-radius: 12px; overflow: hidden; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
.font-mono { font-family: monospace; }
.font-bold { font-weight: bold; }
.text-blue-600 { color: #2563eb; }
.text-center { text-align: center; }
.actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }
</style>

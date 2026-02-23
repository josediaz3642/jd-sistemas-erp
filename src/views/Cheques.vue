<template>
  <div class="cheques-container">
    <header class="page-header">
      <div>
        <h2>🎫 Cartera de Cheques</h2>
        <p>Administra los cheques de terceros recibidos y sus vencimientos.</p>
      </div>
      <div class="stats-cheques">
        <div class="stat-mini">
          <span>Total en Cartera</span>
          <strong>${{ totalEnCartera.toLocaleString() }}</strong>
        </div>
      </div>
    </header>

    <div class="table-container glass-card">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Vencimiento</th>
            <th>Banco</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in listaCheques" :key="c.id" :class="{ 'vencido': esVencido(c.fechaVencimiento) }">
            <td class="font-bold">{{ c.fechaVencimiento }}</td>
            <td>{{ c.banco }}</td>
            <td class="font-mono">{{ c.numero }}</td>
            <td>{{ getNombreCliente(c.clienteId) }}</td>
            <td class="font-bold">${{ c.monto.toLocaleString() }}</td>
            <td>
              <span :class="['badge-estado', c.estado.toLowerCase()]">
                {{ c.estado }}
              </span>
            </td>
            <td class="text-right">
              <button v-if="c.estado === 'EN_CARTERA'" @click="depositar(c.id)" class="btn-sm">Depositar</button>
            </td>
          </tr>
          <tr v-if="listaCheques.length === 0">
            <td colspan="7" class="text-center">No hay cheques en cartera.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
// CAMBIO: Importamos getCheques, getClientes y updateChequesList
import { getCheques, getClientes, updateChequesList } from '@/services/data'; 

const listaCheques = ref([]);
const clientes = ref([]);

onMounted(() => {
  listaCheques.value = getCheques() || [];
  clientes.value = getClientes() || [];
});

const totalEnCartera = computed(() => {
  return listaCheques.value
    .filter(c => c.estado === 'EN_CARTERA')
    .reduce((acc, c) => acc + c.monto, 0);
});

function getNombreCliente(id) {
  const cliente = clientes.value.find(cl => cl.id === id);
  return cliente ? cliente.nombre : 'S/D';
}

function esVencido(fecha) {
  return new Date(fecha) < new Date() && listaCheques.value.some(c => c.estado === 'EN_CARTERA');
}

function depositar(id) {
  const c = listaCheques.value.find(x => x.id === id);
  if (c) {
    c.estado = 'DEPOSITADO';
    // CAMBIO: Usamos la función específica
    updateChequesList(listaCheques.value);
    alert("Cheque marcado como depositado correctamente.");
  }
}
</script>
<style scoped>
.stats-cheques { background: #f8fafc; padding: 10px 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
.stat-mini span { display: block; font-size: 0.75rem; color: #64748b; }
.stat-mini strong { font-size: 1.2rem; color: #2563eb; }

.badge-estado { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; }
.badge-estado.en_cartera { background: #fef9c3; color: #854d0e; }
.badge-estado.depositado { background: #dcfce7; color: #166534; }

.vencido { background-color: #fff1f2; }
.btn-sm { padding: 5px 10px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-sm:hover { background: #f1f5f9; }
</style>
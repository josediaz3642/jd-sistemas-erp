<template>
  <div class="gastos-container">
    <header class="page-header">
      <h2>💸 Registro de Gastos y Compras</h2>
      <button @click="mostrarModal = true" class="btn-nuevo">+ Registrar Gasto</button>
    </header>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <span>Total Gastado (Mes)</span>
        <h3>${{ totalMes.toLocaleString() }}</h3>
      </div>
      <div class="stat-card glass-card">
        <span>Pendiente de Pago</span>
        <h3 class="text-red">${{ totalPendiente.toLocaleString() }}</h3>
      </div>
    </div>

    <div class="table-container glass-card">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Categoría/Proveedor</th>
            <th>Concepto</th>
            <th>Estado</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="gasto in listaGastos" :key="gasto.id">
            <td>{{ formatDate(gasto.fecha) }}</td>
            <td><strong>{{ gasto.proveedor }}</strong></td>
            <td>{{ gasto.concepto }}</td>
            <td>
              <span :class="'badge ' + gasto.estado.toLowerCase()">{{ gasto.estado }}</span>
            </td>
            <td class="text-right font-bold">${{ gasto.total.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Nuevo Registro</h3>
        <div class="form-grid">
          <div class="field">
            <label>Proveedor / Categoría</label>
            <input v-model="nuevoGasto.proveedor" placeholder="Ej: Edenor o Proveedor S.A.">
          </div>
          <div class="field">
            <label>Concepto</label>
            <input v-model="nuevoGasto.concepto" placeholder="Ej: Pago de luz">
          </div>
          <div class="field">
            <label>Monto Total</label>
            <input type="number" v-model="nuevoGasto.total">
          </div>
          <div class="field">
            <label>Estado</label>
            <select v-model="nuevoGasto.estado">
              <option value="PAGADO">PAGADO</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="mostrarModal = false" class="btn-cancelar">Cancelar</button>
          <button @click="guardarGasto" class="btn-guardar">Guardar Gasto</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { saveWithTenant, load } from '@/services/data'; // Usaremos estas funciones base

const listaGastos = ref([]);
const mostrarModal = ref(false);
const nuevoGasto = ref({
  proveedor: '',
  concepto: '',
  total: 0,
  estado: 'PAGADO',
  fecha: new Date().toISOString()
});

onMounted(() => {
  cargarGastos();
});

const cargarGastos = () => {
  // Cargamos desde una nueva key en LocalStorage
  listaGastos.value = JSON.parse(localStorage.getItem('contasoft_gastos') || '[]')
    .filter(g => g.empresaId === JSON.parse(localStorage.getItem('contasoft_user_session')).empresaId);
};

const totalMes = computed(() => {
  return listaGastos.value.reduce((acc, g) => acc + Number(g.total), 0);
});

const totalPendiente = computed(() => {
  return listaGastos.value.filter(g => g.estado === 'PENDIENTE')
    .reduce((acc, g) => acc + Number(g.total), 0);
});

const guardarGasto = () => {
  if (!nuevoGasto.value.proveedor || nuevoGasto.value.total <= 0) return;
  
  const user = JSON.parse(localStorage.getItem('contasoft_user_session'));
  const gastoAFuardar = { 
    ...nuevoGasto.value, 
    id: Date.now(), 
    empresaId: user.empresaId 
  };

  const todos = JSON.parse(localStorage.getItem('contasoft_gastos') || '[]');
  todos.push(gastoAFuardar);
  localStorage.setItem('contasoft_gastos', JSON.stringify(todos));

  mostrarModal.value = false;
  nuevoGasto.value = { proveedor: '', concepto: '', total: 0, estado: 'PAGADO', fecha: new Date().toISOString() };
  cargarGastos();
};

const formatDate = (d) => new Date(d).toLocaleDateString();
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
.stat-card { padding: 20px; text-align: center; }
.stat-card span { color: #64748b; font-size: 0.9rem; }
.stat-card h3 { font-size: 1.8rem; margin-top: 5px; }
.text-red { color: #ef4444; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 30px; width: 450px; border-radius: 15px; }
.form-grid { display: grid; gap: 15px; margin-top: 20px; }
.field label { display: block; font-size: 0.8rem; margin-bottom: 5px; color: #64748b; }
.field input, .field select { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }

.badge { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: bold; }
.badge.pagado { background: #dcfce7; color: #166534; }
.badge.pendiente { background: #fee2e2; color: #991b1b; }

.btn-nuevo { background: #1e293b; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; border: none; }
.btn-guardar { background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }
</style>
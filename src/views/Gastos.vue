<template>
  <div class="gastos-container">
    <header class="page-header">
      <div>
        <h2>💸 Gastos y Compras</h2>
        <p class="subtitle">Control de egresos y facturas de servicios.</p>
      </div>
      <button @click="abrirModal" class="btn-nuevo">+ Registrar Gasto</button>
    </header>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <span>Total Gastado (Mes)</span>
        <h3 v-if="!loading">${{ totalMes.toLocaleString() }}</h3>
        <small v-else>Calculando...</small>
      </div>
      <div class="stat-card glass-card">
        <span>Pendiente de Pago</span>
        <h3 v-if="!loading" class="text-red">${{ totalPendiente.toLocaleString() }}</h3>
        <small v-else>Calculando...</small>
      </div>
    </div>

    <div class="table-container glass-card">
      <div v-if="loading" class="loader">Sincronizando con la nube...</div>
      
      <table v-else class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Proveedor / Categoría</th>
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
              <span :class="['badge', gasto.estado.toLowerCase()]">{{ gasto.estado }}</span>
            </td>
            <td class="text-right font-bold">${{ Number(gasto.total).toLocaleString() }}</td>
          </tr>
          <tr v-if="listaGastos.length === 0">
            <td colspan="5" class="text-center py-10">No hay gastos registrados este mes.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Nuevo Registro de Egreso</h3>
        <div class="form-grid">
          <div class="field">
            <label>Proveedor / Categoría</label>
            <input v-model="nuevoGasto.proveedor" placeholder="Ej: Edenor o Distribuidora X">
          </div>
          <div class="field">
            <label>Concepto</label>
            <input v-model="nuevoGasto.concepto" placeholder="Ej: Pago de Alquiler">
          </div>
          <div class="field">
            <label>Monto Total</label>
            <input type="number" v-model.number="nuevoGasto.total" step="0.01">
          </div>
          <div class="field">
            <label>Estado de Pago</label>
            <select v-model="nuevoGasto.estado">
              <option value="PAGADO">PAGADO</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="mostrarModal = false" class="btn-cancelar" :disabled="guardando">Cancelar</button>
          <button @click="guardarGasto" class="btn-guardar" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar en Nube' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getGastos, saveGasto } from '@/services/data'; 

const listaGastos = ref([]);
const loading = ref(true);
const guardando = ref(false);
const mostrarModal = ref(false);

const nuevoGasto = ref({
  proveedor: '',
  concepto: '',
  total: 0,
  estado: 'PAGADO',
  fecha: new Date().toISOString()
});

onMounted(async () => {
  await cargarGastos();
});

const cargarGastos = async () => {
  loading.value = true;
  try {
    // getGastos() ahora debe llamar a supabase.from('gastos').select('*')
    listaGastos.value = await getGastos() || [];
  } catch (e) {
    console.error("Error al cargar gastos:", e);
  } finally {
    loading.value = false;
  }
};

const totalMes = computed(() => {
  return listaGastos.value.reduce((acc, g) => acc + Number(g.total), 0);
});

const totalPendiente = computed(() => {
  return listaGastos.value
    .filter(g => g.estado === 'PENDIENTE')
    .reduce((acc, g) => acc + Number(g.total), 0);
});

const abrirModal = () => {
  nuevoGasto.value = { 
    proveedor: '', 
    concepto: '', 
    total: 0, 
    estado: 'PAGADO', 
    fecha: new Date().toISOString() 
  };
  mostrarModal.value = true;
};

const guardarGasto = async () => {
  if (!nuevoGasto.value.proveedor || nuevoGasto.value.total <= 0) {
    alert("Datos incompletos");
    return;
  }
  
  guardando.value = true;
  try {
    // saveGasto realiza el insert en Supabase
    await saveGasto(nuevoGasto.value);
    mostrarModal.value = false;
    await cargarGastos();
  } catch (e) {
    alert("Error al guardar el gasto");
  } finally {
    guardando.value = false;
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString();
</script>

<style scoped>
.gastos-container { padding: 20px; max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { color: #64748b; font-size: 0.9rem; }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px; }
.stat-card { padding: 25px; text-align: center; border: 1px solid #e2e8f0; background: white; }
.stat-card span { color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-card h3 { font-size: 2.2rem; margin-top: 10px; color: #1e293b; }
.text-red { color: #ef4444 !important; }

.loader { padding: 50px; text-align: center; color: #64748b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 30px; width: 100%; max-width: 450px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.form-grid { display: grid; gap: 15px; margin-top: 20px; }
.field label { display: block; font-size: 0.85rem; margin-bottom: 6px; color: #475569; font-weight: 600; }
.field input, .field select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 1rem; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
.badge { padding: 5px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.4px; }
.badge.pagado { background: #dcfce7; color: #166534; }
.badge.pendiente { background: #fee2e2; color: #991b1b; }

.btn-nuevo { background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; }
.btn-guardar { background: #1e293b; color: white; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; flex: 1; }
.btn-guardar:disabled { background: #94a3b8; }
.btn-cancelar { background: #f1f5f9; color: #475569; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; }
</style>
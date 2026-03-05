<template>
  <div class="cheques-container">
    <header class="flex-header">
      <h1>🎫 Gestión de Cheques</h1>
      <button @click="abrirModal" class="btn-nuevo">+ Nuevo Cheque</button>
    </header>

    <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div class="stat-card shadow card">
        <p>En Cartera (Pendientes)</p>
        <h3 class="text-blue font-bold text-xl">${{ totalCartera.toLocaleString() }}</h3>
      </div>
      <div class="stat-card shadow card">
        <p>A vencer (próx. 7 días)</p>
        <h3 class="text-orange font-bold text-xl">${{ totalVencer.toLocaleString() }}</h3>
      </div>
    </div>

    <div class="tabs">
      <button @click="tabActiva = 'cartera'" :class="{ active: tabActiva === 'cartera' }">En Cartera</button>
      <button @click="tabActiva = 'propios'" :class="{ active: tabActiva === 'propios' }">Propios / Emitidos</button>
    </div>

    <div class="table-container card">
      <table>
        <thead>
          <tr>
            <th>Vencimiento</th>
            <th>Banco</th>
            <th>Número</th>
            <th>{{ tabActiva === 'cartera' ? 'Cliente' : 'Destino' }}</th>
            <th class="text-right">Monto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cheque in chequesFiltrados" :key="cheque.id">
            <td :class="{ 'vencido': isVencido(cheque.fecha_vencimiento) }">
              {{ formatDate(cheque.fecha_vencimiento) }}
            </td>
            <td>{{ cheque.banco }}</td>
            <td>{{ cheque.numero }}</td>
            <td>{{ cheque.emisor }}</td>
            <td class="text-right font-bold">${{ Number(cheque.monto).toLocaleString() }}</td>
            <td>
              <span :class="'status-badge ' + cheque.estado">{{ cheque.estado }}</span>
            </td>
            <td>
              <button @click="cambiarEstado(cheque)" class="btn-edit" title="Cambiar Estado">⚡</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="chequesFiltrados.length === 0" class="p-8 text-center text-gray-400">
        No hay cheques en esta categoría.
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Registrar Nuevo Cheque</h3>
        <form @submit.prevent="guardarNuevoCheque">
          <div class="grid-form">
            <div class="form-group">
              <label>Tipo de Cheque</label>
              <select v-model="nuevoCheque.tipo" required>
                <option value="cartera">Recibido (Cartera)</option>
                <option value="propios">Emitido (Propio)</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ nuevoCheque.tipo === 'cartera' ? 'Recibido de (Cliente)' : 'Entregado a (Proveedor)' }}</label>
              <select v-if="nuevoCheque.tipo === 'cartera'" v-model="nuevoCheque.entidad" required>
                <option value="">-- Seleccionar Cliente --</option>
                <option v-for="c in clientes" :key="c.id" :value="c.nombre">{{ c.nombre }}</option>
              </select>
              <select v-else v-model="nuevoCheque.entidad" required>
                <option value="">-- Seleccionar Proveedor --</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Banco</label>
              <input v-model="nuevoCheque.banco" type="text" placeholder="Ej: Banco Nación" required>
            </div>

            <div class="form-group">
              <label>Número</label>
              <input v-model="nuevoCheque.numero" type="text" required>
            </div>

            <div class="form-group">
              <label>Monto</label>
              <input v-model.number="nuevoCheque.monto" type="number" step="0.01" required>
            </div>

            <div class="form-group">
              <label>Vencimiento</label>
              <input v-model="nuevoCheque.fechaVto" type="date" required>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModal = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-guardar" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar en Nube' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  getCheques, 
  saveCheque, 
  registrarMovimientoCaja, 
  getClientes, 
  getProveedores 
} from '@/services/data';

const tabActiva = ref('cartera');
const mostrarModal = ref(false);
const cheques = ref([]);
const loading = ref(false);

// Listas para los selectores
const clientes = ref([]);
const proveedores = ref([]);

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getHoy = () => new Date().toISOString().split('T')[0];

const nuevoCheque = ref({
  tipo: 'cartera',
  banco: '',
  numero: '',
  monto: 0,
  fechaVto: getHoy(), // Fecha actual por defecto
  entidad: '', 
  estado: 'pendiente'
});

const cargarDatos = async () => {
  const [dataCheques, dataClientes, dataProvs] = await Promise.all([
    getCheques(),
    getClientes(),
    getProveedores()
  ]);
  cheques.value = dataCheques || [];
  clientes.value = dataClientes || [];
  proveedores.value = dataProvs || [];
};

onMounted(cargarDatos);

const guardarNuevoCheque = async () => {
  try {
    loading.value = true; 
   
    const payload = {
      empresa_id: 'emp_default', // Aseguramos que se guarde con el ID correcto
      tipo: nuevoCheque.value.tipo, // 'cartera' o 'propios'
      banco: nuevoCheque.value.banco,
      numero: nuevoCheque.value.numero,
      monto: nuevoCheque.value.monto,
      emisor: nuevoCheque.value.entidad, 
      fecha_vencimiento: nuevoCheque.value.fechaVto,
      estado: 'CARTERA'
    };

    const resultado = await saveCheque(payload);
    
    if (resultado) {
      alert("✅ Cheque registrado correctamente");
      mostrarModal.value = false;
      // Resetear con fecha de hoy
      nuevoCheque.value = {
        tipo: 'cartera', banco: '', numero: '', monto: 0,
        fechaVto: getHoy(), entidad: '', estado: 'pendiente'
      };
      await cargarDatos();
    }
  } catch (error) {
    alert("❌ Error: " + error.message);
  } finally {
    loading.value = false;
  }
};

// ... (Mantenemos los mismos computed: chequesFiltrados, totalCartera, etc.)
const chequesFiltrados = computed(() => {
  return cheques.value.filter(c => c.tipo === tabActiva.value);
});

const totalCartera = computed(() => {
  return cheques.value
    .filter(c => c.tipo === 'cartera' && (c.estado === 'pendiente' || c.estado === 'CARTERA'))
    .reduce((acc, curr) => acc + Number(curr.monto), 0);
});

const totalVencer = computed(() => {
  const hoy = new Date();
  const proximaSemana = new Date();
  proximaSemana.setDate(hoy.getDate() + 7);
  return cheques.value.filter(c => {
    const f = new Date(c.fecha_vencimiento);
    return f >= hoy && f <= proximaSemana;
  }).reduce((acc, curr) => acc + Number(curr.monto), 0);
});

const abrirModal = () => { mostrarModal.value = true; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'S/F';
const isVencido = (d) => d && new Date(d) < new Date().setHours(0,0,0,0);
</script>

<style scoped>
/* Tus estilos se mantienen, solo asegúrate de que .card exista en tu CSS global o añade: */
.card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.status-badge.depositado { background: #dbeafe; color: #1e40af; }
.status-badge.pagado { background: #d1fae5; color: #065f46; }
.status-badge.anulado { background: #f3f4f6; color: #374151; }
/* ... resto de estilos del archivo original ... */
</style>
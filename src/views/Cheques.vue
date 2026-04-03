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
      <button @click="tabActiva = 'cartera'" :class="{ active: tabActiva === 'cartera' }">Recibidos (Cartera)</button>
      <button @click="tabActiva = 'propios'" :class="{ active: tabActiva === 'propios' }">Emitidos (Propios)</button>
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
            <th class="text-center">Acciones</th>
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
              <span :class="'status-badge ' + cheque.estado.toLowerCase()">{{ cheque.estado }}</span>
            </td>
            <td class="text-center">
              <button @click="cambiarEstado(cheque)" class="btn-edit" title="Siguiente Estado">⚡</button>
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
              <select v-model="nuevoCheque.entidad" required>
                <option value="">-- Seleccionar --</option>
                <template v-if="nuevoCheque.tipo === 'cartera'">
                  <option v-for="c in clientes" :key="c.id" :value="c.nombre">{{ c.nombre }}</option>
                </template>
                <template v-else>
                  <option v-for="p in proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
                </template>
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
              {{ loading ? 'Guardando...' : 'Confirmar Registro' }}
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
const clientes = ref([]);
const proveedores = ref([]);

const getHoy = () => new Date().toISOString().split('T')[0];

const nuevoCheque = ref({
  tipo: 'cartera',
  banco: '',
  numero: '',
  monto: 0,
  fechaVto: getHoy(),
  entidad: '', 
  estado: 'CARTERA'
});

// --- CARGA DE DATOS ---
const cargarDatos = async () => {
  try {
    const [dataCheques, dataClientes, dataProvs] = await Promise.all([
      getCheques(),
      getClientes(),
      getProveedores()
    ]);
    cheques.value = dataCheques || [];
    clientes.value = dataClientes || [];
    proveedores.value = dataProvs || [];
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};

onMounted(cargarDatos);

// --- ACCIONES ---
const guardarNuevoCheque = async () => {
  try {
    loading.value = true;
    
    // Buscar la entidad para obtener su ID
    const lista = nuevoCheque.value.tipo === 'cartera' ? clientes.value : proveedores.value;
    const encontrada = lista.find(e => e.nombre === nuevoCheque.value.entidad);

    const payload = {
      empresa_id: 'emp_default',
      cliente_id: nuevoCheque.value.tipo === 'cartera' ? encontrada?.id : null,
      tipo: nuevoCheque.value.tipo,
      banco: nuevoCheque.value.banco,
      numero: nuevoCheque.value.numero,
      monto: nuevoCheque.value.monto,
      emisor: nuevoCheque.value.entidad, 
      fecha_vencimiento: nuevoCheque.value.fechaVto,
      estado: 'CARTERA'
    };

    const resultado = await saveCheque(payload);
    
    if (resultado) {
      alert("✅ Cheque registrado y vinculado correctamente");
      mostrarModal.value = false;
      nuevoCheque.value = { tipo: 'cartera', banco: '', numero: '', monto: 0, fechaVto: getHoy(), entidad: '', estado: 'CARTERA' };
      await cargarDatos();
    }
  } catch (error) {
    alert("❌ Error: " + error.message);
  } finally {
    loading.value = false;
  }
};

const cambiarEstado = async (cheque) => {
  const estados = ['CARTERA', 'DEPOSITADO', 'COBRADO', 'ANULADO'];
  const indiceActual = estados.indexOf(cheque.estado.toUpperCase());
  const nuevoEstado = estados[(indiceActual + 1) % estados.length];

  if (!confirm(`¿Cambiar estado de Cheque N° ${cheque.numero} a ${nuevoEstado}?`)) return;

  try {
    loading.value = true;
    const resultado = await saveCheque({ ...cheque, estado: nuevoEstado });

    if (resultado) {
      if (nuevoEstado === 'COBRADO') {
        await registrarMovimientoCaja('ingreso', cheque.monto, `Cobro Cheque N° ${cheque.numero}`, 'Finanzas');
      }
      await cargarDatos();
    }
  } catch (error) {
    alert("❌ Error al actualizar: " + error.message);
  } finally {
    loading.value = false;
  }
};

// --- COMPUTED ---
const chequesFiltrados = computed(() => cheques.value.filter(c => c.tipo === tabActiva.value));

const totalCartera = computed(() => {
  return cheques.value
    .filter(c => c.tipo === 'cartera' && (c.estado === 'CARTERA' || c.estado === 'DEPOSITADO'))
    .reduce((acc, curr) => acc + Number(curr.monto), 0);
});

const totalVencer = computed(() => {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 7);
  return cheques.value.filter(c => {
    const f = new Date(c.fecha_vencimiento);
    return f >= hoy && f <= limite && c.estado !== 'COBRADO';
  }).reduce((acc, curr) => acc + Number(curr.monto), 0);
});

// --- HELPERS ---
const abrirModal = () => { mostrarModal.value = true; };
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : 'S/F';
const isVencido = (d) => d && new Date(d) < new Date().setHours(0,0,0,0);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.vencido { color: #dc2626; font-weight: bold; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.status-badge.cartera { background: #fef3c7; color: #92400e; }
.status-badge.depositado { background: #dbeafe; color: #1e40af; }
.status-badge.cobrado { background: #d1fae5; color: #065f46; }
.status-badge.anulado { background: #f3f4f6; color: #374151; }
</style>
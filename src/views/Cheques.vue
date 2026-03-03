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
            <td :class="{ 'vencido': isVencido(cheque.fechaVto) }">
              {{ formatDate(cheque.fechaVto) }}
            </td>
            <td>{{ cheque.banco }}</td>
            <td>{{ cheque.numero }}</td>
            <td>{{ cheque.entidad }}</td>
            <td class="text-right font-bold">${{ cheque.monto.toLocaleString() }}</td>
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
              <label>Tipo</label>
              <select v-model="nuevoCheque.tipo" required>
                <option value="cartera">Recibido (Cartera)</option>
                <option value="propio">Emitido (Propio)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Banco</label>
              <input v-model="nuevoCheque.banco" type="text" required>
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
              <label>Fecha Vencimiento</label>
              <input v-model="nuevoCheque.fechaVto" type="date" required>
            </div>
            <div class="form-group">
              <label>Cliente / Proveedor</label>
              <input v-model="nuevoCheque.entidad" type="text" required>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="mostrarModal = false">Cancelar</button>
            <button type="submit" class="btn-guardar">Guardar en Nube</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCheques, saveCheque, registrarMovimientoCaja } from '@/services/data';

const tabActiva = ref('cartera');
const mostrarModal = ref(false);
const cheques = ref([]);

const nuevoCheque = ref({
  tipo: 'cartera',
  banco: '',
  numero: '',
  monto: 0,
  fechaVto: '',
  entidad: '',
  estado: 'pendiente'
});

// Cargar desde Supabase
const cargarCheques = async () => {
  cheques.value = await getCheques();
};

onMounted(cargarCheques);

const chequesFiltrados = computed(() => {
  return cheques.value.filter(c => c.tipo === tabActiva.value);
});

const totalCartera = computed(() => {
  return cheques.value
    .filter(c => c.tipo === 'cartera' && c.estado === 'pendiente')
    .reduce((acc, curr) => acc + Number(curr.monto), 0);
});

const totalVencer = computed(() => {
  const hoy = new Date();
  const proximaSemana = new Date();
  proximaSemana.setDate(hoy.getDate() + 7);

  return cheques.value.filter(c => {
    const f = new Date(c.fechaVto);
    return f >= hoy && f <= proximaSemana && c.estado === 'pendiente';
  }).reduce((acc, curr) => acc + Number(curr.monto), 0);
});

const abrirModal = () => { mostrarModal.value = true; };

const guardarNuevoCheque = async () => {
  try {
    await saveCheque({ ...nuevoCheque.value });
    alert("Cheque guardado correctamente.");
    mostrarModal.value = false;
    // Reset
    nuevoCheque.value = { tipo: 'cartera', banco: '', numero: '', monto: 0, fechaVto: '', entidad: '', estado: 'pendiente' };
    await cargarCheques(); // Recargar lista
  } catch (e) {
    alert("Error al guardar");
  }
};

const cambiarEstado = async (cheque) => {
  const estadosCartera = ['pendiente', 'depositado', 'cobrado', 'rechazado'];
  const estadosPropios = ['pendiente', 'pagado', 'anulado'];
  
  const listaEstados = cheque.tipo === 'cartera' ? estadosCartera : estadosPropios;
  const currentIndex = listaEstados.indexOf(cheque.estado);
  const nuevoEstado = listaEstados[(currentIndex + 1) % listaEstados.length];
  
  // LÓGICA DE INTEGRACIÓN CON CAJA (Ahora va a Supabase)
  if (nuevoEstado === 'cobrado' && cheque.tipo === 'cartera') {
    await registrarMovimientoCaja('ingreso', cheque.monto, `Cobro Cheque ${cheque.banco} Nº${cheque.numero}`, 'Cheques');
    alert(`💰 $${cheque.monto.toLocaleString()} sumados a la Caja.`);
  } 
  else if (nuevoEstado === 'pagado' && cheque.tipo === 'propio') {
    await registrarMovimientoCaja('egreso', cheque.monto, `Pago Cheque Propio ${cheque.banco} Nº${cheque.numero}`, 'Cheques');
    alert(`💸 $${cheque.monto.toLocaleString()} restados de la Caja.`);
  }

  // Actualizar el cheque en la base de datos
  cheque.estado = nuevoEstado;
  await saveCheque(cheque);
  await cargarCheques();
};

const formatDate = (d) => new Date(d).toLocaleDateString();
const isVencido = (d) => {
  const fecha = new Date(d);
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  return fecha < hoy;
};
</script>

<style scoped>
/* Tus estilos se mantienen, solo asegúrate de que .card exista en tu CSS global o añade: */
.card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.status-badge.depositado { background: #dbeafe; color: #1e40af; }
.status-badge.pagado { background: #d1fae5; color: #065f46; }
.status-badge.anulado { background: #f3f4f6; color: #374151; }
/* ... resto de estilos del archivo original ... */
</style>
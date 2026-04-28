<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from "@/supabase"; //
import { 
  getCheques, 
  saveCheque, 
  deleteCheque, 
  registrarEvento,
  getClientes,     
  getProveedores,   
  registrarMovimientoCtaCte  
} from '@/services/data';

const cheques = ref([]);
const entidades = ref([]); // Guardará clientes y proveedores mezclados
const loading = ref(false);
const filtroBusqueda = ref('');

const mostrarModal = ref(false);
const chequeEdit = ref({
  emisor: '',
  banco: '',
  numero: '',
  monto: 0,
  fecha_vencimiento: '',
  estado: 'CARTERA'
});

onMounted(() => {
  cargarCheques();
  cargarEntidades(); // Cargamos el directorio para el autocompletado
});

async function cargarEntidades() {
  try {
    const [clientesDb, proveedoresDb] = await Promise.all([
      getClientes(),
      getProveedores()
    ]);
    
    // Unificamos ambas listas agregando una etiqueta para saber qué son
    entidades.value = [
      ...clientesDb.map(c => ({ id: c.id, nombre: c.nombre, tipo: 'CLIENTE' })),
      ...proveedoresDb.map(p => ({ id: p.id, nombre: p.nombre, tipo: 'PROVEEDOR' }))
    ];
  } catch (e) {
    console.error("Error cargando entidades para autocompletado:", e);
  }
}

async function cargarCheques() {
  loading.value = true;
  try {
    cheques.value = await getCheques();
  } catch (e) {
    console.error("Error cargando cheques:", e);
  } finally {
    loading.value = false;
  }
}

async function guardar() {
  try {
    const payload = {
      ...chequeEdit.value,
      monto: Number(chequeEdit.value.monto)
    };

    // 1. Guardamos el cheque en la cartera
    const resCheque = await saveCheque(payload);
    
    // 2. Registramos el evento (Auditoría)
    await registrarEvento({
      modulo: 'FINANZAS',
      tipo: 'CHEQUE',
      monto: payload.monto,
      desc: `Cheque #${payload.numero} de ${payload.emisor}`,
      entidad: payload.emisor
    });

    // 3. VINCULACIÓN CON CUENTA CORRIENTE
    // Buscamos si el emisor es un cliente registrado
    const clienteVinculado = entidades.value.find(
      e => e.nombre.trim().toLowerCase() === payload.emisor.trim().toLowerCase() && e.tipo === 'CLIENTE'
    );

    if (clienteVinculado) {
      // Insertamos directamente en la tabla que lee tu DetalleCliente.vue
      await supabase.from('pagos_cuentas').insert([{
        cliente_id: clienteVinculado.id,
        monto: payload.monto,
        metodo_pago: `Cheque #${payload.numero} (${payload.banco})`,
        fecha: new Date().toISOString(),
        empresa_id: 'emp_default' // O el ID de tu sesión
      }]);
    }

    cerrarModal();
    await cargarCheques();
    alert("✅ Cheque guardado e impactado en cuenta corriente");
  } catch (e) {
    console.error("Error completo:", e);
    alert("Error al procesar. Revisá la consola.");
  }
}

async function cambiarEstado(c, nuevoEstado) {
  try {
    await saveCheque({ ...c, estado: nuevoEstado });
    await cargarCheques();
    // Nota: Si el cheque pasa de CARTERA a RECHAZADO, deberías crear 
    // otro movimiento en cuenta corriente que anule el pago (un DÉBITO).
  } catch (e) {
    alert("Error al actualizar estado");
  }
}

async function eliminar(id) {
  if (!confirm("¿Eliminar este cheque de la cartera?")) return;
  try {
    await deleteCheque(id);
    await cargarCheques();
  } catch (e) {
    alert("Error al eliminar");
  }
}

function abrirModal(c = null) {
  if (c) {
    chequeEdit.value = { ...c };
  } else {
    chequeEdit.value = { emisor: '', banco: '', numero: '', monto: 0, fecha_vencimiento: '', estado: 'CARTERA' };
  }
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
}

const chequesFiltrados = computed(() => {
  return cheques.value.filter(c => 
    (c.banco || '').toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
    (c.emisor || '').toLowerCase().includes(filtroBusqueda.value.toLowerCase()) ||
    (c.numero || '').includes(filtroBusqueda.value)
  ).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
});
</script>

<template>
  <div class="cheques-container">
    <header class="page-header">
      <div>
        <h2>Cartera de Cheques</h2>
        <p class="subtitle">Control de valores y vencimientos.</p>
      </div>
      <button @click="abrirModal()" class="btn-nueva">
        <span>+</span> Ingresar Cheque
      </button>
    </header>

    <div class="filters-bar glass-card">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input v-model="filtroBusqueda" type="text" placeholder="Buscar por banco, emisor o número..." class="input-search">
      </div>
    </div>

    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
    </div>

    <div v-else class="table-container glass-card shadow-lg">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Recepción</th>
            <th>Emisor</th>
            <th>Banco / Ref</th>
            <th>Vencimiento</th>
            <th>Monto</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chequesFiltrados" :key="c.id">
            <td data-label="Recepción" class="text-xs text-gray-500">
              {{ c.fecha_recepcion ? new Date(c.fecha_recepcion).toLocaleDateString() : 'S/F' }}
            </td>
            <td data-label="Emisor" class="font-bold">{{ c.emisor || 'S/D' }}</td>
            <td data-label="Banco / Ref">
              <div>{{ c.banco }}</div>
              <div class="font-mono text-xs text-gray-500">#{{ c.numero }}</div>
            </td>
            <td data-label="Vencimiento" class="font-bold text-red-600">
              {{ c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString() : 'S/V' }}
            </td>
            <td data-label="Monto" class="font-mono font-black text-blue-700">
              ${{ Number(c.monto).toLocaleString() }}
            </td>
            <td data-label="Estado">
              <select :value="c.estado" @change="cambiarEstado(c, $event.target.value)" class="status-select">
                <option value="CARTERA">📥 CARTERA</option>
                <option value="DEPOSITADO">🏦 DEPOSITADO</option>
                <option value="COBRADO">💵 COBRADO</option>
                <option value="RECHAZADO">❌ RECHAZADO</option>
              </select>
            </td>
            <td class="text-right actions-cell">
              <button @click="abrirModal(c)" class="btn-icon">✏️</button>
              <button @click="eliminar(c.id)" class="btn-icon btn-delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content glass-card shadow-2xl">
        <h3>{{ chequeEdit.id ? 'Editar' : 'Ingresar' }} Cheque</h3>
        <div class="form-grid">
         <div class="field" style="grid-column: span 2;">
            <label>Emisor (Cliente o Proveedor)</label>
            <input 
              v-model="chequeEdit.emisor" 
              type="text" 
              list="lista-entidades" 
              placeholder="Escriba para buscar o ingrese un nombre nuevo..."
              autocomplete="off"
            >
            <datalist id="lista-entidades">
              <option v-for="entidad in entidades" :key="entidad.id" :value="entidad.nombre">
                {{ entidad.tipo }}
              </option>
            </datalist>
          </div>
          <div class="field">
            <label>Banco</label>
            <input v-model="chequeEdit.banco" type="text" placeholder="Ej: Galicia">
          </div>
          <div class="field">
            <label>Número de Cheque</label>
            <input v-model="chequeEdit.numero" type="text" placeholder="000123">
          </div>
          <div class="field">
            <label>Monto ($)</label>
            <input v-model="chequeEdit.monto" type="number">
          </div>
          <div class="field">
            <label>Fecha de Vencimiento</label>
            <input v-model="chequeEdit.fecha_vencimiento" type="date">
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="cerrarModal" class="btn-cancel">Cancelar</button>
          <button @click="guardar" class="btn-save">Guardar Valor</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* (Mantenemos los mismos estilos de la versión anterior que ya eran responsivos y limpios) */
.cheques-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

.filters-bar { display: flex; padding: 15px; margin-bottom: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
.search-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
.input-search { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; border-radius: 8px; }

.table-container { background: white; border-radius: 12px; overflow: hidden; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.text-xs { font-size: 0.75rem; }
.text-gray-500 { color: #6b7280; }
.text-red-600 { color: #dc2626; }
.status-select { padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.8rem; font-weight: 600; cursor: pointer; }

.actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; cursor: pointer; }
.btn-delete:hover { background: #fee2e2; border-color: #ef4444; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.modal-content { background: white; padding: 30px; border-radius: 16px; width: 100%; max-width: 550px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 0.8rem; font-weight: 700; color: #64748b; }
.field input { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-save { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

@media (max-width: 768px) {
  .table-moderna thead { display: none; }
  .table-moderna tr { display: block; border: 1px solid #e2e8f0; margin-bottom: 10px; border-radius: 10px; padding: 10px; }
  .table-moderna td { display: flex; justify-content: space-between; padding: 8px 5px; border: none; }
  .table-moderna td::before { content: attr(data-label); font-weight: 800; color: #64748b; font-size: 0.7rem; }
  .form-grid { grid-template-columns: 1fr; }
  .field[style] { grid-column: auto !important; }
}
</style>
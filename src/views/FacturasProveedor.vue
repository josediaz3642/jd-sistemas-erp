<template>
  <div class="page-container">
    <header class="header-section glass-card">
      <div>
        <h1>Facturas de Compra</h1>
        <p class="subtitle">Registro de comprobantes recibidos del proveedor.</p>
      </div>
      <button class="btn-primary" @click="mostrarModal = true">
        + Registrar Factura
      </button>
    </header>

    <div class="table-container glass-card">
      <div v-if="loading" class="loader">Cargando comprobantes...</div>
      
      <table v-else class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>N° Factura</th>
            <th>Proveedor</th>
            <th class="text-right">Total</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in facturas" :key="f.id">
            <td>{{ formatDate(f.fecha) }}</td>
            <td class="font-mono">{{ f.numero_factura || f.numero }}</td>
            <td>{{ f.proveedor_nombre || 'Proveedor' }}</td>
            <td class="text-right font-bold">${{ Number(f.total).toLocaleString() }}</td>
            <td class="text-right">
              <button class="btn-ver" @click="verDetalle(f)">👁️</button>
            </td>
          </tr>
          <tr v-if="facturas.length === 0">
            <td colspan="5" class="text-center py-20">No hay facturas registradas para este proveedor.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Registrar Compra</h3>
        <div class="form-group">
          <label>Número de Factura</label>
          <input v-model="nuevaF.numero" placeholder="0001-00001234" class="input-moderno" />
        </div>
        <div class="form-group">
          <label>Importe Total</label>
          <input type="number" v-model.number="nuevaF.total" class="input-moderno" />
        </div>
        <div class="modal-actions">
          <button @click="mostrarModal = false" class="btn-cancel">Cancelar</button>
          <button @click="guardarNuevaFactura" class="btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { 
  getFacturasProveedorById, 
  saveFacturaProveedor 
} from "@/services/data.js";

const route = useRoute();
const proveedorId = route.params.id;

const facturas = ref([]);
const loading = ref(true);
const guardando = ref(false);
const mostrarModal = ref(false);

const nuevaF = ref({
  numero: "",
  total: 0
});

onMounted(async () => {
  await cargarFacturas();
});

async function cargarFacturas() {
  loading.value = true;
  try {
    facturas.value = await getFacturasProveedorById(proveedorId);
  } finally {
    loading.value = false;
  }
}

async function guardarNuevaFactura() {
  if (!nuevaF.value.numero || nuevaF.value.total <= 0) {
    alert("Por favor, complete los datos correctamente.");
    return;
  }

  guardando.value = true;
  try {
    await saveFacturaProveedor({
      proveedor_id: proveedorId,
      fecha: new Date().toISOString(),
      numero_factura: nuevaF.value.numero,
      total: nuevaF.value.total,
      estado: 'INGRESADA'
    });
    
    mostrarModal.value = false;
    nuevaF.value = { numero: "", total: 0 };
    await cargarFacturas(); // Recargar lista
  } catch (e) {
    alert("Error al guardar la factura de compra.");
  } finally {
    guardando.value = false;
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

function verDetalle(f) {
  // Aquí podrías navegar a un detalle de compra si fuera necesario
  console.log("Detalle de factura:", f);
}
</script>

<style scoped>
.page-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px !important; }
.subtitle { color: #64748b; font-size: 0.9rem; }

.table-moderna { width: 100%; border-collapse: collapse; background: white; }
.table-moderna th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.font-mono { font-family: monospace; font-weight: bold; color: #334155; }
.text-right { text-align: right; }
.loader { padding: 40px; text-align: center; color: #64748b; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-content { width: 400px; padding: 30px !important; background: white; }
.form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.input-moderno { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }

.btn-primary { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #f1f5f9; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1; }
.btn-ver { background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 10px; border-radius: 6px; cursor: pointer; }
</style>
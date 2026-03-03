<template>
  <div class="pago-container">
    <header class="header-section glass-card">
      <div>
        <h1>Pagos Realizados</h1>
        <p class="subtitle">Historial de egresos para este proveedor.</p>
      </div>
      <button class="btn-primary" @click="mostrarModal = true">
        💸 Registrar Pago
      </button>
    </header>

    <div class="table-container glass-card">
      <div v-if="loading" class="loader">Sincronizando pagos...</div>
      
      <table v-else class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Medio de Pago</th>
            <th class="text-right">Monto</th>
            <th class="text-right">Comprobante</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pagos" :key="p.id">
            <td>{{ formatDate(p.fecha) }}</td>
            <td>
              <span class="medio-tag">{{ p.medio_pago || p.medio }}</span>
            </td>
            <td class="text-right font-bold text-red">
              - ${{ Number(p.monto).toLocaleString() }}
            </td>
            <td class="text-right">
              <button class="btn-icon" title="Ver Recibo">📄</button>
            </td>
          </tr>
          <tr v-if="pagos.length === 0">
            <td colspan="4" class="text-center py-10">No se han registrado pagos aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h3>Registrar Salida de Dinero</h3>
        <p class="modal-sub">El monto se descontará automáticamente de la caja actual.</p>
        
        <div class="form-grid">
          <div class="field">
            <label>Medio de Pago</label>
            <select v-model="nuevoP.medio" class="input-moderno">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="field">
            <label>Monto a Pagar</label>
            <input type="number" v-model.number="nuevoP.monto" class="input-moderno" placeholder="0.00" />
          </div>
        </div>

        <div class="modal-actions">
          <button @click="mostrarModal = false" class="btn-cancel" :disabled="guardando">Cancelar</button>
          <button @click="confirmarPago" class="btn-primary" :disabled="guardando || nuevoP.monto <= 0">
            {{ guardando ? 'Procesando...' : 'Confirmar Pago' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getPagosProveedorById, savePagoProveedor } from "@/services/data.js";

const route = useRoute();
const proveedorId = route.params.id;

const pagos = ref([]);
const loading = ref(true);
const guardando = ref(false);
const mostrarModal = ref(false);

const nuevoP = ref({
  medio: "Efectivo",
  monto: 0
});

onMounted(async () => {
  await cargarPagos();
});

async function cargarPagos() {
  loading.value = true;
  try {
    pagos.value = await getPagosProveedorById(proveedorId);
  } finally {
    loading.value = false;
  }
}

async function confirmarPago() {
  guardando.value = true;
  try {
    await savePagoProveedor({
      proveedor_id: proveedorId,
      fecha: new Date().toISOString(),
      medio_pago: nuevoP.value.medio,
      monto: nuevoP.value.monto,
      tipo: 'EGRESO_PROVEEDOR'
    });
    
    mostrarModal.value = false;
    nuevoP.value = { medio: "Efectivo", monto: 0 };
    await cargarPagos();
  } catch (e) {
    alert("Error al registrar el pago.");
  } finally {
    guardando.value = false;
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
</script>

<style scoped>
.pago-container { padding: 20px; max-width: 900px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding: 20px !important; }
.subtitle { color: #64748b; font-size: 0.9rem; }

.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.medio-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; color: #475569; }
.text-red { color: #ef4444; }
.text-right { text-align: right; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { width: 400px; padding: 30px !important; background: white; }
.modal-sub { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; }
.form-grid { display: flex; flex-direction: column; gap: 15px; }
.field label { display: block; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; color: #475569; }
.input-moderno { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }

.btn-primary { background: #1e293b; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #f1f5f9; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
</style>
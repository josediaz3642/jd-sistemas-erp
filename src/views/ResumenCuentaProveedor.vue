<template>
  <div class="resumen-container">
    <header v-if="!loading" class="proveedor-header glass-card">
      <div class="perfil">
        <div class="avatar-prov">🏭</div>
        <div>
          <h1>{{ proveedor?.nombre || 'Proveedor' }}</h1>
          <p class="cuit-tag">{{ proveedor?.cuit || 'Sin CUIT registrado' }}</p>
        </div>
      </div>
      
      <div class="balance-card" :class="{ 'deuda-activa': saldo > 0 }">
        <span class="label">Total a Pagar</span>
        <h2 class="monto">${{ saldo.toLocaleString() }}</h2>
        <div class="status-indicator">
          <span class="dot"></span> {{ saldo > 0 ? 'Cuenta Pendiente' : 'Saldo Acreedor' }}
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Calculando saldos y mercadería...</p>
    </div>

    <div v-else class="resumen-grid">
      <section class="activity-panel">
        <div class="stat-box glass-card">
          <span class="stat-label">Facturas Recibidas</span>
          <span class="stat-value">{{ facturas.length }}</span>
        </div>
        <div class="stat-box glass-card">
          <span class="stat-label">Pagos Enviados</span>
          <span class="stat-value">{{ pagos.length }}</span>
        </div>
      </section>

      <section class="items-panel glass-card">
        <div class="panel-header">
          <h3>📦 Historial de Abastecimiento</h3>
          <small>Productos adquiridos a este proveedor</small>
        </div>
        
        <div class="table-container">
          <table class="table-resumen">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Total Unidades</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.producto">
                <td class="prod-name">{{ item.producto }}</td>
                <td class="text-right font-bold">{{ item.cantidad }}</td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="2" class="empty-msg">No hay registros de compras.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="actions-footer">
        <button class="btn-back" @click="$router.back()">← Regresar</button>
        <button class="btn-pay" @click="$router.push(`/pago-proveedor/${id}`)">
          💸 Registrar Nuevo Pago
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  getProveedorById,
  getFacturasProveedor,
  getPagosProveedor,
  getItemsCompradosProveedor
} from "@/services/data";

const route = useRoute();
const id = route.params.id; // UUID o ID de Supabase

const proveedor = ref(null);
const facturas = ref([]);
const pagos = ref([]);
const items = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    // Consultas paralelas para optimizar tiempos de respuesta
    const [pInfo, fData, pData, iData] = await Promise.all([
      getProveedorById(id),
      getFacturasProveedor(id),
      getPagosProveedor(id),
      getItemsCompradosProveedor(id)
    ]);

    proveedor.value = pInfo;
    facturas.value = fData || [];
    pagos.value = pData || [];
    items.value = iData || [];
  } catch (error) {
    console.error("Error al obtener resumen del proveedor:", error);
  } finally {
    loading.value = false;
  }
});

// El saldo se calcula restando lo pagado a lo facturado (deuda con el proveedor)
const saldo = computed(() => {
  const totalFacturado = facturas.value.reduce((acc, f) => acc + (f.total || 0), 0);
  const totalPagado = pagos.value.reduce((acc, p) => acc + (p.monto || 0), 0);
  return totalFacturado - totalPagado;
});
</script>

<style scoped>
.resumen-container { max-width: 1000px; margin: 0 auto; padding: 25px; }

.proveedor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px !important;
  margin-bottom: 25px;
}

.perfil { display: flex; gap: 20px; align-items: center; }
.avatar-prov { font-size: 2.5rem; background: #f1f5f9; padding: 15px; border-radius: 15px; }
.cuit-tag { color: #64748b; font-family: monospace; }

.balance-card { text-align: right; }
.balance-card .monto { font-size: 2.2rem; margin: 5px 0; color: #1e293b; }
.deuda-activa .monto { color: #e11d48; }

.status-indicator { font-size: 0.8rem; font-weight: 700; color: #64748b; display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
.deuda-activa .dot { width: 8px; height: 8px; background: #e11d48; border-radius: 50%; }

.resumen-grid { display: grid; grid-template-columns: 280px 1fr; gap: 25px; }

.activity-panel { display: flex; flex-direction: column; gap: 15px; }
.stat-box { padding: 20px !important; text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

.items-panel { padding: 25px !important; }
.panel-header { margin-bottom: 20px; }
.table-resumen { width: 100%; border-collapse: collapse; }
.table-resumen th { text-align: left; padding-bottom: 10px; color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; }
.table-resumen td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }

.prod-name { font-weight: 600; color: #475569; }
.actions-footer { grid-column: span 2; display: flex; justify-content: space-between; margin-top: 25px; }

.btn-pay { background: #10b981; color: white; border: none; padding: 14px 25px; border-radius: 10px; font-weight: bold; cursor: pointer; }
.btn-back { background: white; border: 1px solid #e2e8f0; padding: 14px 25px; border-radius: 10px; cursor: pointer; }

/* Loader */
.loading-state { text-align: center; padding: 100px; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1e293b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
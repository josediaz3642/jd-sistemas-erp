<template>
  <div class="dashboard-container">
    <header class="db-header">
      <div class="header-content">
        <h1>Bienvenido, {{ usuario?.nombre || 'Usuario' }}</h1>
        <p class="subtitle">Estado actual de tu empresa.</p>
      </div>
      <div class="date-badge">{{ fechaActual }}</div>
    </header>

    <div v-if="loading" class="loader-container glass-card">
      <div class="spinner"></div>
      <p>Consultando base de datos...</p>
    </div>

    <template v-else>
      <div class="kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-icon blue">💰</div>
          <div class="kpi-data">
            <span>Total Facturado</span>
            <h3>${{ (kpis?.totalFacturado || 0).toLocaleString() }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon green">📄</div>
          <div class="kpi-data">
            <span>Comprobantes</span>
            <h3>{{ kpis?.totalFacturas || 0 }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon purple">👥</div>
          <div class="kpi-data">
            <span>Clientes Activos</span>
            <h3>{{ kpis?.totalClientes || 0 }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card" :class="{ 'warning-border': (kpis?.stockBajo || 0) > 0 }">
          <div class="kpi-icon orange">📦</div>
          <div class="kpi-data">
            <span>Stock Crítico</span>
            <h3 :class="{ 'text-danger': (kpis?.stockBajo || 0) > 0 }">{{ kpis?.stockBajo || 0 }} items</h3>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="quick-actions-container">
          <h3>Acceso Rápido</h3>
          <div class="quick-actions">
            <button @click="$router.push('/facturacion')" class="action-btn primary">+ Nueva Venta</button>
            <button @click="$router.push('/stock')" class="action-btn">📦 Stock</button>
            <button @click="$router.push('/clientes')" class="action-btn">👥 Clientes</button>
          </div>
        </div>

        <div class="recent-activity glass-card">
          <div class="section-header">
            <h3>Últimas Facturas</h3>
          </div>
          <div class="table-wrapper">
            <table class="db-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in ultimasFacturas" :key="f.id">
                  <td class="font-mono">#{{ String(f.numero_factura || f.numero || 0).slice(-4) }}</td>
                  <td class="text-truncate">{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
                  <td class="font-bold">${{ Number(f.total || 0).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardKPIs, getFacturas, getClientes } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

// 1. Definimos las variables con valores iniciales seguros
const usuario = ref(null);
const loading = ref(true);
const clientes = ref([]);
const ultimasFacturas = ref([]);
const kpis = ref({ 
  totalFacturado: 0, 
  totalFacturas: 0, 
  totalClientes: 0, 
  stockBajo: 0 
});

const fechaActual = new Date().toLocaleDateString('es-AR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// 2. Lógica de carga
async function refreshDashboard() {
  loading.value = true;
  try {
    const [resKPIs, resFacturas, resClientes] = await Promise.all([
      getDashboardKPIs(),
      getFacturas(),
      getClientes()
    ]);

    kpis.value = resKPIs || kpis.value;
    clientes.value = resClientes || [];
    ultimasFacturas.value = (resFacturas || [])
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  usuario.value = getCurrentUser();
  await refreshDashboard();
});

function getNombreCliente(id) {
  if (!id) return 'Consumidor Final';
  const c = clientes.value.find(x => x.id === id);
  return c ? c.nombre : '...';
}
</script>

<style scoped>
/* Pegar aquí los mismos estilos del mensaje anterior */
.dashboard-container { padding: 20px; max-width: 1400px; margin: auto; display: flex; flex-direction: column; gap: 20px; }
.db-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; }
.db-header h1 { font-size: 1.6rem; font-weight: 800; color: #0f172a; }
.glass-card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; }
.kpi-card { padding: 18px; display: flex; align-items: center; gap: 15px; }
.kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
.blue { background: #eff6ff; color: #2563eb; }
.green { background: #f0fdf4; color: #16a34a; }
.purple { background: #faf5ff; color: #9333ea; }
.orange { background: #fff7ed; color: #ea580c; }
.charts-section { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
.quick-actions-container h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 15px; text-transform: uppercase; }
.quick-actions { display: grid; grid-template-columns: 1fr; gap: 10px; }
.action-btn { padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 700; text-align: left; }
.action-btn.primary { background: #2563eb; color: white; border: none; }
.recent-activity { padding: 20px; }
.table-wrapper { overflow-x: auto; }
.db-table { width: 100%; border-collapse: collapse; min-width: 400px; }
.db-table td { padding: 14px 8px; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
.text-truncate { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.loader-container { padding: 40px; text-align: center; color: #64748b; }
.spinner { border: 3px solid #f3f3f3; border-top: 3px solid #2563eb; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .charts-section { display: flex; flex-direction: column-reverse; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
}
</style>
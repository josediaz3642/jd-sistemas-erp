<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getDashboardKPIs, getFacturas, getClientes } from '@/services/data';

const authStore = useAuthStore();
const loading = ref(true);
const clientes = ref([]);
const ultimasFacturas = ref([]);
const kpis = ref({ totalFacturado: 0, totalFacturas: 0, totalClientes: 0, stockBajo: 0 });

const fechaActual = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getNombreCliente = (id) => {
  const cliente = clientes.value.find(c => c.id === id);
  return cliente ? cliente.nombre : 'Cliente Desconocido';
};

async function refreshDashboard() {
  loading.value = true;
  try {
    const [resKPIs, resFacturas, resClientes] = await Promise.all([
      getDashboardKPIs(), getFacturas(), getClientes()
    ]);
    kpis.value = resKPIs || kpis.value;
    clientes.value = resClientes || [];
    if (resFacturas) {
      ultimasFacturas.value = [...resFacturas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    }
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  console.log("Dashboard cargado para:", authStore.user?.email);
  await refreshDashboard();
});
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="db-header">
      <div>
        <h1 class="db-title">
          Hola, <span class="gradient-text">{{ authStore.user?.email.split('@')[0] || 'Usuario' }}</span>
        </h1>
        <p class="db-subtitle">Estado actual de tu empresa.</p>
      </div>
      <div class="date-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {{ fechaActual }}
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="loader-box">
      <div class="spinner-lg"></div>
      <p>Consultando base de datos...</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">Total Facturado</span>
            <h3 class="kpi-value">${{ (kpis.totalFacturado || 0).toLocaleString() }}</h3>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">Comprobantes</span>
            <h3 class="kpi-value">{{ kpis.totalFacturas || 0 }}</h3>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">Clientes Activos</span>
            <h3 class="kpi-value">{{ kpis.totalClientes || 0 }}</h3>
          </div>
        </div>

        <div class="kpi-card" :class="{ 'kpi-alert': (kpis.stockBajo || 0) > 0 }">
          <div class="kpi-icon kpi-orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">Stock Crítico</span>
            <h3 class="kpi-value" :class="{ 'text-danger': (kpis.stockBajo || 0) > 0 }">{{ kpis.stockBajo || 0 }} items</h3>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Quick Actions -->
        <div class="quick-panel">
          <h3 class="panel-title">Acceso Rápido</h3>
          <div class="quick-actions">
            <button @click="$router.push('/facturacion')" class="qa-btn qa-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Venta
            </button>
            <button @click="$router.push('/stock')" class="qa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Inventario
            </button>
            <button @click="$router.push('/clientes')" class="qa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Clientes
            </button>
            <button @click="$router.push('/cheques')" class="qa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Cheques
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-panel">
          <h3 class="panel-title">Últimas Facturas</h3>
          <div class="table-wrapper">
            <table class="db-table">
              <thead>
                <tr><th>Nº</th><th>Cliente</th><th>Total</th></tr>
              </thead>
              <tbody>
                <tr v-for="f in ultimasFacturas" :key="f.id">
                  <td class="font-mono td-num">#{{ String(f.numero_factura || f.numero || 0).slice(-4) }}</td>
                  <td class="td-name">{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
                  <td class="font-mono td-total">${{ Number(f.total || 0).toLocaleString() }}</td>
                </tr>
                <tr v-if="ultimasFacturas.length === 0">
                  <td colspan="3" class="empty-row">Sin facturas recientes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.db-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.db-title { font-size: 1.6rem; font-weight: 900; color: var(--cs-text-primary); }
.gradient-text { background: var(--cs-gradient-brand); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.db-subtitle { font-size: 0.85rem; color: var(--cs-text-muted); margin-top: 2px; }

.date-badge {
  display: flex; align-items: center; gap: 8px;
  background: var(--cs-bg-primary); padding: 8px 16px;
  border-radius: var(--cs-radius-full); font-size: 0.8rem;
  color: var(--cs-text-secondary); font-weight: 600;
  border: 1px solid var(--cs-border-soft);
}

/* KPIs */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.kpi-card {
  background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg); padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: var(--cs-shadow-sm); transition: all var(--cs-transition);
}
.kpi-card:hover { box-shadow: var(--cs-shadow-md); transform: translateY(-2px); }
.kpi-alert { border-left: 3px solid var(--cs-warning); }

.kpi-icon {
  width: 48px; height: 48px; border-radius: var(--cs-radius-lg);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-blue   { background: rgba(99,102,241,0.1); color: var(--cs-brand-500); }
.kpi-green  { background: rgba(22,163,106,0.1);  color: var(--cs-success); }
.kpi-purple { background: rgba(147,51,234,0.1);  color: #9333ea; }
.kpi-orange { background: rgba(234,88,12,0.1);   color: #ea580c; }

.kpi-label { font-size: var(--cs-text-xs); color: var(--cs-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
.kpi-value { font-size: 1.3rem; font-weight: 900; color: var(--cs-text-primary); margin-top: 2px; }
.text-danger { color: var(--cs-error) !important; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }

.quick-panel, .recent-panel {
  background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg); padding: 20px;
  box-shadow: var(--cs-shadow-sm);
}

.panel-title { font-size: 0.75rem; color: var(--cs-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 16px; }

.quick-actions { display: grid; gap: 8px; }

.qa-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-radius: var(--cs-radius-md);
  border: 1px solid var(--cs-border-soft); background: var(--cs-bg-secondary);
  cursor: pointer; font-weight: 600; font-size: 0.85rem;
  color: var(--cs-text-primary); transition: all var(--cs-transition);
  text-align: left; font-family: var(--cs-font-sans);
}
.qa-btn:hover { background: var(--cs-bg-tertiary); border-color: var(--cs-border-medium); transform: translateY(-1px); }
.qa-btn.qa-primary { background: var(--cs-gradient-brand); color: white; border: none; box-shadow: 0 4px 12px rgba(79,70,229,0.25); }
.qa-btn.qa-primary:hover { box-shadow: 0 6px 16px rgba(79,70,229,0.35); }

.table-wrapper { overflow-x: auto; }
.db-table { width: 100%; border-collapse: collapse; }
.db-table th { text-align: left; font-size: 0.7rem; color: var(--cs-text-muted); text-transform: uppercase; padding: 10px 8px; border-bottom: 2px solid var(--cs-border-soft); font-weight: 700; }
.db-table td { padding: 12px 8px; border-bottom: 1px solid var(--cs-border-soft); font-size: 0.85rem; }
.td-num { color: var(--cs-text-muted); font-size: 0.8rem; }
.td-name { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
.td-total { font-weight: 800; color: var(--cs-text-primary); }
.empty-row { text-align: center; color: var(--cs-text-muted); font-size: 0.8rem; padding: 24px !important; }

.loader-box { text-align: center; padding: 60px; color: var(--cs-text-muted); }
.spinner-lg { border: 3px solid var(--cs-border-soft); border-top: 3px solid var(--cs-brand-500); border-radius: 50%; width: 36px; height: 36px; animation: cs-spin 1s linear infinite; margin: 0 auto 16px; }

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 500px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
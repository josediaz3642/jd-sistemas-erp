<template>
  <div class="dashboard-container">
    <header class="db-header">
      <div>
        <h1>Bienvenido, {{ usuario?.nombre || 'Usuario' }}</h1>
        <p class="subtitle">Este es el estado actual de tu empresa en la nube.</p>
      </div>
      <div class="date-badge">{{ fechaActual }}</div>
    </header>

    <div v-if="loading" class="text-center p-10 glass-card">
      <p>Consultando base de datos...</p>
    </div>

    <template v-else>
      <div class="kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-icon blue">💰</div>
          <div class="kpi-data">
            <span>Total Facturado</span>
            <h3>${{ kpis.totalFacturado.toLocaleString() }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon green">📄</div>
          <div class="kpi-data">
            <span>Comprobantes</span>
            <h3>{{ kpis.totalFacturas }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon purple">👥</div>
          <div class="kpi-data">
            <span>Clientes Activos</span>
            <h3>{{ kpis.totalClientes }}</h3>
          </div>
        </div>

        <div class="kpi-card glass-card" :class="{ 'warning-border': kpis.stockBajo > 0 }">
          <div class="kpi-icon orange">📦</div>
          <div class="kpi-data">
            <span>Stock Crítico</span>
            <h3 :class="{ 'text-danger': kpis.stockBajo > 0 }">{{ kpis.stockBajo }} items</h3>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="recent-activity glass-card">
          <h3>Últimas Facturas Emitidas</h3>
          <table class="db-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in ultimasFacturas" :key="f.id">
                <td>#{{ String(f.numero_factura || f.numero || 0).padStart(8, '0') }}</td>
                <td>{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
                <td class="font-bold">${{ Number(f.total).toLocaleString() }}</td>
                <td><span class="status-pill">{{ f.estado || 'Emitida' }}</span></td>
              </tr>
              <tr v-if="ultimasFacturas.length === 0">
                <td colspan="4" class="text-center p-4 text-gray-400">No hay ventas registradas aún.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="quick-actions">
          <button @click="$router.push('/facturacion')" class="action-btn primary">
            + Nueva Venta
          </button>
          <button @click="$router.push('/stock')" class="action-btn">
            Gestionar Stock
          </button>
          <button @click="$router.push('/clientes')" class="action-btn">
            Ver Clientes
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardKPIs, getFacturas, getClientes } from '@/services/data';
import { getCurrentUser } from '@/services/auth';

const usuario = ref(null);
const loading = ref(true);
const kpis = ref({ totalFacturado: 0, totalFacturas: 0, totalClientes: 0, stockBajo: 0 });
const ultimasFacturas = ref([]);
const clientes = ref([]);
const fechaActual = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

onMounted(async () => {
  usuario.value = getCurrentUser();
  await refreshDashboard();
});

async function refreshDashboard() {
  loading.value = true;
  try {
    // Ejecutamos todas las consultas en paralelo para ganar velocidad
    const [resKPIs, resFacturas, resClientes] = await Promise.all([
      getDashboardKPIs(),
      getFacturas(),
      getClientes()
    ]);

    kpis.value = resKPIs;
    clientes.value = resClientes;
    
    // Supabase ya devuelve las facturas ordenadas si lo configuramos en data.js,
    // pero por seguridad nos aseguramos de tomar las últimas 5 aquí.
    ultimasFacturas.value = (resFacturas || [])
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);

  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    loading.value = false;
  }
}

function getNombreCliente(id) {
  if (!id) return 'Consumidor Final';
  const c = clientes.value.find(x => x.id === id);
  return c ? c.nombre : 'Cargando...';
}
</script>

<style scoped>
/* Los estilos se mantienen igual, solo agregué un par de ajustes de visibilidad */
.dashboard-container { padding: 20px; display: flex; flex-direction: column; gap: 30px; }
.db-header h1 { font-size: 1.8rem; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-top: 5px; }
.date-badge { background: #fff; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; color: #2563eb; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.05); width: fit-content; margin-top: 10px; }

.glass-card { 
  background: white; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.kpi-card { padding: 20px; display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
.kpi-card:hover { transform: translateY(-5px); }
.kpi-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

.blue { background: #eff6ff; color: #2563eb; }
.green { background: #f0fdf4; color: #16a34a; }
.purple { background: #faf5ff; color: #9333ea; }
.orange { background: #fff7ed; color: #ea580c; }

.kpi-data span { font-size: 0.85rem; color: #64748b; }
.kpi-data h3 { font-size: 1.4rem; margin: 0; color: #1e293b; }

.charts-section { display: grid; grid-template-columns: 1fr 250px; gap: 20px; }
@media (max-width: 768px) {
  .charts-section { grid-template-columns: 1fr; }
}

.recent-activity { padding: 20px; overflow-x: auto; }
.db-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.db-table th { text-align: left; font-size: 0.8rem; color: #64748b; padding: 10px; border-bottom: 1px solid #f1f5f9; }
.db-table td { padding: 12px 10px; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }

.status-pill { background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
.warning-border { border: 2px solid #fed7aa !important; }
.text-danger { color: #ef4444; }

.quick-actions { display: flex; flex-direction: column; gap: 10px; }
.action-btn { padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; color: #475569; transition: all 0.2s; text-align: center; }
.action-btn.primary { background: #1e293b; color: white; border: none; }
.action-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
</style>
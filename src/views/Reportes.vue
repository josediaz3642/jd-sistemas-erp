<template>
  <div class="page-container">
    <div class="header-section">
      <h1>Panel de Reportes</h1>
      <p>Métricas de rendimiento de JD Sistemasinformáticos</p>
    </div>

    <div v-if="loading" class="loading-state">Calculando métricas...</div>

    <div v-else class="dashboard-grid">
      <div class="metric-card">
        <span class="label">Ingresos Totales</span>
        <span class="value positive">$ {{ metricas.ingresos.toLocaleString() }}</span>
      </div>

      <div class="metric-card">
        <span class="label">Egresos Totales</span>
        <span class="value negative">$ {{ metricas.egresos.toLocaleString() }}</span>
      </div>

      <div class="metric-card balance">
        <span class="label">Balance Neto</span>
        <span class="value" :class="metricas.balance >= 0 ? 'positive' : 'negative'">
          $ {{ metricas.balance.toLocaleString() }}
        </span>
      </div>

      <div class="details-card full-width">
        <h3>Resumen Operativo</h3>
        <div class="info-row">
          <span>Facturas Emitidas:</span>
          <strong>{{ metricas.totalFacturas }}</strong>
        </div>
        <div class="info-row">
          <span>Período consultado:</span>
          <strong>Últimos 30 días</strong>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="imprimirReporte">Imprimir Informe</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getMetricasReportes } from "@/services/data";

const loading = ref(true);
const metricas = ref({
  ingresos: 0,
  egresos: 0,
  balance: 0,
  totalFacturas: 0
});
const imprimirReporte = () => {
  // Verificamos que window exista (estándar de seguridad)
  if (typeof window !== 'undefined') {
    window.print();
  } else {
    console.error("El navegador no soporta la función de impresión directa.");
  }
};
onMounted(async () => {
  try {
    const data = await getMetricasReportes();
    metricas.value = data;
  } catch (error) {
    console.error("Error al cargar reportes:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-container { padding: 30px; max-width: 1200px; margin: auto; }
.header-section { margin-bottom: 30px; border-left: 4px solid #2563eb; padding-left: 20px; }
.header-section h1 { font-size: 2rem; margin: 0; color: #1e293b; }

.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }

.metric-card { 
  background: white; padding: 25px; border-radius: 12px; 
  border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}

.label { font-size: 0.85rem; color: #64748b; text-transform: uppercase; font-weight: 600; }
.value { font-size: 1.8rem; font-weight: bold; margin-top: 10px; }
.positive { color: #10b981; }
.negative { color: #ef4444; }

.full-width { grid-column: 1 / -1; }
.details-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }

.btn-print { 
  margin-top: 30px; padding: 12px 24px; border-radius: 8px; 
  background: #1e293b; color: white; border: none; cursor: pointer; font-weight: 600;
}
@media print {
  /* Escondemos lo que no queremos en papel */
  .sidebar, .nav-tabs, .btn-primary, .no-print, header {
    display: none !important;
  }

  /* Ajustamos el contenedor principal */
  .report-container {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    box-shadow: none !important;
  }

  /* Forzamos que los gráficos o tablas ocupen el ancho total */
  .stats-grid {
    display: block !important;
  }
  
  .stat-card {
    border: 1px solid #eee !important;
    margin-bottom: 10px !important;
    page-break-inside: avoid;
  }
}
</style>
<template>
  <div class="reportes-container">
    <header class="page-header">
      <div>
        <h2>📊 Reportes y Estadísticas</h2>
        <p class="subtitle">Análisis de rendimiento y salud financiera del negocio.</p>
      </div>
      <div class="periodo-selector">
        <select v-model="periodo" @change="cargarReportes" class="select-moderno">
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Este Año</option>
        </select>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card glass-card border-blue">
        <span class="label">Ingresos Totales</span>
        <h3 v-if="!loading">${{ métricas.ingresos.toLocaleString() }}</h3>
        <div v-else class="skeleton-text"></div>
      </div>
      <div class="kpi-card glass-card border-red">
        <span class="label">Egresos Totales</span>
        <h3 v-if="!loading">${{ métricas.egresos.toLocaleString() }}</h3>
        <div v-else class="skeleton-text"></div>
      </div>
      <div class="kpi-card glass-card" :class="utilidadClase">
        <span class="label">Utilidad Neta</span>
        <h3 v-if="!loading">${{ (métricas.ingresos - métricas.egresos).toLocaleString() }}</h3>
        <div v-else class="skeleton-text"></div>
      </div>
      <div class="kpi-card glass-card border-purple">
        <span class="label">Margen Operativo</span>
        <h3 v-if="!loading">{{ margen }}%</h3>
        <div v-else class="skeleton-text"></div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container glass-card">
        <h4>📦 Gastos por Categoría</h4>
        <div v-if="loading" class="loader-box">Analizando categorías...</div>
        <div v-else-if="métricas.gastosPorCategoria.length === 0" class="empty-state">
          No hay datos de egresos para este período.
        </div>
        <div v-else class="list-data">
          <div v-for="g in métricas.gastosPorCategoria" :key="g.categoria" class="data-item">
            <span class="cat-name">{{ g.categoria || 'Sin Categoría' }}</span>
            <div class="bar-bg">
              <div class="bar-fill" :style="{ width: g.porcentaje + '%' }"></div>
            </div>
            <span class="cat-val">${{ g.monto.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="chart-container glass-card">
        <h4>🏆 Top 5 Productos (Volumen)</h4>
        <div v-if="loading" class="loader-box">Calculando rankings...</div>
        <table v-else class="simple-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cant.</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in métricas.topProductos" :key="p.id">
              <td>{{ p.nombre }}</td>
              <td class="text-right">{{ p.cantidad }}</td>
              <td class="text-right font-bold">${{ p.total.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMetricasReportes } from '@/services/data';

const periodo = ref("30");
const loading = ref(true);
const métricas = ref({
  ingresos: 0,
  egresos: 0,
  gastosPorCategoria: [],
  topProductos: []
});

onMounted(() => {
  cargarReportes();
});

const cargarReportes = async () => {
  loading.value = true;
  try {
    // getMétricasReportes consulta vistas agregadas en Supabase
   const data = await getMetricasReportes(periodo.value);
    métricas.value = data;
  } catch (error) {
    console.error("Error al generar reportes:", error);
  } finally {
    loading.value = false;
  }
};

const margen = computed(() => {
  if (métricas.value.ingresos === 0) return 0;
  const util = métricas.value.ingresos - métricas.value.egresos;
  return ((util / métricas.value.ingresos) * 100).toFixed(1);
});

const utilidadClase = computed(() => {
  const util = métricas.value.ingresos - métricas.value.egresos;
  return util >= 0 ? 'border-green text-green' : 'border-red text-red';
});
</script>

<style scoped>
.reportes-container { padding: 25px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.select-moderno { padding: 10px 15px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-weight: 600; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
.kpi-card { padding: 25px; border-left: 5px solid #cbd5e1; }
.kpi-card .label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.kpi-card h3 { font-size: 1.8rem; margin-top: 10px; color: #1e293b; }

.border-blue { border-left-color: #3b82f6; }
.border-red { border-left-color: #ef4444; }
.border-green { border-left-color: #10b981; }
.border-purple { border-left-color: #8b5cf6; }

.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
.chart-container { padding: 25px; min-height: 350px; }
.chart-container h4 { margin-bottom: 20px; color: #475569; font-size: 1.1rem; }

/* Mini barras de categoría */
.list-data { display: flex; flex-direction: column; gap: 15px; }
.data-item { display: grid; grid-template-columns: 120px 1fr 100px; align-items: center; gap: 15px; }
.cat-name { font-size: 0.85rem; font-weight: 600; color: #475569; }
.bar-bg { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.bar-fill { height: 100%; background: #3b82f6; border-radius: 10px; }
.cat-val { font-size: 0.9rem; font-weight: 700; text-align: right; }

.simple-table { width: 100%; border-collapse: collapse; }
.simple-table th { text-align: left; font-size: 0.75rem; color: #94a3b8; padding-bottom: 10px; text-transform: uppercase; }
.simple-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }

.loader-box { display: flex; align-items: center; justify-content: center; height: 200px; color: #94a3b8; font-style: italic; }
.skeleton-text { height: 30px; background: #f1f5f9; border-radius: 5px; margin-top: 10px; animation: pulse 1.5s infinite; }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
</style>
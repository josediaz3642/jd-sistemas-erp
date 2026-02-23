<template>
  <div class="reportes-container">
    <header class="page-header">
      <h2>📈 Reporte de Utilidad</h2>
      <p>Análisis de rentabilidad basado en ventas y costos de mercadería.</p>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card glass-card">
        <span class="label">Ventas Totales</span>
        <h2 class="valor text-blue">${{ stats.ventas.toLocaleString() }}</h2>
      </div>
      <div class="kpi-card glass-card">
        <span class="label">Costo de Mercadería</span>
        <h2 class="valor text-red">-${{ stats.costos.toLocaleString() }}</h2>
      </div>
      <div class="kpi-card glass-card highlight">
        <span class="label">Utilidad Bruta</span>
        <h2 class="valor text-green">${{ stats.utilidad.toLocaleString() }}</h2>
      </div>
    </div>

    <div class="detalle-section glass-card">
      <h3>Rentabilidad por Producto</h3>
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant. Vendida</th>
            <th>Ingresos</th>
            <th>Costos</th>
            <th>Ganancia</th>
            <th>Margen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reporteProductos" :key="item.id">
            <td>{{ item.nombre }}</td>
            <td>{{ item.cantidad }}</td>
            <td>${{ item.ingresos.toLocaleString() }}</td>
            <td>${{ item.costos.toLocaleString() }}</td>
            <td class="font-bold text-green">${{ item.ganancia.toLocaleString() }}</td>
            <td>
              <span class="badge-margen">{{ item.margen }}%</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFacturas, getStockItems } from '@/services/data';

const facturas = ref([]);
const productos = ref([]);

onMounted(() => {
  facturas.value = getFacturas().filter(f => f.estado !== 'ANULADA');
  productos.value = getStockItems();
});

const reporteProductos = computed(() => {
  const mapa = {};

  // Procesar cada factura para agrupar ventas por producto
  facturas.value.forEach(f => {
    f.items.forEach(item => {
      if (!mapa[item.id]) {
        const infoProd = productos.value.find(p => p.id === item.id);
        mapa[item.id] = {
          nombre: item.nombre,
          cantidad: 0,
          ingresos: 0,
          costos: 0,
          costoUnitario: infoProd ? (infoProd.costo || 0) : 0
        };
      }
      mapa[item.id].cantidad += item.cantidad;
      mapa[item.id].ingresos += (item.precio * item.cantidad);
      mapa[item.id].costos += (mapa[item.id].costoUnitario * item.cantidad);
    });
  });

  // Convertir mapa a array y calcular ganancias
  return Object.values(mapa).map(p => {
    const ganancia = p.ingresos - p.costos;
    const margen = p.ingresos > 0 ? ((ganancia / p.ingresos) * 100).toFixed(1) : 0;
    return { ...p, ganancia, margen };
  }).sort((a, b) => b.ganancia - a.ganancia);
});

const stats = computed(() => {
  const ventas = reporteProductos.value.reduce((acc, p) => acc + p.ingresos, 0);
  const costos = reporteProductos.value.reduce((acc, p) => acc + p.costos, 0);
  return {
    ventas,
    costos,
    utilidad: ventas - costos
  };
});
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card .label { font-size: 0.85rem; color: #64748b; font-weight: 600; }
.kpi-card .valor { margin-top: 10px; font-size: 1.8rem; }
.highlight { border-bottom: 4px solid #10b981; }

.text-blue { color: #2563eb; }
.text-red { color: #ef4444; }
.text-green { color: #10b981; }

.badge-margen {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #475569;
}

.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; padding: 12px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.8rem; }
.table-moderna td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
</style>
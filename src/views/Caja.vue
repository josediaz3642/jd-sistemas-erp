<template>
  <div class="caja-container">
    <header class="header-caja">
      <div>
        <h1>🏦 Control de Caja</h1>
        <p class="text-gray">Gestiona el efectivo y flujo de fondos (Nube)</p>
      </div>
      <div class="saldo-total">
        <span class="label">Saldo Actual</span>
        <h2 :class="saldoCalculado >= 0 ? 'pos' : 'neg'">${{ saldoCalculado.toLocaleString() }}</h2>
      </div>
    </header>

    <div class="stats-visual card">
      <div class="flex-between">
        <span class="text-sm font-bold">Flujo de Fondos (Movimientos Recientes)</span>
        <span class="text-xs text-gray">{{ movimientos.length }} operaciones</span>
      </div>
      <div class="progress-bar-container">
        <div class="bar ingreso" :style="{ width: porcentajeIngresos + '%' }"></div>
        <div class="bar egreso" :style="{ width: (100 - porcentajeIngresos) + '%' }"></div>
      </div>
      <div class="flex-between mt-2">
        <span class="text-ingreso">● Ingresos: ${{ totalIngresos.toLocaleString() }}</span>
        <span class="text-egreso">● Egresos: ${{ totalEgresos.toLocaleString() }}</span>
      </div>
    </div>

    <div class="movimientos-section card">
      <div class="table-header">
        <h3>Historial de Movimientos</h3>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Categoría</th>
              <th class="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in movimientos" :key="mov.id">
              <td class="text-sm">{{ formatDate(mov.fecha) }}</td>
              <td>
                <div class="concepto">{{ mov.concepto }}</div>
              </td>
              <td><span class="cat-badge">{{ mov.categoria || 'General' }}</span></td>
              <td :class="['text-right font-bold', mov.tipo.toLowerCase() === 'ingreso' ? 'text-ingreso' : 'text-egreso']">
                {{ mov.tipo.toLowerCase() === 'ingreso' ? '+' : '-' }} ${{ Math.abs(mov.monto).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="movimientos.length === 0" class="p-8 text-center text-gray-400">
          No hay movimientos registrados en la nube.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase'; // Importamos directo para consultas rápidas

const movimientos = ref([]);

onMounted(async () => {
  // Consultamos los movimientos directamente de la tabla 'caja' en Supabase
  const { data, error } = await supabase
    .from('caja')
    .select('*')
    .order('fecha', { ascending: false });

  if (!error) {
    movimientos.value = data;
  }
});

const totalIngresos = computed(() => {
  return movimientos.value
    .filter(m => m.tipo.toLowerCase() === 'ingreso')
    .reduce((acc, m) => acc + Number(m.monto), 0);
});

const totalEgresos = computed(() => {
  return movimientos.value
    .filter(m => m.tipo.toLowerCase() === 'egreso')
    .reduce((acc, m) => acc + Number(m.monto), 0);
});

const saldoCalculado = computed(() => {
  return totalIngresos.value - totalEgresos.value;
});

const porcentajeIngresos = computed(() => {
  const total = totalIngresos.value + totalEgresos.value;
  return total === 0 ? 50 : (totalIngresos.value / total) * 100;
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
<template>
  <div class="caja-container">
    <header class="page-header">
      <h2>🏦 Control de Caja y Finanzas</h2>
      <p>Resumen de entradas y salidas de dinero.</p>
    </header>

    <div class="caja-grid">
      <div class="saldos-column">
        <div class="card-saldo glass-card">
          <span class="label">Efectivo en Caja</span>
          <h2 :class="saldos.efectivo >= 0 ? 'text-green' : 'text-red'">
            ${{ saldos.efectivo.toLocaleString() }}
          </h2>
        </div>
        <div class="card-saldo glass-card">
          <span class="label">Banco / Transferencias</span>
          <h2 class="text-blue">${{ saldos.banco.toLocaleString() }}</h2>
        </div>
        <div class="card-saldo glass-card">
          <span class="label">Cheques a Depositar</span>
          <h2 class="text-purple">${{ saldos.cheques.toLocaleString() }}</h2>
        </div>
      </div>

      <div class="movimientos-column glass-card">
        <h3>Últimos Movimientos</h3>
        <table class="table-moderna">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Método</th>
              <th class="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimientos" :key="m.id">
              <td>{{ formatDate(m.fecha) }}</td>
              <td>
                <span :class="['tipo-dot', m.tipo.toLowerCase()]"></span>
                {{ m.concepto }}
              </td>
              <td><span class="metodo-tag">{{ m.metodo }}</span></td>
              <td :class="['text-right', 'font-bold', m.tipo === 'INGRESO' ? 'text-green' : 'text-red']">
                {{ m.tipo === 'INGRESO' ? '+' : '' }}{{ m.monto.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMovimientosCaja } from '@/services/data';

const movimientos = ref([]);

onMounted(() => {
  movimientos.value = getMovimientosCaja();
});

const saldos = computed(() => {
  return movimientos.value.reduce((acc, m) => {
    const monto = Number(m.monto);
    if (m.metodo === 'Efectivo') acc.efectivo += monto;
    else if (m.metodo === 'Transferencia') acc.banco += monto;
    else if (m.metodo === 'Cheque') acc.cheques += Math.abs(monto); // Los cheques siempre suman a la cartera
    return acc;
  }, { efectivo: 0, banco: 0, cheques: 0 });
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.caja-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.saldos-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-saldo {
  padding: 20px;
}

.card-saldo .label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.text-blue { color: #3b82f6; }
.text-purple { color: #8b5cf6; }

.metodo-tag {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #475569;
}

.tipo-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.tipo-dot.ingreso { background: #10b981; }
.tipo-dot.egreso { background: #ef4444; }

.table-moderna {
  width: 100%;
  margin-top: 20px;
}
</style>
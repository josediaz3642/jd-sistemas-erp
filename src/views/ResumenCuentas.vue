<template>
  <div class="page">
    <div class="card-glass header">
      <h1>Resumen de Cuenta Corriente</h1>
      <select v-model="clienteSeleccionado" @change="cargarMovimientos" class="select-cliente">
        <option value="">Seleccione un cliente...</option>
        <option v-for="c in clientes" :key="c.id" :value="c.id">
          {{ c.nombre }} (Saldo: ${{ c.saldo?.toLocaleString() }})
        </option>
      </select>
    </div>

    <div class="card-glass" v-if="clienteSeleccionado">
      <div v-if="loading" class="text-center p-4">Cargando movimientos...</div>
      <table v-else-if="movimientos.length > 0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Concepto</th>
            <th>Debe</th>
            <th>Haber</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movimientos" :key="m.id">
            <td>{{ new Date(m.fecha).toLocaleDateString() }}</td>
            <td><span class="badge">{{ m.tipo }}</span></td>
            <td>{{ m.concepto }}</td>
            <td class="text-red">{{ formatearMoneda(m.debe) }}</td>
            <td class="text-green">{{ formatearMoneda(m.haber) }}</td>
            <td class="font-bold" :class="m.saldoAcumulado > 0 ? 'text-red' : 'text-green'">
              ${{ m.saldoAcumulado.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">No hay movimientos registrados para este cliente.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getClientes, getNotasByCliente, getFacturasCliente, getPagosCliente } from '@/services/data';

const clientes = ref([]);
const clienteSeleccionado = ref('');
const movimientos = ref([]);
const loading = ref(false);

onMounted(async () => {
  clientes.value = await getClientes();
});

async function cargarMovimientos() {
  if (!clienteSeleccionado.value) return;
  loading.value = true;

  try {
    const [notas, facturas, pagos] = await Promise.all([
      getNotasByCliente(clienteSeleccionado.value),
      getFacturasCliente(clienteSeleccionado.value),
      getPagosCliente(clienteSeleccionado.value)
    ]);

    const historial = [
      ...facturas.map(f => ({
        id: f.id,
        fecha: f.fecha,
        tipo: 'FAC',
        concepto: `Factura N° ${f.numero}`,
        debe: Number(f.total) || 0,
        haber: 0
      })),
      ...pagos.map(p => ({
        id: p.id,
        fecha: p.fecha,
        tipo: 'PAGO',
        concepto: p.concepto || 'Pago recibido',
        debe: 0,
        haber: Number(p.monto) || 0
      })),
      ...notas.map(n => ({
        id: n.id,
        fecha: n.fecha,
        tipo: n.tipo_comprobante,
        concepto: n.motivo,
        debe: n.tipo_comprobante === 'ND' ? Number(n.monto) : 0,
        haber: n.tipo_comprobante === 'NC' ? Number(n.monto) : 0
      }))
    ];

    historial.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    let saldoCorriente = 0;
    movimientos.value = historial.map(m => {
      saldoCorriente += (m.debe - m.haber);
      return { ...m, saldoAcumulado: saldoCorriente };
    });

    movimientos.value.reverse();
  } catch (error) {
    console.error("Error cargando cuenta corriente:", error);
  } finally {
    loading.value = false;
  }
}

function formatearMoneda(valor) {
  return valor > 0 ? `$${valor.toLocaleString()}` : '-';
}
</script>

<style scoped>
.page { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.card-glass { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.select-cliente { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 10px; }
.text-red { color: #e53e3e; }
.text-green { color: #38a169; }
.badge { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; color: #475569; }
table { width: 100%; border-collapse: collapse; margin-top: 15px; }
th { text-align: left; padding: 12px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.85rem; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
.font-bold { font-weight: bold; }
</style>
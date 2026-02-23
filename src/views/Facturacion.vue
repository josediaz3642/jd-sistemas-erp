<template>
  <div class="facturacion-container">
    <header class="page-header">
      <div>
        <h2>Historial de Facturación</h2>
        <p class="subtitle">Gestiona y visualiza tus comprobantes emitidos.</p>
      </div>
      <button @click="$router.push('/factura/nueva')" class="btn-nueva">+ Nueva Factura</button>
    </header>

    <div class="filters-bar glass-card">
      <input v-model="filtroBusqueda" type="text" placeholder="Buscar por cliente o número..." class="input-search">
      <select v-model="filtroEstado" class="input-select">
        <option value="">Todos los estados</option>
        <option value="EMITIDA">EMITIDA</option>
        <option value="ANULADA">ANULADA</option>
      </select>
    </div>

    <div class="table-container glass-card">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in facturasFiltradas" :key="f.id">
            <td>{{ f.fecha ? new Date(f.fecha).toLocaleDateString() : 'S/F' }}</td>
            <td class="font-mono">#{{ String(f.puntoVenta || 0).padStart(4, '0') }}-{{ String(f.numero || 0).padStart(8, '0') }}</td>
            <td>{{ getNombreCliente(f.clienteId) }}</td>
            <td class="font-bold">${{ (f.total || 0).toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', (f.estado || 'EMITIDA').toLowerCase()]">{{ f.estado || 'EMITIDA' }}</span>
            </td>
            <td class="text-right">
              <button @click="$router.push('/facturacion/' + f.id)" class="btn-action">
                👁️ Ver / Imprimir
              </button>
            </td>
          </tr>
          <tr v-if="facturasFiltradas.length === 0">
            <td colspan="6" class="text-center">No se encontraron facturas.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFacturas, getClientes } from '@/services/data';

const listaFacturas = ref([]);
const listaClientes = ref([]);
const filtroBusqueda = ref('');
const filtroEstado = ref('');

onMounted(() => {
  listaClientes.value = getClientes() || [];
  listaFacturas.value = getFacturas() || [];
});

function getNombreCliente(id) {
  if (!id) return 'Sin Cliente';
  const c = listaClientes.value.find(x => x.id === id);
  return c ? c.nombre : 'Cliente no encontrado';
}

const facturasFiltradas = computed(() => {
  if (!listaFacturas.value) return [];

  return listaFacturas.value.filter(f => {
    // Blindaje contra undefined:
    const nombreCliente = getNombreCliente(f.clienteId).toLowerCase();
    const numeroFactura = String(f.numero || '').toLowerCase();
    const busqueda = filtroBusqueda.value.toLowerCase();

    const cumpleBusqueda = nombreCliente.includes(busqueda) || numeroFactura.includes(busqueda);
    const cumpleEstado = filtroEstado.value === '' || f.estado === filtroEstado.value;
    
    return cumpleBusqueda && cumpleEstado;
  }).sort((a, b) => b.id - a.id);
});
</script>

<style scoped>
.facturacion-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.filters-bar { display: flex; gap: 15px; padding: 15px !important; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.input-search { flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.input-select { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; width: 200px; }
.table-container { overflow-x: auto; background: white; border-radius: 12px; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.85rem; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.status-badge.emitida { background: #dcfce7; color: #166534; }
.status-badge.anulada { background: #fee2e2; color: #991b1b; }
.btn-action { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.font-mono { font-family: monospace; color: #475569; font-weight: bold; }
</style>
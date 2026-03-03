<template>
  <div class="facturacion-container">
    <header class="page-header">
      <div>
        <h2>Historial de Facturación</h2>
        <p class="subtitle">Gestiona y visualiza tus comprobantes emitidos en tiempo real.</p>
      </div>
      <button @click="$router.push('/factura-nueva')" class="btn-nueva">+ Nueva Factura</button>
    </header>

    <div class="filters-bar glass-card">
      <input 
        v-model="filtroBusqueda" 
        type="text" 
        placeholder="Buscar por cliente o número..." 
        class="input-search"
      >
      <select v-model="filtroEstado" class="input-select">
        <option value="">Todos los estados</option>
        <option value="EMITIDA">EMITIDA</option>
        <option value="ANULADA">ANULADA</option>
      </select>
    </div>

    <div v-if="loading" class="loading-box glass-card">
      Cargando historial de facturas...
    </div>

    <div v-else class="table-container glass-card">
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
            <td class="font-mono">
              #{{ String(f.punto_venta || 0).padStart(4, '0') }}-{{ String(f.numero_factura || f.numero || 0).padStart(8, '0') }}
            </td>
            <td>{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
            <td class="font-bold text-blue-700">${{ Number(f.total || 0).toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', (f.estado || 'EMITIDA').toLowerCase()]">
                {{ f.estado || 'EMITIDA' }}
              </span>
            </td>
            <td class="text-right">
              <button @click="$router.push('/facturacion/' + f.id)" class="btn-action">
                👁️ Ver / Imprimir
              </button>
            </td>
          </tr>
          <tr v-if="facturasFiltradas.length === 0">
            <td colspan="6" class="text-center py-10 text-gray-400">
              No se encontraron facturas con esos criterios.
            </td>
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
const loading = ref(true);
const filtroBusqueda = ref('');
const filtroEstado = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    // Cargamos ambos en paralelo
    const [facturasData, clientesData] = await Promise.all([
      getFacturas(),
      getClientes()
    ]);
    
    listaFacturas.value = facturasData || [];
    listaClientes.value = clientesData || [];
  } catch (error) {
    console.error("Error cargando historial:", error);
  } finally {
    loading.value = false;
  }
});

function getNombreCliente(id) {
  if (!id) return 'Consumidor Final';
  const c = listaClientes.value.find(x => x.id === id);
  return c ? c.nombre : 'Cargando...';
}

const facturasFiltradas = computed(() => {
  if (!listaFacturas.value) return [];

  return listaFacturas.value.filter(f => {
    // Buscamos en el nombre guardado en la factura o el del cliente relacionado
    const nombreCliente = (f.cliente_nombre || getNombreCliente(f.cliente_id)).toLowerCase();
    const numeroFactura = String(f.numero_factura || f.numero || '').toLowerCase();
    const busqueda = filtroBusqueda.value.toLowerCase();

    const cumpleBusqueda = nombreCliente.includes(busqueda) || numeroFactura.includes(busqueda);
    const cumpleEstado = filtroEstado.value === '' || f.estado === filtroEstado.value;
    
    return cumpleBusqueda && cumpleEstado;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Orden por fecha descendente
});
</script>

<style scoped>
.facturacion-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { color: #64748b; margin-top: 4px; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-nueva:hover { background: #1d4ed8; }

.filters-bar { display: flex; gap: 15px; padding: 15px !important; margin-bottom: 20px; border: 1px solid #e2e8f0; background: white; }
.input-search { flex: 1; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.input-search:focus { border-color: #2563eb; }
.input-select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 220px; background: white; }

.loading-box { padding: 50px; text-align: center; color: #64748b; }
.table-container { overflow-x: auto; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }

.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
.status-badge.emitida { background: #dcfce7; color: #166534; }
.status-badge.anulada { background: #fee2e2; color: #991b1b; }

.btn-action { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
.btn-action:hover { background: #f1f5f9; border-color: #cbd5e1; }

.font-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #475569; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
</style>
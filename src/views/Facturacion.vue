<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFacturas, getClientes } from '@/services/data';
import { supabase } from '@/supabase';

const route = useRoute();
const router = useRouter();

const listaFacturas = ref([]);
const listaClientes = ref([]);
const loading = ref(true);
const filtroBusqueda = ref(route.query.busqueda || ''); 
const filtroEstado = ref('');

onMounted(async () => {
  await cargarDatos();
});

async function cargarDatos() {
  loading.value = true;
  try {
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
}

// --- ACCIÓN WHATSAPP (La que faltaba) ---
function enviarResumenWhatsApp(f, cliente) {
  if (!cliente || !cliente.telefono) {
    return alert("El cliente no tiene un teléfono registrado.");
  }

  const telefonoLimpio = cliente.telefono.replace(/\D/g, '');
  const nroFactura = String(f.numero_factura || f.numero || 0).padStart(8, '0');
  
  let msj = `*JD SISTEMAS - Comprobante Digital*%0A`;
  msj += `--------------------------%0A`;
  msj += `📄 *Factura:* #${nroFactura}%0A`;
  msj += `👤 *Cliente:* ${cliente.nombre}%0A`;
  msj += `💰 *Total:* $${Number(f.total).toLocaleString()}%0A`;
  msj += `📅 *Fecha:* ${new Date(f.fecha).toLocaleDateString()}%0A`;
  msj += `--------------------------%0A`;
  msj += `_Gracias por confiar en JD Sistemasinformáticos._`;

  window.open(`https://wa.me/${telefonoLimpio}?text=${msj}`, '_blank');
}

async function anularFactura(id) {
  if (!confirm("¿Estás seguro de ANULAR esta factura? Esto afectará el saldo del cliente.")) return;
  
  try {
    const { error } = await supabase
      .from('facturas')
      .update({ estado: 'ANULADA' })
      .eq('id', id);

    if (error) throw error;
    alert("Factura anulada correctamente.");
    await cargarDatos();
  } catch (e) {
    alert("Error al anular");
  }
}

function imprimirFactura(f) {
  router.push(`/facturacion/${f.id}`);
}

function getNombreCliente(id) {
  if (!id) return 'Consumidor Final';
  const c = listaClientes.value.find(x => x.id === id);
  return c ? c.nombre : 'Cargando...';
}

const facturasFiltradas = computed(() => {
  if (!listaFacturas.value) return [];

  return listaFacturas.value.filter(f => {
    const nombreCliente = (f.cliente_nombre || getNombreCliente(f.cliente_id)).toLowerCase();
    const numeroFactura = String(f.numero_factura || f.numero || '').toLowerCase();
    const busqueda = filtroBusqueda.value.toLowerCase();

    const cumpleBusqueda = nombreCliente.includes(busqueda) || numeroFactura.includes(busqueda);
    const cumpleEstado = filtroEstado.value === '' || f.estado === filtroEstado.value;
    
    return cumpleBusqueda && cumpleEstado;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});
</script>

<template>
  <div class="facturacion-container">
    <header class="page-header">
      <div>
        <h2>Historial de Facturación</h2>
        <p class="subtitle">Gestión centralizada de comprobantes de JD Sistemas.</p>
      </div>
      <div class="header-buttons">
        <button @click="cargarDatos" class="btn-refresh" title="Refrescar datos">🔄</button>
        <button @click="router.push('/factura-nueva')" class="btn-nueva">
          <span>+</span> Nueva Factura
        </button>
      </div>
    </header>

    <div class="filters-bar glass-card">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          v-model="filtroBusqueda" 
          type="text" 
          placeholder="Buscar por cliente o número de factura..." 
          class="input-search"
        >
      </div>
      <select v-model="filtroEstado" class="input-select">
        <option value="">Todos los estados</option>
        <option value="EMITIDA">✅ EMITIDAS</option>
        <option value="ANULADA">🚫 ANULADAS</option>
      </select>
    </div>

    <div v-if="loading" class="loading-box glass-card">
       <div class="spinner"></div>
       <p>Sincronizando con la base de datos...</p>
    </div>

    <div v-else class="table-container glass-card shadow-lg">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Comprobante</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in facturasFiltradas" :key="f.id" :class="{ 'row-anulada': f.estado === 'ANULADA' }">
            <td>{{ f.fecha ? new Date(f.fecha).toLocaleDateString() : 'S/F' }}</td>
            <td class="font-mono">
              <span class="txt-copy">#{{ String(f.punto_venta || 0).padStart(4, '0') }}-{{ String(f.numero_factura || f.numero || 0).padStart(8, '0') }}</span>
            </td>
            <td class="font-bold">{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
            <td class="font-mono font-black text-blue-700">${{ Number(f.total || 0).toLocaleString() }}</td>
            <td>
              <span :class="['status-badge', (f.estado || 'EMITIDA').toLowerCase()]">
                {{ f.estado || 'EMITIDA' }}
              </span>
            </td>
            <td class="text-right actions-cell">
              <button @click="imprimirFactura(f)" class="btn-icon" title="Ver/Imprimir">👁️</button>
              
              <button @click="enviarResumenWhatsApp(f, listaClientes.find(c => c.id === f.cliente_id))" 
                      class="btn-icon btn-wp" title="Enviar por WhatsApp">
                🟢
              </button>

              <button v-if="f.estado !== 'ANULADA'" @click="anularFactura(f.id)" class="btn-icon btn-delete" title="Anular">🚫</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* (Se mantienen tus estilos, solo asegúrate de que esté el de btn-wp) */
.facturacion-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { color: #64748b; margin-top: 4px; }
.header-buttons { display: flex; gap: 12px; align-items: stretch; }
.btn-refresh { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-refresh:hover { background: #f8fafc; color: #2563eb; }
.btn-nueva { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; }
.btn-nueva:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }

.filters-bar { display: flex; gap: 15px; padding: 15px; margin-bottom: 20px; border: 1px solid #e2e8f0; background: white; border-radius: 12px; }
.search-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
.input-search { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.input-select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 220px; background: white; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; }
.status-badge.emitida { background: #dcfce7; color: #166534; }
.status-badge.anulada { background: #fee2e2; color: #991b1b; }

.actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 1.1rem; transition: 0.2s; }
.btn-icon:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-wp:hover { background: #dcfce7; border-color: #22c55e; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

.font-mono { font-family: 'JetBrains Mono', monospace; }
.font-black { font-weight: 900; }
.row-anulada { opacity: 0.6; background: #f8fafc; }
.row-anulada .font-bold { text-decoration: line-through; }
</style>
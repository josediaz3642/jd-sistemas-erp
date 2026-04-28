<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFacturas, getClientes, getNextNumeroFactura, registrarEvento } from '@/services/data'; 
import { supabase } from '@/supabase';

const route = useRoute();
const router = useRouter();

const listaFacturas = ref([]);
const listaClientes = ref([]);
const loading = ref(false);
const filtroBusqueda = ref(route.query.busqueda || ''); 
const filtroEstado = ref('');

// 1. Cargamos los datos al montar sin bloquear el componente
onMounted(async () => {
  await cargarDatos();
});

async function cargarDatos() {
  console.log("🔄 Sincronizando con JD Sistemas...");
  loading.value = true;
  try {
    const [facturasData, clientesData] = await Promise.all([
      getFacturas(),
      getClientes()
    ]);
    listaFacturas.value = facturasData || [];
    listaClientes.value = clientesData || [];
    console.log("✅ Datos cargados:", listaFacturas.value.length, "facturas.");
  } catch (error) {
    console.error("❌ Error en cargarDatos:", error);
  } finally {
    loading.value = false;
  }
}

function enviarResumenWhatsApp(f, cliente) {
  if (!cliente || !cliente.telefono) {
    return alert("El cliente no tiene un teléfono registrado.");
  }
  const telefonoLimpio = cliente.telefono.replace(/\D/g, '');
  const nroFactura = String(f.numero_factura || f.numero || 0).padStart(8, '0');
  const totalFactura = Number(f.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  const fechaFactura = f.fecha ? new Date(f.fecha).toLocaleDateString() : 'S/F';

  const textoMensaje = `*JD SISTEMAS - Comprobante Digital*\n--------------------------\n📄 *Factura:* #${nroFactura}\n👤 *Cliente:* ${cliente.nombre}\n💰 *Total:* $${totalFactura}\n📅 *Fecha:* ${fechaFactura}\n--------------------------\n_Gracias por confiar en JD Sistemasinformáticos._`;

  window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(textoMensaje)}`, '_blank');
}

async function anularFactura(f) {
  if (!confirm(`¿Estás seguro de ANULAR la factura #${f.numero}?`)) return;
  try {
    const { error } = await supabase.from('facturas').update({ estado: 'ANULADA' }).eq('id', f.id);
    if (error) throw error;
    
    await registrarEvento({
      modulo: 'FACTURACION',
      tipo: 'ANULACION',
      desc: `Factura #${f.numero} anulada manualmente`,
      refId: f.id
    });

    alert("Factura anulada correctamente.");
    await cargarDatos();
  } catch (e) {
    alert("Error al anular la factura.");
  }
}

function imprimirFactura(f) {
  router.push(`/facturacion/${f.id}`);
}

function getNombreCliente(id) {
  if (!id) return 'Consumidor Final';
  const c = listaClientes.value.find(x => x.id === id);
  return c ? c.nombre : 'S/D';
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
          placeholder="Buscar por cliente o número..." 
          class="input-search"
        >
      </div>
      <select v-model="filtroEstado" class="input-select">
        <option value="">Todos los estados</option>
        <option value="EMITIDA">✅ EMITIDAS</option>
        <option value="ANULADA">🚫 ANULADAS</option>
      </select>
    </div>

    <div v-if="loading" class="loading-box">
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
            <td data-label="Fecha">{{ f.fecha ? new Date(f.fecha).toLocaleDateString() : 'S/F' }}</td>
            <td data-label="Comprobante" class="font-mono">
              #{{ String(f.numero_factura || f.numero || 0).padStart(8, '0') }}
            </td>
            <td data-label="Cliente" class="font-bold">{{ f.cliente_nombre || getNombreCliente(f.cliente_id) }}</td>
            <td data-label="Total" class="font-mono font-black text-blue-700">${{ Number(f.total || 0).toLocaleString() }}</td>
            <td data-label="Estado">
              <span :class="['status-badge', (f.estado || 'EMITIDA').toLowerCase()]">
                {{ f.estado || 'EMITIDA' }}
              </span>
            </td>
            <td class="text-right actions-cell">
              <button @click="imprimirFactura(f)" class="btn-icon" title="Ver/Imprimir">👁️</button>
              <button @click="enviarResumenWhatsApp(f, listaClientes.find(c => c.id === f.cliente_id))" class="btn-icon btn-wp" title="Enviar WhatsApp">🟢</button>
              <button v-if="f.estado !== 'ANULADA'" @click="anularFactura(f)" class="btn-icon btn-delete" title="Anular">🚫</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="facturasFiltradas.length === 0" class="no-data">
        No se encontraron comprobantes con esos filtros.
      </div>
    </div>
  </div>
</template>

<style scoped>
.facturacion-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { color: #64748b; font-size: 0.9rem; }
.header-buttons { display: flex; gap: 12px; }

.btn-refresh { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 15px; cursor: pointer; transition: 0.2s; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

.filters-bar { display: flex; gap: 15px; padding: 15px; margin-bottom: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
.search-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; left: 12px; top: 12px; color: #94a3b8; }
.input-search { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e2e8f0; border-radius: 8px; }
.input-select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 200px; }

.table-container { background: white; border-radius: 12px; overflow: hidden; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; }

.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; }
.status-badge.emitida { background: #dcfce7; color: #166534; }
.status-badge.anulada { background: #fee2e2; color: #991b1b; }

.actions-cell { display: flex; gap: 6px; justify-content: flex-end; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; cursor: pointer; }
.btn-wp:hover { background: #dcfce7; border-color: #22c55e; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

.loading-box { text-align: center; padding: 50px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.no-data { padding: 30px; text-align: center; color: #94a3b8; }

@media (max-width: 768px) {
  .table-moderna thead { display: none; }
  .table-moderna tr { display: block; border: 1px solid #e2e8f0; margin-bottom: 10px; border-radius: 10px; padding: 10px; }
  .table-moderna td { display: flex; justify-content: space-between; padding: 8px 5px; border: none; }
  .table-moderna td::before { content: attr(data-label); font-weight: 800; color: #64748b; font-size: 0.7rem; }
  .actions-cell { justify-content: center; background: #f8fafc; padding: 10px; border-radius: 8px; }
}
</style>
<template>
  <div class="page-container">
    <div class="inventory-header">
      <div>
        <h1>Gestión de Clientes</h1>
        <div class="stats-mini">
          <div class="stat-tag">TOTAL A COBRAR: ${{ totalDeudaCartera.toLocaleString() }}</div>
          <div class="stat-tag" :class="{ 'warning': clientesConDeuda > 0 }">
            {{ clientesConDeuda }} CLIENTES CON DEUDA
          </div>
        </div>
      </div>
      <button class="btn-primary" @click="nuevoCliente">
        <span>+</span> Nuevo Cliente
      </button>
    </div>

    <div class="filter-bar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar cliente por nombre o documento..." 
          class="search-input" 
        />
      </div>
    </div>

    <div class="card-glass">
      <div v-if="loading" class="loader">
        <div class="spinner"></div>
        <p>Sincronizando con la nube...</p>
      </div>
      
      <table v-else-if="clientesFiltrados.length > 0" class="table-moderna">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Estado de Cuenta</th>
            <th class="text-right">Saldo Actual</th>
            <th class="text-right">Última Actividad</th>
            <th class="text-center">WhatsApp</th>
            <th class="text-right">Ajustes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientesFiltrados" :key="c.id" @click="verCliente(c.id)" class="row-click">
            <td>
              <div class="font-black">{{ c.nombre }}</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">{{ c.nro_documento || 'SIN DOCUMENTO' }}</div>
            </td>
            <td>
              <span class="status-pill" :class="getClasePill(c)">
                {{ getTextoDeuda(c) }}
              </span>
            </td>
            <td class="text-right font-mono font-black" :style="{ color: c.saldoCalculado > 0 ? '#dc2626' : '#16a34a' }">
              ${{ (c.saldoCalculado || 0).toLocaleString() }}
            </td>
            <td class="text-right" style="color: #64748b; font-size: 0.85rem;">
              {{ obtenerResumen(c).ultima ? new Date(obtenerResumen(c).ultima).toLocaleDateString("es-AR") : "SIN MOVIMIENTOS" }}
            </td>
            <td class="text-center">
              <button @click.stop="prepararYEnviarWA(c)" class="btn-wa-minimal">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" />
              </button>
            </td>
            <td class="text-right">
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button @click.stop="abrirAjuste(c, 'ND')" class="btn-sm-opt nd" title="Nota de Débito">+</button>
                <button @click.stop="abrirAjuste(c, 'NC')" class="btn-sm-opt nc" title="Nota de Crédito">-</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="loader">No se encontraron clientes que coincidan con la búsqueda.</div>
    </div>

    <ModalAjuste 
      v-if="modalConfig.show"
      :show="modalConfig.show"
      :tipo="modalConfig.tipo"
      :clienteId="modalConfig.clienteId"
      :clienteNombre="modalConfig.nombre"
      @close="modalConfig.show = false"
      @success="handleExito"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { getClientes, getFacturas } from "@/services/data";
import ModalAjuste from '@/components/ModalAjuste.vue';

const router = useRouter();
const clientes = ref([]);
const facturas = ref([]);
const loading = ref(true);
const busqueda = ref("");
const modalConfig = ref({ show: false, tipo: 'ND', clienteId: null, nombre: '' });

// --- CARGA DE DATOS ---
async function obtenerSaldoReal(clienteId) {
  const [fRes, pRes, nRes] = await Promise.all([
    supabase.from('facturas').select('total').eq('cliente_id', clienteId),
    supabase.from('pagos_cuentas').select('monto').eq('cliente_id', clienteId),
    supabase.from('notas').select('monto, tipo_comprobante').eq('cliente_id', clienteId)
  ]);
  const totalF = fRes.data?.reduce((acc, f) => acc + Number(f.total), 0) || 0;
  const totalP = pRes.data?.reduce((acc, p) => acc + Number(p.monto), 0) || 0;
  const totalNC = nRes.data?.filter(n => n.tipo_comprobante === 'NC').reduce((acc, n) => acc + Number(n.monto), 0) || 0;
  const totalND = nRes.data?.filter(n => n.tipo_comprobante === 'ND').reduce((acc, n) => acc + Number(n.monto), 0) || 0;
  return (totalF + totalND) - (totalP + totalNC);
}

const cargarDatos = async () => {
  try {
    loading.value = true;
    const [dataClientes, dataFacturas] = await Promise.all([getClientes(), getFacturas()]);
    const clientesConSaldo = await Promise.all((dataClientes || []).map(async (c) => ({
      ...c,
      saldoCalculado: await obtenerSaldoReal(c.id)
    })));
    clientes.value = clientesConSaldo;
    facturas.value = dataFacturas || [];
  } catch (error) { console.error(error); } 
  finally { loading.value = false; }
};

onMounted(cargarDatos);

// --- LÓGICA DE ESTADOS (PILLS) ---
function getClasePill(c) {
  const saldo = c.saldoCalculado || 0;
  if (saldo <= 0) return 'success';
  if (c.limite_credito > 0 && saldo > c.limite_credito) return 'error';
  const res = obtenerResumen(c);
  if (!res.ultima) return 'warn';
  const dias = Math.floor((new Date() - new Date(res.ultima)) / (1000 * 60 * 60 * 24));
  return dias > 30 ? 'error' : 'warn';
}

function getTextoDeuda(c) {
  const saldo = c.saldoCalculado || 0;
  if (saldo <= 0) return 'AL DÍA';
  if (c.limite_credito > 0 && saldo > c.limite_credito) return 'EXCEDIDO';
  const res = obtenerResumen(c);
  if (!res.ultima) return 'PENDIENTE';
  const dias = Math.floor((new Date() - new Date(res.ultima)) / (1000 * 60 * 60 * 24));
  return dias > 30 ? `MOROSO (${dias}D)` : 'PENDIENTE';
}

// --- COMPUTADOS ---
const clientesFiltrados = computed(() => {
  return clientes.value.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    (c.nro_documento && c.nro_documento.includes(busqueda.value))
  );
});

const totalDeudaCartera = computed(() => {
  return clientes.value.reduce((acc, c) => acc + (c.saldoCalculado > 0 ? c.saldoCalculado : 0), 0);
});

const clientesConDeuda = computed(() => {
  return clientes.value.filter(c => c.saldoCalculado > 0).length;
});

// --- WHATSAPP ---
async function prepararYEnviarWA(cliente) {
  if (!cliente.telefono) return alert("Sin teléfono.");
  const [pagos, notas] = await Promise.all([
    supabase.from('pagos_cuentas').select('*').eq('cliente_id', cliente.id),
    supabase.from('notas').select('*').eq('cliente_id', cliente.id)
  ]);
  const facturasCliente = facturas.value.filter(f => f.cliente_id === cliente.id);
  const movs = [
    ...facturasCliente.map(f => ({ f: f.fecha, d: `FAC ${f.numero}`, i: f.total, t: '+' })),
    ...(pagos.data || []).map(p => ({ f: p.fecha, d: `PAGO`, i: p.monto, t: '-' })),
    ...(notas.data || []).map(n => ({ f: n.fecha, d: n.tipo_comprobante, i: n.monto, t: n.tipo_comprobante === 'NC' ? '-' : '+' }))
  ].sort((a, b) => new Date(b.f) - new Date(a.f));

  let msj = `*JD SISTEMAS - ESTADO DE CUENTA*\nCliente: *${cliente.nombre}*\n----------------------------------\n`;
  movs.slice(0, 5).forEach(m => {
    msj += `• ${new Date(m.f).toLocaleDateString('es-AR', {day:'numeric', month:'numeric'})} | ${m.d} | ${m.t}$${m.i.toLocaleString()}\n`;
  });
  msj += `----------------------------------\n*SALDO ACTUAL: $${(cliente.saldoCalculado || 0).toLocaleString()}*`;
  window.open(`https://wa.me/${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(msj)}`, '_blank');
}

// --- AUXILIARES ---
function obtenerResumen(cliente) {
  const fCli = facturas.value.filter(f => f.cliente_id === cliente.id);
  const ordenadas = [...fCli].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return { cantidad: fCli.length, ultima: ordenadas[0]?.fecha || null };
}

const abrirAjuste = (cliente, tipo) => { 
  modalConfig.value = { show: true, tipo, clienteId: cliente.id, nombre: cliente.nombre }; 
};
const handleExito = () => cargarDatos();
function nuevoCliente() { router.push("/cliente/nuevo"); }
function verCliente(id) { router.push(`/cliente/${id}`); }
</script>

<style scoped>
.page-container { padding: 25px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
.card-glass { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }

.inventory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.inventory-header h1 { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin-bottom: 5px; }

.btn-primary { 
  background: #2563eb; color: white; border: none; padding: 12px 24px; 
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

.filter-bar { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; align-items: center; }
.search-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; left: 15px; top: 12px; color: #94a3b8; }
.search-input { width: 100%; padding: 12px 12px 12px 45px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.3s; color: #333; }
.search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.stats-mini { display: flex; gap: 10px; }
.stat-tag { padding: 8px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.85rem; font-weight: 700; color: #475569; }
.stat-tag.warning { border-color: #fecaca; background: #fef2f2; color: #dc2626; }

.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; background: #f8fafc; color: #64748b; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
.table-moderna td { padding: 16px 15px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }

.row-click { cursor: pointer; transition: 0.2s; }
.row-click:hover { background: #f1f5f9; }

.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
.status-pill.success { background: #dcfce7; color: #15803d; }
.status-pill.warn { background: #fff7ed; color: #c2410c; }
.status-pill.error { background: #fef2f2; color: #b91c1c; }

.text-right { text-align: right; }
.text-center { text-align: center; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.btn-wa-minimal { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-wa-minimal:hover { background: #f0fdf4; border-color: #22c55e; }

.btn-sm-opt { 
  width: 30px; height: 30px; border-radius: 8px; border: none; font-weight: 900; cursor: pointer; color: white;
}
.btn-sm-opt.nd { background: #3b82f6; }
.btn-sm-opt.nc { background: #10b981; }

.loader { text-align: center; padding: 60px; color: #64748b; }
.spinner { width: 35px; height: 35px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
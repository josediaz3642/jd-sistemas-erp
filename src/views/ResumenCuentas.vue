<template>
  <div>
    <div class="page no-print">
      <div class="card-glass header-section">
      <h1 class="page-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Cuentas Corrientes
      </h1>
      <select v-model="clienteSeleccionado" @change="cargarDatos" class="cs-input mt-4">
        <option value="">Seleccione un cliente...</option>
        <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
    </div>

    <div v-if="clienteSeleccionado" class="dashboard-grid">
      <aside class="actions-sidebar">
        <!-- Totales Card -->
        <div class="card-glass balance-summary" :class="saldoTotal > 0 ? 'deuda' : 'favor'">
          <h3 class="title-card">Estado de Cuenta</h3>
          <div class="summary-item">
            <span>Debe (Facturado)</span>
            <span class="font-mono txt-red">${{ totalDebe.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span>Haber (Pagos+Cheques)</span>
            <span class="font-mono txt-green">-${{ totalHaber.toLocaleString() }}</span>
          </div>
          <div class="summary-total">
            <span>Saldo Total</span>
            <strong class="font-mono">${{ Math.abs(saldoTotal).toLocaleString() }}</strong>
            <span class="status-pill" :class="saldoTotal > 0 ? 'error' : 'success'">
              {{ saldoTotal > 0 ? 'DEUDOR' : 'A FAVOR' }}
            </span>
          </div>
        </div>

        <div class="card-glass accent-green mt-20">
          <h3 class="title-card">📥 Nuevo Recibo</h3>
          <div class="form-group">
            <input type="number" v-model.number="pagoTotal" class="cs-input" placeholder="Monto total $">
            <select v-model="metodo" class="cs-input">
              <option value="Contado">💵 Contado</option>
              <option value="Transferencia">🏦 Transferencia</option>
            </select>
            <div class="info-imputacion">
              <p>A abonar: <strong>${{ totalSeleccionado.toLocaleString() }}</strong></p>
            </div>
            <button @click="generarCobro" class="cs-btn cs-btn-primary" style="width: 100%" :disabled="pagoTotal <= 0 || enviando">
              {{ enviando ? 'Procesando...' : 'Cobrar e Imprimir' }}
            </button>
          </div>
        </div>
      </aside>

      <main class="table-container">
        <div class="card-glass">
          <h3 class="title-card">📄 Facturas Pendientes</h3>
          <table class="table-moderna">
            <thead>
              <tr>
                <th>Sel.</th>
                <th>Fecha</th>
                <th>Nro</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in facturasPendientes" :key="f.id">
                <td><input type="checkbox" :value="f" v-model="facturasAbonadas"></td>
                <td>{{ new Date(f.fecha).toLocaleDateString() }}</td>
                <td class="font-mono">{{ f.numero }}</td>
                <td class="text-right font-mono font-bold">${{ f.total.toLocaleString() }}</td>
              </tr>
              <tr v-if="facturasPendientes.length === 0">
                <td colspan="4" class="text-center" style="color: var(--cs-text-muted)">Sin facturas pendientes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOVIMIENTOS HISTÓRICOS -->
        <div class="card-glass mt-20">
          <h3 class="title-card">history Movimientos (Recibos y Cheques)</h3>
          <table class="table-moderna">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th class="text-right">Monto (Haber)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in historialMovimientos" :key="m.id">
                <td>{{ new Date(m.fecha).toLocaleDateString() }}</td>
                <td>
                  <span class="tipo-tag" :class="m.tipo === 'RECIBO' ? 'rec' : 'cheque'">{{ m.tipo }}</span>
                </td>
                <td style="font-size: 0.85rem">{{ m.detalle }}</td>
                <td class="text-right font-mono txt-green font-bold">${{ m.monto.toLocaleString() }}</td>
                <td>
                  <button v-if="m.tipo === 'RECIBO'" @click="reimprimirRecibo(m.original)" class="cs-btn cs-btn-sm cs-btn-secondary">🖨️ Reimprimir</button>
                  <span v-else style="font-size: 0.7rem; color: var(--cs-text-muted)">{{ m.original.estado }}</span>
                </td>
              </tr>
              <tr v-if="historialMovimientos.length === 0">
                <td colspan="5" class="text-center" style="color: var(--cs-text-muted)">Sin movimientos registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>

  <div v-if="reciboActivo" id="seccion-impresion" class="only-print">
    <div class="recibo-box">
      <div class="recibo-header">
        <div>
          <h1 class="logo">JD SISTEMAS</h1>
          <p>Jose Diaz | Soluciones IT</p>
        </div>
        <div class="text-right">
          <h2 class="titulo-recibo">RECIBO DE PAGO</h2>
          <p>N°: {{ reciboActivo.id.substring(0,8).toUpperCase() }}</p>
          <p>Fecha: {{ new Date(reciboActivo.fecha).toLocaleDateString() }}</p>
        </div>
      </div>

      <div class="recibo-body">
        <p>Cliente: <strong>{{ clienteNombre }}</strong></p>
        <p>Monto: <strong>${{ reciboActivo.monto.toLocaleString() }}</strong></p>
        <p>Método: {{ reciboActivo.metodo_pago }}</p>
        
        <table class="tabla-impresion">
          <thead>
            <tr>
              <th>Detalle / Concepto</th>
              <th class="text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pago de servicios y facturas informáticas</td>
              <td class="text-right">${{ reciboActivo.monto.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="recibo-footer">
        <div class="firma-box">
          <div class="linea-firma"></div>
          <p>JD SISTEMAS</p>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from "@/supabase";
import { getClientes, getFacturasCliente, registrarMovimientoCaja, getEmpresaId } from '@/services/data';

const clientes = ref([]);
const clienteSeleccionado = ref('');
const facturasPendientes = ref([]);
const facturasAbonadas = ref([]);
const historialMovimientos = ref([]); // Recibos + Cheques
const facturasTotales = ref([]); // Para calculo de deuda
const pagoTotal = ref(0);
const metodo = ref('Contado');
const enviando = ref(false);
const reciboActivo = ref(null);

const clienteNombre = computed(() => clientes.value.find(c => c.id === clienteSeleccionado.value)?.nombre || '');
const totalSeleccionado = computed(() => facturasAbonadas.value.reduce((acc, f) => acc + f.total, 0));

// Lógica de totales
const totalDebe = computed(() => facturasTotales.value.reduce((acc, f) => acc + Number(f.total || 0), 0));
const totalHaber = computed(() => historialMovimientos.value.reduce((acc, m) => acc + Number(m.monto || 0), 0));
const saldoTotal = computed(() => totalDebe.value - totalHaber.value);

onMounted(async () => {
  clientes.value = await getClientes();
});

async function cargarDatos() {
  if (!clienteSeleccionado.value) return;
  const clienteData = clientes.value.find(c => c.id === clienteSeleccionado.value);
  
  const [fData, rData, cData] = await Promise.all([
    getFacturasCliente(clienteSeleccionado.value),
    supabase.from('pagos_cuentas').select('*').eq('cliente_id', clienteSeleccionado.value).order('fecha', { ascending: false }),
    // Buscar cheques emitidos por este cliente (usando el nombre porque así lo guardamos)
    supabase.from('cheques').select('*').eq('empresa_id', getEmpresaId()).ilike('emisor', `%${clienteData.nombre}%`)
  ]);
  
  facturasTotales.value = fData || [];
  facturasPendientes.value = fData.filter(f => f.estado !== 'Pagada');
  
  // Unir recibos y cheques
  const recibos = (rData.data || []).map(r => ({
    id: r.id,
    fecha: r.fecha,
    tipo: 'RECIBO',
    detalle: `Recibo de Pago - ${r.metodo_pago}`,
    monto: r.monto,
    original: r
  }));
  
  const cheques = (cData.data || []).map(c => ({
    id: c.id,
    fecha: c.fecha_recepcion || c.created_at,
    tipo: 'CHEQUE',
    detalle: `Cheque #${c.numero} - ${c.banco}`,
    monto: Number(c.monto),
    original: c
  }));
  
  historialMovimientos.value = [...recibos, ...cheques].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

async function generarCobro() {
  enviando.value = true;
  try {
    const { data: pago, error: pError } = await supabase.from('pagos_cuentas').insert([{
      cliente_id: clienteSeleccionado.value,
      monto: pagoTotal.value,
      metodo_pago: metodo.value,
      fecha: new Date().toISOString()
    }]).select().single();

    if (pError) throw pError;

    for (const f of facturasAbonadas.value) {
      await supabase.from('facturas').update({ estado: 'Pagada' }).eq('id', f.id);
    }

    await registrarMovimientoCaja('ingreso', pagoTotal.value, `Cobro Recibo ${pago.id.substring(0,5)}`, 'Cobranzas', clienteSeleccionado.value, metodo.value);

    reciboActivo.value = pago;
    setTimeout(() => {
      window.print();
      reciboActivo.value = null;
      limpiar();
      cargarDatos();
    }, 300);

  } catch (e) {
    alert("Error al procesar cobro");
  } finally {
    enviando.value = false;
  }
}

function reimprimirRecibo(recibo) {
  reciboActivo.value = recibo;
  setTimeout(() => {
    window.print();
    reciboActivo.value = null;
  }, 300);
}

function limpiar() {
  pagoTotal.value = 0;
  facturasAbonadas.value = [];
}
</script>

<style scoped>
.page { padding: 20px; max-width: 1400px; margin: 0 auto; }
.dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; margin-top: 24px; }
.header-section { margin-bottom: 24px; }
.mt-20 { margin-top: 20px; }
.mt-4 { margin-top: 16px; }

/* Totales / Balance Summary */
.balance-summary { border-top: 4px solid var(--cs-brand-500); }
.balance-summary.deuda { border-top-color: var(--cs-error); }
.balance-summary.favor { border-top-color: var(--cs-success); }
.summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem; color: var(--cs-text-secondary); }
.summary-total { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--cs-border-soft); }
.summary-total span:first-child { font-size: 0.8rem; font-weight: 700; color: var(--cs-text-muted); text-transform: uppercase; }
.summary-total strong { font-size: 2rem; color: var(--cs-text-primary); }

.info-imputacion { margin: 12px 0; font-size: 0.85rem; color: var(--cs-text-secondary); text-align: center; }

.tipo-tag { padding: 3px 8px; border-radius: var(--cs-radius-full); font-size: 0.65rem; font-weight: 800; color: white; text-transform: uppercase; }
.rec { background: var(--cs-success); }
.cheque { background: var(--cs-brand-500); }

/* --- ESTILOS CRÍTICOS DE IMPRESIÓN --- */
@media screen {
  .only-print { display: none !important; }
}

@media print {
  html, body, #app, #layout-wrapper, .menu-lateral, .header-principal, .no-print, nav, aside {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .only-print, .only-print * {
    display: block !important;
    visibility: visible !important;
  }

  .only-print {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .recibo-box {
    border: 1.5px solid #000;
    padding: 40px;
    background: white;
    color: black;
    min-height: 500px;
    display: flex;
    flex-direction: column;
  }
  
  .recibo-header { 
    display: flex; 
    justify-content: space-between; 
    border-bottom: 2px solid #000; 
    padding-bottom: 20px;
    margin-bottom: 30px;
  }

  .logo { font-size: 32px; font-weight: bold; margin: 0; letter-spacing: -1px; }
  
  .tabla-impresion { 
    width: 100%; 
    margin-top: 30px; 
    border-collapse: collapse; 
  }
  
  .tabla-impresion th {
    background: #eee !important;
    -webkit-print-color-adjust: exact;
    text-align: left;
    padding: 10px;
    border: 1px solid #000;
  }

  .tabla-impresion td { 
    border: 1px solid #000; 
    padding: 10px; 
  }

  .recibo-footer { 
    margin-top: auto; 
    padding-top: 50px;
    display: flex; 
    justify-content: flex-end; 
  }
  
  .firma-box { text-align: center; width: 250px; }
  .linea-firma { border-top: 1.5px solid #000; margin-bottom: 8px; }
}
</style>
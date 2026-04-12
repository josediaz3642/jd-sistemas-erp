<template>
  <div class="page no-print">
    <div class="card-glass header-section">
      <h1>Gestión de Cobranzas</h1>
      <select v-model="clienteSeleccionado" @change="cargarDatos" class="select-cliente">
        <option value="">Seleccione un cliente...</option>
        <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
    </div>

    <div v-if="clienteSeleccionado" class="dashboard-grid">
      <aside class="actions-sidebar">
        <div class="card-glass accent-green">
          <h3>📥 Nuevo Recibo</h3>
          <div class="form-group">
            <input type="number" v-model.number="pagoTotal" class="input-moderno" placeholder="Monto total $">
            <select v-model="metodo" class="input-moderno">
              <option value="Contado">💵 Contado</option>
              <option value="Transferencia">🏦 Transferencia</option>
            </select>
            <div class="info-imputacion">
              <p>A abonar: <strong>${{ totalSeleccionado.toLocaleString() }}</strong></p>
            </div>
            <button @click="generarCobro" class="btn-confirmar" :disabled="pagoTotal <= 0 || enviando">
              {{ enviando ? 'Procesando...' : 'Cobrar e Imprimir' }}
            </button>
          </div>
        </div>
      </aside>

      <main class="table-container">
        <div class="card-glass">
          <h3>📄 Facturas Pendientes</h3>
          <table class="simple-table">
            <thead>
              <tr>
                <th>Sel.</th>
                <th>Fecha</th>
                <th>Nro</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in facturasPendientes" :key="f.id">
                <td><input type="checkbox" :value="f" v-model="facturasAbonadas"></td>
                <td>{{ new Date(f.fecha).toLocaleDateString() }}</td>
                <td>{{ f.numero }}</td>
                <td>${{ f.total.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-glass mt-20">
          <h3>history Recibos Emitidos</h3>
          <table class="simple-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in historialRecibos" :key="r.id">
                <td>{{ new Date(r.fecha).toLocaleDateString() }}</td>
                <td>${{ r.monto.toLocaleString() }}</td>
                <td>{{ r.metodo_pago }}</td>
                <td>
                  <button @click="reimprimirRecibo(r)" class="btn-reimprimir">🖨️ Reimprimir</button>
                </td>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from "@/supabase";
import { getClientes, getFacturasCliente, registrarMovimientoCaja } from '@/services/data';

const clientes = ref([]);
const clienteSeleccionado = ref('');
const facturasPendientes = ref([]);
const facturasAbonadas = ref([]);
const historialRecibos = ref([]);
const pagoTotal = ref(0);
const metodo = ref('Contado');
const enviando = ref(false);
const reciboActivo = ref(null);

const clienteNombre = computed(() => clientes.value.find(c => c.id === clienteSeleccionado.value)?.nombre || '');
const totalSeleccionado = computed(() => facturasAbonadas.value.reduce((acc, f) => acc + f.total, 0));

onMounted(async () => {
  clientes.value = await getClientes();
});

async function cargarDatos() {
  if (!clienteSeleccionado.value) return;
  const [fData, rData] = await Promise.all([
    getFacturasCliente(clienteSeleccionado.value),
    supabase.from('pagos_cuentas').select('*').eq('cliente_id', clienteSeleccionado.value).order('fecha', { ascending: false })
  ]);
  
  facturasPendientes.value = fData.filter(f => f.estado !== 'Pagada');
  historialRecibos.value = rData.data || [];
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
.page { padding: 20px; }
.dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; margin-top: 20px; }
.card-glass { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.mt-20 { margin-top: 20px; }
.input-moderno { width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #ddd; }
.btn-confirmar { width: 100%; background: #1e293b; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-reimprimir { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.simple-table { width: 100%; border-collapse: collapse; }
.simple-table th, .simple-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
/* --- ESTILOS CRÍTICOS DE IMPRESIÓN --- */
@media screen {
  .only-print { display: none !important; }
}

@media print {
  /* 1. Ocultar TODO el sitio (incluyendo menús, headers y overlays) */
  html, body, #app, #layout-wrapper, .menu-lateral, .header-principal, .no-print, nav, aside {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* 2. Mostrar ÚNICAMENTE el contenedor del recibo */
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

  /* 3. Estética del Recibo */
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
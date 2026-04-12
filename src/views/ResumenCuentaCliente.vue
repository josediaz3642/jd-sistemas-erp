<template>
  <div class="resumen-container">
    <header v-if="cliente" class="cliente-header glass-card">
      <div class="info-principal">
        <div class="avatar">{{ cliente.nombre.charAt(0) }}</div>
        <div>
          <h1>{{ cliente.nombre }}</h1>
          <p>{{ cliente.nro_documento || 'Sin Documento' }} | {{ cliente.direccion || 'Sin dirección' }}</p>
          <p class="phone-label">📞 {{ cliente.telefono || 'Sin teléfono' }}</p>
        </div>
      </div>
      <div class="saldo-card" :class="{ 'saldo-deudor': saldo > 0 }">
        <span class="label">Saldo de Cuenta</span>
        <h2 class="monto">${{ saldo.toLocaleString() }}</h2>
        <span class="badge">{{ saldo > 0 ? 'Deuda Pendiente' : 'Al día' }}</span>
      </div>
    </header>

    <div class="dashboard-grid">
      <section class="stats-section">
        
        <div class="mini-card glass-card accent-green">
          <div class="full-width">
            <h3>💰 Registrar Pago</h3>
            <div class="cobro-form mt-10">
              <label class="small-label">Monto recibido</label>
              <input type="number" v-model="pagoRapido.monto" placeholder="0.00" class="input-moderno">
              
              <label class="small-label mt-5">Método</label>
              <select v-model="pagoRapido.metodo" class="input-moderno">
                <option value="Contado">💵 Contado</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Tarjeta">💳 Tarjeta</option>
              </select>
              
              <button @click="procesarCobro" class="btn-cobrar-now mt-10" :disabled="!pagoRapido.monto || pagoRapido.monto <= 0">
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>

        <div class="mini-card glass-card">
          <span class="icon">📄</span>
          <div>
            <h3>{{ facturas.length }}</h3>
            <p>Comprobantes</p>
          </div>
        </div>

        <button v-if="cliente && cliente.telefono" @click="enviarWhatsApp" class="btn-whatsapp-full">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" />
          Enviar Estado de Cuenta
        </button>
      </section>

      <section class="items-section glass-card">
        <h3>🛍️ Ranking de Productos Comprados</h3>
        <div class="table-scroll">
          <table class="simple-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cantidad Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.producto">
                <td>{{ item.producto }}</td>
                <td class="text-right font-bold">{{ item.cantidad }}</td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="2" class="text-center py-4">Sin registros de ventas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="footer-actions">
        <button @click="$router.back()" class="btn-outline">← Volver al Listado</button>
        <button @click="imprimirResumen" class="btn-primary">🖨️ Imprimir</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import { 
  getFacturasCliente, 
  getPagosCliente, 
  getItemsVendidosCliente,  
  getClienteById, 
  getNotasByCliente,
  registrarMovimientoCaja 
} from "@/services/data";

const route = useRoute();
const id = route.params.id;

const cliente = ref(null);
const facturas = ref([]);
const pagos = ref([]);
const items = ref([]);
const notas = ref([]);
const pagoRapido = reactive({ monto: null, metodo: 'Contado' });

onMounted(async () => { await cargarDatos(); });

async function cargarDatos() {
  try {
    const [cData, fData, pData, iData, nData] = await Promise.all([
      getClienteById(id),
      getFacturasCliente(id),
      getPagosCliente(id),
      getItemsVendidosCliente(id),
      getNotasByCliente(id)
    ]);
    cliente.value = cData;
    facturas.value = fData || [];
    pagos.value = pData || [];
    items.value = iData || [];
    notas.value = nData || [];
  } catch (e) {
    console.error("Error al cargar datos:", e);
  }
}

const saldo = computed(() => {
  const f = facturas.value.reduce((acc, f) => acc + (Number(f.total) || 0), 0);
  const p = pagos.value.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  const nD = notas.value.filter(n => n.tipo_comprobante === 'ND').reduce((acc, n) => acc + (Number(n.monto) || 0), 0);
  const nC = notas.value.filter(n => n.tipo_comprobante === 'NC').reduce((acc, n) => acc + (Number(n.monto) || 0), 0);
  return (f + nD) - (p + nC);
});

async function procesarCobro() {
  if (!pagoRapido.monto || pagoRapido.monto <= 0) return;
  try {
    await supabase.from('pagos_cuentas').insert([{
      cliente_id: id,
      monto: pagoRapido.monto,
      metodo_pago: pagoRapido.metodo,
      fecha: new Date()
    }]);

    await registrarMovimientoCaja(
      'ingreso', 
      pagoRapido.monto, 
      `Cobro Cta. Cte. - ${cliente.value.nombre}`, 
      'Cobranzas', 
      id, 
      pagoRapido.metodo
    );

    alert("¡Pago registrado!");
    pagoRapido.monto = null;
    await cargarDatos();
  } catch (e) {
    alert("Error al registrar el pago");
  }
}

function enviarWhatsApp() {
  if (!cliente.value?.telefono) return;
  const num = cliente.value.telefono.replace(/\D/g, '');
  const mensaje = `*RESUMEN DE CUENTA - JD Sistemas*\n\n` +
                  `Hola *${cliente.value.nombre}*, tu saldo es: *$${saldo.value.toLocaleString()}*`;
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function imprimirResumen() { window.print(); }
</script>

<style scoped>
.resumen-container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.glass-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.cliente-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.info-principal { display: flex; gap: 15px; align-items: center; }
.avatar { width: 50px; height: 50px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.saldo-card { text-align: right; }
.saldo-deudor .monto { color: #e11d48; font-weight: bold; }

.dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
.stats-section { display: flex; flex-direction: column; gap: 15px; }

.accent-green { border-left: 5px solid #22c55e !important; }
.full-width { width: 100%; }
.small-label { font-size: 0.75rem; color: #64748b; display: block; margin-bottom: 3px; }

.input-moderno { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; }

.btn-cobrar-now { background: #1e293b; color: white; border: none; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-cobrar-now:disabled { background: #e2e8f0; color: #94a3b8; }

.btn-whatsapp-full { background: #22c55e; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

.simple-table { width: 100%; border-collapse: collapse; }
.simple-table th { text-align: left; padding: 10px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.8rem; }
.simple-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }

.footer-actions { grid-column: span 2; display: flex; justify-content: space-between; margin-top: 20px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 12px 25px; border-radius: 8px; cursor: pointer; }

.text-right { text-align: right; }
.mt-10 { margin-top: 10px; }
.mt-5 { margin-top: 5px; }
</style>
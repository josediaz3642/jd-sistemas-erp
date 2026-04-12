<template>
  <div class="page-factura">
    <header class="header-factura">
      <button @click="router.back()" class="btn-volver">← Cancelar</button>
      <h1>Nueva Factura</h1>
      <div class="nro-comprobante">Borrador: #{{ new Date().getFullYear() }}-{{ Math.floor(Math.random() * 1000) }}</div>
    </header>

    <div class="grid-factura">
      <div class="col-principal">
        <div class="card-glass">
          <h2 class="section-title">1. Selección de Cliente</h2>
          <div class="cliente-selector">
            <div v-if="clienteSeleccionado" class="cliente-card animate-fade">
              <div class="info">
                <span class="label">Facturando a:</span>
                <h3>{{ clienteSeleccionado.nombre }}</h3>
                <p>{{ clienteSeleccionado.nro_documento }} | {{ clienteSeleccionado.email || 'Sin email' }}</p>
              </div>
              <button @click="clienteSeleccionado = null" class="btn-cambiar">Cambiar Cliente</button>
            </div>
            
            <div v-else class="buscador-cliente">
              <input 
                type="text" 
                v-model="busquedaCliente" 
                placeholder="Buscar por nombre o DNI..."
                @input="buscarClientes"
                class="input-pro"
              />
              <ul v-if="sugerenciasClientes.length > 0" class="sugerencias">
                <li v-for="c in sugerenciasClientes" :key="c.id" @click="seleccionarCliente(c)">
                  {{ c.nombre }} <small>({{ c.nro_documento }})</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card-glass items-section">
          <h2 class="section-title">2. Detalles de la Venta</h2>
          <div class="items-header">
            <span>Concepto / Producto</span>
            <span>Cant.</span>
            <span>Precio Unit.</span>
            <span>Subtotal</span>
          </div>
          <div class="item-row">
             <input type="text" v-model="itemManual.desc" placeholder="Ej: Servicio Técnico" class="input-desc">
             <input type="number" v-model="itemManual.cant" class="input-cant">
             <input type="number" v-model="itemManual.precio" class="input-precio">
             <span class="subtotal-item">${{ (itemManual.cant * itemManual.precio).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="col-lateral">
        <div class="card-glass resumen-pago">
          <h2 class="section-title">Resumen</h2>
          <div class="total-box">
            <p>TOTAL A COBRAR</p>
            <h2 class="monto-total">${{ totalFactura.toLocaleString() }}</h2>
          </div>

          <div class="metodo-pago">
            <label>Condición de Venta</label>
            <select v-model="condicionVenta" class="select-pro">
              <option value="Contado">Efectivo / Contado</option>
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Tarjeta">Tarjeta Débito/Crédito</option>
              <option value="Cuenta Corriente">Cuenta Corriente (Deuda)</option>
            </select>
          </div>

          <button 
            @click="confirmarVenta" 
            class="btn-confirmar" 
            :disabled="!clienteSeleccionado || guardandoVenta"
          >
            {{ guardandoVenta ? 'Procesando...' : '🚀 Confirmar y Emitir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getClienteById, getClientes } from '@/services/data';
import { supabase } from '@/supabase';

const route = useRoute();
const router = useRouter();

// ESTADOS
const clienteSeleccionado = ref(null);
const busquedaCliente = ref('');
const sugerenciasClientes = ref([]);
const condicionVenta = ref('Contado');
const guardandoVenta = ref(false);

// ITEM TEMPORAL (Para que el código funcione ya mismo)
const itemManual = ref({ desc: '', cant: 1, precio: 0 });
const totalFactura = computed(() => itemManual.value.cant * itemManual.value.precio);

onMounted(async () => {
  const idViaUrl = route.query.clienteId;
  if (idViaUrl && idViaUrl !== "undefined") {
    const data = await getClienteById(idViaUrl);
    if (data) clienteSeleccionado.value = data;
  }
});

// BUSCADOR DE CLIENTES REAL
async function buscarClientes() {
  if (busquedaCliente.value.length < 2) {
    sugerenciasClientes.value = [];
    return;
  }
  const { data } = await supabase
    .from('clientes')
    .select('*')
    .ilike('nombre', `%${busquedaCliente.value}%`)
    .limit(5);
  sugerenciasClientes.value = data || [];
}

function seleccionarCliente(cliente) {
  clienteSeleccionado.value = cliente;
  sugerenciasClientes.value = [];
  busquedaCliente.value = '';
}

async function confirmarVenta() {
  if (!clienteSeleccionado.value) return alert("Debes seleccionar un cliente");
  if (totalFactura.value <= 0) return alert("El total debe ser mayor a 0");

  guardandoVenta.value = true;
  
  try {
    // 1. Guardar Factura
    const { data: nuevaFactura, error: errorFactura } = await supabase
      .from('facturas')
      .insert([{
        cliente_id: clienteSeleccionado.value.id,
        cliente_nombre: clienteSeleccionado.value.nombre,
        total: totalFactura.value,
        condicion_venta: condicionVenta.value,
        estado: 'EMITIDA',
        fecha: new Date().toISOString()
      }])
      .select().single();

    if (errorFactura) throw errorFactura;

    // 2. Lógica Contable (Caja o Cta Cte)
    if (condicionVenta.value === 'Cuenta Corriente') {
      await supabase.from('movimientos_cuentas').insert([{
        cliente_id: clienteSeleccionado.value.id,
        factura_id: nuevaFactura.id,
        monto: totalFactura.value,
        impacto: '+',
        detalle: `Factura #${nuevaFactura.id.toString().slice(-5)}` 
      }]);
    } else {
      await supabase.from('caja_movimientos').insert([{
        tipo: 'ingreso',
        monto: totalFactura.value,
        concepto: `Venta Factura #${nuevaFactura.id.toString().slice(-5)}`,
        categoria: 'Ventas',
        metodo_pago: condicionVenta.value,
        cliente_id: clienteSeleccionado.value.id
      }]);
    }

    // --- EL WHATSAPP VA AQUÍ ADENTRO ---
    alert("🚀 ¡Venta registrada con éxito!");
    
    const enviar = confirm("¿Deseas enviar el comprobante por WhatsApp al cliente?");
    if (enviar) {
      enviarResumenWhatsApp(nuevaFactura, clienteSeleccionado.value);
    }

    router.push('/facturacion');

  } catch (error) {
    console.error("Error fatal:", error);
    alert("Error al procesar la venta. Revisa la consola.");
  } finally {
    guardandoVenta.value = false;
  }
}
</script>

<style scoped>
/* (Se mantienen tus estilos y agregamos los de buscador) */
.buscador-cliente { position: relative; }
.sugerencias { 
  position: absolute; width: 100%; background: white; border: 1px solid #e2e8f0; 
  border-radius: 8px; z-index: 100; list-style: none; padding: 0; margin-top: 5px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}
.sugerencias li { padding: 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; }
.sugerencias li:hover { background: #f8fafc; color: #2563eb; }
.input-pro { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }
.input-pro:focus { border-color: #2563eb; }

.page-factura { padding: 30px; max-width: 1400px; margin: 0 auto; color: #1e293b; }
.header-factura { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.grid-factura { display: grid; grid-template-columns: 1fr 350px; gap: 25px; }
.card-glass { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.section-title { font-size: 0.85rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; }

.btn-volver { background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; }
.btn-confirmar { 
  width: 100%; background: #22c55e; color: white; border: none; padding: 18px; 
  border-radius: 14px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s;
}
.btn-confirmar:hover:not(:disabled) { background: #16a34a; transform: translateY(-2px); }
.btn-confirmar:disabled { background: #cbd5e1; cursor: not-allowed; }

.total-box { text-align: center; background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.monto-total { font-size: 2.8rem; font-weight: 900; color: #2563eb; margin: 0; }

/* Estilos de tabla de items */
.items-header { display: grid; grid-template-columns: 1fr 80px 120px 100px; gap: 15px; font-weight: 800; font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; }
.item-row { display: grid; grid-template-columns: 1fr 80px 120px 100px; gap: 15px; align-items: center; }
.item-row input { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
.subtotal-item { font-weight: 800; text-align: right; color: #1e293b; }
</style>
<template>
  <div class="page-container">
    <div class="header-factura">
      <h1>Nueva Factura</h1>
      <div class="factura-meta">
        <span v-if="factura.numero" class="tag-nro">N° {{ factura.numero }}</span>
        <span class="fecha-txt">{{ new Date().toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="grid-main">
      <div class="flex-column gap-20">
        <section class="glass-card">
          <h3>Configuración de Venta</h3>
          <div class="grid-config">
            <div class="field full-mobile">
              <label>Cliente</label>
              <select v-model="factura.cliente_id" @change="actualizarCliente" class="input-moderno">
                <option value="">-- Consumidor Final --</option>
                <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>

            <div class="field">
              <label>Lista</label>
              <select v-model="listaSeleccionada" @change="recalcularPreciosPorLista" class="input-moderno">
                <option value="publico">🏷️ Público</option>
                <option value="gremio">🛠️ Gremio</option>
              </select>
            </div>

            <div class="field">
              <label>Pago</label>
              <select v-model="factura.metodo_pago" class="input-moderno">
                <option value="Contado">💵 Contado</option>
                <option value="Transferencia">🏦 Transf.</option>
                <option value="Tarjeta">💳 Tarjeta</option>
                <option value="Cuenta Corriente">📑 Cta. Cte.</option>
              </select>
            </div>
          </div>
        </section>

        <section class="glass-card">
          <div class="section-header">
            <h3>Detalle de Productos</h3>
            <button @click="agregarItem" class="btn-add-mini">+ Agregar</button>
          </div>

          <table class="table-moderna desktop-only">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in factura.items" :key="index">
                <td>
                  <select v-model="item.producto_id" @change="actualizarItem(index)" class="input-moderno">
                    <option value="">-- Seleccionar --</option>
                    <option v-for="p in stock" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </td>
                <td><input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-moderno mini" /></td>
                <td><span class="precio-txt">$ {{ item.precio.toLocaleString() }}</span></td>
                <td><span class="total-txt">$ {{ (item.cantidad * item.precio).toLocaleString() }}</span></td>
                <td><button @click="removerItem(index)" class="btn-delete">×</button></td>
              </tr>
            </tbody>
          </table>

          <div class="mobile-only items-container">
            <div v-for="(item, index) in factura.items" :key="'mob-'+index" class="item-card-mobile">
              <div class="card-row">
                <select v-model="item.producto_id" @change="actualizarItem(index)" class="input-moderno select-full">
                  <option value="">-- Seleccionar Producto --</option>
                  <option v-for="p in stock" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
                <button @click="removerItem(index)" class="btn-delete-card">×</button>
              </div>
              <div class="card-row mt-10">
                <div class="qty-control">
                  <label>Cant.</label>
                  <input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-moderno mini" />
                </div>
                <div class="price-info">
                  <span class="sub-label">Subtotal</span>
                  <span class="val">$ {{ (item.cantidad * item.precio).toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <button @click="agregarItem" class="btn-add-full">+ Agregar Fila</button>
          </div>
        </section>
      </div>

      <section class="resumen-section glass-card">
        <div class="totales">
          <div class="total-row"><span>Subtotal:</span> <span>$ {{ factura.subtotal.toLocaleString() }}</span></div>
          <div class="total-row"><span>IVA (21%):</span> <span>$ {{ factura.iva.toLocaleString() }}</span></div>
          <div class="total-row grand-total"><span>TOTAL:</span> <span>$ {{ factura.total.toLocaleString() }}</span></div>
        </div>
        
        <div class="pago-info" v-if="factura.metodo_pago === 'Cuenta Corriente'">
          <p class="warning-text">⚠️ Se registrará como deuda del cliente.</p>
        </div>

        <div class="acciones-finales">
          <button @click="guardar" class="btn-primary" :disabled="guardando || factura.items.length === 0">
            {{ guardando ? 'Guardando...' : 'Emitir Factura' }}
          </button>
          <button @click="router.push('/facturacion')" class="btn-cancelar">Cancelar</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// (El script se mantiene igual que el tuyo, la lógica es sólida)
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { getClientes, getStockItems, getNextNumeroFactura, saveFactura, registrarMovimientoCaja } from "@/services/data";

const router = useRouter();
const guardando = ref(false);
const clientes = ref([]);
const stock = ref([]);
const listaSeleccionada = ref('publico');

const factura = reactive({
  numero: "",
  cliente_id: "",
  cliente_nombre: "",
  metodo_pago: "Contado",
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0,
  estado: "EMITIDA"
});

onMounted(async () => {
  const [cli, prod] = await Promise.all([getClientes(), getStockItems()]);
  clientes.value = cli;
  stock.value = prod;
  factura.numero = await getNextNumeroFactura();
  agregarItem();
});

function agregarItem() {
  factura.items.push({ producto_id: "", nombre: "", cantidad: 1, precio: 0 });
}

function removerItem(index) {
  factura.items.splice(index, 1);
  calcularTotales();
}

function actualizarCliente() {
  const c = clientes.value.find(cli => cli.id === factura.cliente_id);
  factura.cliente_nombre = c ? c.nombre : "Consumidor Final";
}

function actualizarItem(index) {
  const p = stock.value.find(prod => prod.id === factura.items[index].producto_id);
  if (p) {
    factura.items[index].precio = listaSeleccionada.value === 'gremio' ? (p.precio_gremio || p.precio) : p.precio;
    factura.items[index].nombre = p.nombre;
  }
  calcularTotales();
}

function recalcularPreciosPorLista() {
  factura.items.forEach((item, index) => {
    if (item.producto_id) actualizarItem(index);
  });
}

function calcularTotales() {
  const sub = factura.items.reduce((acc, i) => acc + (Number(i.cantidad) * Number(i.precio)), 0);
  factura.subtotal = sub;
  factura.iva = sub * 0.21;
  factura.total = sub * 1.21;
}

async function guardar() {
  if (factura.metodo_pago === 'Cuenta Corriente' && !factura.cliente_id) {
    return alert("Debe seleccionar un cliente para vender en Cuenta Corriente");
  }

  guardando.value = true;
  try {
    const nuevaFactura = await saveFactura(factura);
    if (factura.metodo_pago === 'Cuenta Corriente') {
      await supabase.from('cuentas_corrientes').insert([{
        cliente_id: factura.cliente_id,
        factura_id: nuevaFactura.id,
        monto: factura.total,
        saldo: factura.total
      }]);
    } else {
      await registrarMovimientoCaja('ingreso', factura.total, `Venta Fac. #${nuevaFactura.numero}`, 'Ventas', factura.cliente_id, factura.metodo_pago);
    }
    alert("Factura emitida correctamente");
    router.push("/facturacion");
  } catch (error) {
    console.error(error);
    alert("Error al guardar");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.page-container { padding: 15px; max-width: 1200px; margin: auto; }
.header-factura { margin-bottom: 20px; }
.header-factura h1 { font-size: 1.5rem; font-weight: 900; }
.factura-meta { color: #64748b; font-size: 0.9rem; display: flex; gap: 10px; }
.tag-nro { background: #e2e8f0; padding: 2px 8px; border-radius: 6px; font-weight: 700; color: #0f172a; }

.grid-main { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }

.glass-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.grid-config { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; margin-top: 15px; }

.field label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; display: block; }
.input-moderno { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.95rem; }
.input-moderno:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

/* TABLA DESKTOP */
.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; padding-bottom: 10px; }
.table-moderna td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }

/* RESUMEN Y TOTALES */
.grand-total { font-size: 1.8rem; font-weight: 900; color: #1e293b; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 800; cursor: pointer; width: 100%; transition: 0.3s; }
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

/* HELPERS MOBILE */
.mobile-only { display: none; }
.desktop-only { display: table; }

@media (max-width: 900px) {
  .grid-main { grid-template-columns: 1fr; }
  .grid-config { grid-template-columns: 1fr 1fr; }
  .full-mobile { grid-column: span 2; }
  .desktop-only { display: none; }
  .mobile-only { display: block; }

  .item-card-mobile {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
  }
  
  .card-row { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
  .select-full { flex: 1; }
  .qty-control { display: flex; align-items: center; gap: 10px; }
  .qty-control .input-moderno { width: 70px; }
  .price-info { text-align: right; }
  .sub-label { display: block; font-size: 0.65rem; color: #64748b; text-transform: uppercase; }
  .val { font-weight: 800; color: #2563eb; }
  
  .btn-delete-card { background: #fee2e2; color: #ef4444; border: none; width: 35px; height: 35px; border-radius: 8px; font-weight: bold; }
  .btn-add-full { width: 100%; padding: 12px; background: white; border: 2px dashed #cbd5e1; border-radius: 12px; color: #2563eb; font-weight: 700; margin-top: 5px; }
  
  .resumen-section {
    position: sticky;
    bottom: 10px;
    z-index: 10;
    box-shadow: 0 -10px 20px rgba(0,0,0,0.1);
  }
}

.mt-10 { margin-top: 10px; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.btn-add-mini { background: #eff6ff; color: #2563eb; border: none; padding: 5px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }
</style>
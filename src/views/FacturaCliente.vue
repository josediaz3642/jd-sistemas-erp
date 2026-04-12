<template>
  <div class="page-container">
    <div class="header-factura">
      <h1>Nueva Factura</h1>
      <div class="factura-meta">
        <span v-if="factura.numero">N° {{ factura.numero }}</span>
        <span>Fecha: {{ new Date().toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="grid-main">
      <div class="flex-column gap-20">
        <section class="glass-card">
          <h3>Configuración de Venta</h3>
          <div class="grid-config">
            <div class="field">
              <label>Cliente</label>
              <select v-model="factura.cliente_id" @change="actualizarCliente" class="input-moderno">
                <option value="">-- Consumidor Final --</option>
                <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>

            <div class="field">
              <label>Lista de Precios</label>
              <select v-model="listaSeleccionada" @change="recalcularPreciosPorLista" class="input-moderno">
                <option value="publico">🏷️ Precio Público</option>
                <option value="gremio">🛠️ Precio Gremio</option>
              </select>
            </div>

            <div class="field">
              <label>Condición de Pago</label>
              <select v-model="factura.metodo_pago" class="input-moderno">
                <option value="Contado">💵 Contado</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Tarjeta">💳 Tarjeta</option>
                <option value="Cuenta Corriente">📑 Cuenta Corriente</option>
              </select>
            </div>
          </div>
        </section>

        <section class="glass-card">
          <h3>Detalle de Productos</h3>
          <table class="table-moderna">
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
                    <option value="">-- Seleccionar Producto --</option>
                    <option v-for="p in stock" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </td>
                <td><input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-moderno mini" /></td>
                <td><span>$ {{ item.precio.toLocaleString() }}</span></td>
                <td><span>$ {{ (item.cantidad * item.precio).toLocaleString() }}</span></td>
                <td><button @click="removerItem(index)" class="btn-delete">×</button></td>
              </tr>
            </tbody>
          </table>
          <button @click="agregarItem" class="btn-add">+ Agregar Fila</button>
        </section>
      </div>

      <section class="resumen-section glass-card">
        <div class="totales">
          <div class="total-row"><span>Subtotal:</span> <span>$ {{ factura.subtotal.toLocaleString() }}</span></div>
          <div class="total-row"><span>IVA (21%):</span> <span>$ {{ factura.iva.toLocaleString() }}</span></div>
          <div class="total-row grand-total"><span>TOTAL:</span> <span>$ {{ factura.total.toLocaleString() }}</span></div>
        </div>
        
        <div class="pago-info" v-if="factura.metodo_pago === 'Cuenta Corriente'">
          <p class="warning-text">⚠️ Esta venta se registrará como deuda del cliente.</p>
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
  metodo_pago: "Contado", // Valor por defecto
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
    // Elige el precio según la lista seleccionada
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
    // 1. Guardar Factura
    const nuevaFactura = await saveFactura(factura);

    // 2. Impacto Financiero
    if (factura.metodo_pago === 'Cuenta Corriente') {
      await supabase.from('cuentas_corrientes').insert([{
        cliente_id: factura.cliente_id,
        factura_id: nuevaFactura.id,
        monto: factura.total,
        saldo: factura.total
      }]);
    } else {
      await registrarMovimientoCaja(
        'ingreso',
        factura.total,
        `Venta Fac. #${nuevaFactura.numero}`,
        'Ventas',
        factura.cliente_id,
        factura.metodo_pago
      );
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
/* Mix de tus estilos con mejoras de espaciado */
.page-container { padding: 20px; max-width: 1100px; margin: auto; }
.header-factura { display: flex; justify-content: space-between; margin-bottom: 20px; }
.grid-main { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.glass-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.grid-config { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.input-moderno { padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; }
.input-moderno.mini { width: 80px; }
.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; font-size: 0.8rem; color: #64748b; padding-bottom: 10px; }
.table-moderna td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.totales { display: flex; flex-direction: column; gap: 8px; }
.total-row { display: flex; justify-content: space-between; color: #64748b; }
.grand-total { font-size: 1.6rem; font-weight: bold; color: #1e293b; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px; }
.warning-text { color: #b45309; font-size: 0.85rem; margin-top: 15px; background: #fffbeb; padding: 10px; border-radius: 6px; }
.acciones-finales { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 12px; border-radius: 8px; cursor: pointer; }
.btn-add { background: #f8fafc; border: 1px dashed #cbd5e1; width: 100%; padding: 10px; border-radius: 8px; margin-top: 15px; color: #2563eb; cursor: pointer; }
.btn-delete { color: #ef4444; background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.flex-column { display: flex; flex-direction: column; }
.gap-20 { gap: 20px; }
</style>
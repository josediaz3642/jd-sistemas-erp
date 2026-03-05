<template>
  <div class="page-container">
    <div class="header-factura">
      <h1>Nueva Factura</h1>
      <div class="factura-meta">
        <span v-if="factura.numero_factura">N° {{ factura.numero_factura }}</span>
        <span>Fecha: {{ new Date().toLocaleDateString() }}</span>
      </div>
    </div>

    <div class="grid-main">
      <section class="cliente-section glass-card">
        <h3>Datos del Cliente</h3>
        <div class="field">
          <label>Seleccionar Cliente</label>
          <select v-model="factura.cliente_id" @change="actualizarCliente" class="input-moderno">
            <option value="">-- Seleccionar --</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
      </section>

      <section class="items-section glass-card">
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
                  <option value="">-- Seleccionar --</option>
                  <option v-for="p in stock" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </td>
              <td><input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-moderno mini" /></td>
              <td><span>$ {{ item.precio }}</span></td>
              <td><span>$ {{ (item.cantidad * item.precio).toFixed(2) }}</span></td>
              <td><button @click="removerItem(index)" class="btn-delete">×</button></td>
            </tr>
          </tbody>
        </table>
        <button @click="agregarItem" class="btn-add">+ Agregar Fila</button>
      </section>

      <section class="resumen-section glass-card">
        <div class="totales">
          <div class="total-row"><span>Subtotal:</span> <span>$ {{ factura.subtotal.toFixed(2) }}</span></div>
          <div class="total-row"><span>IVA (21%):</span> <span>$ {{ factura.iva.toFixed(2) }}</span></div>
          <div class="total-row grand-total"><span>TOTAL:</span> <span>$ {{ factura.total.toFixed(2) }}</span></div>
        </div>
        <div class="acciones-finales">
          <button @click="guardar" class="btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Emitir Factura' }}
          </button>
          <button @click="router.push('/facturas')" class="btn-cancelar">Cancelar</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getClientes, getStockItems, getNextNumeroFactura, saveFactura } from "@/services/data";

const router = useRouter();
const route = useRoute();
const guardando = ref(false);
const clientes = ref([]);
const stock = ref([]);

const factura = reactive({
  numero_factura: "",
  cliente_id: "",
  cliente_nombre: "",
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0,
  estado: "EMITIDA"
});

onMounted(async () => {
  try {
    const [cli, prod] = await Promise.all([getClientes(), getStockItems()]);
    clientes.value = cli;
    stock.value = prod;

    if (route.params.id === 'nuevo' || !route.params.id) {
      factura.numero_factura = await getNextNumeroFactura();
      agregarItem();
    }
  } catch (err) {
    console.error("Error al inicializar:", err);
  }
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
  if (c) factura.cliente_nombre = c.nombre;
}

function actualizarItem(index) {
  const p = stock.value.find(prod => prod.id === factura.items[index].producto_id);
  if (p) {
    factura.items[index].precio = p.precio;
    factura.items[index].nombre = p.nombre;
  }
  calcularTotales();
}

function calcularTotales() {
  const sub = factura.items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0);
  factura.subtotal = sub;
  factura.iva = sub * 0.21;
  factura.total = sub * 1.21;
}

async function guardar() {
  if (!factura.cliente_id) return alert("Selecciona un cliente");
  if (factura.items.length === 0) return alert("Agrega al menos un producto");

  guardando.value = true;
  try {
    await saveFactura(factura);
    router.push("/facturacion");
  } catch (error) {
    alert("Error al guardar factura");
    console.error(error);
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.page-container { padding: 20px; max-width: 1000px; margin: auto; }
.header-factura { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.glass-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.grid-main { display: grid; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.input-moderno { padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; }
.input-moderno.mini { width: 70px; }
.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; color: #64748b; font-size: 0.8rem; padding-bottom: 10px; }
.table-moderna td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.totales { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; padding: 20px 0; }
.total-row { display: flex; gap: 20px; color: #64748b; }
.grand-total { font-size: 1.5rem; font-weight: bold; color: #1e293b; border-top: 2px solid #f1f5f9; padding-top: 10px; }
.acciones-finales { display: flex; gap: 10px; margin-top: 20px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; flex: 2; font-weight: bold; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; flex: 1; }
.btn-add { background: #f8fafc; border: 1px dashed #cbd5e1; width: 100%; padding: 12px; border-radius: 8px; cursor: pointer; margin-top: 10px; color: #2563eb; font-weight: 600; }
.btn-delete { color: #ef4444; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
</style>
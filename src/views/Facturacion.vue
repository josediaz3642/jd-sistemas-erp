<template>
  <div class="card">
    <h1>Facturación</h1>

    <!-- Mensaje -->
    <p v-if="mensaje" class="msg">{{ mensaje }}</p>

    <!-- CLIENTE -->
    <label>Seleccionar Cliente</label>
    <select v-model="factura.clienteId">
      <option disabled value="">-- Seleccionar --</option>
      <option v-for="c in clientes" :key="c.id" :value="c.id">
        {{ c.nombre }} - {{ c.cuit }}
      </option>
    </select>

    <!-- ITEMS -->
    <h3>Items</h3>

    <div class="item-row">
      <select v-model="nuevoItem.productoId">
        <option disabled value="">Producto…</option>
        <option v-for="p in stock" :key="p.id" :value="p.id">
          {{ p.descripcion }} - ${{ p.precio }}
        </option>
      </select>

      <input type="number" v-model.number="nuevoItem.cantidad" placeholder="Cantidad" />
      <button @click="agregarItem">Agregar</button>
    </div>

    <table class="tabla">
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
        <tr v-for="(it, index) in items" :key="index">
          <td>{{ it.descripcion }}</td>
          <td>{{ it.cantidad }}</td>
          <td>{{ it.precio }}</td>
          <td>{{ it.total }}</td>
          <td><button @click="borrarItem(index)" class="btn-delete">X</button></td>
        </tr>
      </tbody>
    </table>

    <h2>Total: ${{ totalFactura }}</h2>

    <button class="btn-primary" @click="guardarFactura">Guardar Factura</button>
    <button class="btn-secondary" @click="exportarPDF">Exportar PDF</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getClientes,
  getStockItems,
  saveFactura,
  getEmpresa
} from "@/services/data";

const clientes = ref([]);
const stock = ref([]);
const items = ref([]);
const mensaje = ref("");

const factura = ref({
  clienteId: "",
  fecha: new Date().toISOString().split("T")[0]
});

const nuevoItem = ref({
  productoId: "",
  cantidad: 1
});

onMounted(() => {
  clientes.value = getClientes();
  stock.value = getStockItems();
});

/* -------------------------------
   AGREGAR ITEM
--------------------------------*/
function agregarItem() {
  const prod = stock.value.find(p => p.id === nuevoItem.value.productoId);
  if (!prod) return;

  items.value.push({
    productoId: prod.id,
    descripcion: prod.descripcion,
    cantidad: nuevoItem.value.cantidad,
    precio: prod.precio,
    total: prod.precio * nuevoItem.value.cantidad
  });

  nuevoItem.value = { productoId: "", cantidad: 1 };
}

/* -------------------------------
   BORRAR ITEM
--------------------------------*/
function borrarItem(i) {
  items.value.splice(i, 1);
}

/* -------------------------------
   TOTAL FACTURA
--------------------------------*/
const totalFactura = computed(() =>
  items.value.reduce((acc, it) => acc + it.total, 0)
);

/* -------------------------------
   GUARDAR FACTURA
--------------------------------*/
function guardarFactura() {
  if (!factura.value.clienteId) {
    mensaje.value = "Debe seleccionar un cliente";
    return;
  }

  const dataGuardar = {
    ...factura.value,
    items: items.value,
    total: totalFactura.value
  };

  saveFactura(dataGuardar);
  mensaje.value = "Factura guardada correctamente";

  setTimeout(() => (mensaje.value = ""), 3000);
}

/* -------------------------------
   EXPORTAR PDF
--------------------------------*/
function exportarPDF() {
  const doc = new jsPDF();

  const cliente = clientes.value.find(c => c.id === factura.value.clienteId);
  const empresa = getEmpresa();

  doc.setFontSize(14);
  doc.text(empresa.nombre, 10, 10);
  doc.text("Factura - Cliente: " + cliente.nombre, 10, 20);

  autoTable(doc, {
    head: [["Producto", "Cant.", "Precio", "Total"]],
    body: items.value.map(it => [
      it.descripcion,
      it.cantidad,
      it.precio,
      it.total
    ])
  });

  doc.text("TOTAL: $" + totalFactura.value, 10, doc.lastAutoTable.finalY + 15);

  doc.save("factura.pdf");
}
</script>

<style scoped>
.card {
  padding: 20px;
  background: #fff;
}
.msg {
  color: green;
  font-weight: bold;
}
.tabla {
  width: 100%;
  margin-top: 15px;
  border-collapse: collapse;
}
.tabla th,
.tabla td {
  border: 1px solid #ccc;
  padding: 6px;
}
.btn-delete {
  background: red;
  color: white;
}
</style>

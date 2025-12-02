<template>
  <div class="card">
    <h1>Facturas del Proveedor</h1>

    <button class="btn btn-primary" @click="nuevaFactura">Nueva Factura</button>

    <table class="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>N° Factura</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in facturas" :key="f.id">
          <td>{{ f.fecha }}</td>
          <td>{{ f.numero }}</td>
          <td>$ {{ f.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  getFacturasProveedorById,
  saveFacturaProveedor
} from "@/services/data.js";

const route = useRoute();
const proveedorId = route.params.id;

const facturas = ref([]);

onMounted(() => {
  facturas.value = getFacturasProveedorById(proveedorId);
});

function nuevaFactura() {
  const numero = prompt("Número de factura:");
  const total = prompt("Importe total:");

  if (!numero || !total) return;

  saveFacturaProveedor({
    proveedorId,
    fecha: new Date().toISOString().slice(0, 10),
    numero,
    total
  });

  facturas.value = getFacturasProveedorById(proveedorId);
}
</script>

<style scoped>
.table {
  width: 100%;
  margin-top: 20px;
}

.btn {
  margin-bottom: 10px;
}
</style>

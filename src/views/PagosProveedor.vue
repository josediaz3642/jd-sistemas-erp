<template>
  <div class="card">
    <h1>Pagos al Proveedor</h1>

    <button class="btn btn-primary" @click="nuevoPago">Registrar Pago</button>

    <table class="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Medio</th>
          <th>Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pagos" :key="p.id">
          <td>{{ p.fecha }}</td>
          <td>{{ p.medio }}</td>
          <td>$ {{ p.monto }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  getPagosProveedorById,
  savePagoProveedor
} from "@/services/data.js";

const route = useRoute();
const proveedorId = route.params.id;

const pagos = ref([]);

onMounted(() => {
  pagos.value = getPagosProveedorById(proveedorId);
});

function nuevoPago() {
  const medio = prompt("Medio de pago (efectivo, transferencia, cheque):");
  const monto = prompt("Monto del pago:");

  if (!medio || !monto) return;

  savePagoProveedor({
    proveedorId,
    fecha: new Date().toISOString().slice(0, 10),
    medio,
    monto
  });

  pagos.value = getPagosProveedorById(proveedorId);
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

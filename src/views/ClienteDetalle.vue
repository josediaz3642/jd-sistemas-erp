<template>
  <div class="page">
    <div class="card-glass">
      <button class="btn" @click="volver">← Volver</button>

      <h1>{{ cliente?.nombre }}</h1>

      <hr />

      <h3>Resumen Comercial</h3>

      <p><strong>Total Facturado:</strong> ${{ totalFacturado }}</p>
      <p><strong>Cantidad de Facturas:</strong> {{ facturasCliente.length }}</p>
<button class="btn-primary" @click="nuevaFactura">
  + Nueva factura para este cliente
</button>

      <hr />

      <h3>Historial de Facturas</h3>

      <table v-if="facturasCliente.length > 0">
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="f in facturasCliente" :key="f.id">
            <td>{{ f.numero }}</td>
            <td>{{ new Date(f.fecha).toLocaleDateString("es-AR") }}</td>
            <td>${{ f.total }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>No hay facturas registradas.</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { getClientes, getFacturas } from "@/services/data";

const route = useRoute();
const router = useRouter();

const clientes = getClientes();
const facturas = getFacturas();

const cliente = clientes.find(
  c => c.id === Number(route.params.id)
);

const facturasCliente = computed(() =>
  facturas.filter(f => f.cliente === cliente?.nombre)
);

const totalFacturado = computed(() =>
  facturasCliente.value.reduce((acc, f) => acc + f.total, 0)
);

function volver() {
  router.push("/clientes");
}
function nuevaFactura() {
  router.push({
    path: "/facturacion",
    query: { cliente: cliente.nombre }
  });
}

</script>

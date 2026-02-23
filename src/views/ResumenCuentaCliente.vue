<template>
  <div class="container">
    <h1>Resumen del Cliente</h1>

    <div class="card">
      <p><strong>Facturas:</strong> {{ facturas.length }}</p>
      <p><strong>Pagos:</strong> {{ pagos.length }}</p>
    </div>

    <h2>Items vendidos</h2>
    <ul>
      <li v-for="item in items" :key="item.producto">
        {{ item.producto }} — {{ item.cantidad }}
      </li>
    </ul>

    <h2>Datos del Cliente</h2>
    <div v-if="cliente" class="card">
      <p><strong>Nombre:</strong> {{ cliente.nombre }}</p>
      <p><strong>CUIT:</strong> {{ cliente.cuit }}</p>
      <p><strong>Dirección:</strong> {{ cliente.direccion }}</p>

      <div class="buttons">
        <router-link :to="`/cliente/${cliente.id}`" class="btn">Volver</router-link>
      </div>
    </div>

    <p v-else>Cargando datos...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  getFacturasCliente,
  getPagosCliente,
  getItemsVendidosCliente,
  getClientes
} from "@/services/data";

const route = useRoute();
const id = Number(route.params.id);

// Datos
const cliente = ref(null);
const facturas = ref([]);
const pagos = ref([]);
const items = ref([]);

onMounted(() => {
  const lista = getClientes();
  cliente.value = lista.find(c => c.id === id) || null;

  facturas.value = getFacturasCliente(id);
  pagos.value = getPagosCliente(id);
  items.value = getItemsVendidosCliente(id);
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: auto;
}

.card {
  padding: 20px;
  background: #ffffff50;
  border: 1px solid #ffffff40;
  backdrop-filter: blur(8px);
  border-radius: 10px;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 15px;
  text-decoration: none;
  background: #007bff;
  color: white;
  border-radius: 6px;
}
</style>

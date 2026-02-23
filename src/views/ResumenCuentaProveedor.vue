<template>
  <div>
    <h1>Resumen del Proveedor</h1>

    <div class="card">
      <p><strong>Facturas:</strong> {{ facturas.length }}</p>
      <p><strong>Pagos:</strong> {{ pagos.length }}</p>
    </div>

    <h2>Items Comprados</h2>
    <ul>
      <li v-for="item in items" :key="item.producto">
        {{ item.producto }} — {{ item.cantidad }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import {
  getFacturasProveedor,
  getPagosProveedor,
  getItemsCompradosProveedor
} from "@/services/data";

const route = useRoute();
const id = Number(route.params.id); 

const facturas = getFacturasProveedor(id);
const pagos = getPagosProveedor(id);
const items = getItemsCompradosProveedor(id);
</script>

<style>
.card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
}
</style>

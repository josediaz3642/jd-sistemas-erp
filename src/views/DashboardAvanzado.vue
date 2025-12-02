<template>
  <div class="container">
    <h1>Dashboard Avanzado</h1>

    <div class="cards">
      <div class="card">Facturación Total: {{ totales.facturacion }}</div>
      <div class="card">Compras Proveedores: {{ totales.compras }}</div>
      <div class="card">Cheques Emitidos: {{ totales.chequesEmitidos }}</div>
      <div class="card">Cheques Recibidos: {{ totales.chequesRecibidos }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const totales = ref({
  facturacion: 0,
  compras: 0,
  chequesEmitidos: 0,
  chequesRecibidos: 0,
});
</script>

<style>
.container { padding: 20px; }
.cards { display: flex; gap: 20px; margin-top: 20px; }
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

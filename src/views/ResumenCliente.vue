<template>
  <div>
    <h1>Resumen de Cuenta - Clientes</h1>

    <div class="section">
      <h2>Facturas Generadas</h2>
      <p>Total: {{ resumen.facturas }}</p>
    </div>

    <div class="section">
      <h2>Items Vendidos</h2>
      <p>Total: {{ resumen.itemsVendidos }}</p>
    </div>

    <div class="section">
      <h2>Cheques Recibidos</h2>
      <p>Total: {{ resumen.cheques }}</p>
    </div>

  </div>
</template>

<script setup>
import { reactive } from "vue";

const resumen = reactive({
  facturas: 0,
  itemsVendidos: 0,
  cheques: 0,
});
</script>

<style>
.section {
  background: white;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>

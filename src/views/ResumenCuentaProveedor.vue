<template>
  <div class="container">
    <h1>Resumen de Cuenta - Proveedores</h1>

    <div class="grid">
      <div class="box">Facturas Recibidas: {{ resumen.facturas }}</div>
      <div class="box">Pagos Realizados: {{ resumen.pagos }}</div>
      <div class="box">Items Comprados: {{ resumen.items }}</div>
      <div class="box">Cheques Emitidos: {{ resumen.cheques }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const resumen = ref({
  facturas: 0,
  pagos: 0,
  items: 0,
  cheques: 0,
});
</script>

<style>
.container { padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.box {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

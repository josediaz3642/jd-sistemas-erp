<template>
  <EstadoCuenta :tipo="'proveedor'" :id="id" />
</template>

<script setup>
import EstadoCuenta from "./EstadoCuenta.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const id = Number(route.params.id);
</script>

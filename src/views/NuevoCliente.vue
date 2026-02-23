<template>
  <div class="container card-glass">
    <h1>Nuevo Cliente</h1>

    <form @submit.prevent="guardar">
      <input v-model="cliente.nombre" placeholder="Nombre" required />
      <input v-model="cliente.cuit" placeholder="CUIT" />
      <input v-model="cliente.direccion" placeholder="Dirección" />

      <button class="btn">Guardar</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { saveCliente } from "@/services/data";

const router = useRouter();

const cliente = reactive({
  nombre: "",
  cuit: "",
  direccion: ""
});

function guardar() {
  const nuevo = saveCliente(cliente);
  router.push(`/cliente/${nuevo.id}`);
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
}

input {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
}

.btn {
  padding: 10px 20px;
}
</style>

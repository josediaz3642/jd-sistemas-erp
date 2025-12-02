<template>
  <div class="card page">
    <h1>Proveedor</h1>

    <form @submit.prevent="guardar">
      <input v-model="proveedor.nombre" placeholder="Nombre" class="input" />
      <input v-model="proveedor.cuit" placeholder="CUIT" class="input" />
      <input v-model="proveedor.telefono" placeholder="Teléfono" class="input" />

      <button class="btn btn-primary">Guardar</button>
    </form>

    <hr>

    <button class="btn btn-secondary"
      @click="router.push(`/proveedor/${id}/facturas`)">
      Facturas del proveedor
    </button>

    <button class="btn btn-secondary"
      @click="router.push(`/proveedor/${id}/pagos`)">
      Pagos realizados
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProveedores, saveProveedor } from "@/services/data";

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const proveedor = ref({
  nombre: "",
  cuit: "",
  telefono: ""
});

onMounted(() => {
  if (id !== 0) {
    const lista = getProveedores();
    const data = lista.find(p => p.id === id);
    if (data) proveedor.value = { ...data };
  }
});

function guardar() {
  saveProveedor({ ...proveedor.value, id });
  alert("Guardado");
  router.push("/proveedores");
}
</script>

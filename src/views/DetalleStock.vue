<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getStockById,
  saveStockItem,
  deleteStockItem
} from "@/services/data";

const route = useRoute();
const router = useRouter();

const producto = ref({
  nombre: "",
  precio: 0,
  cantidad: 0
});

onMounted(() => {
  if (route.params.id) {
    const p = getStockById(route.params.id);
    if (p) producto.value = { ...p };
  }
});

function guardar() {
  saveStockItem(producto.value);
  router.push("/stock");
}

function eliminar() {
  if (!producto.value.id) return;
  deleteStockItem(producto.value.id);
  router.push("/stock");
}
</script>

<template>
  <div class="page">
    <div class="card-glass">
      <h1>
        {{ producto.id ? "Editar producto" : "Nuevo producto" }}
      </h1>

      <label>Nombre</label>
      <input v-model="producto.nombre" />

      <label>Precio</label>
      <input type="number" v-model.number="producto.precio" />

      <label>Cantidad</label>
      <input type="number" v-model.number="producto.cantidad" />

      <div class="actions">
        <button class="btn-primary" @click="guardar">
          Guardar
        </button>

        <button
          v-if="producto.id"
          class="btn-danger"
          @click="eliminar"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

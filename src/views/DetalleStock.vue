<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
// Las funciones ahora sí existen en data.js
import {
  getStockById,
  saveStockItem,
  deleteStockItem,
  getStockItems // Agregamos esta por si la necesitas
} from "@/services/data";

const route = useRoute();
const router = useRouter();

const producto = ref({
  nombre: "",
  precio: 0,
  cantidad: 0
});

onMounted(() => {
  if (route.params.id && route.params.id !== 'nuevo') {
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
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    deleteStockItem(producto.value.id);
    router.push("/stock");
  }
}
</script>

<template>
  <div class="page-container">
    <div class="form-card glass-card">
      <h2>{{ producto.id ? "Editar Producto" : "Nuevo Producto" }}</h2>
      
      <div class="field">
        <label>Nombre del Producto</label>
        <input v-model="producto.nombre" class="input-moderno" placeholder="Ej: Coca Cola 1.5L" />
      </div>

      <div class="field">
        <label>Precio de Venta</label>
        <input type="number" v-model.number="producto.precio" class="input-moderno" />
      </div>

      <div class="field">
        <label>Cantidad en Stock</label>
        <input type="number" v-model.number="producto.cantidad" class="input-moderno" />
      </div>

      <div class="actions">
        <button class="btn-primary" @click="guardar">Guardar</button>
        <button v-if="producto.id" class="btn-danger" @click="eliminar">Eliminar</button>
        <button class="btn-cancelar" @click="router.push('/stock')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 40px; display: flex; justify-content: center; }
.form-card { width: 100%; max-width: 500px; padding: 30px; background: white; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.field { margin-bottom: 20px; display: flex; flex-direction: column; }
label { font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 8px; }
.input-moderno { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
.actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; }
.btn-danger { background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; }
.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; }
</style>
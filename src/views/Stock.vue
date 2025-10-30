<template>
  <div class="stock-page card">
    <h1>Gestión de Stock</h1>

    <div class="form-container">
      <h2>{{ currentItem.id ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h2>
      <input v-model="currentItem.nombre" placeholder="Nombre del Producto" required />
      <textarea v-model="currentItem.descripcion" placeholder="Descripción del Ítem"></textarea>
      <input v-model.number="currentItem.cantidad" type="number" placeholder="Cantidad" required />
      <input v-model.number="currentItem.precio" type="number" placeholder="Precio Venta" required />

      <button @click="saveItem" class="btn-save">Guardar</button>
      <button v-if="currentItem.id" @click="cancelEdit" class="btn-cancel">Cancelar</button>
    </div>

    <table class="stock-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in stockItems" :key="item.id">
          <td>{{ item.nombre }}</td>
          <td>{{ item.descripcion }}</td>
          <td>{{ item.cantidad }}</td>
          <td>${{ item.precio.toFixed(2) }}</td>
          <td>
            <button @click="editItem(item)" class="btn-edit">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStockItems, saveStockItem } from '@/services/data.js';

const stockItems = ref([]);
const currentItem = ref({ id: null, nombre: '', descripcion: '', cantidad: 0, precio: 0 });

onMounted(() => {
  stockItems.value = getStockItems();
});

function saveItem() {
  if (!currentItem.value.nombre) return alert('Nombre requerido');
  
  // Usamos el servicio para guardar el item
  saveStockItem({ ...currentItem.value });

  // Recargamos los items desde el servicio para reflejar los cambios
  stockItems.value = getStockItems();

  cancelEdit();
}

function editItem(item) {
  currentItem.value = { ...item };
}

function cancelEdit() {
  currentItem.value = { id: null, nombre: '', descripcion: '', cantidad: 0, precio: 0 };
}
</script>

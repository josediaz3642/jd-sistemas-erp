<template>
  <div class="card stock-page">
    <h1>Gestión de Stock</h1>

    <!-- Mensaje de Estado -->
    <div v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">
      {{ statusMessage }}
    </div>

    <!-- Formulario -->
    <section class="form-section">
      <h2>{{ editando ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
      <form @submit.prevent="guardarProducto" class="form-grid">
        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <input id="descripcion" class="form-input" v-model="form.descripcion" required placeholder="Nombre del producto" />
        </div>
        <div class="form-group">
          <label for="cantidad">Cantidad</label>
          <input id="cantidad" class="form-input" v-model.number="form.cantidad" type="number" min="0" required placeholder="Cantidad inicial" />
        </div>
        <div class="form-group">
          <label for="precio">Precio</label>
          <input id="precio" class="form-input" v-model.number="form.precio" type="number" min="0" step="0.01" required placeholder="Precio unitario" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
          <button v-if="editando" @click="resetForm" type="button" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </section>

    <!-- Tabla de Stock -->
    <section>
      <h2>Inventario Actual</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="stock.length === 0">
              <td colspan="4" style="text-align: center; color: var(--text-secondary);">No hay productos en stock.</td>
            </tr>
            <tr v-for="item in stock" :key="item.id">
              <td>{{ item.descripcion }}</td>
              <td>{{ item.cantidad }}</td>
              <td>${{ item.precio.toFixed(2) }}</td>
              <td>
                <button @click="editarProducto(item)" class="btn btn-secondary">Editar</button>
                <button @click="confirmarEliminar(item.id)" class="btn btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal de Confirmación (Oculto por defecto) -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content card">
        <h2>Confirmar Eliminación</h2>
        <p>¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button @click="eliminarProductoConfirmado" class="btn btn-danger">Sí, Eliminar</button>
          <button @click="showDeleteConfirm = false" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Importa las funciones REPARADAS y ESTANDARIZADAS
import { getStockItems, saveStockItem, deleteStockItem } from '@/services/data';

const stock = ref([]);
const editando = ref(false);
const form = ref({
  id: null,
  descripcion: '',
  cantidad: 0,
  precio: 0
});

// Para mensajes y modal (reemplaza alert/confirm)
const statusMessage = ref('');
const isError = ref(false);
const showDeleteConfirm = ref(false);
const itemToDeleteId = ref(null);

// Cargar datos
onMounted(() => {
  stock.value = getStockItems();
});

function showMessage(msg, error = false) {
  statusMessage.value = msg;
  isError.value = error;
  setTimeout(() => { statusMessage.value = ''; }, 3000);
}

function resetForm() {
  form.value = { id: null, descripcion: '', cantidad: 0, precio: 0 };
  editando.value = false;
}

// Lógica CRUD
function guardarProducto() {
  if (!form.value.descripcion || form.value.precio <= 0) {
    showMessage('Por favor, complete la descripción y el precio.', true);
    return;
  }
  
  saveStockItem({ ...form.value });
  stock.value = getStockItems(); // Recargar
  showMessage(editando.value ? 'Producto actualizado.' : 'Producto guardado.', false);
  resetForm();
}

function editarProducto(item) {
  form.value = { ...item };
  editando.value = true;
  window.scrollTo(0, 0); // Subir al formulario
}

function confirmarEliminar(id) {
  itemToDeleteId.value = id;
  showDeleteConfirm.value = true;
}

function eliminarProductoConfirmado() {
  deleteStockItem(itemToDeleteId.value);
  stock.value = getStockItems(); // Recargar
  showMessage('Producto eliminado.', false);
  showDeleteConfirm.value = false;
  itemToDeleteId.value = null;
}
</script>

<style scoped>
/* (Hereda estilos de style.css) */
.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-actions {
  grid-column: 1 / -1; /* Ocupa toda la fila */
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

/* Estilos de Modal (reemplaza confirm()) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  max-width: 450px;
  padding: 30px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
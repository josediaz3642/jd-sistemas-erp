<template>
  <div class="card clientes-page">
    <h1>Gestión de Clientes (CRUD)</h1>
    
    <!-- Mensaje de Estado -->
    <div v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">
      {{ statusMessage }}
    </div>

    <!-- Formulario -->
    <div class="form-container">
      <h2>{{ currentCliente.id ? 'Editar Cliente' : 'Agregar Nuevo Cliente' }}</h2>
      
      <form @submit.prevent="saveClienteAction" class="form-grid-clientes">
        <div class="form-group">
          <label>Nombre</label>
          <input class="form-input" v-model="currentCliente.nombre" placeholder="Nombre (Solo Letras)" @input="validateNombre" required />
          <span v-if="errors.nombre" class="error-msg-inline">{{ errors.nombre }}</span>
        </div>
        
        <div class="form-group">
          <label>CUIT/CUIL/DNI</label>
          <input class="form-input" v-model="currentCliente.cuit" placeholder="CUIT/CUIL/DNI (11 Números)" @input="validateCuit" required />
          <span v-if="errors.cuit" class="error-msg-inline">{{ errors.cuit }}</span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input class="form-input" v-model="currentCliente.email" type="email" placeholder="Email (ejemplo@gmail.com)" @input="validateEmail" required />
          <span v-if="errors.email" class="error-msg-inline">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>Teléfono</label>
          <input class="form-input" v-model="currentCliente.telefono" placeholder="Teléfono" />
        </div>

        <div class="form-group">
          <label>Dirección</label>
          <input class="form-input" v-model="currentCliente.direccion" placeholder="Dirección" />
        </div>

        <div class="form-group">
          <label>Condición IVA</label>
          <select class="form-select" v-model="currentCliente.condicionIVA">
            <option value="CF">Consumidor Final</option>
            <option value="RI">Responsable Inscripto</option>
            <option value="MT">Monotributo</option>
          </select>
        </div>

        <div class="form-actions-clientes">
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">{{ currentCliente.id ? 'Actualizar' : 'Guardar' }}</button>
          <button v-if="currentCliente.id" @click="cancelEdit" type="button" class="btn btn-secondary">Cancelar Edición</button>
        </div>
      </form>
    </div>

    <!-- Tabla de Clientes -->
    <section>
      <h2>Lista de Clientes</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
             <tr v-if="clientes.length === 0">
              <td colspan="5" style="text-align: center; color: var(--text-secondary);">No hay clientes registrados.</td>
            </tr>
            <tr v-for="cliente in clientes" :key="cliente.id">
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.cuit }}</td>
              <td>{{ cliente.email }}</td>
              <td>{{ cliente.telefono }}</td>
              <td>
                <button @click="editCliente(cliente)" class="btn btn-secondary">Editar</button>
                <button @click="confirmarEliminar(cliente.id)" class="btn btn-danger">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal de Confirmación -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content card">
        <h2>Confirmar Eliminación</h2>
        <p>¿Está seguro de que desea eliminar este cliente?</p>
        <div class="modal-actions">
          <button @click="deleteClienteAction" class="btn btn-danger">Sí, Eliminar</button>
          <button @click="showDeleteConfirm = false" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Importa las funciones REPARADAS de data.js
import { getClientes, saveCliente, deleteCliente } from '@/services/data'; 

const clientes = ref([]);
const currentCliente = ref({ 
  id: null, 
  nombre: '', 
  cuit: '', 
  email: '', 
  telefono: '', 
  direccion: '', 
  condicionIVA: 'CF' 
});
const errors = ref({ nombre: '', cuit: '', email: '' });

// Para mensajes y modal (reemplaza alert/confirm)
const statusMessage = ref('');
const isError = ref(false);
const showDeleteConfirm = ref(false);
const itemToDeleteId = ref(null);

onMounted(() => {
  clientes.value = getClientes();
});

function showMessage(msg, error = false) {
  statusMessage.value = msg;
  isError.value = error;
  setTimeout(() => { statusMessage.value = ''; }, 3000);
}

// LÓGICA DE VALIDACIÓN (Sin cambios)
const validateNombre = () => { /* ... */ errors.value.nombre = /^[a-zA-Z\s]*$/.test(currentCliente.value.nombre) ? '' : 'Solo letras y espacios.'; };
const validateCuit = () => { 
  let value = currentCliente.value.cuit.replace(/[^0-9]/g, ''); 
  if (value.length > 11) value = value.slice(0, 11);
  currentCliente.value.cuit = value;
  errors.value.cuit = value.length !== 11 ? 'Debe tener 11 números.' : '';
};
const validateEmail = () => { /* ... */ errors.value.email = /^[^@]+@[^@]+\.[^@]+$/.test(currentCliente.value.email) ? '' : 'Email no válido.'; };

const isFormValid = computed(() => {
  return !errors.value.nombre && !errors.value.cuit && !errors.value.email &&
         currentCliente.value.nombre && currentCliente.value.cuit.length === 11 && currentCliente.value.email;
});

// LÓGICA CRUD (Actualizada)
const saveClienteAction = () => {
  if (!isFormValid.value) {
    showMessage('Por favor, corrige los errores del formulario.', true);
    return;
  }
  
  saveCliente({...currentCliente.value}); // Usa la función REPARADA
  clientes.value = getClientes(); // Recargar
  showMessage(currentCliente.value.id ? 'Cliente actualizado.' : 'Cliente guardado.', false);
  cancelEdit();
};

const editCliente = (cliente) => { 
  currentCliente.value = {...cliente}; 
  errors.value = { nombre: '', cuit: '', email: '' }; 
  window.scrollTo(0, 0);
};

const cancelEdit = () => { 
  currentCliente.value = { id: null, nombre: '', cuit: '', email: '', telefono: '', direccion: '', condicionIVA: 'CF' }; 
  errors.value = { nombre: '', cuit: '', email: '' };
};

function confirmarEliminar(id) {
  itemToDeleteId.value = id;
  showDeleteConfirm.value = true;
}

const deleteClienteAction = () => {
  deleteCliente(itemToDeleteId.value); // Usa la función NUEVA
  clientes.value = getClientes();
  showMessage('Cliente eliminado.', false);
  showDeleteConfirm.value = false;
  itemToDeleteId.value = null;
};
</script>

<style scoped>
/* (Hereda estilos de style.css) */
.form-grid-clientes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.error-msg-inline {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 4px;
}

.form-actions-clientes {
  grid-column: 1 / -1;
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
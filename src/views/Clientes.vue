<template>
  <div class="clientes-page">
    <h1>Gestión de Clientes (CRUD)</h1>
    
    <div class="form-container">
      <h2>{{ currentCliente.id ? 'Editar Cliente' : 'Agregar Nuevo Cliente' }}</h2>
      
      <input v-model="currentCliente.nombre" placeholder="Nombre (Solo Letras)" @input="validateNombre" required />
      <span v-if="errors.nombre" class="error-msg">{{ errors.nombre }}</span>
      
      <input v-model="currentCliente.cuit" placeholder="CUIT/CUIL/DNI (11 Números)" @input="validateCuit" required />
      <span v-if="errors.cuit" class="error-msg">{{ errors.cuit }}</span>
      
      <input v-model="currentCliente.email" type="email" placeholder="Email (ejemplo@gmail.com)" @input="validateEmail" required />
      <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
      
      <input v-model="currentCliente.telefono" placeholder="Teléfono" />
      <input v-model="currentCliente.direccion" placeholder="Dirección" />
      <select v-model="currentCliente.condicionIVA">
        <option value="CF">Consumidor Final</option>
        <option value="RI">Responsable Inscripto</option>
        <option value="MT">Monotributo</option>
      </select>

      <button @click="saveClienteAction" :disabled="!isFormValid" class="btn-save">Guardar Cliente</button>
      <button v-if="currentCliente.id" @click="cancelEdit" class="btn-cancel">Cancelar Edición</button>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>Nombre</th><th>CUIT</th><th>Email</th><th>Condición IVA</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente.id">
          <td>{{ cliente.nombre }}</td>
          <td>{{ cliente.cuit }}</td>
          <td>{{ cliente.email }}</td>
          <td>{{ cliente.condicionIVA }}</td>
          <td>
            <button @click="editCliente(cliente)" class="btn-edit">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getClientes as fetchClientes, saveCliente as commitSaveCliente } from '@/services/data'; 

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

onMounted(() => {
  clientes.value = fetchClientes();
});

// LÓGICA DE VALIDACIÓN (ya proporcionada)
const validateNombre = () => { /* ... lógica ... */ errors.value.nombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(currentCliente.value.nombre) ? '' : 'Solo se permiten letras en el nombre.'; };
const validateCuit = () => { 
  let value = currentCliente.value.cuit.replace(/[^0-9]/g, ''); 
  if (value.length > 11) value = value.slice(0, 11);
  currentCliente.value.cuit = value;
  errors.value.cuit = value.length !== 11 ? 'Debe tener exactamente 11 números.' : '';
};
const validateEmail = () => { /* ... lógica ... */ errors.value.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentCliente.value.email) ? '' : 'El formato de email no es válido.'; };

const isFormValid = computed(() => {
  return !errors.value.nombre && !errors.value.cuit && !errors.value.email &&
         currentCliente.value.nombre && currentCliente.value.cuit.length === 11 && currentCliente.value.email;
});

// LÓGICA CRUD
const saveClienteAction = () => {
  if (!isFormValid.value) return alert('Corrige los errores del formulario.');
  commitSaveCliente({...currentCliente.value});
  clientes.value = fetchClientes();
  cancelEdit();
};

const editCliente = (cliente) => { currentCliente.value = {...cliente}; errors.value = { nombre: '', cuit: '', email: '' }; };
const cancelEdit = () => { currentCliente.value = { id: null, nombre: '', cuit: '', email: '', telefono: '', direccion: '', condicionIVA: 'CF' }; };
</script>

<style scoped>
/* Estilos omitidos */
.error-msg { color: red; font-size: 0.8em; display: block; margin-bottom: 5px; }
input, select { display: block; width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; }
</style>
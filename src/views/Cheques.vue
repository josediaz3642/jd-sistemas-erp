<template>
  <div class="card cheques-page">
    <h1>Gestión de Cheques</h1>

    <!-- Mensaje de Estado -->
    <div v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">
      {{ statusMessage }}
    </div>

    <!-- === Formulario === -->
    <section class="cheque-form">
      <h2>{{ editando ? 'Editar Cheque' : 'Nuevo Cheque' }}</h2>
      <form @submit.prevent="guardarCheque" class="form-grid-cheques">
        
        <div class="form-group">
          <label>Tipo de Cheque:</label>
          <select class="form-select" v-model="form.tipo" required>
            <option value="Recibido">Recibido</option>
            <option value="Emitido">Emitido</option>
          </select>
        </div>

        <div class="form-group">
          <label>Número:</label>
          <input class="form-input" v-model="form.numero" type="text" required placeholder="Ingrese número de cheque" />
        </div>

        <div class="form-group">
          <label>Monto:</label>
          <input class="form-input" v-model.number="form.monto" type="number" min="1" required placeholder="Monto del cheque" />
        </div>

        <div class="form-group">
          <label>Fecha de Emisión:</label>
          <input class="form-input" v-model="form.fechaEmision" type="date" required />
        </div>

        <div class="form-group">
          <label>Fecha de Vencimiento:</label>
          <input class="form-input" v-model="form.fechaVencimiento" type="date" required />
        </div>

        <!-- Campos Condicionales -->
        <div v-if="form.tipo === 'Recibido'" class="form-group">
          <label>Nombre del Emisor:</label>
          <input class="form-input" v-model="form.nombreEmisor" type="text" placeholder="Ej: Cliente A" />
        </div>
        <div v-if="form.tipo === 'Recibido'" class="form-group">
          <label>Fecha Recibido:</label>
          <input class="form-input" v-model="form.fechaRecibido" type="date" />
        </div>

        <div v-if="form.tipo === 'Emitido'" class="form-group">
          <label>Beneficiario:</label>
          <input class="form-input" v-model="form.beneficiario" type="text" placeholder="Ej: Proveedor B" />
        </div>
        
        <div class="form-actions-cheques">
          <button type="submit" class="btn btn-primary">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
          <button v-if="editando" @click="resetForm" type="button" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </section>

    <!-- === Tabla de Cheques === -->
    <section>
      <h2>Cheques en Cartera</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Número</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Emisor/Beneficiario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cheques.length === 0">
              <td colspan="6" style="text-align: center; color: var(--text-secondary);">No hay cheques registrados.</td>
            </tr>
            <tr v-for="cheque in cheques" :key="cheque.id">
              <td>
                <span :class="cheque.tipo === 'Recibido' ? 'tag-success' : 'tag-danger'">
                  {{ cheque.tipo }}
                </span>
              </td>
              <td>{{ cheque.numero }}</td>
              <td>${{ cheque.monto.toFixed(2) }}</td>
              <td>{{ cheque.fechaVencimiento }}</td>
              <td>{{ cheque.tipo === 'Recibido' ? cheque.nombreEmisor : cheque.beneficiario }}</td>
              <td>
                <button @click="editarCheque(cheque)" class="btn btn-secondary">Editar</button>
                <button @click="confirmarEliminar(cheque.id)" class="btn btn-danger">Eliminar</button>
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
        <p>¿Está seguro de que desea eliminar este cheque?</p>
        <div class="modal-actions">
          <button @click="eliminarChequeConfirmado" class="btn btn-danger">Sí, Eliminar</button>
          <button @click="showDeleteConfirm = false" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Importa las funciones REPARADAS de data.js
import { getCheques, saveCheque, deleteCheque } from '@/services/data';

const cheques = ref([]);
const editando = ref(false);
const form = ref({
  id: null,
  tipo: 'Recibido',
  monto: '',
  numero: '',
  fechaVencimiento: '',
  fechaEmision: '',
  beneficiario: '',
  fechaRecibido: '',
  nombreEmisor: '',
});

// Para mensajes y modal (reemplaza alert/confirm)
const statusMessage = ref('');
const isError = ref(false);
const showDeleteConfirm = ref(false);
const itemToDeleteId = ref(null);

onMounted(() => {
  cheques.value = getCheques();
});

function showMessage(msg, error = false) {
  statusMessage.value = msg;
  isError.value = error;
  setTimeout(() => { statusMessage.value = ''; }, 3000);
}

function resetForm() {
  form.value = {
    id: null, tipo: 'Recibido', monto: '', numero: '', 
    fechaVencimiento: '', fechaEmision: '', beneficiario: '', 
    fechaRecibido: '', nombreEmisor: ''
  };
  editando.value = false;
}

// Lógica CRUD (Actualizada)
const guardarCheque = () => {
  saveCheque({ ...form.value }); // Usa la función REPARADA
  cheques.value = getCheques();
  showMessage(editando.value ? 'Cheque actualizado.' : 'Cheque guardado.', false);
  resetForm();
};

const editarCheque = (cheque) => {
  form.value = { ...cheque };
  editando.value = true;
  window.scrollTo(0, 0);
};

function confirmarEliminar(id) {
  itemToDeleteId.value = id;
  showDeleteConfirm.value = true;
}

const eliminarChequeConfirmado = () => {
  deleteCheque(itemToDeleteId.value); // Usa la función NUEVA que causaba el error
  cheques.value = getCheques();
  showMessage('Cheque eliminado.', false);
  showDeleteConfirm.value = false;
  itemToDeleteId.value = null;
};
</script>

<style scoped>
/* (Hereda estilos de style.css) */
.form-grid-cheques {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
.form-actions-cheques {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

/* Estilos de Tags para Tipo */
.tag-success {
  background-color: var(--accent-light);
  color: var(--success);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
}
.tag-danger {
  background-color: #fee2e2;
  color: var(--error);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
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

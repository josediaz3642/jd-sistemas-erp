<template>
  <div class="cheques-page">
    <h1>Gestión de Cheques</h1>

    <!-- === Formulario === -->
    <section class="cheque-form">
      <h2>{{ editando ? 'Editar Cheque' : 'Nuevo Cheque' }}</h2>
      <form @submit.prevent="guardarCheque">
        <div class="form-group">
          <label>Tipo de Cheque:</label>
          <select v-model="form.tipo" required>
            <option value="Recibido">Recibido</option>
            <option value="Emitido">Emitido</option>
          </select>
        </div>

        <div class="form-group">
          <label>Número:</label>
          <input v-model="form.numero" type="text" required placeholder="Ingrese número de cheque" />
        </div>

        <div class="form-group">
          <label>Monto:</label>
          <input v-model.number="form.monto" type="number" min="1" required placeholder="Monto del cheque" />
        </div>

        <div class="form-group">
          <label>Fecha de Emisión:</label>
          <input v-model="form.fechaEmision" type="date" required />
        </div>

        <div class="form-group">
          <label>Fecha de Vencimiento:</label>
          <input v-model="form.fechaVencimiento" type="date" required />
        </div>

        <div class="form-group" v-if="form.tipo === 'Recibido'">
          <label>Nombre del Emisor:</label>
          <input v-model="form.nombreEmisor" type="text" required placeholder="Banco o persona que emitió el cheque" />
        </div>

        <div class="form-group" v-if="form.tipo === 'Emitido'">
          <label>Beneficiario:</label>
          <input v-model="form.beneficiario" type="text" required placeholder="Persona o empresa beneficiaria" />
        </div>

        <div class="form-group">
          <label>Fecha Recibido (opcional):</label>
          <input v-model="form.fechaRecibido" type="date" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editando ? 'Actualizar' : 'Guardar' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="resetForm">Cancelar</button>
        </div>
      </form>
    </section>

    <!-- === Listado de Cheques === -->
    <section class="cheques-list">
      <h2>Cheques Recibidos</h2>
      <table class="data-table" v-if="chequesRecibidos.length">
        <thead>
          <tr>
            <th>Número</th>
            <th>Monto</th>
            <th>Emisor</th>
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chequesRecibidos" :key="c.id">
            <td>{{ c.numero }}</td>
            <td>${{ c.monto.toLocaleString() }}</td>
            <td>{{ c.nombreEmisor }}</td>
            <td>{{ c.fechaEmision }}</td>
            <td>{{ c.fechaVencimiento }}</td>
            <td>
              <button class="btn btn-edit" @click="editarCheque(c)">Editar</button>
              <button class="btn btn-danger" @click="eliminarCheque(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay cheques recibidos registrados.</p>

      <h2>Cheques Emitidos</h2>
      <table class="data-table" v-if="chequesEmitidos.length">
        <thead>
          <tr>
            <th>Número</th>
            <th>Monto</th>
            <th>Beneficiario</th>
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in chequesEmitidos" :key="c.id">
            <td>{{ c.numero }}</td>
            <td>${{ c.monto.toLocaleString() }}</td>
            <td>{{ c.beneficiario }}</td>
            <td>{{ c.fechaEmision }}</td>
            <td>{{ c.fechaVencimiento }}</td>
            <td>
              <button class="btn btn-edit" @click="editarCheque(c)">Editar</button>
              <button class="btn btn-danger" @click="eliminarCheque(c.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay cheques emitidos registrados.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCheques, saveCheque, deleteCheque as deleteChequeService } from '@/services/data.js';

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

onMounted(() => {
  cheques.value = getCheques();
});

const chequesRecibidos = computed(() => cheques.value.filter(c => c.tipo === 'Recibido'));
const chequesEmitidos = computed(() => cheques.value.filter(c => c.tipo === 'Emitido'));

const guardarCheque = () => {
  // Validaciones simples
  if (!form.value.numero || !form.value.monto || !form.value.fechaEmision || !form.value.fechaVencimiento) {
    alert('Por favor complete todos los campos obligatorios.');
    return;
  }

  saveCheque({ ...form.value });
  alert(editando.value ? 'Cheque actualizado correctamente.' : 'Cheque guardado correctamente.');
  
  cheques.value = getCheques();
  resetForm();
};

const editarCheque = (cheque) => {
  form.value = { ...cheque };
  editando.value = true;
};

const eliminarCheque = (id) => {
  if (confirm('¿Desea eliminar este cheque?')) {
    deleteChequeService(id);
    cheques.value = getCheques();
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    tipo: 'Recibido',
    monto: '',
    numero: '',
    fechaVencimiento: '',
    fechaEmision: '',
    beneficiario: '',
    fechaRecibido: '',
    nombreEmisor: '',
  };
  editando.value = false;
};
</script>

<style scoped>
.cheques-page {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}

form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-primary { background: #007bff; color: #fff; }
.btn-secondary { background: #6c757d; color: #fff; }
.btn-edit { background: #ffc107; color: #000; }
.btn-danger { background: #dc3545; color: #fff; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.data-table th {
  background: #f0f0f0;
}
</style>

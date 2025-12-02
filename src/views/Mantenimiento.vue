<template>
  <div class="card mantenimiento-page">
    <h1>Mantenimiento de Usuarios</h1>
    <p>Gestión completa de usuarios. Solo disponible para administradores.</p>

    <!-- Mensajes globales -->
    <div v-if="globalError" class="alert error">{{ globalError }}</div>
    <div v-if="globalSuccess" class="alert success">{{ globalSuccess }}</div>

    <div class="grid">
      <!-- ================================
           LISTA USUARIOS
      ==================================== -->
      <div class="users-list">
        <div class="list-header">
          <h2>Usuarios</h2>
          <button class="btn btn-primary btn-sm" @click="nuevoUsuario">+ Nuevo</button>
        </div>

        <table v-if="usuarios.length" class="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th style="width:140px;">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="u in usuarios" :key="u.id" :class="{ selected: selectedUser?.id === u.id }">
              <td>{{ u.usuario }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.rol }}</td>
              <td>
                <button class="btn btn-sm" @click="seleccionarUsuario(u)">Editar</button>
                <button class="btn btn-danger btn-sm" @click="eliminar(u)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="empty">No hay usuarios registrados.</p>
      </div>

      <!-- ================================
           FORMULARIO
      ==================================== -->
      <div class="editor">
        <h2>{{ isNew ? 'Crear Usuario' : 'Editar Usuario' }}</h2>

        <form @submit.prevent="guardar">
          <div class="form-group">
            <label>Usuario</label>
            <input v-model="form.usuario" :disabled="!isNew" required />
          </div>

          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" required />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="form.rol" :disabled="form.usuario === 'admin'">
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>

          <div class="form-group">
            <label>Contraseña <span v-if="!isNew">(opcional)</span></label>
            <input v-model="password" type="password" :required="isNew" />
          </div>

          <div v-if="formError" class="alert error">{{ formError }}</div>
          <div v-if="formSuccess" class="alert success">{{ formSuccess }}</div>

          <div class="actions">
            <button class="btn btn-primary" type="submit">
              {{ isNew ? 'Crear' : 'Guardar Cambios' }}
            </button>
            <button class="btn btn-secondary" type="button" @click="cancelar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {
  getCurrentUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from '@/services/auth';

const router = useRouter();

// STATE
const usuarios = ref([]);
const selectedUser = ref(null);

const isNew = ref(true);
const form = ref({
  id: null,
  usuario: '',
  nombre: '',
  rol: 'usuario'
});
const password = ref('');

const globalError = ref('');
const globalSuccess = ref('');
const formError = ref('');
const formSuccess = ref('');

onMounted(async () => {
  const user = getCurrentUser();
  if (!user || user.rol !== 'admin') {
    alert('Acceso denegado');
    return router.push('/dashboard');
  }
  await cargarUsuarios();
});

async function cargarUsuarios() {
  try {
    usuarios.value = await listUsers();
    if (usuarios.value.length) {
      seleccionarUsuario(usuarios.value[0]);
    }
  } catch (err) {
    globalError.value = err.message;
  }
}

function nuevoUsuario() {
  isNew.value = true;
  selectedUser.value = null;
  form.value = {
    id: null,
    usuario: '',
    nombre: '',
    rol: 'usuario'
  };
  password.value = '';
  formError.value = '';
  formSuccess.value = '';
}

function seleccionarUsuario(u) {
  isNew.value = false;
  selectedUser.value = u;

  form.value = {
    id: u.id,
    usuario: u.usuario,
    nombre: u.nombre,
    rol: u.rol
  };

  password.value = '';
  formError.value = '';
  formSuccess.value = '';
}

function cancelar() {
  if (usuarios.value.length) seleccionarUsuario(usuarios.value[0]);
  else nuevoUsuario();
}

async function guardar() {
  formError.value = '';
  formSuccess.value = '';

  if (!form.value.usuario || !form.value.nombre) {
    formError.value = 'Usuario y nombre son obligatorios';
    return;
  }

  try {
    if (isNew.value) {
      if (!password.value || password.value.length < 4) {
        formError.value = 'La contraseña debe tener al menos 4 caracteres';
        return;
      }

      await createUser({
        usuario: form.value.usuario,
        nombre: form.value.nombre,
        clave: password.value
      });

      formSuccess.value = 'Usuario creado correctamente';
    } else {
      const patch = {
        nombre: form.value.nombre,
        rol: form.value.rol
      };

      if (password.value) {
        patch.clave = password.value;
      }

      await updateUser(form.value.id, patch);

      formSuccess.value = 'Usuario actualizado correctamente';
    }

    await cargarUsuarios();
  } catch (e) {
    formError.value = e.message;
  }
}

async function eliminar(u) {
  if (!confirm(`¿Eliminar usuario "${u.usuario}"?`)) return;

  try {
    await deleteUser(u.id);
    globalSuccess.value = `Usuario "${u.usuario}" eliminado`;
    await cargarUsuarios();
  } catch (e) {
    globalError.value = e.message;
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 22px;
  margin-top: 20px;
}

/* LISTA */
.users-list {
  border-right: 1px solid var(--border-color);
  padding-right: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

.table tr.selected {
  background: rgba(0, 0, 0, 0.07);
}

.empty {
  opacity: 0.6;
}

/* EDITOR */
.editor .form-group {
  margin-bottom: 14px;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.alert {
  padding: 8px 12px;
  border-radius: 6px;
  margin: 8px 0;
}

.alert.error {
  background: rgba(192, 57, 43, 0.1);
  color: #c0392b;
}

.alert.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.btn-sm {
  font-size: 0.85rem;
  padding: 6px 10px;
}

.btn-danger {
  background: #c0392b;
  color: #fff;
}
</style>

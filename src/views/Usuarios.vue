<template>
  <div class="page-container">
    <div class="card-glass">
      <div class="header-action">
        <h2>👥 Gestión de Equipo</h2>
        <button @click="mostrarModal = true" class="btn-primary">+ Nuevo Usuario</button>
      </div>

      <table class="table-custom">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Accesos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in listaUsuarios" :key="user.id">
            <td>{{ user.nombre }}</td>
            <td>{{ user.email }}</td>
            <td><span class="badge-rol">{{ user.rol }}</span></td>
            <td>
              <div class="tags">
                <span v-for="acc in user.accesos" :key="acc" class="tag">{{ acc }}</span>
              </div>
            </td>
            <td>{{ user.estado }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Crear Acceso para Colaborador</h3>
        <form @submit.prevent="guardarUsuario">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="nuevo.nombre" type="text" required />
          </div>
          <div class="form-group">
            <label>Email de Acceso</label>
            <input v-model="nuevo.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Contraseña Inicial</label>
            <input v-model="nuevo.password" type="text" required />
          </div>

          <div class="permissions-section">
            <h4>Permisos de Acceso</h4>
            <div class="grid-checks">
              <label v-for="area in areasDisponibles" :key="area">
                <input type="checkbox" :value="area" v-model="nuevo.accesos"> {{ area }}
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Crear Usuario</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { getCurrentUser, createSubUser } from '@/services/auth';

const mostrarModal = ref(false);
const listaUsuarios = ref([]);
const areasDisponibles = ['Dashboard', 'Ventas', 'Stock', 'Clientes', 'Proveedores', 'Remitos', 'Caja', 'Mantenimiento'];

const nuevo = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'operador',
  accesos: []
});

async function cargarUsuarios() {
  const admin = getCurrentUser();
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', admin.empresa_id);
  listaUsuarios.value = data;
}

async function guardarUsuario() {
  try {
    await createSubUser(nuevo.value);
    alert("Usuario creado correctamente");
    mostrarModal.value = false;
    cargarUsuarios();
  } catch (e) {
    alert(e.message);
  }
}

onMounted(cargarUsuarios);
</script>

<style scoped>
.grid-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
.badge-rol { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.tag { background: #dbeafe; color: #1e40af; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-right: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 3000; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 450px; }
</style>
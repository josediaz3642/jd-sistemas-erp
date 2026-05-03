<template>
  <div class="usuarios-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Usuarios y Roles
        </h1>
        <p class="page-sub">Gestioná el equipo de trabajo y sus permisos de acceso.</p>
      </div>
      <button @click="nuevoUsuario" class="cs-btn cs-btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Usuario
      </button>
    </header>

    <!-- Users Grid -->
    <div class="users-grid">
      <div v-for="user in listaUsuarios" :key="user.id" class="user-card">
        <div class="user-card-top">
          <div class="user-avatar" :class="getRolColor(user.rol)">
            {{ (user.nombre || 'U')[0].toUpperCase() }}
          </div>
          <div class="user-info">
            <h3>{{ user.nombre }}</h3>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <span class="role-badge" :class="getRolColor(user.rol)">{{ user.rol }}</span>
        </div>

        <div class="user-permisos">
          <span class="permisos-label">Permisos</span>
          <div class="tags-wrap">
            <span v-for="acc in user.accesos" :key="acc" class="perm-tag">{{ acc }}</span>
            <span v-if="!user.accesos || user.accesos.length === 0" class="perm-tag perm-none">Sin permisos</span>
          </div>
        </div>

        <div class="user-card-footer">
          <span class="user-estado" :class="user.estado === 'activo' ? 'estado-activo' : 'estado-inactivo'">
            <span class="estado-dot"></span>
            {{ user.estado || 'activo' }}
          </span>
          <button @click="editarUsuario(user)" class="btn-editar">Editar</button>
        </div>
      </div>

      <div v-if="listaUsuarios.length === 0" class="empty-card">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p>No hay usuarios registrados aún.</p>
      </div>
    </div>

    <!-- ROLES LEGEND -->
    <div class="roles-legend">
      <h4>Jerarquía de Roles</h4>
      <div class="roles-row">
        <div class="role-item">
          <span class="role-dot role-superadmin"></span>
          <div><strong>Super Admin</strong><span>Acceso total + gestión de suscripciones</span></div>
        </div>
        <div class="role-item">
          <span class="role-dot role-admin"></span>
          <div><strong>Administrador</strong><span>Acceso total a la empresa</span></div>
        </div>
        <div class="role-item">
          <span class="role-dot role-operador"></span>
          <div><strong>Operador</strong><span>Acceso según permisos asignados</span></div>
        </div>
        <div class="role-item">
          <span class="role-dot role-viewer"></span>
          <div><strong>Visualizador</strong><span>Solo lectura</span></div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ nuevo.id ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
          <button @click="mostrarModal = false" class="modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form @submit.prevent="guardarUsuario" class="modal-form">
          <div class="form-row">
            <div class="field">
              <label>Nombre Completo</label>
              <input v-model="nuevo.nombre" type="text" required placeholder="Juan Pérez" />
            </div>
            <div class="field">
              <label>Email de Acceso</label>
              <input v-model="nuevo.email" type="email" required placeholder="usuario@empresa.com" />
            </div>
          </div>

          <div class="form-row">
            <div class="field" v-if="!nuevo.id">
              <label>Contraseña Inicial</label>
              <input v-model="nuevo.password" type="text" required placeholder="Min. 6 caracteres" />
            </div>
            <div class="field" v-else>
              <label>Estado</label>
              <select v-model="nuevo.estado">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div class="field">
              <label>Rol</label>
              <select v-model="nuevo.rol">
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
          </div>

          <div class="permisos-section">
            <h4>Permisos de Acceso</h4>
            <p class="permisos-desc">Seleccioná los módulos a los que tendrá acceso este usuario.</p>
            <div class="permisos-grid">
              <label v-for="area in areasDisponibles" :key="area" class="perm-check">
                <input type="checkbox" :value="area" v-model="nuevo.accesos">
                <span class="perm-check-box">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span>{{ area }}</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="mostrarModal = false" class="cs-btn cs-btn-secondary">Cancelar</button>
            <button type="submit" class="cs-btn cs-btn-primary">{{ nuevo.id ? 'Guardar Cambios' : 'Crear Usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { getEmpresaId } from '@/services/data';

const mostrarModal = ref(false);
const listaUsuarios = ref([]);
const areasDisponibles = ['Dashboard', 'Ventas', 'Stock', 'Clientes', 'Proveedores', 'Remitos', 'Cheques', 'Caja', 'Reportes', 'Ajustes'];

const nuevo = ref({
  nombre: '', email: '', password: '',
  rol: 'operador', accesos: [], estado: 'activo'
});

function nuevoUsuario() {
  nuevo.value = { nombre: '', email: '', password: '', rol: 'operador', accesos: [], estado: 'activo' };
  mostrarModal.value = true;
}

function editarUsuario(u) {
  nuevo.value = { ...u };
  mostrarModal.value = true;
}

function getRolColor(rol) {
  const map = { superadmin: 'role-superadmin', admin: 'role-admin', operador: 'role-operador', viewer: 'role-viewer' };
  return map[rol] || 'role-operador';
}

async function cargarUsuarios() {
  try {
    const { data } = await supabase.from('usuarios').select('*').eq('empresa_id', getEmpresaId());
    listaUsuarios.value = data || [];
  } catch (e) {
    console.error('Error cargando usuarios:', e);
  }
}

async function guardarUsuario() {
  try {
    if (nuevo.value.id) {
      const { error } = await supabase.from('usuarios').update({
        nombre: nuevo.value.nombre,
        email: nuevo.value.email,
        rol: nuevo.value.rol,
        accesos: nuevo.value.accesos,
        estado: nuevo.value.estado
      }).eq('id', nuevo.value.id);
      if (error) throw error;
      alert("Usuario actualizado correctamente");
    } else {
      const { error } = await supabase.from('usuarios').insert([{
        nombre: nuevo.value.nombre,
        email: nuevo.value.email,
        rol: nuevo.value.rol,
        accesos: nuevo.value.accesos,
        estado: 'activo',
        empresa_id: getEmpresaId()
      }]);
      if (error) throw error;
      alert("Usuario creado correctamente");
    }

    mostrarModal.value = false;
    nuevo.value = { nombre: '', email: '', password: '', rol: 'operador', accesos: [], estado: 'activo' };
    cargarUsuarios();
  } catch (e) {
    alert(e.message || "Error al guardar usuario");
  }
}

onMounted(cargarUsuarios);
</script>

<style scoped>
.usuarios-page { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 900; color: var(--cs-text-primary); }
.page-sub { font-size: 0.85rem; color: var(--cs-text-muted); margin-top: 4px; }

/* Users Grid */
.users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 24px; }

.user-card {
  background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg); padding: 20px;
  box-shadow: var(--cs-shadow-sm); transition: all var(--cs-transition);
}
.user-card:hover { box-shadow: var(--cs-shadow-md); transform: translateY(-2px); }

.user-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

.user-avatar {
  width: 42px; height: 42px; border-radius: var(--cs-radius-md);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem; color: white; flex-shrink: 0;
}
.user-avatar.role-superadmin { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.user-avatar.role-admin { background: var(--cs-gradient-brand); }
.user-avatar.role-operador { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
.user-avatar.role-viewer { background: linear-gradient(135deg, #64748b, #94a3b8); }

.user-info { flex: 1; min-width: 0; }
.user-info h3 { font-size: 0.9rem; font-weight: 700; color: var(--cs-text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 0.75rem; color: var(--cs-text-muted); }

.role-badge {
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; padding: 3px 10px; border-radius: var(--cs-radius-full);
}
.role-badge.role-superadmin { background: rgba(245,158,11,0.1); color: #f59e0b; }
.role-badge.role-admin { background: rgba(99,102,241,0.1); color: var(--cs-brand-500); }
.role-badge.role-operador { background: rgba(6,182,212,0.1); color: var(--cs-accent-500); }
.role-badge.role-viewer { background: rgba(148,163,184,0.1); color: var(--cs-text-muted); }

.user-permisos { margin-bottom: 14px; }
.permisos-label { font-size: 0.65rem; font-weight: 700; color: var(--cs-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
.perm-tag { font-size: 0.65rem; padding: 2px 8px; border-radius: var(--cs-radius-full); background: var(--cs-brand-100); color: var(--cs-brand-700); font-weight: 600; }
.perm-none { background: var(--cs-bg-tertiary); color: var(--cs-text-muted); }

.user-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--cs-border-soft); }
.user-estado { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
.estado-dot { width: 6px; height: 6px; border-radius: 50%; }
.estado-activo { color: var(--cs-success); }
.estado-activo .estado-dot { background: var(--cs-success); }
.estado-inactivo { color: var(--cs-text-muted); }
.estado-inactivo .estado-dot { background: var(--cs-text-muted); }
.btn-editar { background: none; border: 1px solid var(--cs-border-medium); color: var(--cs-text-secondary); padding: 4px 10px; border-radius: var(--cs-radius-sm); font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all var(--cs-transition-fast); }
.btn-editar:hover { background: var(--cs-bg-secondary); color: var(--cs-text-primary); }

.empty-card { grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--cs-text-muted); }
.empty-card p { margin-top: 12px; font-size: 0.85rem; }

/* Roles Legend */
.roles-legend {
  background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg); padding: 20px; box-shadow: var(--cs-shadow-sm);
}
.roles-legend h4 { font-size: 0.8rem; font-weight: 700; color: var(--cs-text-secondary); margin-bottom: 16px; }
.roles-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.role-item { display: flex; align-items: flex-start; gap: 10px; }
.role-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.role-dot.role-superadmin { background: #f59e0b; }
.role-dot.role-admin { background: var(--cs-brand-500); }
.role-dot.role-operador { background: var(--cs-accent-500); }
.role-dot.role-viewer { background: var(--cs-text-muted); }
.role-item strong { display: block; font-size: 0.8rem; color: var(--cs-text-primary); }
.role-item span { font-size: 0.7rem; color: var(--cs-text-muted); }

/* Modal */
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 1.1rem; font-weight: 800; }
.modal-close { background: none; border: none; color: var(--cs-text-muted); cursor: pointer; padding: 4px; }
.modal-close:hover { color: var(--cs-text-primary); transform: none; }

.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--cs-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }

.permisos-section { background: var(--cs-bg-tertiary); padding: 16px; border-radius: var(--cs-radius-md); }
.permisos-section h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; }
.permisos-desc { font-size: 0.75rem; color: var(--cs-text-muted); margin-bottom: 12px; }
.permisos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.perm-check {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.8rem; font-weight: 500; color: var(--cs-text-secondary);
  cursor: pointer; padding: 6px 8px; border-radius: var(--cs-radius-sm);
  transition: background var(--cs-transition-fast);
}
.perm-check:hover { background: var(--cs-bg-primary); }
.perm-check input { display: none; }
.perm-check-box {
  width: 20px; height: 20px; border: 2px solid var(--cs-border-medium);
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
  transition: all var(--cs-transition-fast); flex-shrink: 0;
}
.perm-check-box svg { opacity: 0; color: white; }
.perm-check input:checked + .perm-check-box {
  background: var(--cs-brand-500); border-color: var(--cs-brand-500);
}
.perm-check input:checked + .perm-check-box svg { opacity: 1; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

@media (max-width: 768px) {
  .users-grid { grid-template-columns: 1fr; }
  .roles-row { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .permisos-grid { grid-template-columns: 1fr; }
}
</style>
<template>
  <div class="mantenimiento-page">
    <h1>Mantenimiento del Sistema</h1>
    <p>Utilice esta sección para gestionar las copias de seguridad (backup) del sistema.</p>

    <section class="backup-section">
      <h2>Exportar Datos (Backup)</h2>
      <button @click="exportarDatos" class="btn btn-primary">
        Descargar Backup JSON
      </button>
      <p class="info-text">
        Se exportarán todos los datos (Clientes, Facturas, Stock, Cheques) almacenados localmente.
      </p>
    </section>

    <section class="restore-section">
      <h2>Importar Datos (Restauración)</h2>
      <input type="file" ref="fileInput" accept=".json" @change="seleccionarArchivo" class="input-file">
      <button @click="importarDatos" :disabled="!backupFile" class="btn btn-secondary">
        Cargar Backup JSON
      </button>
      <p v-if="backupFile" class="info-text">Archivo listo para importar: {{ backupFile.name }}</p>
      <p class="warning-text">ADVERTENCIA: La importación SOBREESCRIBIRÁ todos los datos actuales.</p>
    </section>

    <section class="user-management-section">
      <h2>Gestión de Usuarios y Permisos</h2>
      <div v-if="editingUser" class="edit-user-form">
        <h3>Editando: {{ editingUser.username }}</h3>
        <label>Nuevo Rol:</label>
        <select v-model="editingUser.role">
          <option value="Administrador">Administrador (Acceso Total)</option>
          <option value="Gerente">Gerente (Acceso Parcial)</option>
          <option value="Vendedor">Vendedor (Acceso Limitado)</option>
        </select>

        <label>Nueva Contraseña:</label>
        <input v-model="editingUser.password" type="password" placeholder="Dejar vacío para no cambiar"/>

        <button @click="saveUserChanges" class="btn btn-primary">Guardar Cambios</button>
        <button @click="editingUser = null" class="btn btn-secondary">Cancelar</button>
      </div>

      <table class="data-table">
        <thead>
          <tr><th>Usuario</th><th>Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="editUser(user)" class="btn btn-edit">Editar Permisos</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';


// === Estados principales ===
const backupFile = ref(null);
const dataKeys = ['clientes', 'facturas', 'stock', 'cheques'];
const usuarios = ref([]);
const editingUser = ref(null);
const originalPassword = ref('');

// === Cargar usuarios al iniciar ===
onMounted(() => {
  usuarios.value = getUsuarios();
});

// === Funciones de gestión de usuarios ===
const editUser = (user) => {
  editingUser.value = { ...user };
  originalPassword.value = user.password;
};

const saveUserChanges = () => {
  if (!editingUser.value) return;

  if (!editingUser.value.password) {
    editingUser.value.password = originalPassword.value;
  }

  if (updateUser(editingUser.value)) {
    alert(`Usuario ${editingUser.value.username} actualizado a rol: ${editingUser.value.role}`);
    usuarios.value = getUsuarios();
    editingUser.value = null;
  } else {
    alert('Error al actualizar el usuario.');
  }
};

// === Funciones de Backup ===
const exportarDatos = () => {
  const backupData = {};
  dataKeys.forEach(key => {
    const data = localStorage.getItem(key);
    backupData[key] = data ? JSON.parse(data) : [];
  });

  const jsonContent = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `contasoft-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Datos exportados con éxito.');
};

const seleccionarArchivo = (event) => {
  backupFile.value = event.target.files[0];
};

const importarDatos = () => {
  if (!backupFile.value) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      let importCount = 0;
      dataKeys.forEach(key => {
        if (Array.isArray(importedData[key])) {
          localStorage.setItem(key, JSON.stringify(importedData[key]));
          importCount++;
        }
      });

      if (importCount > 0) {
        alert(`Restauración exitosa. ${importCount} colecciones importadas.`);
        window.location.reload();
      } else {
        alert('Error: el JSON no contiene las colecciones esperadas.');
      }
    } catch (error) {
      alert('Error: archivo inválido o estructura incorrecta.');
      console.error(error);
    }
  };
  reader.readAsText(backupFile.value);
};
</script>

<style scoped>
.mantenimiento-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.backup-section, .restore-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
}
h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.btn { padding: 10px 15px; margin-right: 10px; cursor: pointer; border: none; border-radius: 4px; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
.input-file { margin-top: 10px; display: block; }
.info-text { font-size: 0.9em; color: #555; margin-top: 5px; }
.warning-text { font-size: 0.9em; color: #dc3545; font-weight: bold; margin-top: 10px; }
</style>

<template>
  <div class="dashboard">
    <h1>Dashboard Principal</h1>
    <p>Bienvenido a <strong>Contasoft ERP</strong></p>

    <!-- Accesos principales -->
    <router-link to="/clientes">Clientes</router-link>
<router-link to="/proveedores">Proveedores</router-link>
<router-link to="/facturacion">Facturación</router-link>
<router-link to="/cheques">Cheques</router-link>
<router-link to="/stock">Stock</router-link>

<!-- NUEVOS -->
<router-link to="/dashboard-avanzado">Dashboard Avanzado</router-link>
<router-link to="/resumen-clientes">Resumen Clientes</router-link>
<router-link to="/resumen-proveedores">Resumen Proveedores</router-link>
    

    <!-- Accesos exclusivos admin -->
    <div v-if="user?.rol === 'admin'" class="admin-panel">
      <h3>Herramientas de Administración</h3>
      <button @click="go('/mantenimiento')" class="btn admin">
        Gestión de Usuarios
      </button>
    </div>

    <!-- Cerrar sesión -->
    <button class="btn logout" @click="logout">Cerrar sesión</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getCurrentUser, logoutUser } from "@/services/auth";

const router = useRouter();
const user = getCurrentUser();

function go(path) {
  router.push(path);
}

function logout() {
  logoutUser();
  router.push("/login");
}
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: auto;
  padding: 25px;
  text-align: center;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
  margin: 25px 0;
}

.btn {
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn:hover {
  background: #2980b9;
}

.special {
  background: #8e44ad;
}

.admin-panel {
  margin-top: 30px;
  padding: 20px;
  border-radius: 10px;
  background: #f1f1f1;
}

.admin {
  background: #27ae60;
}

.logout {
  background: #c0392b;
  margin-top: 20px;
}
</style>

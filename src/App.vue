<template>
  <div>
    <!-- NAVBAR SUPERIOR -->
    <nav class="navbar">
  <router-link to="/dashboard">Inicio</router-link>
  <router-link to="/clientes">Clientes</router-link>
  <router-link to="/proveedores">Proveedores</router-link>
  <router-link to="/facturacion">Facturación</router-link>
  <router-link to="/cheques">Cheques</router-link>
  <router-link to="/stock">Stock</router-link>

  <!-- NUEVOS MÓDULOS -->
  <router-link to="/dashboard-avanzado">Dashboard Avanzado</router-link>
  <router-link to="/resumen-clientes">Resumen Clientes</router-link>
  <router-link to="/resumen-proveedores">Resumen Proveedores</router-link>

  <router-link to="/mantenimiento">Mantenimiento</router-link>
</nav>


    <!-- CONTENIDO PRINCIPAL -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup></script>

<style>
body {
  margin: 0;
  background: #f5f6f7;
  font-family: Arial, Helvetica, sans-serif;
}

.navbar {
  display: flex;
  gap: 20px;
  padding: 15px;
  background: #ffffff;
  border-bottom: 1px solid #ddd;
}

.navbar a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.navbar a.router-link-active {
  color: #007bff;
}

main {
  padding: 20px;
}
</style>

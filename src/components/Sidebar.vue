<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="logo-box">C</div>
      <span>Contasoft <strong>ERP</strong></span>
    </div>

    <nav class="menu">
      <router-link to="/dashboard" class="nav-item">
        <span class="icon">📊</span> Dashboard
      </router-link>
      
      <div class="menu-label">Operaciones</div>
      <router-link to="/facturacion" class="nav-item">
        <span class="icon">📄</span> Ventas / Facturas
      </router-link>
      <router-link to="/caja" class="nav-item">
        <span class="icon">🏦</span> Caja y Finanzas
      </router-link>
      <router-link to="/cheques" class="nav-item">
        <span class="icon">🎫</span> Cheques
      </router-link>
	<router-link to="/reportes" class="nav-item">
  <span class="icon">📈</span> Reportes de Utilidad
</router-link>
      <div class="menu-label">Inventario</div>
      <router-link to="/stock" class="nav-item">
        <span class="icon">📦</span> Stock de Productos
      </router-link>
      
      <div class="menu-label">Contactos</div>
      <router-link to="/clientes" class="nav-item">
        <span class="icon">👥</span> Clientes
      </router-link>
      <router-link to="/proveedores" class="nav-item">
        <span class="icon">🚚</span> Proveedores
      </router-link>

      <div class="menu-sep"></div>
      
      <router-link to="/ajustes" class="nav-item">
        <span class="icon">⚙️</span> Ajustes
      </router-link>
      
      <button @click="handleLogout" class="nav-item logout-btn">
        <span class="icon">🚪</span> Cerrar Sesión
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { logoutUser } from '@/services/auth';

const router = useRouter();

const handleLogout = () => {
  if (confirm('¿Deseas cerrar sesión?')) {
    logoutUser();
    router.push('/login');
  }
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid rgba(255,255,255,0.1);
  z-index: 1000;
}

.brand {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
}

.logo-box {
  background: #2563eb;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.menu {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.menu-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #64748b;
  margin: 20px 0 5px 15px;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.nav-item.router-link-active {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.menu-sep {
  margin: 20px 0;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.logout-btn {
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  margin-top: auto;
  color: #ef4444;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.icon { font-size: 1.1rem; }

.sidebar {
  width: 260px; /* Asegúrate que este número sea igual al margin-left de .main-content */
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #0f172a; /* Un azul más oscuro para separar del fondo */
  z-index: 1000;
}
</style>
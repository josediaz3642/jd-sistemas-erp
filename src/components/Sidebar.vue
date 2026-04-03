<template>
  <div>
    <button 
      @click.stop="toggleSidebar" 
      class="btn-hamburguesa"
      type="button"
    >
      <span v-if="!sidebarOpen">☰ Menú</span>
      <span v-else>✕ Cerrar</span>
    </button>

    <div 
      v-if="sidebarOpen" 
      @click="sidebarOpen = false" 
      class="overlay"
    ></div>

    <aside :class="['sidebar', { 'is-open': sidebarOpen }]">
      <div class="brand">
        <div class="logo-box">C</div>
        <span>Contasoft <strong>ERP</strong></span>
      </div>

      <nav class="menu">
        <router-link to="/dashboard" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">📊</span> Dashboard
        </router-link>
        
        <div class="menu-label">Operaciones</div>
        <router-link to="/facturacion" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">📄</span> Ventas / Facturas
        </router-link>

        <router-link to="/remitos" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">🚚</span> Remitos / Traspasos
        </router-link>

        <router-link to="/caja" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">🏦</span> Caja y Finanzas
        </router-link>
        <router-link to="/cheques" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">🎫</span> Cheques
        </router-link>
        <router-link to="/cuentas-corrientes" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">📑</span> Cuentas Corrientes
        </router-link>

        <div class="menu-label">Inventario</div>
        <router-link to="/stock" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">📦</span> Stock
        </router-link>
        
        <div class="menu-label">Configuración</div>
        <router-link to="/Mantenimiento" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">🛠️</span> Mantenimiento
        </router-link>
        <router-link to="/clientes" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">👥</span> Clientes
        </router-link>
        <router-link to="/proveedores" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">🚚</span> Proveedores
        </router-link>
        <router-link to="/ajustes" class="nav-item" @click="sidebarOpen = false">
          <span class="icon">⚙️</span> Ajustes
        </router-link>

        <div class="menu-sep"></div>
        
        <button @click="handleLogout" class="nav-item logout-btn">
          <span class="icon">🚪</span> Cerrar Sesión
        </button>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { logoutUser } from '@/services/auth';

const router = useRouter();
const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleLogout = () => {
  if (confirm('¿Deseas cerrar sesión?')) {
    logoutUser();
    router.push('/login');
  }
};
</script>

<style scoped>
.btn-hamburguesa {
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 2000;
  padding: 10px 15px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.sidebar {
  width: 260px;
  height: 100vh;
  background: #0f172a;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1500;
  transition: transform 0.3s ease;
}

.brand { padding: 25px 20px; display: flex; align-items: center; gap: 10px; color: white; }
.logo-box { background: #2563eb; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; }

.menu { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; }
.menu-label { font-size: 0.7rem; color: #64748b; margin: 15px 0 5px 10px; text-transform: uppercase; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  font-size: 0.9rem;
}

.nav-item:hover, .router-link-active {
  background: #2563eb;
  color: white;
}

.logout-btn { color: #ef4444; margin-top: 20px; }
.menu-sep { height: 1px; background: #1e293b; margin: 10px 0; }

@media (max-width: 768px) {
  .btn-hamburguesa { display: block; }
  .sidebar { transform: translateX(-100%); }
  .sidebar.is-open { transform: translateX(0); }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1400; }
}
</style>
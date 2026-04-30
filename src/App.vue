<template>
  <!-- Loader de sesión -->
  <div v-if="authStore.loading" class="global-loader">
    <div class="spinner"></div>
    <p>Iniciando tu espacio de trabajo...</p>
  </div>

  <div v-else class="app-layout">
    <!-- SIDEBAR (Desktop) - Restauramos tu lógica visual -->
    <div v-if="showLayout" class="sidebar-container desktop-only">
      <Sidebar />
    </div>
    
    <main :class="['main-content', { 'full-width': !showLayout }]">
      <Header v-if="showLayout" />
      
      <div class="view-container">
        <router-view />
      </div>
    </main>

    <!-- BOTTOM NAV (Mobile) -->
    <nav v-if="showLayout" class="bottom-nav mobile-only">
      <router-link to="/dashboard" class="nav-item">
        <span class="icon">📊</span>
        <span>Inicio</span>
      </router-link>
      <router-link to="/facturacion" class="nav-item">
        <span class="icon">🧾</span>
        <span>Ventas</span>
      </router-link>
      <router-link to="/inventario" class="nav-item">
        <span class="icon">📦</span>
        <span>Stock</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';

const route = useRoute();
const authStore = useAuthStore();

// Restauramos tu lógica visual infalible:
const showLayout = computed(() => route.path !== '/login' && route.path !== '/registro');

onMounted(async () => {
  await authStore.fetchSession();
});
</script>

<style>
/* =========================================
   VARIABLES GLOBALES (Look Profesional)
   ========================================= */
:root {
  --bg-primary: #f1f5f9;
  --bg-secondary: #ffffff;
  --card-bg: #ffffff;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --brand-color: #2563eb;
  --border-soft: #e2e8f0;
  --radius: 12px;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Reset y Base */
body, html { 
  margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-primary); color: var(--text-primary);
}

.app-layout { display: flex; min-height: 100vh; }
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: margin 0.3s ease; }
.view-container { padding: 24px; flex: 1; }

/* ======== DESKTOP ======== */
@media (min-width: 769px) {
  .mobile-only { display: none !important; }
  .main-content:not(.full-width) { margin-left: 260px; /* Ancho de tu sidebar */ }
}

/* ======== MOBILE ======== */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .view-container { 
    padding: 15px; 
    padding-bottom: 80px; /* Vital para que el contenido no quede bajo la barra inferior */
  }
  
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; width: 100%;
    background: #ffffff;
    border-top: 1px solid var(--border-soft);
    justify-content: space-around;
    padding: 10px 0;
    z-index: 1000;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
  }

  .nav-item {
    display: flex; flex-direction: column; align-items: center;
    font-size: 0.7rem; color: var(--text-muted); text-decoration: none; font-weight: 600; gap: 4px;
  }
  .nav-item .icon { font-size: 1.2rem; }
  .nav-item.router-link-active { color: var(--brand-color); }
  .nav-item.router-link-active .icon { transform: scale(1.1); transition: 0.2s; }
}

/* ======== COMPONENTES GLOBALES ======== */
.card, .glass-card, .card-glass {
  background: var(--card-bg); border: 1px solid var(--border-soft); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); margin-bottom: 20px;
}

input, select, textarea {
  background: #ffffff !important; border: 1px solid #d1d5db !important; color: #111827 !important; border-radius: 8px; padding: 10px 12px; font-size: 14px; width: 100%; margin-top: 4px;
}
input:focus, select:focus { border-color: var(--brand-color) !important; outline: none; }

.btn { padding: 10px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: var(--brand-color); color: white; }
.btn-primary:hover { background: #1d4ed8; }

table { width: 100%; border-spacing: 0; }
th { text-align: left; padding: 12px; border-bottom: 2px solid var(--border-soft); color: var(--text-muted); font-size: 13px; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid var(--border-soft); vertical-align: middle; }

/* Loader */
.global-loader { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: var(--bg-primary); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--border-soft); border-top: 3px solid var(--brand-color); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
<template>
  <!-- Loader de sesión -->
  <div v-if="authStore.loading" class="global-loader">
    <div class="loader-ring">
      <LogoContasoft :size="48" />
    </div>
    <p class="loader-text">Iniciando tu espacio de trabajo...</p>
  </div>

  <div v-else>
    <!-- LAYOUT PÚBLICO (Landing, Login, Registro) -->
    <div v-if="isPublicPage" class="public-layout">
      <router-view />
    </div>

    <!-- LAYOUT PRIVADO (Dashboard, módulos ERP) -->
    <div v-else class="app-layout">
      <!-- SIDEBAR (Desktop & Mobile hamburger) -->
      <div class="sidebar-container">
        <Sidebar />
      </div>
      
      <main class="main-content">
        <Header />
        
        <!-- Banner de suscripción -->
        <SuscripcionBanner />
        
        <div class="view-container">
          <router-view :key="$route.fullPath" />
        </div>
      </main>

      <!-- BOTTOM NAV (Mobile) -->
      <nav class="bottom-nav mobile-only">
        <router-link to="/dashboard" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span>Inicio</span>
        </router-link>
        <router-link to="/facturacion" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Ventas</span>
        </router-link>
        <router-link to="/inventario" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span>Stock</span>
        </router-link>
        <router-link to="/clientes" class="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Clientes</span>
        </router-link>
        <button @click="authStore.toggleMobileMenu()" class="nav-item btn-menu-bottom">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Menú</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import LogoContasoft from '@/components/LogoContasoft.vue';
import SuscripcionBanner from '@/components/SuscripcionBanner.vue';

const route = useRoute();
const authStore = useAuthStore();

const publicPages = ['/', '/login', '/registro'];

const isPublicPage = computed(() => {
  return publicPages.includes(route.path);
});
</script>

<style>
/* =========================================
   APP LAYOUT — Premium Design System
   ========================================= */

/* --- App Layout --- */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--cs-bg-root);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin var(--cs-transition);
}

.view-container {
  padding: var(--cs-space-6);
  flex: 1;
}

.public-layout {
  min-height: 100vh;
}

/* --- Page Transition --- */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ======== DESKTOP ======== */
@media (min-width: 769px) {
  .mobile-only { display: none !important; }
  .main-content { margin-left: var(--cs-sidebar-width); }
}

/* ======== MOBILE ======== */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .view-container { 
    padding: var(--cs-space-4); 
    padding-bottom: 90px;
  }
  
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; width: 100%;
    background: var(--cs-bg-primary);
    border-top: 1px solid var(--cs-border-soft);
    justify-content: space-around;
    padding: 8px 0 calc(8px + env(safe-area-inset-bottom, 0px));
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    backdrop-filter: blur(10px);
  }

  .nav-item {
    display: flex; 
    flex-direction: column; 
    align-items: center;
    font-size: 0.65rem; 
    color: var(--cs-text-muted); 
    text-decoration: none; 
    font-weight: 600; 
    gap: 3px;
    padding: 4px 8px;
    border-radius: var(--cs-radius-md);
    transition: color var(--cs-transition-fast);
  }
  .nav-item svg { 
    width: 22px; 
    height: 22px; 
    transition: transform var(--cs-transition-spring); 
  }
  .nav-item.router-link-active { 
    color: var(--cs-brand-600); 
  }
  .nav-item.router-link-active svg { 
    transform: scale(1.15); 
    stroke: var(--cs-brand-600);
  }
  .btn-menu-bottom {
    background: none; border: none; cursor: pointer; padding: 4px 8px; font-family: inherit;
  }
}

/* ======== GLOBAL COMPONENT OVERRIDES ======== */
.card, .glass-card, .card-glass {
  background: var(--cs-bg-primary);
  border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg);
  padding: var(--cs-space-5);
  box-shadow: var(--cs-shadow-sm);
  margin-bottom: var(--cs-space-5);
  transition: box-shadow var(--cs-transition);
}

input, select, textarea {
  background: var(--cs-bg-primary) !important;
  border: 1px solid var(--cs-border-soft) !important;
  color: var(--cs-text-primary) !important;
  border-radius: var(--cs-radius-md);
  padding: 10px 14px;
  font-size: var(--cs-text-base);
  font-family: var(--cs-font-sans);
  width: 100%;
  margin-top: 4px;
  transition: border-color var(--cs-transition-fast), box-shadow var(--cs-transition-fast);
}
input:focus, select:focus, textarea:focus { 
  border-color: var(--cs-brand-500) !important; 
  outline: none; 
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.btn { 
  padding: 10px 18px; 
  border-radius: var(--cs-radius-md); 
  font-weight: 600; 
  cursor: pointer; 
  border: none; 
  transition: all var(--cs-transition);
  font-family: var(--cs-font-sans);
  font-size: var(--cs-text-base);
}
.btn-primary { 
  background: var(--cs-gradient-brand); 
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}
.btn-primary:hover { 
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
}

table { width: 100%; border-spacing: 0; }
th { 
  text-align: left; 
  padding: 12px 16px; 
  border-bottom: 2px solid var(--cs-border-soft); 
  color: var(--cs-text-muted); 
  font-size: var(--cs-text-xs); 
  text-transform: uppercase; 
  letter-spacing: 0.05em;
  font-weight: 700;
}
td { 
  padding: 14px 16px; 
  border-bottom: 1px solid var(--cs-border-soft); 
  vertical-align: middle; 
}

/* Loader */
.global-loader { 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background: var(--cs-bg-root);
  gap: var(--cs-space-5);
}

.loader-ring {
  animation: cs-pulse 2s ease-in-out infinite;
}

.loader-text {
  color: var(--cs-text-muted);
  font-size: var(--cs-text-base);
  font-weight: 500;
}

/* Generic helpers used across views */
.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--cs-space-5);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--cs-space-4);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--cs-bg-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
  animation: cs-fadeIn 0.2s ease;
}

.modal-content {
  background: var(--cs-bg-primary);
  padding: 30px;
  border-radius: var(--cs-radius-xl);
  border: 1px solid var(--cs-border-soft);
  box-shadow: var(--cs-shadow-xl);
  max-width: 550px;
  width: calc(100% - 40px);
  animation: cs-scaleIn 0.25s ease;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--cs-radius-full);
  font-size: var(--cs-text-xs);
  font-weight: 700;
}
.status-pill.success { background: var(--cs-success-bg); color: var(--cs-success); }
.status-pill.warn { background: var(--cs-warning-bg); color: var(--cs-warning-dark); }
.status-pill.error { background: var(--cs-error-bg); color: var(--cs-error); }

/* Table styles used by multiple views */
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { 
  text-align: left; padding: 14px 16px; color: var(--cs-text-muted); 
  font-size: var(--cs-text-xs); text-transform: uppercase; 
  border-bottom: 2px solid var(--cs-border-soft); font-weight: 700;
  letter-spacing: 0.05em;
}
.table-moderna td { padding: 14px 16px; border-bottom: 1px solid var(--cs-border-soft); }
.table-moderna tbody tr { transition: background var(--cs-transition-fast); }
.table-moderna tbody tr:hover { background: var(--cs-bg-tertiary); }

.table-moderna-lite { width: 100%; border-collapse: collapse; }
.table-moderna-lite th { 
  text-align: left; padding: 10px; color: var(--cs-text-muted); 
  font-size: 0.7rem; text-transform: uppercase; 
  border-bottom: 1px solid var(--cs-border-soft);
}
.table-moderna-lite td { padding: 10px; border-bottom: 1px solid var(--cs-border-soft); }

.font-mono { font-family: var(--cs-font-mono); }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
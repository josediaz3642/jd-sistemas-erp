<template>
  <div>
    <button 
      @click.stop="toggleSidebar" 
      class="btn-hamburguesa"
      type="button"
    >
      <svg v-if="!sidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div 
      v-if="sidebarOpen" 
      @click="sidebarOpen = false" 
      class="overlay"
    ></div>

    <aside :class="['sidebar', { 'is-open': sidebarOpen }]">
      <!-- Brand -->
      <div class="brand">
        <LogoContasoft :size="34" />
        <div class="brand-text">
          <span class="brand-name">Contasoft</span>
          <span class="brand-tag">ERP</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="menu">
        <router-link to="/dashboard" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/crm" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <span>CRM & Ventas</span>
          <span class="nav-badge" style="background:var(--cs-brand-500); color:white;">Nuevo</span>
        </router-link>

        <router-link to="/presupuestos" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Presupuestos</span>
        </router-link>

        <div class="menu-label">Operaciones</div>
        
        <router-link to="/facturacion" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Ventas / Facturas</span>
        </router-link>

        <router-link to="/remitos" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <span>Remitos / Traspasos</span>
        </router-link>

        <router-link to="/caja" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Caja y Finanzas</span>
        </router-link>

        <router-link to="/cheques" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span>Cheques</span>
        </router-link>

        <router-link to="/cuentas-corrientes" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Cuentas Corrientes</span>
        </router-link>

        <div class="menu-label">Inventario</div>

        <router-link to="/stock" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>Stock</span>
        </router-link>

        <div class="menu-label">Contactos</div>

        <router-link to="/clientes" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Clientes</span>
        </router-link>

        <router-link to="/proveedores" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Proveedores</span>
        </router-link>

        <div class="menu-label">Administración</div>

        <router-link to="/perfil" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Mi Perfil</span>
        </router-link>

        <router-link v-if="esSuperAdmin" to="/usuarios" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Usuarios y Roles</span>
          <span class="nav-badge">Super Admin</span>
        </router-link>

        <router-link v-if="esSuperAdmin" to="/admin/suscripciones" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Suscripciones</span>
          <span class="nav-badge">Super Admin</span>
        </router-link>

        <router-link to="/ajustes" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Ajustes</span>
        </router-link>

        <router-link v-if="esAdmin" to="/mantenimiento" class="nav-link" @click="sidebarOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          <span>Mantenimiento</span>
        </router-link>

        <div class="menu-sep"></div>
        
        <button @click="handleLogout" class="nav-link logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Cerrar Sesión</span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="footer-brand">
          <span class="footer-by">Desarrollado por</span>
          <span class="footer-company">JD Sistemas</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LogoContasoft from '@/components/LogoContasoft.vue';

const authStore = useAuthStore();
const router = useRouter();

const sidebarOpen = computed({
  get: () => authStore.mobileMenuOpen,
  set: (val) => authStore.mobileMenuOpen = val
});

const esAdmin = computed(() => {
  return authStore.user?.app_metadata?.role === 'admin' || true;
});

const esSuperAdmin = computed(() => {
  return authStore.user?.email === 'josediaz3642@gmail.com';
});

const toggleSidebar = () => {
  authStore.toggleMobileMenu();
};

const handleLogout = async () => {
  if (confirm('¿Deseas cerrar sesión?')) {
    await authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
/* ============================================
   SIDEBAR — Premium Dark Design
   ============================================ */

.btn-hamburguesa {
  display: none;
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 2000;
  padding: 10px;
  background: var(--cs-gradient-brand);
  color: white;
  border: none;
  border-radius: var(--cs-radius-md);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all var(--cs-transition);
}
.btn-hamburguesa:hover {
  transform: scale(1.05);
}

.sidebar {
  width: var(--cs-sidebar-width);
  height: 100vh;
  background: var(--cs-sidebar-bg);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1500;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
}

/* Brand */
.brand {
  padding: 24px 20px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.brand-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-tag {
  color: var(--cs-accent-400);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 1px 6px;
  background: rgba(6, 182, 212, 0.12);
  border-radius: 4px;
}

/* Menu */
.menu {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.menu-label {
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.6);
  margin: 16px 0 6px 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: var(--cs-sidebar-text);
  text-decoration: none;
  border-radius: var(--cs-radius-md);
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
  font-family: var(--cs-font-sans);
  transition: all var(--cs-transition-fast);
  position: relative;
}

.nav-link svg {
  flex-shrink: 0;
  opacity: 0.7;
  transition: all var(--cs-transition-fast);
}

.nav-link:hover {
  background: var(--cs-sidebar-hover);
  color: #e2e8f0;
}

.nav-link:hover svg {
  opacity: 1;
  stroke: var(--cs-accent-400);
}

/* Active state */
.nav-link.router-link-active {
  background: rgba(79, 70, 229, 0.2);
  color: #ffffff;
  font-weight: 600;
}

.nav-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--cs-gradient-brand);
  border-radius: 0 3px 3px 0;
}

.nav-link.router-link-active svg {
  opacity: 1;
  stroke: var(--cs-accent-400);
}

/* Nav Badge */
.nav-badge {
  margin-left: auto;
  font-size: 0.6rem;
  padding: 2px 6px;
  background: rgba(79, 70, 229, 0.3);
  color: var(--cs-brand-300);
  border-radius: var(--cs-radius-full);
  font-weight: 700;
  letter-spacing: 0.03em;
}

/* Logout */
.logout-btn {
  color: rgba(239, 68, 68, 0.7);
  margin-top: 8px;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.logout-btn:hover svg {
  stroke: #ef4444;
}

.menu-sep {
  height: 1px;
  background: rgba(255,255,255,0.06);
  margin: 8px 12px;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-by {
  font-size: 0.6rem;
  color: rgba(148, 163, 184, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.footer-company {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  font-weight: 600;
}

/* --- Mobile --- */
@media (max-width: 768px) {
  .btn-hamburguesa { display: flex; align-items: center; justify-content: center; }
  .sidebar { 
    transform: translateX(-100%); 
    width: 280px;
    max-width: 80vw;
  }
  .sidebar.is-open { transform: translateX(0); }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 1400;
    animation: cs-fadeIn 0.2s ease;
  }
}
</style>
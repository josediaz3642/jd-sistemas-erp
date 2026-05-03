<template>
  <header class="top-header">
    <div class="header-left">
      <div class="breadcrumb">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        <span class="view-title">{{ currentRouteName }}</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Dark Mode Toggle -->
      <button @click="toggleTheme" class="theme-toggle" aria-label="Toggle dark mode">
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>

      <!-- Subscription Status -->
      <div class="subscription-pill" v-if="authStore.empresa">
        <div class="pulse-dot"></div>
        <span>Plan Activo</span>
      </div>

      <!-- Company Info -->
      <div class="company-info" v-if="authStore.empresa">
        <img v-if="authStore.empresa.logo" :src="authStore.empresa.logo" class="company-logo-mini" />
        <div class="company-text">
          <p class="company-name">{{ authStore.empresa.razon_social || 'Mi Empresa' }}</p>
          <p class="company-cuit">{{ authStore.empresa.cuit || 'Sin CUIT' }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="header-divider"></div>

      <!-- User Profile -->
      <div class="user-profile" v-if="authStore.user">
        <div class="avatar">
          <span>{{ usuarioInitials }}</span>
        </div>
        <div class="user-details">
          <span class="user-name">{{ authStore.user.email.split('@')[0] }}</span>
          <span class="user-role">Super Admin</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const isDark = ref(false);

onMounted(() => {
  const savedTheme = localStorage.getItem('cs-theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
});

function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('cs-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('cs-theme', 'light');
  }
}

const routeNames = {
  'dashboard': 'Dashboard',
  'facturacion': 'Facturación',
  'factura-nueva': 'Nueva Factura',
  'clientes': 'Clientes',
  'cliente': 'Detalle Cliente',
  'proveedores': 'Proveedores',
  'proveedor': 'Detalle Proveedor',
  'stock': 'Inventario',
  'inventario': 'Inventario',
  'caja': 'Caja y Finanzas',
  'cheques': 'Cartera de Cheques',
  'cuentas-corrientes': 'Cuentas Corrientes',
  'remitos': 'Remitos',
  'ajustes': 'Ajustes',
  'mantenimiento': 'Mantenimiento',
  'usuarios': 'Usuarios y Roles',
  'reportes': 'Reportes',
  'admin': 'Administración'
};

const currentRouteName = computed(() => {
  const segment = route.path.split('/')[1];
  return routeNames[segment] || (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard');
});

const usuarioInitials = computed(() => {
  if (!authStore.user?.email) return 'U';
  return authStore.user.email.charAt(0).toUpperCase();
});
</script>

<style scoped>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  margin-bottom: 0;
  background: var(--cs-glass-bg);
  backdrop-filter: blur(var(--cs-glass-blur));
  -webkit-backdrop-filter: blur(var(--cs-glass-blur));
  border-bottom: 1px solid var(--cs-border-soft);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-title {
  font-weight: 700;
  color: var(--cs-text-primary);
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Theme Toggle */
.theme-toggle {
  background: transparent;
  border: 1px solid var(--cs-border-soft);
  color: var(--cs-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: var(--cs-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cs-transition-fast);
}
.theme-toggle:hover {
  background: var(--cs-bg-secondary);
  color: var(--cs-brand-500);
  border-color: var(--cs-brand-300);
}

/* Subscription Pill */
.subscription-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(22, 163, 106, 0.08);
  border: 1px solid rgba(22, 163, 106, 0.2);
  border-radius: var(--cs-radius-full);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--cs-success);
  letter-spacing: 0.02em;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cs-success);
  animation: cs-pulse 2s ease-in-out infinite;
}

/* Company Info */
.company-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-logo-mini {
  height: 32px;
  width: auto;
  max-width: 70px;
  object-fit: contain;
  border-radius: 6px;
}

.company-text {
  text-align: right;
}

.company-name {
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0;
  color: var(--cs-text-primary);
  line-height: 1.3;
}

.company-cuit {
  font-size: 0.65rem;
  margin: 0;
  color: var(--cs-text-muted);
  font-family: var(--cs-font-mono);
}

/* Divider */
.header-divider {
  width: 1px;
  height: 28px;
  background: var(--cs-border-soft);
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  background: var(--cs-gradient-brand);
  color: white;
  border-radius: var(--cs-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cs-text-primary);
  line-height: 1.3;
}

.user-role {
  font-size: 0.65rem;
  color: var(--cs-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 600;
}

/* --- Responsive --- */
@media (max-width: 900px) {
  .company-info, .header-divider, .subscription-pill {
    display: none;
  }
  .top-header {
    padding: 12px 16px;
  }
}

@media (max-width: 768px) {
  .top-header {
    padding: 12px 16px;
    padding-left: 60px; /* Space for hamburger */
  }
}
</style>
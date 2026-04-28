<template>
  <nav class="navbar card-glass">
    <div class="nav-container">
      <div class="nav-header">
        <div class="nav-logo" @click="go('/dashboard')">
          <span class="logo-accent">Contasoft</span>
        </div>
        
        <button class="mobile-menu-btn" @click="toggleMenu">
          <span v-if="!menuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>

      <div :class="['nav-links', { 'is-open': menuOpen }]">
        <a @click.prevent="navigate('/dashboard')" :class="{ active: isActive('/dashboard') }">
          <span class="icon">🏠</span> Dashboard
        </a>
        <a @click.prevent="navigate('/clientes')" :class="{ active: isActive('/clientes') }">
          <span class="icon">👥</span> Clientes
        </a>
        <a @click.prevent="navigate('/proveedores')" :class="{ active: isActive('/proveedores') }">
          <span class="icon">🚚</span> Proveedores
        </a>
        <a @click.prevent="navigate('/facturacion')" :class="{ active: isActive('/facturacion') }">
          <span class="icon">📄</span> Facturación
        </a>
        <a @click.prevent="navigate('/remitos')" :class="{ active: isActive('/remitos') }">
          <span class="icon">📦</span> Remitos
        </a>
        <a @click.prevent="navigate('/stock')" :class="{ active: isActive('/stock') }">
          <span class="icon">📊</span> Stock
        </a>
        <a @click.prevent="navigate('/cheques')" :class="{ active: isActive('/cheques') }">
          <span class="icon">🏦</span> Cheques
        </a>
        
        <a @click.prevent="logout" class="logout-link mobile-only">
          <span class="icon">🚪</span> Cerrar Sesión
        </a>
      </div>

      <div class="nav-right desktop-only">
        <span class="user-name" v-if="user">{{ user.email.split('@')[0] }}</span>
        <button @click="logout" class="btn-logout">Salir</button>
      </div>
    </div>
  </nav>

  <div v-if="menuOpen" class="nav-overlay" @click="menuOpen = false"></div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getCurrentUser, logoutUser } from "@/services/auth";

const router = useRouter();
const route = useRoute();
const menuOpen = ref(false); // Estado del menú móvil

const user = computed(() => getCurrentUser());

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

// Función de navegación que cierra el menú automáticamente
function navigate(path) {
  menuOpen.value = false;
  router.push(path);
}

function go(path) {
  router.push(path);
}

function isActive(path) {
  return route.path.startsWith(path);
}

function logout() {
  menuOpen.value = false;
  logoutUser();
  router.push("/login");
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 2000;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.4rem;
  font-weight: 900;
  cursor: pointer;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.logo-accent {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-links a {
  padding: 8px 14px;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-links a:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.nav-links a.active {
  background: #eff6ff;
  color: #2563eb;
}

.btn-logout {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.user-name {
  margin-right: 15px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* --- RESPONSIVE LOGIC --- */

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #0f172a;
  cursor: pointer;
}

.mobile-only { display: none; }

@media (max-width: 1024px) {
  .mobile-menu-btn { display: block; }
  
  .nav-header { width: 100%; }

  .nav-links {
    position: fixed;
    top: 65px;
    left: -100%;
    width: 280px;
    height: calc(100vh - 65px);
    background: white;
    flex-direction: column;
    padding: 20px;
    box-shadow: 10px 0 20px rgba(0,0,0,0.1);
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-links.is-open { left: 0; }

  .nav-links a {
    font-size: 1.1rem;
    padding: 15px;
    border-bottom: 1px solid #f1f5f9;
    width: 100%;
  }

  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  
  .logout-link { color: #ef4444 !important; margin-top: auto; }

  .nav-overlay {
    position: fixed;
    top: 65px;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 1999;
  }
}
</style>
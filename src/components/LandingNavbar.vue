<template>
  <nav :class="['landing-nav', { 'nav-scrolled': scrolled }]">
    <div class="nav-inner">
      <div class="nav-brand" @click="scrollToTop">
        <LogoContasoft :size="32" />
        <div class="brand-text">
          <span class="brand-name">Contasoft</span>
          <span class="brand-tag">ERP</span>
        </div>
      </div>

      <!-- Desktop Links -->
      <div class="nav-links desktop-nav">
        <a href="#features" @click.prevent="scrollTo('features')">Funcionalidades</a>
        <a href="#pricing" @click.prevent="scrollTo('pricing')">Planes</a>
        <a href="#about" @click.prevent="scrollTo('about')">Nosotros</a>
      </div>

      <div class="nav-actions desktop-nav">
        <router-link to="/login" class="btn-login">Iniciar Sesión</router-link>
        <router-link to="/registro" class="btn-register">Comenzar Gratis</router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="menuOpen = !menuOpen">
        <svg v-if="!menuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <transition name="dropdown">
      <div v-if="menuOpen" class="mobile-dropdown">
        <a href="#features" @click.prevent="scrollTo('features'); menuOpen = false">Funcionalidades</a>
        <a href="#pricing" @click.prevent="scrollTo('pricing'); menuOpen = false">Planes</a>
        <a href="#about" @click.prevent="scrollTo('about'); menuOpen = false">Nosotros</a>
        <div class="mobile-actions">
          <router-link to="/login" class="btn-login" @click="menuOpen = false">Iniciar Sesión</router-link>
          <router-link to="/registro" class="btn-register" @click="menuOpen = false">Comenzar Gratis</router-link>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LogoContasoft from '@/components/LogoContasoft.vue';

const scrolled = ref(false);
const menuOpen = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 40;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<style scoped>
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.nav-scrolled {
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 4px 30px rgba(0,0,0,0.3);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.brand-name {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-tag {
  color: var(--cs-accent-400);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--cs-radius-md);
  transition: all var(--cs-transition-fast);
}

.nav-links a:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.08);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-login {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: var(--cs-radius-md);
  transition: all var(--cs-transition-fast);
}
.btn-login:hover {
  color: #ffffff;
  background: rgba(255,255,255,0.08);
}

.btn-register {
  display: inline-flex;
  align-items: center;
  background: var(--cs-gradient-brand);
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 22px;
  border-radius: var(--cs-radius-md);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);
  transition: all var(--cs-transition);
}
.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
}

/* Mobile */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px;
}
.mobile-menu-btn:hover { transform: none; }

.mobile-dropdown {
  display: none;
  flex-direction: column;
  padding: 16px 32px 24px;
  gap: 4px;
  background: rgba(10, 14, 39, 0.98);
  border-top: 1px solid rgba(255,255,255,0.1);
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.mobile-dropdown a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: var(--cs-radius-md);
  transition: all var(--cs-transition-fast);
}
.mobile-dropdown a:hover {
  background: rgba(255,255,255,0.06);
  color: white;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.mobile-actions .btn-login {
  text-align: center;
  padding: 12px;
}
.mobile-actions .btn-register {
  text-align: center;
  justify-content: center;
  padding: 12px;
}

@media (max-width: 768px) {
  .desktop-nav { display: none !important; }
  .mobile-menu-btn { display: block; }
  .mobile-dropdown { display: flex; }
  .nav-inner { padding: 14px 20px; }
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.25s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

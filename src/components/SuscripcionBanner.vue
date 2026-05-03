<template>
  <transition name="banner-slide">
    <div v-if="mostrarBanner" class="suscripcion-banner" :class="bannerClass">
      <div class="banner-content">
        <div class="banner-icon">
          <svg v-if="diasRestantes <= 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="banner-text">
          <strong v-if="diasRestantes <= 0">Tu suscripción ha vencido.</strong>
          <strong v-else>Tu suscripción vence en {{ diasRestantes }} día{{ diasRestantes !== 1 ? 's' : '' }}.</strong>
          <span v-if="diasRestantes <= 0"> Acceso restringido. Por favor, regularizá tu pago.</span>
          <span v-else> Renová a tiempo para evitar interrupciones en el servicio.</span>
        </div>
      </div>
      <div class="banner-actions">
        <!-- MercadoPago Link / Checkout -->
        <a href="https://link.mercadopago.com.ar/contasofterp" target="_blank" class="btn-pagar" title="Pagar con MercadoPago">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Pagar Suscripción
        </a>
        <button @click="cerrarBanner" class="banner-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const authStore = useAuthStore();
const subStore = useSubscriptionStore();
const cerrado = ref(false);

onMounted(() => {
  if (authStore.user?.id) {
    subStore.fetchSuscripcion(authStore.user.id);
  }
});

watch(() => authStore.user, (newVal) => {
  if (newVal?.id) subStore.fetchSuscripcion(newVal.id);
});

const diasRestantes = computed(() => subStore.diasRestantes);

const mostrarBanner = computed(() => {
  if (cerrado.value) return false;
  // Mostrar si está suspendida, o si le quedan <= 5 días.
  if (subStore.estadoDisplay === 'suspendida') return true;
  return diasRestantes.value <= 5;
});

const bannerClass = computed(() => {
  if (subStore.estadoDisplay === 'suspendida' || diasRestantes.value <= 0) return 'banner-danger';
  if (diasRestantes.value <= 3) return 'banner-warning';
  return 'banner-info';
});

const cerrarBanner = () => {
  cerrado.value = true;
};
</script>

<style scoped>
.suscripcion-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  font-size: 0.8rem;
  animation: cs-fadeInDown 0.3s ease;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-icon {
  flex-shrink: 0;
}

.banner-text span {
  opacity: 0.85;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-pagar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--cs-radius-full);
  background: var(--cs-brand-500);
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.75rem;
  transition: all var(--cs-transition-fast);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.btn-pagar:hover {
  background: var(--cs-brand-600);
  transform: translateY(-1px);
}

.banner-info {
  background: linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%);
  color: var(--cs-info);
  border-bottom: 1px solid rgba(59,130,246,0.15);
}

.banner-warning {
  background: linear-gradient(90deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%);
  color: var(--cs-warning-dark);
  border-bottom: 1px solid rgba(245,158,11,0.15);
}

.banner-danger {
  background: linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%);
  color: var(--cs-error);
  border-bottom: 1px solid rgba(239,68,68,0.15);
}

.banner-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity var(--cs-transition-fast);
  color: inherit;
}
.banner-close:hover {
  opacity: 1;
  transform: none;
}

.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.3s ease;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@media (max-width: 768px) {
  .suscripcion-banner { flex-direction: column; gap: 10px; align-items: flex-start; }
  .banner-actions { align-self: flex-end; }
}
</style>

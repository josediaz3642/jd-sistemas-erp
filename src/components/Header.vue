<template>
  <header class="top-header glass-card">
    <div class="breadcrumb">
      <span class="view-title">{{ currentRouteName }}</span>
    </div>

    <div class="user-actions">
      <div class="company-info" v-if="empresa">
        <img v-if="empresa.logo" :src="empresa.logo" class="company-logo-mini" />
        <div class="text-right">
          <p class="company-name">{{ empresa.nombre || 'Mi Empresa' }}</p>
          <p class="company-cuit">{{ empresa.cuit || 'Sin CUIT' }}</p>
        </div>
      </div>

      <div class="user-profile">
        <div class="avatar">{{ usuarioInitials }}</div>
        <div class="user-details">
          <span class="user-name">{{ usuario?.nombre }}</span>
          <span class="user-role">{{ usuario?.rol }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentUser } from '@/services/auth';
import { getEmpresa } from '@/services/data';

const route = useRoute();
const usuario = ref(null);
const empresa = ref(null);

onMounted(() => {
  usuario.value = getCurrentUser();
  empresa.value = getEmpresa();
});

const currentRouteName = computed(() => {
  const name = route.path.split('/')[1];
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Dashboard';
});

const usuarioInitials = computed(() => {
  if (!usuario.value?.nombre) return 'U';
  return usuario.value.nombre.charAt(0).toUpperCase();
});
</script>

<style scoped>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px !important;
  margin-bottom: 20px;
  border-radius: 12px;
  background: white;
}

.view-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 25px;
  border-right: 1px solid #e2e8f0;
}

.company-logo-mini {
  height: 35px;
  width: auto;
  max-width: 80px;
  object-fit: contain;
}

.text-right { text-align: right; }
.company-name { font-size: 0.85rem; font-weight: 700; margin: 0; color: #1e293b; }
.company-cuit { font-size: 0.7rem; margin: 0; color: #64748b; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 35px;
  height: 35px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-details { display: flex; flex-direction: column; }
.user-name { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.user-role { font-size: 0.7rem; color: #64748b; text-transform: capitalize; }
</style>
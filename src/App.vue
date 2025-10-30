<template>
  <div :data-theme="theme">
    <header class="app-header">
      <img src="/logo.png" alt="Logo" class="logo" />
      <nav>
        <button @click="go('dashboard')">Inicio</button>
        <button @click="go('clientes')">Clientes</button>
        <button @click="go('facturacion')">Facturación</button>
        <button @click="go('cheques')">Cheques</button>
        <button @click="go('stock')">Stock</button>
        <button @click="go('mantenimiento')" v-if="userRol === 'admin' || userRol === 'gerente'">
          Mantenimiento
        </button>
      </nav>
      <div class="actions">
        <button @click="toggleTheme">🌓 Tema</button>
        <button v-if="user" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser, logoutUser } from '@/services/auth';

const router = useRouter();
const theme = ref(localStorage.getItem('theme') || 'light');
const user = ref(getCurrentUser());
const userRol = computed(() => user.value?.rol || 'usuario');

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
}

function logout() {
  logoutUser();
  router.push('/login');
}

function go(path) {
  router.push(`/${path}`);
}
</script>

<style src="@/styles/theme.css"></style>

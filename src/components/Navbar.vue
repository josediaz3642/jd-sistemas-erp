<template>
  <nav class="navbar card-glass">
    <div class="nav-left">
      <div class="nav-logo" @click="go('/dashboard')">Contasoft</div>

      <div class="nav-links">
        <a @click.prevent="go('/dashboard')" :class="{ active: isActive('/dashboard') }">Dashboard</a>
        <a @click.prevent="go('/clientes')" :class="{ active: isActive('/clientes') }">Clientes</a>
        <a @click.prevent="go('/proveedores')" :class="{ active: isActive('/proveedores') }">Proveedores</a>
        <a @click.prevent="go('/facturacion')" :class="{ active: isActive('/facturacion') }">Facturación</a>
        <a @click.prevent="go('/stock')" :class="{ active: isActive('/stock') }">Stock</a>
        <a @click.prevent="go('/cheques')" :class="{ active: isActive('/cheques') }">Cheques</a>
      </div>
    </div>

    <div class="row">
      <div class="kv">Hola, {{ user?.nombre || 'Invitado' }}</div>
      <button class="btn secondary" @click="logout">Salir</button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getCurrentUser, logoutUser } from "@/services/auth";

const router = useRouter();
const route = useRoute();
const user = computed(() => getCurrentUser());

function go(path) {
  router.push(path);
}

function isActive(path) {
  return route.path.startsWith(path);
}

function logout() {
  logoutUser();
  router.push("/login");
}
</script>

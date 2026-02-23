<template>
  <div class="app-layout">
    <Sidebar v-if="isLoggedIn" />
    
    <main :class="['main-content', { 'full-width': !isLoggedIn }]">
      <Header v-if="isLoggedIn" />
      
      <div class="view-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue'; // 1. Importar

const route = useRoute();
const isLoggedIn = computed(() => route.path !== '/login' && route.path !== '/registro');
</script>

<style>
/* 1. RESET Y BASES */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  background-color: #f1f5f9; /* Gris muy claro azulado para que resalten las cards */
  color: #1e293b; /* Slate 800: Casi negro, mucho más legible que el gris */
}

/* 2. ESTRUCTURA PRINCIPAL */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  /* El ancho del sidebar es 260px, así que empujamos el contenido a la derecha */
  margin-left: 260px; 
  padding: 20px 40px;
  min-width: 0; /* Evita que el contenido desborde en flex */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* Cuando no hay sidebar (Login/Registro) */
.main-content.full-width {
  margin-left: 0;
  padding: 0;
}

/* 3. MEJORA DE LECTURA (GLASS CARDS) */
.glass-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* Títulos con más contraste */
h1, h2, h3 {
  color: #0f172a; /* Slate 900: Negro puro azulado */
  margin-bottom: 0.5rem;
}

/* Párrafos y subtítulos que antes eran grises ilegibles */
.subtitle, p {
  color: #475569; /* Slate 600: Gris oscuro con suficiente contraste */
  line-height: 1.6;
}

/* 4. TABLAS (Para que no se corten) */
.table-container {
  width: 100%;
  overflow-x: auto; /* Scroll horizontal si la tabla es muy ancha */
  background: white;
  border-radius: 8px;
}

/* Responsividad básica para pantallas chicas */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
  /* Aquí podrías agregar lógica para un menú hamburguesa luego */
}
</style>
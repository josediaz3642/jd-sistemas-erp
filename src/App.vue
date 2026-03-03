<template>
  <div class="app-layout">
    <div v-if="isLoggedIn" class="sidebar-container">
      <Sidebar />
    </div>
    
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
import Header from '@/components/Header.vue';

const route = useRoute();
const isLoggedIn = computed(() => route.path !== '/login' && route.path !== '/registro');
</script>

<style>
/* =========================================
   VARIABLES GLOBALES (Look Profesional)
   ========================================= */
:root {
  --bg-primary: #f1f5f9;      /* Fondo general grisáceo suave */
  --bg-secondary: #ffffff;    /* Blanco para elementos elevados */
  --card-bg: #ffffff;         /* Fondo de tarjetas */
  
  --text-primary: #0f172a;    /* Texto casi negro (legible) */
  --text-muted: #64748b;      /* Texto gris para etiquetas */
  
  --brand-color: #2563eb;     /* Azul corporativo */
  --border-soft: #e2e8f0;     /* Bordes finos */
  --radius: 12px;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Reset y Base */
body, html { 
  margin: 0; 
  padding: 0; 
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Gestión de Espacio del Sidebar */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin 0.3s ease;
}

@media (min-width: 769px) {
  .main-content:not(.full-width) {
    margin-left: 260px; /* Ancho del sidebar */
  }
}

.view-container {
  padding: 24px;
  flex: 1;
}

/* =========================================
   ESTILOS DE COMPONENTES (Globales)
   ========================================= */

/* Tarjetas */
.card, .glass-card, .card-glass {
  background: var(--card-bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

/* Títulos y textos en las vistas */
.view-container h1, .view-container h2, .view-container h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

/* Inputs y Selects (Ahora claros y legibles) */
input, select, textarea {
  background: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #111827 !important;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  width: 100%;
  margin-top: 4px;
}

input:focus {
  border-color: var(--brand-color) !important;
  outline: none;
  ring: 2px var(--brand-color);
}

/* Botones Profesionales */
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--brand-color);
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

/* Tablas */
table {
  width: 100%;
  border-spacing: 0;
}

th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid var(--border-soft);
  color: var(--text-muted);
  font-size: 13px;
  text-transform: uppercase;
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--border-soft);
  vertical-align: middle;
}

/* Badges de estado */
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
</style>
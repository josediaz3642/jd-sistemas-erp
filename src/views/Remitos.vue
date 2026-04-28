<template>
  <div class="page-container">
    <header class="section-header">
      <h1>Gestión de Remitos</h1>
      <router-link to="/remitos/nuevo" class="btn-primary-jd">+ Nuevo Remito</router-link>
    </header>

    <div class="search-container glass-card">
      <input 
        v-model="filtro" 
        type="text" 
        placeholder="Buscar cliente o número..." 
        class="input-search" 
      />
      <div class="filter-pills">
        <span @click="filtroEstado = 'todos'" :class="{ active: filtroEstado === 'todos' }">Todos</span>
        <span @click="filtroEstado = 'pendiente'" :class="{ active: filtroEstado === 'pendiente' }">⏳ Pendientes</span>
        <span @click="filtroEstado = 'entregado'" :class="{ active: filtroEstado === 'entregado' }">✅ Entregados</span>
      </div>
    </div>

    <div class="remitos-list">
      <div v-if="loading" class="loader">Cargando remitos...</div>
      
      <div v-else-if="remitosFiltrados.length === 0" class="text-center empty-state">
        <p>No se encontraron remitos.</p>
      </div>

      <div v-for="remito in remitosFiltrados" :key="remito.id" class="remito-card glass-card">
        <div class="remito-main">
          <div class="remito-info">
            <span class="remito-number">#{{ remito.numero || remito.id.toString().slice(0, 8) }}</span>
            <h3 class="cliente-name">{{ remito.cliente_nombre }}</h3>
            <p class="remito-date">{{ formatFecha(remito.fecha) }}</p>
          </div>
          <div :class="['status-badge', (remito.estado || remito.status || 'pendiente').toLowerCase()]">
            {{ remito.estado || remito.status || 'Pendiente' }}
          </div>
        </div>

        <div class="remito-footer">
          <div class="remito-total">
            <span class="label">Total</span>
            <span class="amount">$ {{ remito.total?.toLocaleString() || '0' }}</span>
          </div>
          <div class="remito-actions">
            <button 
              @click="cambiarEstado(remito)" 
              class="btn-action btn-status"
              title="Cambiar Estado"
            >
              {{ (remito.estado || remito.status || 'pendiente').toLowerCase() === 'pendiente' ? '🚚' : '⏳' }}
            </button>
            
            <button @click="verDetalle(remito.id)" class="btn-action">👁️ Ver</button>
            <button @click="imprimir(remito)" class="btn-action btn-print">🖨️</button>
            <button @click="eliminarRemito(remito)" class="btn-action btn-delete-remito">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getRemitos } from '@/services/data';
import { deleteRemito, updateRemitoEstado } from '@/services/data';

const router = useRouter();
const remitos = ref([]);
const loading = ref(true);
const filtro = ref('');
const filtroEstado = ref('todos');

const cargarRemitos = async () => {
  loading.value = true;
  try {
    const data = await getRemitos();
    console.log("Datos recibidos:", data); // Mirá la consola para ver qué nombres de columnas vienen
    remitos.value = data || [];
  } catch (error) {
    console.error("Error al cargar remitos:", error);
    remitos.value = [];
  } finally {
    loading.value = false;
  }
};
const cambiarEstado = async (remito) => { 
  const valorActual = remito.estado || remito.status || 'Pendiente';
  const nuevoEstado = valorActual.toLowerCase() === 'pendiente' ? 'Entregado' : 'Pendiente';
  
  try {   
    await updateRemitoEstado(remito.id, nuevoEstado);   
    await cargarRemitos(); 
  } catch (e) {
    alert("Error: Revisa que el nombre de la columna en Supabase sea correcto.");
  }
};

const eliminarRemito = async (remito) => {
  const confirmar = confirm(`¿Estás seguro de eliminar el remito de ${remito.cliente_nombre}?`);
  if (!confirmar) return;

  try {
    await deleteRemito(remito.id);
    await cargarRemitos(); // Refrescar lista
  } catch (e) {
    alert("Error al eliminar el remito");
  }
};
const remitosFiltrados = computed(() => {
  if (!remitos.value) return [];
  
  return remitos.value.filter(r => {
    // 1. Buscamos coincidencias de texto (Nombre o Número)
    const nombre = (r.cliente_nombre || "").toLowerCase();
    const numero = (r.numero || r.id || "").toString().toLowerCase();
    const busqueda = filtro.value.toLowerCase();
    const matchBusqueda = nombre.includes(busqueda) || numero.includes(busqueda);

    // 2. Filtramos por estado (Si es 'todos' pasa directo)
    if (filtroEstado.value === 'todos') return matchBusqueda;
    
    // Normalizamos el estado de la base de datos para comparar
    const estadoRemito = (r.estado || "pendiente").toLowerCase();
    return matchBusqueda && estadoRemito === filtroEstado.value;
  });
});

const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-AR') : '-';
const verDetalle = (id) => router.push(`/remitos/${id}`);
const imprimir = (r) => router.push({ name: 'DetalleRemito', params: { id: r.id }, query: { imprimir: 'true' } });

onMounted(cargarRemitos);
</script>

<style scoped>
.remito-actions {
  display: flex;
  gap: 6px;
}

.btn-action {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-status:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.btn-delete-remito {
  color: #ef4444;
  background: #fef2f2;
  border-color: #fecaca;
}

.btn-delete-remito:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* Estilo extra para el badge de "Entregado" */
.status-badge.entregado {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
/* Reutilizamos la base de Stock para coherencia visual */
.page-container { padding: 15px; max-width: 800px; margin: auto; background: #f8fafc; min-height: 100vh; }
.glass-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

/* Header estilo JD */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary-jd { background: #1e293b; color: white; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.9rem; }

/* Tarjeta de Remito */
.remito-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.remito-number { font-size: 0.7rem; color: #94a3b8; font-weight: 800; }
.cliente-name { font-size: 1.1rem; color: #1e293b; margin: 2px 0; font-weight: 700; }
.remito-date { font-size: 0.8rem; color: #64748b; }

/* Status Badges */
.status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.status-badge.pendiente { background: #fff7ed; color: #ea580c; border: 1px solid #fdba74; }
.status-badge.pagado { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

/* Footer de tarjeta */
.remito-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
.remito-total .label { font-size: 0.65rem; color: #94a3b8; display: block; text-transform: uppercase; }
.remito-total .amount { font-size: 1.1rem; font-weight: 800; color: #1e293b; }

.remito-actions { display: flex; gap: 8px; }
.btn-action { padding: 8px 14px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; color: #475569; font-size: 0.85rem; }
.btn-print { background: #f8fafc; color: #2563eb; border-color: #dbeafe; }
</style>
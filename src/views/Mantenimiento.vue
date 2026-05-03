<template>
  <div class="page no-print">
    <div class="card-glass header-section mb-6">
      <h1 class="page-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Auditoría de Sistema
      </h1>
      <p class="text-slate-500 text-sm mt-2">Registro de todas las acciones, movimientos de stock y caja realizados en la empresa.</p>
    </div>
    
    <div class="card-glass p-0 overflow-hidden">
      <div v-if="cargando" class="p-8 text-center text-slate-500">
        <span class="cs-animate-spin inline-block text-2xl mb-2">🔄</span>
        <p>Cargando registros...</p>
      </div>

      <table v-else class="cs-table">
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Módulo</th>
            <th>Tipo</th>
            <th>Descripción / Acción</th>
            <th class="text-right">Monto / Cant.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evento in eventos" :key="evento.id">
            <td class="whitespace-nowrap font-mono text-sm text-slate-600">
              {{ formatFecha(evento.fecha || evento.created_at) }}
            </td>
            <td>
              <span class="cs-badge" :class="getBadgeClass(evento.modulo)">
                {{ evento.modulo }}
              </span>
            </td>
            <td>
              <span class="cs-badge" :class="evento.tipo_movimiento === 'ENTRADA' || evento.tipo_movimiento === 'INGRESO' ? 'cs-badge-success' : (evento.tipo_movimiento === 'SALIDA' || evento.tipo_movimiento === 'EGRESO' ? 'cs-badge-error' : 'cs-badge-info')">
                {{ evento.tipo_movimiento }}
              </span>
            </td>
            <td>
              <p class="text-sm font-medium text-slate-800">{{ evento.descripcion }}</p>
              <p class="text-xs text-slate-500" v-if="evento.entidad_nombre">Ref: {{ evento.entidad_nombre }}</p>
            </td>
            <td class="text-right font-mono font-bold">
              <span v-if="evento.monto > 0" class="text-slate-700">${{ evento.monto.toLocaleString() }}</span>
              <span v-else-if="evento.cantidad > 0" class="text-indigo-600">{{ evento.cantidad }} und.</span>
              <span v-else class="text-slate-400">-</span>
            </td>
          </tr>
          <tr v-if="eventos.length === 0">
            <td colspan="5" class="text-center p-8 text-slate-500">
              No hay registros de actividad aún.
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="p-4 bg-slate-50 border-t border-slate-200 text-center" v-if="eventos.length >= limit">
        <button @click="cargarMas" class="cs-btn cs-btn-secondary cs-btn-sm">Cargar movimientos anteriores</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';

const eventos = ref([]);
const cargando = ref(true);
const limit = ref(50);

const fetchEventos = async () => {
  cargando.value = true;
  try {
    const user = JSON.parse(localStorage.getItem("contasoft_user_sesion"));
    const empresaId = user ? user.empresa_id : null;
    
    if (!empresaId) return;

    const { data, error } = await supabase
      .from('flujo_sistema')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('id', { ascending: false })
      .limit(limit.value);

    if (error) throw error;
    eventos.value = data || [];
  } catch (error) {
    console.error("Error al cargar auditoría:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  fetchEventos();
});

const cargarMas = () => {
  limit.value += 50;
  fetchEventos();
};

const formatFecha = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('es-AR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

const getBadgeClass = (modulo) => {
  const map = {
    'CAJA': 'cs-badge-success',
    'STOCK': 'cs-badge-warning',
    'FACTURACION': 'cs-badge-brand',
    'SISTEMA': 'cs-badge-info'
  };
  return map[modulo?.toUpperCase()] || 'cs-badge-secondary';
};
</script>

<style scoped>
.page { padding: 24px; max-width: 1200px; margin: 0 auto; }
.mb-6 { margin-bottom: 24px; }
.whitespace-nowrap { white-space: nowrap; }
.text-right { text-align: right; }
.inline-block { display: inline-block; }
.text-slate-500 { color: var(--cs-text-muted); }
.text-slate-600 { color: var(--cs-text-secondary); }
.text-slate-700 { color: var(--cs-text-primary); }
.text-slate-800 { color: var(--cs-text-primary); font-weight: 600; }
.bg-slate-50 { background-color: var(--cs-bg-secondary); }
.border-t { border-top: 1px solid var(--cs-border-soft); }
.p-0 { padding: 0; }
.p-4 { padding: 16px; }
.p-8 { padding: 32px; }
.mt-2 { margin-top: 8px; }
</style>
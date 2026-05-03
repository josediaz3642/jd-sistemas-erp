<template>
  <div class="admin-subs">
    <header class="page-header">
      <div>
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Gestión de Suscripciones
        </h1>
        <p class="page-sub">Administrá los planes de todas las empresas registradas.</p>
      </div>
      <button @click="refresh" class="cs-btn cs-btn-secondary cs-btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Actualizar
      </button>
    </header>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Total Empresas</span>
        <span class="stat-value">{{ empresas.length }}</span>
      </div>
      <div class="stat-card stat-green">
        <span class="stat-label">Activas</span>
        <span class="stat-value">{{ empresas.filter(e => e.estado_sub === 'activa').length }}</span>
      </div>
      <div class="stat-card stat-red">
        <span class="stat-label">Vencidas</span>
        <span class="stat-value">{{ empresas.filter(e => e.estado_sub === 'vencida').length }}</span>
      </div>
      <div class="stat-card stat-gray">
        <span class="stat-label">Sin Plan</span>
        <span class="stat-value">{{ empresas.filter(e => e.estado_sub === 'sin_plan').length }}</span>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="busqueda" type="text" placeholder="Buscar por razón social, CUIT o email..." class="search-input" />
    </div>

    <!-- Table -->
    <div class="table-card">
      <table class="subs-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Estado</th>
            <th>Días Rest.</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in empresasFiltradas" :key="emp.id">
            <td>
              <div class="emp-info">
                <div class="emp-avatar">{{ (emp.razon_social || 'E')[0].toUpperCase() }}</div>
                <div>
                  <strong>{{ emp.razon_social || 'Sin nombre' }}</strong>
                  <span class="emp-cuit">{{ emp.cuit || '—' }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="status-pill" :class="getStatusClass(emp.estado_sub)">
                {{ getStatusLabel(emp.estado_sub) }}
              </span>
            </td>
            <td>
              <span :class="{ 'text-danger': emp.dias_restantes !== null && emp.dias_restantes <= 5 }" class="font-mono font-bold">
                {{ emp.dias_restantes !== null ? emp.dias_restantes + 'd' : '—' }}
              </span>
            </td>
            <td class="font-mono">${{ emp.suscripcion?.precio_mensual?.toLocaleString() || '—' }}</td>
            <td>
              <div class="action-btns">
                <button @click="extender(emp.id, 30)" class="cs-btn cs-btn-sm cs-btn-success" title="+30 días">+30d</button>
                <button @click="extender(emp.id, -30)" class="cs-btn cs-btn-sm cs-btn-danger" title="-30 días">-30d</button>
                <button @click="abrirEditar(emp)" class="cs-btn cs-btn-sm cs-btn-ghost" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="empresasFiltradas.length === 0" class="empty-state">No se encontraron empresas.</div>
    </div>

    <!-- Modal Editar -->
    <div v-if="editModal" class="modal-overlay" @click.self="editModal = false">
      <div class="modal-content">
        <h3>Editar Suscripción</h3>
        <p class="modal-sub">{{ editEmpresa?.razon_social }}</p>
        <div class="form-grid">
          <div class="field">
            <label>Precio Mensual (ARS$)</label>
            <input v-model.number="editPrecio" type="number" />
          </div>
          <div class="field">
            <label>Estado</label>
            <select v-model="editEstado">
              <option value="trial">Trial</option>
              <option value="activa">Activa</option>
              <option value="suspendida">Suspendida</option>
            </select>
          </div>
          <div class="field">
            <label>Agregar / Quitar Días</label>
            <input v-model.number="editDias" type="number" placeholder="Ej: 30 o -15" />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="editModal = false" class="cs-btn cs-btn-secondary">Cancelar</button>
          <button @click="guardarEdicion" class="cs-btn cs-btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const subStore = useSubscriptionStore();
const busqueda = ref('');
const editModal = ref(false);
const editEmpresa = ref(null);
const editPrecio = ref(14990);
const editEstado = ref('activa');
const editDias = ref(0);

const empresas = computed(() => subStore.allSuscripciones);

const empresasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return empresas.value;
  return empresas.value.filter(e =>
    (e.razon_social || '').toLowerCase().includes(q) ||
    (e.cuit || '').includes(q)
  );
});

function getStatusClass(estado) {
  const map = { activa: 'success', trial: 'info', vencida: 'error', suspendida: 'warn', sin_plan: '' };
  return map[estado] || '';
}
function getStatusLabel(estado) {
  const map = { activa: 'ACTIVA', trial: 'TRIAL', vencida: 'VENCIDA', suspendida: 'SUSPENDIDA', sin_plan: 'SIN PLAN' };
  return map[estado] || estado;
}

async function refresh() { await subStore.fetchAllSuscripciones(); }

async function extender(empresaId, dias) {
  await subStore.modificarDias(empresaId, dias);
}

function abrirEditar(emp) {
  editEmpresa.value = emp;
  editPrecio.value = emp.suscripcion?.precio_mensual || 14990;
  editEstado.value = emp.suscripcion?.estado || 'activa';
  editDias.value = 0;
  editModal.value = true;
}

async function guardarEdicion() {
  const emp = editEmpresa.value;
  if (emp.suscripcion) {
    await subStore.cambiarPrecio(emp.suscripcion.id, editPrecio.value);
    await subStore.cambiarEstado(emp.suscripcion.id, editEstado.value);
  }
  if (editDias.value !== 0) {
    await subStore.modificarDias(emp.id, editDias.value);
  }
  editModal.value = false;
}

onMounted(refresh);
</script>

<style scoped>
.admin-subs { max-width: 1200px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 900; color: var(--cs-text-primary); }
.page-sub { font-size: 0.85rem; color: var(--cs-text-muted); margin-top: 4px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.stat-card { background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-lg); padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: var(--cs-text-xs); color: var(--cs-text-muted); font-weight: 600; text-transform: uppercase; }
.stat-value { font-size: 1.5rem; font-weight: 900; color: var(--cs-text-primary); }
.stat-green .stat-value { color: var(--cs-success); }
.stat-red .stat-value { color: var(--cs-error); }
.stat-gray .stat-value { color: var(--cs-text-muted); }

.search-bar { display: flex; align-items: center; gap: 10px; background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-md); padding: 10px 16px; margin-bottom: 16px; }
.search-bar svg { color: var(--cs-text-muted); flex-shrink: 0; }
.search-input { border: none !important; background: transparent !important; flex: 1; padding: 0 !important; margin: 0 !important; font-size: var(--cs-text-base); }

.table-card { background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-lg); overflow: hidden; }
.subs-table { width: 100%; border-collapse: collapse; }
.subs-table th { text-align: left; padding: 14px 16px; font-size: var(--cs-text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cs-text-muted); border-bottom: 2px solid var(--cs-border-soft); }
.subs-table td { padding: 14px 16px; border-bottom: 1px solid var(--cs-border-soft); vertical-align: middle; }

.emp-info { display: flex; align-items: center; gap: 12px; }
.emp-avatar { width: 36px; height: 36px; background: var(--cs-gradient-brand); color: white; border-radius: var(--cs-radius-md); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
.emp-info strong { display: block; font-size: 0.85rem; color: var(--cs-text-primary); }
.emp-cuit { font-size: 0.7rem; color: var(--cs-text-muted); font-family: var(--cs-font-mono); }

.action-btns { display: flex; gap: 6px; }

.status-pill { display: inline-flex; padding: 3px 10px; border-radius: var(--cs-radius-full); font-size: 0.65rem; font-weight: 800; letter-spacing: 0.03em; }
.status-pill.success { background: var(--cs-success-bg); color: var(--cs-success); }
.status-pill.error { background: var(--cs-error-bg); color: var(--cs-error); }
.status-pill.warn { background: var(--cs-warning-bg); color: var(--cs-warning-dark); }
.status-pill.info { background: var(--cs-info-bg); color: var(--cs-info); }

.text-danger { color: var(--cs-error) !important; }
.font-mono { font-family: var(--cs-font-mono); }
.font-bold { font-weight: 700; }
.empty-state { padding: 40px; text-align: center; color: var(--cs-text-muted); font-size: 0.85rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--cs-text-secondary); text-transform: uppercase; margin-bottom: 6px; }
.modal-sub { color: var(--cs-text-muted); font-size: 0.85rem; margin-top: -4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .subs-table thead { display: none; }
  .subs-table tr { display: block; margin-bottom: 12px; border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-md); padding: 12px; }
  .subs-table td { display: flex; justify-content: space-between; padding: 6px 0; border: none; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>

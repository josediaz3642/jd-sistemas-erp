<template>
  <div class="crm-container">
    <header class="page-header">
      <div>
        <h2 class="page-title">🎯 CRM & Oportunidades</h2>
        <p class="page-sub">Gestiona tu embudo de ventas y seguimiento de prospectos (Inspirado en Odoo).</p>
      </div>
      <button class="cs-btn cs-btn-primary" @click="nuevaOportunidad">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva Oportunidad
      </button>
    </header>

    <div class="kanban-board">
      <div 
        v-for="(column, idx) in board" 
        :key="idx" 
        class="kanban-column"
        @dragover.prevent
        @drop="onDrop($event, column.id)"
      >
        <div class="column-header" :style="{ borderTopColor: column.color }">
          <h3 class="column-title">{{ column.title }}</h3>
          <span class="column-count">{{ getLeadsByStatus(column.id).length }}</span>
        </div>
        
        <div class="column-body">
          <div 
            v-for="lead in getLeadsByStatus(column.id)" 
            :key="lead.id" 
            class="lead-card"
            draggable="true"
            @dragstart="onDragStart($event, lead)"
          >
            <div class="lead-priority" :class="'p-' + lead.priority"></div>
            <h4 class="lead-name">{{ lead.name }}</h4>
            <div class="lead-customer">{{ lead.customer }}</div>
            <div class="lead-footer">
              <span class="lead-value">${{ lead.expected_revenue.toLocaleString() }}</span>
              <div class="lead-actions">
                <button @click.stop="editarOportunidad(lead)" class="btn-icon" title="Editar">✏️</button>
                <button @click.stop="finalizarOportunidad(lead.id)" class="btn-icon" title="Finalizar (Ganado)">✅</button>
                <button @click.stop="eliminarOportunidad(lead.id)" class="btn-icon delete" title="Eliminar">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Oportunidad -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>{{ form.id ? 'Editar Oportunidad' : 'Crear Oportunidad' }}</h3>
        <div class="form-grid">
          <div class="field">
            <label>Nombre de la Oportunidad</label>
            <input v-model="form.name" type="text" placeholder="Ej: Venta de Servidores">
          </div>
          <div class="field">
            <label>Cliente / Empresa</label>
            <input v-model="form.customer" type="text" placeholder="Nombre del prospecto">
          </div>
          <div class="field">
            <label>Ingreso Estimado ($)</label>
            <input v-model.number="form.expected_revenue" type="number">
          </div>
          <div class="field">
            <label>Prioridad</label>
            <select v-model="form.priority">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
        <div class="modal-actions mt-4 flex justify-end gap-2">
          <button class="cs-btn cs-btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="cs-btn cs-btn-primary" @click="guardarOportunidad">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const showModal = ref(false);
const form = ref({ name: '', customer: '', expected_revenue: 0, priority: 'medium' });

const board = ref([
  { id: 'new', title: 'Nuevo', color: '#64748b' },
  { id: 'qualified', title: 'Calificado', color: '#3b82f6' },
  { id: 'proposition', title: 'Propuesta', color: '#f59e0b' },
  { id: 'won', title: 'Ganado', color: '#10b981' }
]);

const leads = ref([]);

onMounted(() => {
  const saved = localStorage.getItem('contasoft_crm_leads');
  if (saved) {
    leads.value = JSON.parse(saved);
  } else {
    leads.value = [
      { id: 1, name: 'Venta 10 Licencias', customer: 'Acme Corp', expected_revenue: 50000, priority: 'high', status: 'new', date: new Date().toISOString() },
      { id: 2, name: 'Soporte Anual', customer: 'Tech SA', expected_revenue: 120000, priority: 'medium', status: 'qualified', date: new Date().toISOString() }
    ];
  }
});

watch(leads, (newVal) => {
  localStorage.setItem('contasoft_crm_leads', JSON.stringify(newVal));
}, { deep: true });

const getLeadsByStatus = (status) => {
  return leads.value.filter(l => l.status === status);
};

const onDragStart = (evt, lead) => {
  evt.dataTransfer.dropEffect = 'move';
  evt.dataTransfer.effectAllowed = 'move';
  evt.dataTransfer.setData('leadID', lead.id);
};

const onDrop = (evt, newStatus) => {
  const leadID = evt.dataTransfer.getData('leadID');
  const lead = leads.value.find(l => l.id == leadID);
  if (lead) {
    lead.status = newStatus;
  }
};

const nuevaOportunidad = () => {
  form.value = { name: '', customer: '', expected_revenue: 0, priority: 'medium' };
  showModal.value = true;
};

const editarOportunidad = (lead) => {
  form.value = { ...lead };
  showModal.value = true;
};

const eliminarOportunidad = (id) => {
  if (confirm('¿Eliminar esta oportunidad?')) {
    leads.value = leads.value.filter(l => l.id !== id);
  }
};

const finalizarOportunidad = (id) => {
  const lead = leads.value.find(l => l.id === id);
  if (lead) {
    lead.status = 'won';
  }
};

const guardarOportunidad = () => {
  if (!form.value.name || !form.value.customer) return;
  if (form.value.id) {
    const idx = leads.value.findIndex(l => l.id === form.value.id);
    if (idx !== -1) {
      leads.value[idx] = { ...leads.value[idx], ...form.value };
    }
  } else {
    leads.value.push({
      id: Date.now(),
      ...form.value,
      status: 'new',
      date: new Date().toISOString()
    });
  }
  showModal.value = false;
};
</script>

<style scoped>
.crm-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--cs-text-primary);
}

.page-sub {
  font-size: 0.9rem;
  color: var(--cs-text-muted);
}

.kanban-board {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  min-height: 600px;
}

.kanban-column {
  flex: 1;
  min-width: 280px;
  background: var(--cs-bg-secondary);
  border-radius: var(--cs-radius-lg);
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 16px;
  border-top: 4px solid;
  border-radius: var(--cs-radius-lg) var(--cs-radius-lg) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cs-bg-primary);
  border-bottom: 1px solid var(--cs-border-soft);
}

.column-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--cs-text-primary);
}

.column-count {
  background: var(--cs-bg-tertiary);
  color: var(--cs-text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.column-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lead-card {
  background: var(--cs-bg-primary);
  border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-md);
  padding: 16px;
  cursor: grab;
  box-shadow: var(--cs-shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.lead-card:active {
  cursor: grabbing;
}

.lead-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--cs-shadow-md);
}

.lead-priority {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: var(--cs-radius-md) 0 0 var(--cs-radius-md);
}

.p-high { background: var(--cs-error); }
.p-medium { background: var(--cs-warning); }
.p-low { background: var(--cs-success); }

.lead-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--cs-text-primary);
  margin-bottom: 4px;
}

.lead-customer {
  font-size: 0.85rem;
  color: var(--cs-text-secondary);
  margin-bottom: 12px;
}

.lead-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--cs-border-soft);
  padding-top: 12px;
}

.lead-value {
  font-weight: 800;
  color: var(--cs-brand-600);
}

.lead-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 4px;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

.form-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--cs-text-secondary);
  margin-bottom: 6px;
}

.field input, .field select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-md);
}

.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.mt-4 { margin-top: 16px; }
</style>

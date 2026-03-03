<template>
  <div class="page-container">
    <div class="card-glass main-card">
      <header class="table-header">
        <div>
          <h1>Directorio de Proveedores</h1>
          <p class="subtitle">Gestione sus fuentes de suministro y cuentas corrientes.</p>
        </div>
        <button class="btn-primary" @click="nuevo">
          <span class="icon">+</span> Nuevo Proveedor
        </button>
      </header>

      <div class="table-wrapper">
        <div v-if="loading" class="loader">
          <div class="spinner"></div>
          <p>Sincronizando con la nube...</p>
        </div>

        <table v-else class="table-moderna">
          <thead>
            <tr>
              <th>Razón Social</th>
              <th>Identificación (CUIT)</th>
              <th>Contacto / Tel</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in proveedores" :key="p.id" class="row-hover">
              <td class="font-bold text-slate-700">{{ p.nombre }}</td>
              <td class="font-mono text-sm">{{ p.cuit || 'N/A' }}</td>
              <td>{{ p.telefono || '—' }}</td>
              <td class="actions-cell">
                <button class="btn-icon btn-view" @click="ver(p.id)" title="Ver Historial">
                  👁️ <span>Detalle</span>
                </button>
                <button class="btn-icon btn-edit" @click="editar(p.id)" title="Editar Datos">
                  📝 <span>Editar</span>
                </button>
              </td>
            </tr>
            <tr v-if="proveedores.length === 0">
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <p>No se encontraron proveedores registrados.</p>
                  <small>Comience agregando uno para registrar facturas de compra.</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProveedores } from '@/services/data';

const router = useRouter();
const proveedores = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Llamada asíncrona a Supabase
    proveedores.value = await getProveedores();
  } catch (e) {
    console.error("Error cargando proveedores:", e);
  } finally {
    loading.value = false;
  }
});

function nuevo() { router.push('/proveedor/0'); }
function ver(id) { router.push(`/proveedor/${id}`); }
function editar(id) { router.push(`/proveedor/${id}`); }
</script>

<style scoped>
.page-container { padding: 30px; max-width: 1100px; margin: 0 auto; }
.main-card { padding: 25px !important; }

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

.table-wrapper { overflow-x: auto; }

.table-moderna {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table-moderna th {
  padding: 16px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

.table-moderna td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.row-hover:hover { background: #f1f5f950; }

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Botones */
.btn-primary {
  background: #1e293b;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { background: #0f172a; transform: translateY(-1px); }

.btn-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-view:hover { border-color: #3b82f6; color: #3b82f6; }
.btn-edit:hover { border-color: #10b981; color: #10b981; }

/* Loader */
.loader {
  text-align: center;
  padding: 50px;
  color: #64748b;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #1e293b;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px 0; color: #94a3b8; }
</style>
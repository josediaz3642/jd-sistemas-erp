<template>
  <div class="page-container">
    <header class="section-header">
      <div class="header-content">
        <h1>Proveedores</h1>
        <p>Gestión de suministros y contactos.</p>
      </div>
      <button class="btn-add-main" @click="nuevo">
        <span class="icon">+</span> Nuevo
      </button>
    </header>

    <div class="search-bar-container">
      <div class="glass-card search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="filtro" 
          type="text" 
          placeholder="Buscar por nombre o CUIT..." 
          class="input-search"
        />
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="loading" class="loader-container">
        <div class="spinner"></div>
        <p>Sincronizando con Supabase...</p>
      </div>

      <template v-else>
        <div class="mobile-grid">
          <div v-for="p in proveedoresFiltrados" :key="p.id" class="glass-card provider-card">
            <div class="card-body">
              <div class="provider-main-info">
                <span class="cuit-badge">{{ p.cuit || 'SIN CUIT' }}</span>
                <h3>{{ p.nombre }}</h3>
                <p class="tel-info">📞 {{ p.telefono || 'Sin teléfono' }}</p>
              </div>
              <div class="card-actions">
                <button @click="ver(p.id)" class="btn-action-mobile view">👁️ Ver</button>
                <button @click="editar(p.id)" class="btn-action-mobile edit">📝 Editar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="desktop-table glass-card">
          <table class="table-modern">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in proveedoresFiltrados" :key="p.id" class="row-hover">
                <td class="font-bold">{{ p.nombre }}</td>
                <td class="font-mono text-blue">{{ p.cuit }}</td>
                <td>{{ p.telefono }}</td>
                <td class="actions-cell">
                  <button @click="ver(p.id)" class="btn-small">👁️ Detalle</button>
                  <button @click="editar(p.id)" class="btn-small">📝 Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="proveedoresFiltrados.length === 0" class="empty-state">
          <p>No se encontraron proveedores.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getProveedores } from '@/services/data';

const router = useRouter();
const proveedores = ref([]);
const loading = ref(true);
const filtro = ref("");

onMounted(async () => {
  try {
    proveedores.value = await getProveedores();
  } catch (e) {
    console.error("Error:", e);
  } finally {
    loading.value = false;
  }
});

// Filtrado en tiempo real
const proveedoresFiltrados = computed(() => {
  const search = filtro.value.toLowerCase();
  return proveedores.value.filter(p => 
    p.nombre?.toLowerCase().includes(search) || 
    p.cuit?.includes(search)
  );
});

// CAMBIO CLAVE: Enviamos 'nuevo' en lugar de '0' para evitar el error 400
function nuevo() { router.push('/proveedor/nuevo'); }
function ver(id) { router.push(`/proveedor/${id}`); }
function editar(id) { router.push(`/proveedor/${id}`); }
</script>

<style scoped>
.page-container { padding: 20px; max-width: 1000px; margin: 0 auto; background: #f8fafc; min-height: 100vh; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h1 { font-size: 1.5rem; font-weight: 900; color: #0f172a; margin: 0; }
.section-header p { color: #64748b; font-size: 0.9rem; }

.btn-add-main {
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Buscador Estilo JD */
.search-bar-container { margin-bottom: 20px; }
.search-box {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 10px;
}
.input-search {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 1rem;
  color: #1e293b;
}

.glass-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

/* VISTA MOBILE */
.mobile-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.provider-card { padding: 16px; }
.cuit-badge {
  font-size: 0.65rem;
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
  font-family: monospace;
}
.provider-card h3 { margin: 8px 0 4px 0; font-size: 1.1rem; color: #1e293b; }
.tel-info { font-size: 0.85rem; color: #64748b; margin-bottom: 15px; }

.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-action-mobile {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-action-mobile.edit { background: #0f172a; color: white; border: none; }

/* VISTA DESKTOP */
.desktop-table { display: none; padding: 10px; }
.table-modern { width: 100%; border-collapse: collapse; }
.table-modern th {
  text-align: left;
  padding: 15px;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}
.table-modern td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.text-blue { color: #2563eb; font-weight: bold; }
.actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-small {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
}

/* RESPONSIVE */
@media (min-width: 768px) {
  .mobile-grid { display: none; }
  .desktop-table { display: block; }
}

/* Spinner */
.loader-container { text-align: center; padding: 40px; }
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #0f172a;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
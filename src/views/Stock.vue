<template>
  <div class="page-container">
    <div class="card-glass main-inventory">
      <header class="inventory-header">
        <div>
          <h1>Control de Inventario</h1>
          <p class="subtitle">Gestiona tus existencias y precios en tiempo real.</p>
        </div>
        <button class="btn-primary" @click="nuevo">
          <span class="icon">📦</span> Nuevo Producto
        </button>
      </header>

      <div class="filter-bar">
        <input 
          v-model="search" 
          type="text" 
          placeholder="Buscar por nombre o código..." 
          class="search-input"
        />
        <div class="stats-mini">
          <span class="stat-tag">Total: {{ stock.length }}</span>
          <span class="stat-tag warning">Bajo Stock: {{ bajoStockCount }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <div v-if="loading" class="loader">
          <div class="spinner"></div>
          <p>Actualizando almacén...</p>
        </div>

        <table v-else class="table-moderna">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Precio Venta</th>
              <th class="text-right">Cantidad</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="p in filteredStock"
              :key="p.id"
              class="row-click"
              @click="editar(p.id)"
            >
              <td class="prod-info">
                <span class="prod-name">{{ p.nombre }}</span>
                <small v-if="p.categoria" class="prod-cat">{{ p.categoria }}</small>
              </td>
              <td class="text-right font-bold">${{ p.precio_venta || p.precio }}</td>
              <td class="text-right">
                <span class="qty-badge" :class="getQtyClass(p.cantidad)">
                  {{ p.cantidad }}
                </span>
              </td>
              <td>
                <span v-if="p.cantidad <= 0" class="status-pill error">Sin Stock</span>
                <span v-else-if="p.cantidad <= 5" class="status-pill warn">Reponer</span>
                <span v-else class="status-pill success">Disponible</span>
              </td>
            </tr>
            <tr v-if="filteredStock.length === 0">
              <td colspan="4" class="empty-msg">No se encontraron productos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getStockItems } from "@/services/data";

const router = useRouter();
const stock = ref([]);
const loading = ref(true);
const search = ref("");

onMounted(async () => {
  loading.value = true;
  try {
    stock.value = await getStockItems();
  } finally {
    loading.value = false;
  }
});

const filteredStock = computed(() => {
  return stock.value.filter(p => 
    p.nombre.toLowerCase().includes(search.value.toLowerCase())
  );
});

const bajoStockCount = computed(() => {
  return stock.value.filter(p => p.cantidad <= 5).length;
});

function getQtyClass(qty) {
  if (qty <= 0) return 'qty-critical';
  if (qty <= 5) return 'qty-low';
  return 'qty-normal';
}

function nuevo() { router.push("/stock/nuevo"); }
function editar(id) { router.push(`/stock/${id}`); }
</script>

<style scoped>
.page-container { padding: 25px; max-width: 1100px; margin: 0 auto; }
.inventory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { color: #64748b; font-size: 0.9rem; }

.filter-bar { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
.search-input { flex: 1; padding: 12px 18px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; }

.stats-mini { display: flex; gap: 10px; }
.stat-tag { padding: 8px 15px; background: #f1f5f9; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: #475569; }
.stat-tag.warning { background: #fee2e2; color: #ef4444; }

.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.prod-info { display: flex; flex-direction: column; }
.prod-name { font-weight: 700; color: #1e293b; }
.prod-cat { font-size: 0.75rem; color: #94a3b8; }

.qty-badge { padding: 5px 12px; border-radius: 6px; font-weight: 800; }
.qty-critical { background: #ef4444; color: white; }
.qty-low { background: #f59e0b; color: white; }
.qty-normal { background: #f1f5f9; color: #475569; }

.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.status-pill.success { background: #dcfce7; color: #166534; }
.status-pill.warn { background: #fef3c7; color: #92400e; }
.status-pill.error { background: #fee2e2; color: #991b1b; }

.row-click { cursor: pointer; transition: 0.2s; }
.row-click:hover { background: #f8fafc; }

.text-right { text-align: right; }
.font-bold { font-weight: 800; }

.loader { text-align: center; padding: 50px; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
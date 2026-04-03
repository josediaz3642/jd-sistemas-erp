<template>
  <div class="page-container">
    <div class="card-glass main-inventory">
      <header class="inventory-header">
        <div>
          <h1>Control de Inventario</h1>
          <p class="subtitle">Gestión avanzada para JD Sistemasinformáticos.</p>
        </div>
        <button class="btn-primary" @click="nuevo">
          <span class="icon">📦</span> Nuevo Producto
        </button>
      </header>

      <div class="filter-bar">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            v-model="search" 
            type="text" 
            placeholder="Buscar por nombre o código SKU..." 
            class="search-input"
          />
        </div>
        <div class="stats-mini">
          <span class="stat-tag">Total: {{ stock.length }}</span>
          <span class="stat-tag warning">Bajo Stock: {{ bajoStockCount }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <div v-if="loading" class="loader">
          <div class="spinner"></div>
          <p>Sincronizando con base de datos...</p>
        </div>

        <table v-else class="table-moderna">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th class="text-right">Costo Real</th>
              <th class="text-right">Precio Venta</th>
              <th class="text-right">Stock</th>
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
              <td class="font-mono text-blue-600 font-bold">
                {{ p.codigo || 'S/C' }}
              </td>
              <td class="prod-info">
                <span class="prod-name">{{ p.nombre }}</span>
                <small class="prod-cat">{{ p.categoria || 'General' }}</small>
              </td>
              <td class="text-right text-gray-500">
                ${{ Number(p.costo_real || 0).toLocaleString() }}
              </td>
              <td class="text-right font-black text-green-600">
                ${{ Number(p.precio || p.precio_venta || 0).toLocaleString() }}
              </td>
              <td class="text-right">
                <span class="qty-badge" :class="getQtyClass(p.cantidad, p.stock_minimo)">
                  {{ p.cantidad }}
                </span>
              </td>
              <td>
                <span v-if="p.cantidad <= 0" class="status-pill error">Sin Stock</span>
                <span v-else-if="p.cantidad <= (p.stock_minimo || 5)" class="status-pill warn">Reponer</span>
                <span v-else class="status-pill success">Ok</span>
              </td>
            </tr>
            <tr v-if="filteredStock.length === 0">
              <td colspan="6" class="empty-msg text-center py-10 text-gray-400">
                No se encontraron productos que coincidan con "{{ search }}"
              </td>
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
  await cargarStock();
});

async function cargarStock() {
  loading.value = true;
  try {
    stock.value = await getStockItems();
  } catch (error) {
    console.error("Error cargando stock:", error);
  } finally {
    loading.value = false;
  }
}

// BUSQUEDA MEJORADA: Filtra por nombre y por código
const filteredStock = computed(() => {
  const query = search.value.toLowerCase();
  return stock.value.filter(p => 
    (p.nombre?.toLowerCase().includes(query)) || 
    (p.codigo?.toLowerCase().includes(query))
  );
});

const bajoStockCount = computed(() => {
  return stock.value.filter(p => p.cantidad <= (p.stock_minimo || 5)).length;
});

function getQtyClass(qty, min) {
  const limite = min || 5;
  if (qty <= 0) return 'qty-critical';
  if (qty <= limite) return 'qty-low';
  return 'qty-normal';
}

function nuevo() { 
  // Asegurate que tu router tenga esta ruta definida que apunte al nuevo formulario
  router.push("/stock/nuevo"); 
}

function editar(id) { 
  router.push(`/stock/${id}`); 
}
</script>

<style scoped>
.page-container { padding: 25px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
.card-glass { background: white; border-radius: 20px; padding: 25px; shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }

.inventory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.inventory-header h1 { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin-bottom: 5px; }

.btn-primary { 
  background: #2563eb; color: white; border: none; padding: 12px 24px; 
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

.filter-bar { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; align-items: center; }
.search-wrapper { position: relative; flex: 1; }
.search-icon { position: absolute; left: 15px; top: 12px; color: #94a3b8; }
.search-input { width: 100%; padding: 12px 12px 12px 45px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.3s; }
.search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.stats-mini { display: flex; gap: 10px; }
.stat-tag { padding: 8px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.85rem; font-weight: 700; color: #475569; }
.stat-tag.warning { border-color: #fecaca; background: #fef2f2; color: #dc2626; }

.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; background: #f8fafc; color: #64748b; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
.table-moderna td { padding: 16px 15px; border-bottom: 1px solid #f1f5f9; }

.row-click { cursor: pointer; transition: 0.2s; }
.row-click:hover { background: #f1f5f9; }

.qty-badge { padding: 4px 10px; border-radius: 8px; font-weight: 900; font-size: 0.9rem; }
.qty-critical { background: #fee2e2; color: #b91c1c; }
.qty-low { background: #fef3c7; color: #92400e; }
.qty-normal { background: #f1f5f9; color: #475569; }

.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
.status-pill.success { background: #dcfce7; color: #15803d; }
.status-pill.warn { background: #fff7ed; color: #c2410c; }
.status-pill.error { background: #fef2f2; color: #b91c1c; }

.text-right { text-align: right; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.loader { text-align: center; padding: 60px; color: #64748b; }
.spinner { width: 35px; height: 35px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
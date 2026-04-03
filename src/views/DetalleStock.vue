<template>
  <div class="page-wrapper">
    <div class="form-container">
      <header class="form-header">
        <div class="header-content">
          <span class="icon">📦</span>
          <h2>{{ isNuevo ? 'Nuevo Producto' : 'Editar Ficha' }}</h2>
        </div>
        <button @click="router.back()" class="btn-close">✕</button>
      </header>

      <form @submit.prevent="guardar" class="main-form">
        <div class="form-grid">
          
          <div class="form-section">
            <div class="input-group">
              <label>Código SKU</label>
              <input v-model="form.codigo" type="text" placeholder="Ej: REP-001" class="input-special">
            </div>

            <div class="input-group">
              <label>Descripción del Producto</label>
              <input v-model="form.nombre" type="text" required placeholder="Nombre completo...">
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Stock Actual</label>
                <input v-model.number="form.cantidad" type="number" step="0.01">
              </div>
              <div class="input-group">
                <label>Mínimo</label>
                <input v-model.number="form.stock_minimo" type="number" class="border-red">
              </div>
            </div>

            <div class="input-group">
              <label>Categoría</label>
              <select v-model="form.categoria">
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Insumos">Insumos</option>
                <option value="Servicios">Servicios</option>
              </select>
            </div>
          </div>

          <div class="finance-card">
            <h3 class="finance-title">ESTRUCTURA DE PRECIOS</h3>
            
            <div class="price-input-block">
              <label>PRECIO BASE COMPRA ($)</label>
              <input v-model.number="form.precio_base" type="number" step="0.01" class="main-price">
            </div>

            <div class="percent-grid">
              <div class="input-group">
                <label>Desc. %</label>
                <input v-model.number="form.descuento_porcentaje" type="number" class="dark-input">
              </div>
              <div class="input-group">
                <label>Flete %</label>
                <input v-model.number="form.flete_porcentaje" type="number" class="dark-input">
              </div>
            </div>

            <div class="cost-summary">
              Costo Final: <strong>${{ costoCalculado.toFixed(2) }}</strong>
            </div>

            <div class="margin-block">
              <label>MARGEN DE GANANCIA (%)</label>
              <input v-model.number="form.ganancia_porcentaje" type="number" class="margin-input">
            </div>

            <div class="final-price-box">
              <label>P. VENTA FINAL</label>
              <div class="price-big">${{ precioVentaCalculado.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <footer class="form-actions">
          <button type="button" @click="router.back()" class="btn-alt">Descartar</button>
          <button type="submit" class="btn-primary">Confirmar y Guardar</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStockById, saveStockItem } from '@/services/data';

const route = useRoute();
const router = useRouter();
const isNuevo = computed(() => route.params.id === 'nuevo');

const form = ref({
  codigo: '', nombre: '', categoria: 'Hardware',
  cantidad: 0, stock_minimo: 5,
  precio_base: 0, descuento_porcentaje: 0,
  flete_porcentaje: 0, ganancia_porcentaje: 35
});

onMounted(async () => {
  if (!isNuevo.value) {
    const data = await getStockById(route.params.id);
    if (data) form.value = { ...form.value, ...data };
  }
});

const costoCalculado = computed(() => {
  const base = Number(form.value.precio_base) || 0;
  const d = base * (Number(form.value.descuento_porcentaje) / 100);
  const f = (base - d) * (Number(form.value.flete_porcentaje) / 100);
  return (base - d) + f;
});

const precioVentaCalculado = computed(() => {
  const g = costoCalculado.value * (Number(form.value.ganancia_porcentaje) / 100);
  return costoCalculado.value + g;
});

async function guardar() {
  try {
    await saveStockItem(form.value);
    router.push('/stock');
  } catch (e) { alert("Error al guardar: Verifique columnas en Supabase"); }
}
</script>

<style scoped>
.page-wrapper { padding: 20px; display: flex; justify-content: center; min-height: 90vh; box-sizing: border-box; }
.form-container { background: white; width: 100%; max-width: 850px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid #eee; overflow: hidden; height: fit-content; }
.form-header { background: #111827; color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
.header-content { display: flex; items-center: center; gap: 10px; }
.header-content h2 { font-size: 1.2rem; margin: 0; font-weight: 700; }
.btn-close { background: none; border: none; color: #6b7280; cursor: pointer; font-size: 1.2rem; }

.main-form { padding: 30px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }

/* Responsive Grid */
@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

.form-section { display: flex; flex-direction: column; gap: 15px; }
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-group label { font-size: 0.75rem; font-weight: 700; color: #4b5563; text-transform: uppercase; }
.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

input, select { padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; outline: none; transition: 0.2s; }
input:focus { border-color: #2563eb; ring: 2px solid #dbeafe; }

.input-special { background: #f0f9ff; color: #0369a1; font-family: monospace; font-weight: bold; border-color: #bae6fd; }

/* FINANCE CARD */
.finance-card { background: #0f172a; border-radius: 12px; padding: 25px; color: #94a3b8; }
.finance-title { font-size: 0.7rem; letter-spacing: 0.1em; color: #38bdf8; margin-bottom: 20px; }
.main-price { background: transparent !important; border: none !important; border-bottom: 2px solid #334155 !important; color: #fff !important; font-size: 2rem !important; font-weight: 800 !important; width: 100%; border-radius: 0 !important; padding: 5px 0 !important; }
.percent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
.dark-input { background: #1e293b; border: 1px solid #334155; color: white; }
.cost-summary { padding: 10px 0; border-bottom: 1px dashed #334155; font-size: 0.85rem; }
.cost-summary strong { color: white; font-size: 1.1rem; margin-left: 10px; }
.margin-input { width: 100%; background: #1e293b; border: 1px solid #334155; color: #4ade80; font-weight: bold; margin-top: 5px; }
.final-price-box { margin-top: 25px; text-align: right; }
.price-big { color: #4ade80; font-size: 2.8rem; font-weight: 900; line-height: 1; margin-top: 5px; }

.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; border-top: 1px solid #eee; pt: 20px; }
.btn-alt { background: #f3f4f6; color: #4b5563; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 12px 40px; border-radius: 8px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
</style>
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getStockItems, updateStockItem, createStockItem, deleteStockItem } from '@/services/data';

// --- ESTADO ---
const productos = ref([]);
const loading = ref(true);
const filtro = ref("");
const filtroStock = ref("todos");
const mostrarModal = ref(false);
const mostrarAjuste = ref(false);
const editando = ref(false);
const productoSeleccionado = ref(null);
const formAjuste = ref(0);

// --- ACCIONES ---
onMounted(cargarStock);

async function cargarStock() {
  loading.value = true;
  try {
    const data = await getStockItems();
    productos.value = data || [];
  } catch (error) {
    console.error("Error al cargar:", error);
    productos.value = [];
  } finally {
    loading.value = false;
  }
}

async function eliminarProducto(p) {
  const confirmar = confirm(`¿Estás seguro de eliminar "${p.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmar) return;
  try {
    await deleteStockItem(p.id);
    await cargarStock();
  } catch (e) {
    alert("Error al intentar eliminar el producto");
  }
}

// --- FORMULARIO Y LÓGICA ---
const form = ref({
  nombre: '', codigo: '', categoria: 'Hardware', precio_base: 0,
  flete_porcentaje: 0, ganancia_porcentaje: 30, iva_porcentaje: 21,
  precio_publico: 0, precio_gremio_porcentaje: 15, precio_gremio: 0,
  stock: 0, stock_minimo: 5
});

const calcularPrecios = () => {
  const base = Number(form.value.precio_base) || 0;
  const flete = base * (Number(form.value.flete_porcentaje) / 100);
  const costoConFlete = base + flete;
  const ganancia = costoConFlete * (Number(form.value.ganancia_porcentaje) / 100);
  const neto = costoConFlete + ganancia;
  const iva = neto * (Number(form.value.iva_porcentaje) / 100);
  form.value.precio_publico = Math.round(neto + iva);
  const descGremio = form.value.precio_publico * (Number(form.value.precio_gremio_porcentaje) / 100);
  form.value.precio_gremio = Math.round(form.value.precio_publico - descGremio);
};

watch(() => [
  form.value.precio_base, form.value.flete_porcentaje, 
  form.value.ganancia_porcentaje, form.value.iva_porcentaje,
  form.value.precio_gremio_porcentaje
], calcularPrecios, { deep: true });

const productosFiltrados = computed(() => {
  if (!productos.value) return [];
  return productos.value.filter(p => {
    const nombreProd = (p.nombre || p.name || "").toLowerCase();
    const codigoProd = (p.codigo || p.code || "").toLowerCase();
    const match = nombreProd.includes(filtro.value.toLowerCase()) || codigoProd.includes(filtro.value.toLowerCase());
    const stockActual = p.stock ?? p.cantidad ?? 0;
    return filtroStock.value === 'bajo' ? (match && stockActual <= (p.stock_minimo || 5)) : match;
  });
});

function statusClass(p) {
  const stockActual = p.stock ?? p.cantidad ?? 0;
  const stockMin = p.stock_minimo || 5;
  if (stockActual <= 0) return 'status-critical';
  if (stockActual <= stockMin) return 'status-low';
  return 'status-normal';
}

function abrirModalNuevo() {
  editando.value = false;
  form.value = { 
    nombre: '', codigo: '', categoria: 'Hardware', precio_base: 0, 
    flete_porcentaje: 0, ganancia_porcentaje: 30, iva_porcentaje: 21, 
    stock: 0, stock_minimo: 5, precio_gremio_porcentaje: 15 
  };
  mostrarModal.value = true;
}

function editar(p) {
  editando.value = true;
  productoSeleccionado.value = p;
  
  // Mapeamos lo que viene de la DB a lo que entiende el Formulario
  form.value = { 
    ...p,
    stock: p.cantidad ?? 0, 
    precio_publico: p.precio_venta ?? p.precio ?? 0,
    // Nos aseguramos que los porcentajes tengan valor por defecto si vienen null
    flete_porcentaje: p.flete_porcentaje ?? 0,
    ganancia_porcentaje: p.ganancia_porcentaje ?? 35,
    iva_porcentaje: 21, // Este no está en tu DB, lo dejamos fijo o lo agregás después
    precio_gremio_porcentaje: 15
  };
  
  // Forzamos el cálculo de precios para que se vea bien al abrir
  calcularPrecios();
  mostrarModal.value = true;
}

function ajustarStock(p) {
  productoSeleccionado.value = p;
  formAjuste.value = 0;
  mostrarAjuste.value = true;
}

async function guardarProducto() {
  try {
    // Calculamos valores derivados antes de enviar para llenar costo_real
    const base = Number(form.value.precio_base) || 0;
    const flete = base * (Number(form.value.flete_porcentaje) / 100);
    const costoConFlete = base + flete;

    const payload = {
      nombre: form.value.nombre,
      codigo: form.value.codigo,
      categoria: form.value.categoria,
      precio_base: base,
      flete_porcentaje: Number(form.value.flete_porcentaje) || 0,
      ganancia_porcentaje: Number(form.value.ganancia_porcentaje) || 0,
      descuento_porcentaje: Number(form.value.descuento_porcentaje) || 0,
      cantidad: Number(form.value.stock) || 0,
      stock_minimo: Number(form.value.stock_minimo) || 5,
      // Mapeamos a las tres columnas de precio que tenés en SQL
      precio_venta: Number(form.value.precio_publico) || 0,
      precio: Number(form.value.precio_publico) || 0, // <--- Aquí se soluciona el null en 'precio'
      precio_costo: base,
      costo_real: costoConFlete, // Guardamos el costo con flete
      empresa_id: 'emp_default'
    };

    if (editando.value) {
      await updateStockItem(productoSeleccionado.value.id, payload);
    } else {
      await createStockItem(payload);
    }

    await cargarStock();
    mostrarModal.value = false;
    alert("¡Producto guardado con éxito!");
    
  } catch (e) {
    console.error("Error al guardar:", e);
    alert("Error al guardar. Revisá la consola.");
  }
}

async function confirmarAjuste() {
  try {
    // Usamos 'cantidad' porque así se llama en tu tabla SQL
    const stockActual = productoSeleccionado.value.cantidad ?? 0;
    const nuevoStock = stockActual + formAjuste.value;

    await updateStockItem(productoSeleccionado.value.id, { 
      cantidad: nuevoStock 
    });

    await cargarStock();
    mostrarAjuste.value = false;
    formAjuste.value = 0;
  } catch (e) {
    console.error("Error en ajuste:", e);
  }
}
</script>

<template>
  <div class="page-container">
    <header class="section-header">
      <h1>Inventario</h1>
      <button @click="abrirModalNuevo" class="btn-add-stock">+ Nuevo</button>
    </header>

    <div class="search-container glass-card">
      <input v-model="filtro" type="text" placeholder="Buscar..." class="input-search" />
      <div class="filter-pills">
        <span @click="filtroStock = 'todos'" :class="{ active: filtroStock === 'todos' }">Todos</span>
        <span @click="filtroStock = 'bajo'" :class="{ active: filtroStock === 'bajo' }">⚠️ Stock Bajo</span>
      </div>
    </div>

    <div class="stock-list">
      <div v-if="loading" class="loader">Cargando...</div>
      <div v-else v-for="p in productosFiltrados" :key="p.id" class="product-card glass-card">
        <div class="product-main">
          <div class="product-info">
            <span class="product-code">{{ p.codigo || p.code || 'S/C' }}</span>
            <h3 class="product-name">{{ p.nombre || p.name }}</h3>
            <p class="product-category">{{ p.categoria || 'General' }}</p>
          </div>
          <div class="product-stock-badge" :class="statusClass(p)">
            <span class="stock-qty">{{ p.stock ?? p.cantidad ?? 0 }}</span>
            <span class="stock-label">unidades</span>
          </div>
        </div>

        <div class="product-prices">
          <div class="price-item">
            <span class="label">Público</span>
            <span class="price">$ {{ (p.precio || p.precio_publico || 0).toLocaleString() }}</span>
          </div>
          <div class="price-item">
            <span class="label">Gremio</span>
            <span class="price gremio">$ {{ (p.precio_gremio || 0).toLocaleString() }}</span>
          </div>
        </div>

        <div class="product-actions">
          <button @click="editar(p)" class="btn-edit-stock">Editar</button>
          <button @click="ajustarStock(p)" class="btn-adjust">Ajustar</button>
          <button @click="eliminarProducto(p)" class="btn-delete">Eliminar</button>
        </div>
      </div>
    </div>

  <div v-if="mostrarModal" class="modal-overlay">
  <div class="modal-content glass-card edit-modal">
    <header class="modal-header-dark">
      <div class="header-info">
        <span class="icon">📦</span>
        <h3>{{ editando ? 'Editar Producto' : 'Nuevo Ingreso' }}</h3>
      </div>
      <button @click="mostrarModal = false" class="btn-close-dark">✕</button>
    </header>

    <div class="form-container-scroll">
      <div class="form-section">
        <div class="input-group">
          <label>Nombre del Producto</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: MacBook Pro M2" class="input-main" />
        </div>
        
        <div class="input-row">
          <div class="input-group">
            <label>Código / SKU</label>
            <input v-model="form.codigo" type="text" placeholder="SKU-123" class="input-code" />
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

        <div class="input-row" v-if="!editando">
          <div class="input-group">
            <label>Stock Inicial</label>
            <input v-model.number="form.stock" type="number" />
          </div>
          <div class="input-group">
            <label>Stock Mínimo</label>
            <input v-model.number="form.stock_minimo" type="number" class="input-warning" />
          </div>
        </div>
      </div>

      <div class="finance-dark-card">
        <h4 class="finance-label">ESTRUCTURA DE COSTOS</h4>
        
        <div class="price-input-main">
          <label>COSTO BASE COMPRA ($)</label>
          <input v-model.number="form.precio_base" type="number" step="0.01" class="input-ghost" />
        </div>

        <div class="percent-row">
          <div class="input-group-dark">
            <label>Flete %</label>
            <input v-model.number="form.flete_porcentaje" type="number" />
          </div>
          <div class="input-group-dark">
            <label>Margen %</label>
            <input v-model.number="form.ganancia_porcentaje" type="number" />
          </div>
          <div class="input-group-dark">
            <label>IVA %</label>
            <input v-model.number="form.iva_porcentaje" type="number" />
          </div>
        </div>

        <div class="result-display">
          <div class="result-item">
            <span>P. Venta Público</span>
            <div class="price-val highlight-green">${{ form.precio_publico.toLocaleString() }}</div>
          </div>
          <div class="result-item">
            <span>Desc. Gremio ({{form.precio_gremio_porcentaje}}%)</span>
            <div class="price-val highlight-purple">${{ form.precio_gremio.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="modal-footer">
      <button @click="mostrarModal = false" class="btn-cancel-flat">Descartar</button>
      <button @click="guardarProducto" class="btn-save-primary">
        {{ editando ? 'Guardar Cambios' : 'Crear Producto' }}
      </button>
    </footer>
  </div>
</div>
    

 <div v-if="mostrarAjuste" class="modal-overlay">
      <div class="modal-content adjustment-modal glass-card">
        <div class="modal-header">
           <h3>Ajustar Inventario</h3>
           <p class="product-target">{{ productoSeleccionado?.nombre }}</p>
        </div>
        
        <div class="ajuste-body">
          <label class="label-hint">Sumar o restar unidades</label>
          <div class="ajuste-control-wrapper">
            <button @click="formAjuste--" class="btn-step minus">—</button>
            <input v-model.number="formAjuste" type="number" class="input-qty-large" />
            <button @click="formAjuste++" class="btn-step plus">+</button>
          </div>
          <div class="stock-preview">
            Nuevo stock estimado: <strong>{{ (productoSeleccionado?.stock || 0) + formAjuste }}</strong>
          </div>
        </div>

        <div class="modal-actions-alt">
          <button @click="mostrarAjuste = false" class="btn-cancel-alt">Cancelar</button>
          <button @click="confirmarAjuste" class="btn-save-alt">Confirmar Cambio</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Estilos Ajuste Stock JD Sistemas --- */
.adjustment-modal {
  text-align: center;
  border-top: 4px solid #2563eb;
}

.product-target {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
  font-weight: 600;
}

.ajuste-body {
  padding: 20px 0;
}

.label-hint {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 15px;
  font-weight: 800;
}

.ajuste-control-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn-step {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-step:active { transform: scale(0.9); }
.btn-step.minus:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.btn-step.plus:hover { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }

.input-qty-large {
  width: 80px;
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  border: none;
  background: transparent;
  color: #1e293b;
  outline: none;
}

.stock-preview {
  font-size: 0.85rem;
  color: #64748b;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  display: inline-block;
}

.modal-actions-alt {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  margin-top: 10px;
}

.btn-cancel-alt {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-save-alt {
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-save-alt:hover { background: #1d4ed8; }

/* Chrome, Safari, Edge, Opera - Quitar flechas del input number */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* --- Ajuste Stock JD Sistemas --- */
.adjustment-card {
  text-align: center;
  border-top: 5px solid #2563eb;
  padding: 24px !important;
}

.adj-product-name {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.current-badge {
  display: inline-block;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 700;
  margin-bottom: 20px;
}

.counter-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 10px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.btn-step {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: #1e293b;
}

.btn-step:active { transform: scale(0.95); background: #2563eb; color: white; }

.input-wrapper {
  display: flex;
  flex-direction: column;
}

.input-qty-main {
  width: 80px;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 900;
  border: none;
  background: transparent;
  outline: none;
  color: #1e293b;
}

.input-suffix {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
}

.final-preview {
  font-size: 0.9rem;
  padding: 10px;
  border-radius: 8px;
  background: #f1f5f9;
  margin-bottom: 20px;
}

.text-plus { color: #16a34a; background: #f0fdf4; }
.text-minus { color: #ef4444; background: #fef2f2; }

.modal-actions-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.btn-cancel-flat {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-confirm-flat {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

/* Quitar flechitas del input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* --- Nuevo Estilo Modal Editar JD --- */
.edit-modal {
  padding: 0 !important;
  max-width: 480px !important;
  overflow: hidden;
}

.modal-header-dark {
  background: white;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info { display: flex; align-items: center; gap: 10px; }
.header-info h3 { margin: 0; font-size: 1.1rem; }
.btn-close-dark { background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; }

.form-container-scroll {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
}

.input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
.input-group label { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; }

.input-main { font-size: 1.1rem; font-weight: 700; border-color: #e2e8f0; }
.input-code { font-family: monospace; color: #2563eb; background: #eff6ff; font-weight: bold; }

.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

/* FINANCE DARK CARD */
.finance-dark-card {
  background: #0f172a;
  border-radius: 16px;
  padding: 20px;
  margin-top: 10px;
  color: #94a3b8;
}

.finance-label { font-size: 0.65rem; letter-spacing: 0.1em; color: #38bdf8; margin: 0 0 15px 0; }

.price-input-main { border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-bottom: 15px; }
.input-ghost {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
  width: 100%;
  outline: none;
  padding: 5px 0;
}

.percent-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.input-group-dark label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; margin-bottom: 4px; display: block; }
.input-group-dark input { 
  background: #1e293b; 
  border: 1px solid #334155; 
  color: white; 
  width: 100%; 
  padding: 8px; 
  border-radius: 8px; 
  text-align: center;
}

.result-display {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item { display: flex; justify-content: space-between; align-items: center; }
.result-item span { font-size: 0.75rem; font-weight: 600; }
.price-val { font-size: 1.2rem; font-weight: 900; }
.highlight-green { color: #4ade80; }
.highlight-purple { color: #a78bfa; }

.modal-footer {
  padding: 20px;
  border-top: 1px solid #f1f5f9;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 12px;
}

.btn-save-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
/* Estilos JD Sistemas */
.btn-add-stock { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; }
.page-container { padding: 15px; max-width: 800px; margin: auto; padding-bottom: 100px; background: #f8fafc; min-height: 100vh; }
.glass-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 12px; }
.product-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.product-info h3 { font-size: 1.1rem; color: #1e293b; margin: 0; font-weight: 700; }
.product-code { font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
.product-stock-badge { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; border-radius: 12px; min-width: 80px; font-weight: 800; }
.status-normal { background: #f0fdf4; color: #16a34a; }
.status-low { background: #fff7ed; color: #ea580c; border: 1px solid #fdba74; }
.status-critical { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.stock-qty { font-size: 1.3rem; }
.product-prices { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #f1f5f9; }
.price-item .price { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.price-item .price.gremio { color: #7c3aed; }
.product-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
.btn-edit-stock, .btn-adjust, .btn-delete { padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; border: 1px solid #e2e8f0; background: white; }
.btn-adjust { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.btn-delete { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 95%; max-width: 420px; max-height: 85vh; border-radius: 20px; padding: 20px; overflow-y: auto; box-sizing: border-box; }
@media (min-width: 640px) { .modal-overlay { align-items: center; } }
</style>
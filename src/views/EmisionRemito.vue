<template>
  <div class="page-container">
    <div class="card-glass form-remito">
      <header class="header-remito">
        <div class="title-group">
          <h1>Emisión de Remito</h1>
          <p class="subtitle">Transferencia Interna de Mercadería</p>
        </div>
        <div class="status-badge">N° {{ form.numero }}</div>
      </header>

      <form @submit.prevent="generarRemito" class="main-form">
        <div class="grid-layout">
          
          <div class="section-card">
            <h3 class="section-title">Ruta de Transferencia</h3>
            <div class="flex-row gap-4">
              <div class="input-group">
                <label>Desde (Origen)</label>
                <select v-model="form.unidad_desde" required class="select-modern">
                  <option value="Depósito Central">Depósito Central</option>
                  <option value="Taller Técnico">Taller Técnico</option>
                  <option value="Local Ventas">Local Ventas</option>
                </select>
              </div>
              <div class="input-group">
                <label>Hacia (Destino)</label>
                <select v-model="form.unidad_hacia" required class="select-modern h-highlight">
                  <option value="Taller Técnico">Taller Técnico</option>
                  <option value="Local Ventas">Local Ventas</option>
                  <option value="Depósito Central">Depósito Central</option>
                </select>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h3 class="section-title">Comprobante</h3>
            <div class="flex-row gap-4">
              <div class="input-group">
                <label>Tipo / Comprobante</label>
                <div class="flex gap-2">
                  <select v-model="form.tipo" class="select-modern w-20">
                    <option value="T">T</option>
                    <option value="R">R</option>
                  </select>
                  <select v-model="form.comprobante_id" class="select-modern flex-1">
                    <option value="1">Transf. Interna</option>
                    <option value="2">Remito Salida</option>
                  </select>
                </div>
              </div>
              <div class="input-group">
                <label>Fecha de Carga</label>
                <input v-model="form.fecha" type="date" required class="input-modern">
              </div>
            </div>
          </div>

          <div class="section-card full-width">
            <div class="flex justify-between items-center mb-4">
              <h3 class="section-title m-0">Detalle de Artículos</h3>
              <button type="button" @click="agregarFila" class="btn-add">
                + Agregar Producto
              </button>
            </div>

            <div class="table-container">
              <table class="grilla-items">
                <thead>
                  <tr>
                    <th width="50%">Producto / Descripción</th>
                    <th width="15%">Cant.</th>
                    <th width="20%">Cód. SKU</th>
                    <th width="10%"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in form.items" :key="index">
                    <td>
                      <input v-model="item.nombre" type="text" placeholder="Buscar producto..." class="grid-input" @input="buscarSugerencias(index)">
                    </td>
                    <td>
                      <input v-model.number="item.cantidad" type="number" min="1" class="grid-input text-center font-bold">
                    </td>
                    <td>
                      <input v-model="item.codigo" type="text" placeholder="SKU" class="grid-input font-mono text-xs">
                    </td>
                    <td class="text-center">
                      <button type="button" @click="eliminarFila(index)" class="btn-del">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="form.items.length === 0" class="empty-grid">
                No hay productos cargados en la transferencia.
              </div>
            </div>
          </div>

          <div class="section-card full-width">
            <h3 class="section-title">Comentarios del Remito</h3>
            <textarea 
              v-model="form.comentarios" 
              placeholder="Escriba aquí observaciones que aparecerán en el remito impreso..."
              rows="2"
              class="textarea-modern"
            ></textarea>
          </div>
        </div>

        <footer class="form-actions">
          <button type="button" @click="$router.back()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">
            🚀 Emitir y Actualizar Stock
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  unidad_desde: 'Depósito Central',
  unidad_hacia: 'Taller Técnico',
  comprobante_id: '1',
  tipo: 'T',
  numero: 'TR-' + Math.floor(Math.random() * 10000).toString().padStart(6, '0'),
  fecha: new Date().toISOString().substr(0, 10),
  comentarios: '',
  items: [
    { nombre: '', cantidad: 1, codigo: '' }
  ]
});

function agregarFila() {
  form.value.items.push({ nombre: '', cantidad: 1, codigo: '' });
}

function eliminarFila(index) {
  form.value.items.splice(index, 1);
}

function generarRemito() {
  if (form.value.items.some(i => !i.nombre || i.cantidad <= 0)) {
    alert("Por favor, complete los datos de los productos.");
    return;
  }
  console.log("Generando Remito JD:", form.value);
  alert("✅ Remito generado correctamente. El stock ha sido movido virtualmente.");
}
</script>

<style scoped>
.page-container { padding: 25px; display: flex; justify-content: center; background: #f8fafc; min-height: 100vh; }
.card-glass { background: white; width: 100%; max-width: 950px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0; }

.header-remito { background: #0f172a; color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
.header-remito h1 { font-size: 1.3rem; font-weight: 800; margin: 0; }
.subtitle { font-size: 0.8rem; color: #94a3b8; margin: 0; }

.main-form { padding: 25px; }
.grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }

.section-card { background: #ffffff; padding: 18px; border-radius: 10px; border: 1px solid #edf2f7; }
.section-title { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: #3b82f6; margin-bottom: 15px; letter-spacing: 1px; }

.input-group { display: flex; flex-direction: column; gap: 5px; width: 100%; }
.input-group label { font-size: 0.75rem; font-weight: 700; color: #64748b; }

.flex-row { display: flex; }
.gap-4 { gap: 1rem; }

.select-modern, .input-modern, .textarea-modern { 
  padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; background: #fcfcfc;
}
.select-modern:focus, .input-modern:focus { border-color: #3b82f6; background: white; }

/* TABLA DE ITEMS */
.table-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 10px; }
.grilla-items { width: 100%; border-collapse: collapse; }
.grilla-items th { background: #f8fafc; padding: 10px; text-align: left; font-size: 0.7rem; color: #64748b; border-bottom: 2px solid #e2e8f0; }
.grilla-items td { padding: 8px; border-bottom: 1px solid #f1f5f9; }

.grid-input { width: 100%; border: none; padding: 8px; background: transparent; outline: none; font-size: 0.9rem; }
.grid-input:focus { background: #f0f9ff; }

.btn-add { background: #e0f2fe; color: #0369a1; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
.btn-del { color: #ef4444; background: none; border: none; cursor: pointer; font-weight: bold; }

.empty-grid { padding: 30px; text-align: center; color: #94a3b8; font-size: 0.85rem; }

.form-actions { margin-top: 30px; display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.btn-primary { background: #0f172a; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { background: #1e293b; transform: scale(1.02); }
</style>
<template>
  <div class="page-container">
    <div class="card-glass">
      <div class="header-action">
        <h2>🚚 Nuevo Remito / Traspaso</h2>
        <button @click="$router.back()" class="btn-secondary">Volver</button>
      </div>

      <form @submit.prevent="generarRemito" class="form-remito">
        <div class="grid-form">
          <div class="form-group">
            <label>Origen (Unidad Salida)</label>
            <input v-model="form.unidad_desde" type="text" placeholder="Ej: Depósito Central" required />
          </div>
          <div class="form-group">
            <label>Destino (Unidad Entrada)</label>
            <input v-model="form.unidad_hacia" type="text" placeholder="Ej: Taller o Cliente" required />
          </div>
          <div class="form-group">
            <label>Número de Remito</label>
            <input v-model="form.numero" type="text" readonly />
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="form.fecha" type="date" required />
          </div>
        </div>

        <div class="items-section">
          <h3>Productos a Trasladar</h3>
          <table class="table-items">
            <thead>
              <tr>
                <th>Código/Producto</th>
                <th width="100">Cant.</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index">
                <td>
                  <input v-model="item.nombre" placeholder="Nombre del producto" required />
                </td>
                <td>
                  <input v-model.number="item.cantidad" type="number" min="1" required />
                </td>
                <td>
                  <button type="button" @click="eliminarFila(index)" class="btn-icon-red">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" @click="agregarFila" class="btn-text">+ Agregar Producto</button>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label>Observaciones / Comentarios</label>
          <textarea v-model="form.comentarios" rows="2"></textarea>
        </div>

        <footer class="form-actions">
          <button type="button" @click="$router.back()" class="btn-secondary" :disabled="cargando">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="cargando">
            {{ cargando ? 'Guardando...' : '🚀 Emitir y Actualizar Stock' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { saveRemito } from '@/services/data';

const router = useRouter();
const cargando = ref(false);

const form = ref({
  unidad_desde: 'Depósito Central',
  unidad_hacia: '',
  numero: 'R-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
  fecha: new Date().toISOString().substr(0, 10),
  comentarios: '',
  items: [
    { nombre: '', cantidad: 1 }
  ]
});

function agregarFila() {
  form.value.items.push({ nombre: '', cantidad: 1 });
}

function eliminarFila(index) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
  }
}

async function generarRemito() {
  try {
    cargando.value = true;
    const { data, error } = await saveRemito(form.value);
    if (error) throw error;
    
    alert("✅ Remito registrado con éxito.");
    router.push('/remitos');
  } catch (error) {
    console.error("Error JD Sistemas:", error.message);
    alert("Error al guardar remito.");
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.page-container { padding: 20px; max-width: 900px; margin: 0 auto; }
.header-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 0.85rem; font-weight: bold; color: #64748b; }
.form-group input, .form-group textarea { padding: 10px; border: 1px solid #ddd; border-radius: 6px; }

.items-section { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.table-items { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table-items th { text-align: left; color: #64748b; font-size: 0.8rem; }
.table-items input { width: 100%; padding: 8px; border: 1px solid #eee; border-radius: 4px; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
.btn-primary { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-secondary { background: #f1f5f9; color: #475569; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
.btn-icon-red { background: #fee2e2; color: #ef4444; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-text { background: none; border: none; color: #2563eb; cursor: pointer; margin-top: 10px; font-weight: bold; }
</style>
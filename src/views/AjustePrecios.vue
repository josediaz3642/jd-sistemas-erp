<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase'; // Ajustá la ruta según tu proyecto
import { getCategorias, getProveedores } from '@/services/data';

const categorias = ref([]);
const proveedores = ref([]);
const filtro = ref({
  categoria: null,
  proveedor: null,
  porcentaje: 0
});
const loading = ref(false);

onMounted(async () => {
  const [cat, prov] = await Promise.all([getCategorias(), getProveedores()]);
  categorias.value = cat || [];
  proveedores.value = prov || [];
});

async function aplicarAumento() {
  if (filtro.value.porcentaje === 0) return alert("Ingresá un porcentaje válido");
  
  const confirmacion = confirm(`¿Estás seguro de aumentar un ${filtro.value.porcentaje}% a los productos seleccionados?`);
  if (!confirmacion) return;

  loading.value = true;
  try {
    const { error } = await supabase.rpc('actualizar_precios_masivo', {
      p_porcentaje: filtro.value.porcentaje,
      p_categoria_id: filtro.value.categoria || null,
      p_proveedor_id: filtro.value.proveedor || null
    });

    if (error) throw error;
    alert("Precios actualizados con éxito ✅");
    filtro.value.porcentaje = 0; // Reset
  } catch (err) {
    console.error(err);
    alert("Error al actualizar precios");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="ajuste-container">
    <header class="header">
      <h1>Actualización Masiva de Precios</h1>
      <p>Ajustá tus márgenes de ganancia en segundos.</p>
    </header>

    <div class="card glass-card">
      <div class="form-grid">
        <!-- Filtro por Categoría -->
        <div class="form-group">
          <label>Filtrar por Categoría</label>
          <select v-model="filtro.categoria">
            <option :value="null">Todas las categorías</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>

        <!-- Filtro por Proveedor -->
        <div class="form-group">
          <label>Filtrar por Proveedor</label>
          <select v-model="filtro.proveedor">
            <option :value="null">Todos los proveedores</option>
            <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </div>

        <!-- Input Porcentaje -->
        <div class="form-group">
          <label>Porcentaje de Ajuste (%)</label>
          <input 
            type="number" 
            v-model.number="filtro.porcentaje" 
            placeholder="Ej: 15 o -5"
            step="0.5"
          />
          <small>Usá números negativos para rebajas.</small>
        </div>
      </div>

      <div class="actions">
        <button 
          @click="aplicarAumento" 
          :disabled="loading" 
          class="btn-primary"
        >
          {{ loading ? 'Procesando...' : 'Aplicar Cambio de Precios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ajuste-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
.header { margin-bottom: 2rem; }
.header h1 { font-size: 1.8rem; font-weight: 800; color: #1e293b; }

.glass-card { 
  background: white; 
  padding: 2rem; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.form-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1.5rem; 
  margin-bottom: 2rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #64748b; }

select, input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  outline: none;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
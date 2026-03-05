<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getStockById,saveStockItem,deleteStockItem} from "@/services/data";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const guardando = ref(false);

const producto = ref({
  nombre: "",
  precio: 0,
  cantidad: 0,
  codigo_barras: "",
  stock_minimo: 5 // Para alertas de stock bajo
});

onMounted(async () => {
  const id = route.params.id;
  if (id && id !== 'nuevo') {
    loading.value = true;
    try {
      const p = await getStockById(id);
      if (p) {
        // Aseguramos que los números se traten como tales
        producto.value = { 
          ...p, 
          precio: Number(p.precio), 
          cantidad: Number(p.cantidad),
          stock_minimo: Number(p.stock_minimo || 5)
        };
      }
    } catch (error) {
      console.error("Error al cargar producto:", error);
    } finally {
      loading.value = false;
    }
  }
});

async function guardar() {
  if (!producto.value.nombre) return alert("El nombre es obligatorio");
  
  guardando.value = true;
  try {
    await saveStockItem(producto.value);
    router.push("/stock");
  } catch (error) {
    alert("Error al guardar en la nube");
    console.error(error);
  } finally {
    guardando.value = false;
  }
}

async function eliminar() {
  if (!producto.value.id) return;
  
  if (confirm(`¿Estás seguro de eliminar "${producto.value.nombre}"? Esta acción no se puede deshacer.`)) {
    guardando.value = true;
    try {
      await deleteStockItem(producto.value.id);
      router.push("/stock");
    } catch (error) {
      alert("No se pudo eliminar el producto. Puede que esté vinculado a facturas existentes.");
      console.error(error);
    } finally {
      guardando.value = false;
    }
  }
}
</script>

<template>
  <div class="page-container">
    <div class="form-card glass-card">
      <div v-if="loading" class="loader">Cargando datos del producto...</div>
      
      <template v-else>
        <h2>{{ producto.id ? "Editar Producto" : "Nuevo Producto" }}</h2>
        <p class="subtitle">Gestiona el inventario en tiempo real.</p>
        
        <div class="field">
          <label>Nombre del Producto</label>
          <input v-model="producto.nombre" class="input-moderno" placeholder="Ej: Coca Cola 1.5L" />
        </div>

        <div class="grid-form">
          <div class="field">
            <label>Precio de Venta</label>
            <div class="input-group">
              <span class="prefix">$</span>
              <input type="number" step="0.01" v-model.number="producto.precio" class="input-moderno" />
            </div>
          </div>

          <div class="field">
            <label>Stock Actual</label>
            <input type="number" v-model.number="producto.cantidad" class="input-moderno" />
          </div>
        </div>

        <div class="field">
          <label>Código de Barras / SKU (Opcional)</label>
          <input v-model="producto.codigo_barras" class="input-moderno" placeholder="7791234..." />
        </div>

        <div class="field">
          <label>Stock Mínimo (Alerta de reposición)</label>
          <input type="number" v-model.number="producto.stock_minimo" class="input-moderno" />
        </div>

        <div class="actions">
          <button class="btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? "Procesando..." : "Guardar Producto" }}
          </button>
          
          <button v-if="producto.id" class="btn-danger" @click="eliminar" :disabled="guardando">
            Eliminar
          </button>
          
          <button class="btn-cancelar" @click="router.push('/stock')" :disabled="guardando">
            Cancelar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 40px; display: flex; justify-content: center; background: #f8fafc; min-height: 90vh; }
.form-card { width: 100%; max-width: 500px; padding: 30px; background: white; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }

h2 { margin-bottom: 5px; color: #1e293b; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }

.loader { text-align: center; padding: 40px; color: #64748b; }

.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.field { margin-bottom: 20px; display: flex; flex-direction: column; }
label { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

.input-moderno { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; transition: border 0.2s; }
.input-moderno:focus { outline: none; border-color: #2563eb; ring: 2px solid rgba(37,99,235,0.1); }

.input-group { position: relative; display: flex; align-items: center; }
.prefix { position: absolute; left: 12px; color: #94a3b8; font-weight: bold; }
.input-group .input-moderno { padding-left: 30px; width: 100%; }

.actions { display: flex; gap: 10px; margin-top: 25px; }

.btn-primary { background: #1e293b; color: white; border: none; padding: 14px 20px; border-radius: 8px; cursor: pointer; flex: 2; font-weight: bold; transition: background 0.2s; }
.btn-primary:hover { background: #0f172a; }
.btn-primary:disabled { background: #94a3b8; }

.btn-danger { background: #fee2e2; color: #ef4444; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-danger:hover { background: #fecaca; }

.btn-cancelar { background: #f1f5f9; color: #475569; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>
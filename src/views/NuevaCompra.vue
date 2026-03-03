<template>
  <div class="compra-container">
    <header class="page-header">
      <div class="header-title">
        <h2>🛒 Registrar Compra / Ingreso</h2>
        <p>Carga facturas para actualizar automáticamente el <strong>stock</strong> y tus <strong>egresos</strong>.</p>
      </div>
    </header>

    <div class="grid-compra">
      <section class="form-section glass-card">
        <div class="form-grid">
          <div class="field">
            <label>Proveedor</label>
            <select v-model="compra.proveedor_id" class="input-moderno">
              <option value="">Seleccionar Proveedor...</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="field">
            <label>Fecha de Factura</label>
            <input v-model="compra.fecha" type="date" class="input-moderno">
          </div>
          <div class="field">
            <label>N° Comprobante</label>
            <input v-model="compra.numero_comprobante" type="text" placeholder="0001-00004321" class="input-moderno">
          </div>
          <div class="field">
            <label>Método de Pago</label>
            <select v-model="compra.metodo_pago" class="input-moderno">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cuenta Corriente">Cuenta Corriente</option>
            </select>
          </div>
        </div>

        <div class="items-section">
          <div class="section-header">
            <h4>Productos Recibidos</h4>
            <span class="badge-info">{{ compra.items.length }} ítems</span>
          </div>
          
          <div v-for="(item, index) in compra.items" :key="index" class="item-row animate-in">
            <select v-model="item.producto_id" @change="actualizarPrecio(index)" class="select-prod">
              <option value="">Seleccionar Producto...</option>
              <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                {{ prod.nombre }} (Actual: {{ prod.cantidad }})
              </option>
            </select>
            <div class="qty-field">
              <input v-model.number="item.cantidad" type="number" placeholder="Cant" class="input-cant" min="1">
            </div>
            <div class="cost-field">
              <input v-model.number="item.costo" type="number" placeholder="Costo Unit." class="input-costo" step="0.01">
            </div>
            <span class="subtotal">${{ (item.cantidad * item.costo).toLocaleString() }}</span>
            <button @click="eliminarItem(index)" class="btn-del">✕</button>
          </div>
          
          <button @click="agregarItem" class="btn-add">
            <span>+</span> Agregar Producto al Listado
          </button>
        </div>
      </section>

      <aside class="resumen-section glass-card">
        <h3>Resumen de Ingreso</h3>
        <div class="resumen-body">
          <div class="resumen-row">
            <span>Subtotal Neto</span>
            <span>${{ totalCompra.toLocaleString() }}</span>
          </div>
          <div class="resumen-row">
            <span>Impuestos / Otros</span>
            <span>$0</span>
          </div>
          <div class="resumen-row total">
            <span>TOTAL COMPRA</span>
            <span>${{ totalCompra.toLocaleString() }}</span>
          </div>
        </div>
        
        <button 
          @click="finalizarCompra" 
          class="btn-finalizar" 
          :disabled="!listoParaGuardar || guardando"
        >
          {{ guardando ? '📦 Procesando Ingreso...' : '✅ Confirmar e Incrementar Stock' }}
        </button>
        <p class="helper-text">Esta acción aumentará el stock disponible y registrará el egreso de caja.</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getProveedores, getStockItems, saveCompra } from '@/services/data'; 

const router = useRouter();
const proveedores = ref([]);
const productos = ref([]);
const guardando = ref(false);

const compra = ref({
  proveedor_id: '',
  fecha: new Date().toISOString().split('T')[0],
  numero_comprobante: '',
  metodo_pago: 'Efectivo',
  items: []
});

onMounted(async () => {
  const [pData, sData] = await Promise.all([getProveedores(), getStockItems()]);
  proveedores.value = pData || [];
  productos.value = sData || [];
  agregarItem(); // Iniciar con una fila
});

const totalCompra = computed(() => {
  return compra.value.items.reduce((acc, item) => acc + (item.cantidad * item.costo), 0);
});

const listoParaGuardar = computed(() => {
  return compra.value.proveedor_id && 
         compra.value.items.length > 0 && 
         compra.value.items.every(i => i.producto_id && i.cantidad > 0);
});

function agregarItem() {
  compra.value.items.push({ producto_id: '', cantidad: 1, costo: 0 });
}

function eliminarItem(index) {
  compra.value.items.splice(index, 1);
}

function actualizarPrecio(index) {
  const item = compra.value.items[index];
  const prod = productos.value.find(p => p.id === item.producto_id);
  if (prod) {
    // Sugerimos el último costo conocido
    item.costo = prod.precio_costo || 0;
  }
}

async function finalizarCompra() {
  if (guardando.value) return;
  
  guardando.value = true;
  try {
    const payload = {
      ...compra.value,
      total: totalCompra.value,
      tipo: 'COMPRA',
      estado: 'PAGADA',
      // Denormalizamos el nombre del proveedor para el histórico
      proveedor_nombre: proveedores.value.find(p => p.id === compra.value.proveedor_id)?.nombre
    };

    // La función saveCompra en la nube debe manejar:
    // 1. Insert en la tabla 'compras'
    // 2. Trigger en la base de datos para sumar 'cantidad' al stock de cada producto
    // 3. Registro en la tabla de 'caja' o 'movimientos'
    const exito = await saveCompra(payload);
    
    if (exito) {
      alert("Ingreso registrado. El stock ha sido actualizado.");
      router.push('/stock');
    }
  } catch (error) {
    console.error(error);
    alert("Error al procesar la compra.");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.compra-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 25px; }
.header-title h2 { font-size: 1.8rem; color: #1e293b; }
.header-title p { color: #64748b; }

.grid-compra { display: grid; grid-template-columns: 1fr 340px; gap: 25px; }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 5px; text-transform: uppercase; }
.input-moderno { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.badge-info { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }

.item-row { display: grid; grid-template-columns: 2fr 100px 140px 120px 40px; gap: 12px; align-items: center; margin-bottom: 12px; background: #fff; padding: 10px; border-radius: 12px; border: 1px solid #f1f5f9; }
.select-prod { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; }
.input-cant, .input-costo { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; width: 100%; text-align: center; }
.subtotal { font-weight: 800; color: #1e293b; text-align: right; }

.btn-add { background: #f8fafc; border: 2px dashed #cbd5e1; color: #475569; padding: 12px; width: 100%; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-add:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.btn-del { background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-weight: bold; }

.resumen-section { height: fit-content; position: sticky; top: 20px; padding: 25px !important; }
.resumen-body { margin: 20px 0; }
.resumen-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #64748b; font-size: 0.95rem; }
.resumen-row.total { font-weight: 900; color: #1e293b; font-size: 1.4rem; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 15px; }

.btn-finalizar { width: 100%; background: #059669; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); }
.btn-finalizar:hover { background: #047857; transform: translateY(-1px); }
.btn-finalizar:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }

.helper-text { font-size: 0.75rem; color: #94a3b8; margin-top: 15px; text-align: center; line-height: 1.4; }

.animate-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
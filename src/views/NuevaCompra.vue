<template>
  <div class="compra-container">
    <header class="page-header">
      <h2>🛒 Registrar Compra / Gasto</h2>
      <p>Carga las facturas de tus proveedores para actualizar stock y caja.</p>
    </header>

    <div class="grid-compra">
      <section class="form-section glass-card">
        <div class="form-grid">
          <div class="field">
            <label>Proveedor</label>
            <select v-model="compra.proveedorId" class="input-moderno">
              <option value="">Seleccionar Proveedor...</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="field">
            <label>Fecha de Factura</label>
            <input v-model="compra.fecha" type="date" class="input-moderno">
          </div>
          <div class="field">
            <label>Número de Comprobante</label>
            <input v-model="compra.numero" type="text" placeholder="0001-00004321" class="input-moderno">
          </div>
          <div class="field">
            <label>Método de Pago</label>
            <select v-model="compra.metodoPago" class="input-moderno">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div class="items-section">
          <h4>Productos Comprados</h4>
          <div v-for="(item, index) in compra.items" :key="index" class="item-row">
            <select v-model="item.productoId" @change="actualizarPrecio(index)" class="select-prod">
              <option value="">Seleccionar Producto...</option>
              <option v-for="prod in productos" :key="prod.id" :value="prod.id">{{ prod.nombre }}</option>
            </select>
            <input v-model.number="item.cantidad" type="number" placeholder="Cant" class="input-cant">
            <input v-model.number="item.costo" type="number" placeholder="Costo Unit." class="input-costo">
            <span class="subtotal">${{ (item.cantidad * item.costo).toLocaleString() }}</span>
            <button @click="eliminarItem(index)" class="btn-del">×</button>
          </div>
          <button @click="agregarItem" class="btn-add">+ Agregar Producto</button>
        </div>
      </section>

      <aside class="resumen-section glass-card">
        <h3>Resumen de Compra</h3>
        <div class="resumen-row">
          <span>Subtotal:</span>
          <span>${{ totalCompra.toLocaleString() }}</span>
        </div>
        <div class="resumen-row total">
          <span>Total a Pagar:</span>
          <span>${{ totalCompra.toLocaleString() }}</span>
        </div>
        <button @click="finalizarCompra" class="btn-finalizar" :disabled="!listoParaGuardar">
          ✅ Confirmar Ingreso
        </button>
      </aside>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// CAMBIO: Quitamos saveWithTenant y agregamos saveCompra
import { getProveedores, getStockItems, saveStockItem, saveCompra } from '@/services/data'; 

const router = useRouter();
const proveedores = ref([]);
const productos = ref([]);

// ... (resto del código igual hasta llegar a finalizarCompra)

const finalizarCompra = () => {
  // 1. Aumentar Stock
  compra.value.items.forEach(item => {
    const prod = productos.value.find(p => p.id === item.productoId);
    if (prod) {
      prod.cantidad += item.cantidad;
      prod.costo = item.costo; 
      saveStockItem(prod);
    }
  });

  // 2. Registrar la Compra usando la nueva función
  const nuevaCompra = {
    ...compra.value,
    id: Date.now(),
    total: totalCompra.value,
    tipo: 'COMPRA',
    estado: 'PAGADA' // Por defecto para este flujo simple
  };
  
  saveCompra(nuevaCompra); // USAMOS LA FUNCIÓN ESPECÍFICA

  alert("Compra registrada y stock actualizado con éxito.");
  router.push('/stock');
};
</script>

<style scoped>
.compra-container { padding: 10px; }
.grid-compra { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
.field label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 5px; }
.input-moderno { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }

.items-section h4 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
.item-row { display: grid; grid-template-columns: 2fr 80px 120px 1fr 40px; gap: 10px; align-items: center; margin-bottom: 10px; }
.select-prod { padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; }
.input-cant, .input-costo { padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; width: 100%; }

.btn-add { background: none; border: 1px dashed #2563eb; color: #2563eb; padding: 8px; width: 100%; border-radius: 8px; cursor: pointer; }
.btn-del { background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; }

.resumen-section { height: fit-content; position: sticky; top: 20px; }
.resumen-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #64748b; }
.resumen-row.total { font-weight: bold; color: #1e293b; font-size: 1.2rem; border-top: 1px solid #eee; pt: 10px; }
.btn-finalizar { width: 100%; background: #16a34a; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; margin-top: 20px; cursor: pointer; }
.btn-finalizar:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
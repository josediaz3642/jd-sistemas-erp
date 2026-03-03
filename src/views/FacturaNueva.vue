<template>
  <div class="factura-page">
    <header class="header-vta">
      <h1>Nueva Venta</h1>
      <div class="header-actions">
        <button @click="$router.back()" class="btn-cancel">Cancelar</button>
        <button @click="procesarVenta" class="btn-save" :disabled="!puedeFacturar || guardando">
          {{ guardando ? 'Procesando...' : 'Emitir Factura' }}
        </button>
      </div>
    </header>

    <div class="main-grid">
      <div class="selector-section">
        <div class="card-vta">
          <h3>1. Cliente</h3>
          <select v-model="form.cliente_id" class="input-vta">
            <option :value="null">Consumidor Final</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">
              {{ c.nombre }}
            </option>
          </select>
        </div>

        <div class="card-vta mt-20">
          <h3>2. Agregar Productos</h3>
          <div class="search-box">
            <input 
              v-model="busquedaProd" 
              placeholder="Buscar por nombre o código..." 
              @keyup.enter="agregarPrimeroEncontrado"
              class="input-vta"
            />
          </div>
          
          <div class="productos-sugeridos">
            <div 
              v-for="p in productosFiltrados" 
              :key="p.id" 
              class="prod-item"
              @click="agregarItem(p)"
            >
              <span>{{ p.nombre }}</span>
              <div class="prod-info">
                <small>Stock: {{ p.cantidad }}</small>
                <strong>${{ p.precio.toLocaleString() }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detalle-section card-vta">
        <h3>Resumen de Venta</h3>
        <div class="items-lista">
          <table class="table-items">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index">
                <td>{{ item.nombre }}</td>
                <td>
                  <input type="number" v-model.number="item.cantidad" class="input-qty" min="1">
                </td>
                <td>${{ (item.cantidad * item.precio).toLocaleString() }}</td>
                <td><button @click="quitarItem(index)" class="btn-del">✕</button></td>
              </tr>
              <tr v-if="form.items.length === 0">
                <td colspan="4" class="empty-msg">No hay productos seleccionados</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer-vta">
          <div class="totales">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="total-row">
              <span>IVA (21%):</span>
              <span>${{ iva.toLocaleString() }}</span>
            </div>
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>${{ total.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getClientes, getStockItems, saveFactura } from '@/services/data';

const router = useRouter();
const clientes = ref([]);
const productos = ref([]);
const busquedaProd = ref('');
const guardando = ref(false);

const form = ref({
  cliente_id: null,
  items: [],
  punto_venta: 1,
  tipo_comprobante: 'A'
});

onMounted(async () => {
  const [cData, pData] = await Promise.all([getClientes(), getStockItems()]);
  clientes.value = cData || [];
  productos.value = pData || [];
});

const productosFiltrados = computed(() => {
  if (!busquedaProd.value) return productos.value.slice(0, 5);
  return productos.value.filter(p => 
    p.nombre.toLowerCase().includes(busquedaProd.value.toLowerCase())
  ).slice(0, 5);
});

const subtotal = computed(() => form.value.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0));
const iva = computed(() => subtotal.value * 0.21);
const total = computed(() => subtotal.value + iva.value);
const puedeFacturar = computed(() => form.value.items.length > 0);

function agregarItem(p) {
  const existe = form.value.items.find(i => i.producto_id === p.id);
  if (existe) {
    existe.cantidad++;
  } else {
    form.value.items.push({
      producto_id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: 1
    });
  }
}

function quitarItem(index) {
  form.value.items.splice(index, 1);
}

async function procesarVenta() {
  if (guardando.value) return;
  guardando.value = true;

  try {
    const nuevaFactura = {
      ...form.value,
      total: total.value,
      subtotal: subtotal.value,
      iva: iva.value,
      fecha: new Date().toISOString(),
      estado: 'EMITIDA',
      // Denormalizamos el nombre del cliente para el historial rápido
      cliente_nombre: form.value.cliente_id 
        ? clientes.value.find(c => c.id === form.value.cliente_id)?.nombre 
        : 'Consumidor Final'
    };

    const resultado = await saveFactura(nuevaFactura);
    if (resultado) {
      router.push(`/facturacion/${resultado.id}`);
    }
  } catch (error) {
    alert("Error al procesar la venta. Verifique el stock.");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.factura-page { padding: 20px; max-width: 1200px; margin: 0 auto; }
.header-vta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.main-grid { display: grid; grid-template-columns: 400px 1fr; gap: 20px; }

.card-vta { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.mt-20 { margin-top: 20px; }

.input-vta { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 8px; }
.productos-sugeridos { margin-top: 15px; display: flex; flex-direction: column; gap: 8px; }

.prod-item { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 10px; border: 1px solid #f1f5f9; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.prod-item:hover { background: #f8fafc; border-color: #2563eb; }
.prod-info { text-align: right; display: flex; flex-direction: column; }

.table-items { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-items th { text-align: left; font-size: 0.8rem; color: #64748b; padding: 10px; border-bottom: 1px solid #f1f5f9; }
.table-items td { padding: 10px; border-bottom: 1px solid #f1f5f9; }

.input-qty { width: 60px; padding: 5px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; }
.btn-del { background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold; }

.footer-vta { margin-top: 30px; display: flex; justify-content: flex-end; }
.totales { width: 250px; }
.total-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; }
.final { border-top: 2px solid #1e293b; padding-top: 10px; color: #1e293b; font-weight: 800; font-size: 1.2rem; }

.btn-save { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-cancel { background: white; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 8px; margin-right: 10px; cursor: pointer; }
</style>
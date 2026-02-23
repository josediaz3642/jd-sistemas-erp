<template>
  <div class="factura-container">
    <div class="header-factura glass-card">
      <div class="empresa-info">
        <div class="logo-placeholder" v-if="empresa">
          <img v-if="empresa.logo" :src="empresa.logo" alt="Logo">
          <h2 v-else>{{ empresa.nombre }}</h2>
        </div>
        <div class="datos-fiscales">
          <p><strong>{{ empresa?.razon_social || 'Mi Empresa SaaS' }}</strong></p>
          <p>CUIT: {{ empresa?.cuit || '00-00000000-0' }}</p>
        </div>
      </div>
      
      <div class="nro-comprobante">
        <div class="tipo-badge">{{ factura.tipoComprobante }}</div>
        <div class="numero-display">
          <span>Punto Venta: {{ String(factura.puntoVenta).padStart(4, '0') }}</span>
          <h3>Nº {{ String(factura.numero).padStart(8, '0') }}</h3>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <section class="cliente-section glass-card">
        <h3>Datos del Cliente</h3>
        <select v-model="factura.clienteId" class="input-moderno">
          <option value="">Seleccione un cliente...</option>
          <option v-for="c in listaClientes" :key="c.id" :value="c.id">
            {{ c.nombre }} ({{ c.cuit || 'S/C' }})
          </option>
        </select>
      </section>

      <section class="items-section glass-card">
        <h3>Detalle de Productos</h3>
        <table class="table-moderna">
          <thead>
            <tr>
              <th>Producto</th>
              <th width="100">Cant.</th>
              <th width="150">Precio Unit.</th>
              <th width="150">Subtotal</th>
              <th width="50"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in factura.items" :key="index">
              <td>
                <select v-model="item.productoId" @change="actualizarPrecio(index)" class="input-table">
                  <option value="">Seleccionar...</option>
                  <option v-for="p in listaProductos" :key="p.id" :value="p.id">
                    {{ p.nombre }}
                  </option>
                </select>
              </td>
              <td><input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-table"></td>
              <td><input type="number" v-model.number="item.precio" @input="calcularTotales" class="input-table"></td>
              <td class="text-right">${{ (item.cantidad * item.precio).toLocaleString() }}</td>
              <td><button @click="eliminarItem(index)" class="btn-icon">×</button></td>
            </tr>
          </tbody>
        </table>
        <button @click="agregarItem" class="btn-add">+ Agregar Item</button>
      </section>

      <section class="totales-section glass-card">
        <div class="fila-total">
          <span>Subtotal:</span>
          <span>${{ factura.subtotal.toLocaleString() }}</span>
        </div>
        <div class="fila-total">
          <span>IVA (21%):</span>
          <span>${{ factura.iva.toLocaleString() }}</span>
        </div>
        <div class="fila-total total-final">
          <span>TOTAL:</span>
          <span>${{ factura.total.toLocaleString() }}</span>
        </div>
        <button @click="emitirFactura" class="btn-confirmar">Emitir Comprobante</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  getEmpresa, 
  getClientes, 
  getStockItems, 
  getNextNumeroFactura, 
  saveFactura,
  descontarStock 
} from '@/services/data';

const router = useRouter();
const empresa = ref(null);
const listaClientes = ref([]);
const listaProductos = ref([]);

const factura = reactive({
  id: null,
  clienteId: '',
  tipoComprobante: 'A',
  puntoVenta: 1,
  numero: 0,
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0,
  fecha: new Date().toISOString()
});

onMounted(() => {
  empresa.value = getEmpresa();
  listaClientes.value = getClientes();
  listaProductos.value = getStockItems();
  
  const next = getNextNumeroFactura(1, 'A');
  factura.numero = next.numero;
  
  agregarItem();
});

function agregarItem() {
  factura.items.push({ productoId: '', cantidad: 1, precio: 0 });
}

function eliminarItem(index) {
  factura.items.splice(index, 1);
  calcularTotales();
}

function actualizarPrecio(index) {
  const item = factura.items[index];
  const prod = listaProductos.value.find(p => p.id === item.productoId);
  if (prod) {
    item.precio = prod.precioVenta || prod.precio || 0;
  }
  calcularTotales();
}

function calcularTotales() {
  factura.subtotal = factura.items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  factura.iva = factura.subtotal * 0.21;
  factura.total = factura.subtotal + factura.iva;
}

function emitirFactura() {
  if (!factura.clienteId || factura.items.length === 0) {
    alert("Faltan datos para emitir la factura");
    return;
  }

  const nuevaFactura = {
    ...factura,
    id: Date.now(),
    estado: 'EMITIDA',
    montoPagado: 0,
    pagos: []
  };

  try {
    saveFactura(nuevaFactura);

    // Descontar Stock
    factura.items.forEach(item => {
      if (item.productoId) descontarStock(item.productoId, item.cantidad);
    });

    alert("Factura emitida con éxito");
    router.push('/facturacion');
  } catch (error) {
    console.error(error);
    alert("Error al guardar");
  }
}
</script>

<style scoped>
.factura-container { display: flex; flex-direction: column; gap: 20px; padding: 10px; }
.header-factura { display: flex; justify-content: space-between; align-items: center; padding: 30px !important; }
.logo-placeholder img { max-height: 60px; }
.nro-comprobante { text-align: right; }
.tipo-badge { display: inline-block; background: #1e293b; color: white; font-size: 2rem; padding: 5px 15px; border-radius: 8px; margin-bottom: 5px; }
.main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.items-section { grid-column: 1; }
.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; color: #64748b; font-size: 0.8rem; border-bottom: 1px solid #e2e8f0; padding: 10px; }
.table-moderna td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
.input-table { width: 100%; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px; outline: none; }
.btn-add { margin-top: 15px; background: none; border: 2px dashed #cbd5e1; color: #64748b; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; }
.totales-section { display: flex; flex-direction: column; gap: 15px; }
.fila-total { display: flex; justify-content: space-between; font-size: 1rem; }
.total-final { font-size: 1.5rem; font-weight: bold; color: #1e293b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
.btn-confirmar { background: #2563eb; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; }
.btn-icon { background: none; border: none; color: #ef4444; font-size: 1.5rem; cursor: pointer; }
</style>
<template>
  <div class="factura-container">
    <div class="header-factura glass-card">
      <div class="empresa-info">
        <div class="logo-placeholder" v-if="empresa">
          <img v-if="empresa.logo" :src="empresa.logo" alt="Logo">
          <h2 v-else>{{ empresa.nombre }}</h2>
        </div>
        <div class="datos-fiscales">
          <p><strong>{{ empresa?.razon_social || 'Mi Empresa' }}</strong></p>
          <p>CUIT: {{ empresa?.cuit || '00-00000000-0' }}</p>
          <p>{{ empresa?.direccion }}</p>
        </div>
      </div>
      
      <div class="nro-comprobante">
        <div class="tipo-badge">{{ factura.tipo_comprobante }}</div>
        <div class="numero-display">
          <span>Punto Venta: {{ String(factura.punto_venta).padStart(4, '0') }}</span>
          <h3>Nº {{ String(factura.numero_factura).padStart(8, '0') }}</h3>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="left-column">
        <section class="cliente-section glass-card">
          <h3>Datos del Cliente</h3>
          <select v-model="factura.cliente_id" class="input-moderno">
            <option value="">Consumidor Final</option>
            <option v-for="c in listaClientes" :key="c.id" :value="c.id">
              {{ c.nombre }} {{ c.cuit ? `(${c.cuit})` : '' }}
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
                  <select v-model="item.producto_id" @change="actualizarPrecio(index)" class="input-table">
                    <option value="">Seleccionar...</option>
                    <option v-for="p in listaProductos" :key="p.id" :value="p.id">
                      {{ p.nombre }} (Stock: {{ p.cantidad }})
                    </option>
                  </select>
                </td>
                <td><input type="number" v-model.number="item.cantidad" @input="calcularTotales" class="input-table" min="1"></td>
                <td><input type="number" v-model.number="item.precio" @input="calcularTotales" class="input-table" step="0.01"></td>
                <td class="text-right font-bold">${{ (item.cantidad * item.precio).toLocaleString() }}</td>
                <td><button @click="eliminarItem(index)" class="btn-icon">✕</button></td>
              </tr>
            </tbody>
          </table>
          <button @click="agregarItem" class="btn-add">+ Agregar Fila</button>
        </section>
      </div>

      <aside class="totales-section glass-card">
        <h3>Resumen</h3>
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
        
        <div class="metodo-pago">
          <label>Condición de Venta</label>
          <select class="input-moderno">
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Cuenta Corriente</option>
          </select>
        </div>

        <button 
          @click="emitirFactura" 
          class="btn-confirmar" 
          :disabled="guardando || factura.items.length === 0"
        >
          {{ guardando ? 'Procesando...' : 'Emitir Comprobante' }}
        </button>
      </aside>
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
  saveFactura 
} from '@/services/data';

const router = useRouter();
const empresa = ref(null);
const listaClientes = ref([]);
const listaProductos = ref([]);
const guardando = ref(false);

const factura = reactive({
  cliente_id: '',
  tipo_comprobante: 'A',
  punto_venta: 1,
  numero_factura: 0,
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0,
  fecha: new Date().toISOString()
});

onMounted(async () => {
  // Carga inicial de datos desde Supabase
  const [empData, cliData, prodData] = await Promise.all([
    getEmpresa(),
    getClientes(),
    getStockItems()
  ]);

  empresa.value = empData;
  listaClientes.value = cliData || [];
  listaProductos.value = prodData || [];
  
  // Obtenemos el próximo número disponible
  const next = await getNextNumeroFactura(1, 'A');
  factura.numero_factura = next;
  
  agregarItem(); // Iniciar con una fila vacía
});

function agregarItem() {
  factura.items.push({ producto_id: '', nombre: '', cantidad: 1, precio: 0 });
}

function eliminarItem(index) {
  factura.items.splice(index, 1);
  calcularTotales();
}

function actualizarPrecio(index) {
  const item = factura.items[index];
  const prod = listaProductos.value.find(p => p.id === item.producto_id);
  if (prod) {
    item.precio = prod.precio || 0;
    item.nombre = prod.nombre; // Guardamos el nombre para que sea inmutable
  }
  calcularTotales();
}

function calcularTotales() {
  factura.subtotal = factura.items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  factura.iva = factura.subtotal * 0.21;
  factura.total = factura.subtotal + factura.iva;
}

async function emitirFactura() {
  if (guardando.value) return;
  
  // Validación básica
  if (factura.items.some(i => !i.producto_id)) {
    alert("Hay filas sin producto seleccionado.");
    return;
  }

  guardando.value = true;
  try {
    const payload = {
      ...factura,
      estado: 'EMITIDA',
      cliente_nombre: factura.cliente_id 
        ? listaClientes.value.find(c => c.id === factura.cliente_id)?.nombre 
        : 'Consumidor Final'
    };

    const record = await saveFactura(payload);
    if (record) {
      alert("Comprobante emitido correctamente");
      router.push('/facturacion/' + record.id);
    }
  } catch (error) {
    console.error(error);
    alert("Error al emitir la factura. Verifique conexión y stock.");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.factura-container { padding: 20px; max-width: 1300px; margin: 0 auto; }
.header-factura { display: flex; justify-content: space-between; align-items: center; padding: 25px !important; margin-bottom: 20px; border: 1px solid #e2e8f0; }
.logo-placeholder img { max-height: 70px; }
.datos-fiscales p { margin: 2px 0; color: #64748b; font-size: 0.9rem; }

.nro-comprobante { text-align: right; }
.tipo-badge { display: inline-block; background: #1e293b; color: white; font-size: 2.5rem; padding: 5px 20px; border-radius: 12px; font-weight: 900; margin-bottom: 5px; }

.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
.left-column { display: flex; flex-direction: column; gap: 20px; }

.input-moderno { width: 100%; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-top: 10px; }

.table-moderna { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-moderna th { text-align: left; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding: 12px; }
.table-moderna td { padding: 12px; border-bottom: 1px solid #f1f5f9; }

.input-table { width: 100%; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 0.95rem; }
.btn-add { margin-top: 15px; background: #f8fafc; border: 2px dashed #cbd5e1; color: #475569; width: 100%; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: 600; }
.btn-add:hover { background: #f1f5f9; border-color: #2563eb; color: #2563eb; }

.totales-section { padding: 25px !important; position: sticky; top: 20px; }
.fila-total { display: flex; justify-content: space-between; margin-bottom: 12px; color: #475569; }
.total-final { font-size: 1.8rem; font-weight: 900; color: #1e293b; border-top: 2px solid #f1f5f9; padding-top: 15px; margin-top: 10px; }

.metodo-pago { margin: 20px 0; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.metodo-pago label { font-size: 0.8rem; font-weight: bold; color: #64748b; text-transform: uppercase; }

.btn-confirmar { background: #2563eb; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; width: 100%; transition: transform 0.1s; }
.btn-confirmar:active { transform: scale(0.98); }
.btn-confirmar:disabled { background: #94a3b8; }

.btn-icon { background: #fee2e2; border: none; color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.text-right { text-align: right; }
.font-bold { font-weight: bold; }
</style>
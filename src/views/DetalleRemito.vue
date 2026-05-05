<template>
  <div class="page-container">
    <div class="card-glass">
      <div class="print-only-header">
        <div class="header-content" v-if="authStore.empresa">
          <div class="empresa-info">
            <img v-if="authStore.empresa.logo" :src="authStore.empresa.logo" style="max-height: 50px; margin-bottom: 5px;" />
            <h1>{{ authStore.empresa.razon_social }}</h1>
            <p>CUIT: {{ authStore.empresa.cuit || 'S/D' }}</p>
            <p>{{ authStore.empresa.direccion || '' }} | Tel: {{ authStore.empresa.telefono || 'S/D' }}</p>
          </div>
          <div class="remito-titulo">
            <h2>REMITO</h2>
            <p class="numero-print">N° {{ form.numero }}</p>
            <p>Fecha: {{ new Date(form.fecha).toLocaleDateString('es-AR') }}</p>
          </div>
        </div>
        <hr />
      </div>

      <div class="header-action">
        <h2>🚚 {{ isEdicion ? 'Detalle de Remito' : 'Nuevo Remito / Traspaso' }}</h2>
        <button @click="$router.push('/remitos')" class="btn-secondary">Volver</button>
      </div>

      <form @submit.prevent="generarRemito" class="form-remito">
        <div class="grid-form">
          <div class="form-group">
            <label>Origen (Unidad Salida)</label>
            <input v-model="form.unidad_desde" type="text" required />
          </div>
          <div class="form-group">
            <label>Destino (Unidad Entrada / Cliente)</label>
            <input v-model="form.unidad_hacia" type="text" placeholder="Nombre del Cliente o Destino" required />
          </div>
          <div class="form-group">
            <label>Número de Remito</label>
            <input v-model="form.numero" type="text" readonly class="input-readonly" />
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="form.fecha" type="date" required />
          </div>
        </div>

        <div class="search-section" v-if="!isEdicion">
          <label>🔍 Buscar Producto en Stock (Código o Nombre)</label>
          <input 
            v-model="busqueda" 
            @input="buscar" 
            placeholder="Escribe para buscar..." 
            class="input-search"
          />
          <ul v-if="resultados.length" class="results-list">
            <li v-for="p in resultados" :key="p.id" @click="seleccionarProducto(p)">
              <span>{{ p.codigo }} - <strong>{{ p.nombre }}</strong></span>
              <small>Stock: {{ p.cantidad }} | $ {{ p.precio }}</small>
            </li>
          </ul>
        </div>

        <div class="items-section">
          <h3>Productos a Trasladar</h3>
          <table class="table-items">
            <thead>
              <tr>
                <th>Producto</th>
                <th width="100">Cant.</th>
                <th width="120" class="text-right">Unitario</th>
                <th width="120" class="text-right">Subtotal</th>
                <th width="50" v-if="!isEdicion"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index">
                <td>
                  <div class="item-info">
                    <strong>{{ item.nombre }}</strong>
                    <small v-if="!isEdicion" class="stock-hint">Disp: {{ item.stock_disponible }}</small>
                  </div>
                </td>
                <td>
                  <input v-model.number="item.cantidad" type="number" min="1" :readonly="isEdicion" />
                </td>
                <td class="text-right">$ {{ formatMonto(item.precio) }}</td>
                <td class="text-right">$ {{ formatMonto(item.precio * item.cantidad) }}</td>
                <td v-if="!isEdicion">
                  <button type="button" @click="eliminarFila(index)" class="btn-icon-red">✕</button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>$ {{ formatMonto(totalRemito) }}</strong></td>
                <td v-if="!isEdicion"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="!isEdicion" class="pago-box card-glass mt-20">
          <label class="checkbox-container">
            <input type="checkbox" v-model="registrarEnCaja">
            <span class="p-10">¿Registrar pago en Caja?</span>
          </label>
          <div v-if="registrarEnCaja" class="metodo-pago-inline">
            <label>Método:</label>
            <select v-model="metodoPago">
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Transferencia">🏦 Transferencia</option>
              <option value="Tarjeta">💳 Tarjeta</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label>Observaciones / Comentarios</label>
          <textarea v-model="form.comentarios" rows="2" :readonly="isEdicion"></textarea>
        </div>

        <footer class="form-actions">
          <button type="button" @click="imprimir" v-if="isEdicion" class="btn-print">
            🖨️ Imprimir Remito
          </button>
          <button type="submit" class="btn-primary" :disabled="cargando" v-if="!isEdicion">
            {{ cargando ? 'Guardando...' : '🚀 Emitir Remito' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { saveRemito, buscarProductoPorCodigo, getRemitoById, registrarMovimientoCaja } from '@/services/data';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cargando = ref(false);
const busqueda = ref("");
const resultados = ref([]);

// Estados para el pago automático
const registrarEnCaja = ref(true);
const metodoPago = ref('Efectivo');

const isEdicion = computed(() => {
  return route.params.id !== 'nuevo' && route.path !== '/remitos/nuevo';
});

const form = ref({
  unidad_desde: 'Depósito Central',
  unidad_hacia: '',
  numero: 'R-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
  fecha: new Date().toISOString().substr(0, 10),
  comentarios: '',
  items: [],
  total: 0
});

// Calculamos el total del remito en tiempo real
const totalRemito = computed(() => {
  return form.value.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
});

async function inicializar() {
  if (isEdicion.value) {
    const data = await getRemitoById(route.params.id);
    if (data) {
      form.value = data;
      if (route.query.imprimir === 'true') {
        setTimeout(() => window.print(), 800);
      }
    }
  } else {
    form.value = {
      unidad_desde: 'Depósito Central',
      unidad_hacia: '',
      numero: 'R-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
      fecha: new Date().toISOString().substr(0, 10),
      comentarios: '',
      items: [] 
    };
  }
}

onMounted(inicializar);
watch(() => route.params.id, () => inicializar());

async function buscar() {
  if (busqueda.value.length < 2) { resultados.value = []; return; }
  resultados.value = await buscarProductoPorCodigo(busqueda.value);
}

function seleccionarProducto(p) {
  if (p.cantidad <= 0) return alert(`⚠️ Sin stock de: ${p.nombre}`);

  const existe = form.value.items.find(item => item.producto_id === p.id);
  if (existe) {
    if (existe.cantidad + 1 > p.cantidad) return alert(`⚠️ Stock máximo alcanzado.`);
    existe.cantidad++;
  } else {
    form.value.items.push({
      producto_id: p.id,
      nombre: p.nombre,
      cantidad: 1,
      precio: p.precio || 0, // Guardamos el precio del producto
      codigo: p.codigo,
      stock_disponible: p.cantidad
    });
  }
  busqueda.value = "";
  resultados.value = [];
}

function eliminarFila(index) {
  form.value.items.splice(index, 1);
}

async function generarRemito() {
  if (form.value.items.length === 0) return alert("⚠️ Agregue productos.");
  if (!form.value.unidad_hacia) return alert("⚠️ Indique el destino o cliente.");

  // Validación de stock
  for (const item of form.value.items) {
    if (item.cantidad > item.stock_disponible) {
      alert(`❌ Stock insuficiente de ${item.nombre}`);
      return;
    }
  }

  try {
    cargando.value = true;
    
    // Asignamos el total al form antes de guardar
    form.value.total = totalRemito.value;
    form.value.cliente_nombre = form.value.unidad_hacia; // Usamos el destino como nombre de cliente para la tabla

    // 1. Guardar Remito y actualizar stock
    const remitoGuardado = await saveRemito(form.value);

    // 2. Automatización a Caja
    if (registrarEnCaja.value && remitoGuardado) {
      await registrarMovimientoCaja(
        'ingreso',
        totalRemito.value,
        `Cobro Remito ${form.value.numero} - ${form.value.unidad_hacia}`,
        'Ventas',
        null, // Podrías pasar el cliente_id si lo tuvieras seleccionado
        metodoPago.value
      );
    }

    alert("✅ Remito y Pago registrados con éxito.");
    router.push('/remitos');
  } catch (error) {
    console.error(error);
    alert("Error al procesar el remito.");
  } finally {
    cargando.value = false;
  }
}

const formatMonto = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
function imprimir() { window.print(); }
</script>

<style scoped>
/* Estilos adicionales para la automatización */
.pago-box {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  margin-top: 20px;
}
.metodo-pago-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}
.metodo-pago-inline select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.p-10 { padding-left: 10px; font-weight: bold; color: #166534; }

/* Mantener tus estilos anteriores de búsqueda y tabla... */
.search-section { position: relative; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
.input-search { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; margin-top: 5px; }
.results-list { position: absolute; z-index: 10; width: 95%; background: white; border: 1px solid #ddd; border-radius: 6px; list-style: none; padding: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.results-list li { padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; justify-content: space-between; }
.results-list li:hover { background: #f1f5f9; }
.table-items { width: 100%; border-collapse: collapse; margin-top: 15px; }
.table-items th { background: #f8fafc; padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
.table-items td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
.text-right { text-align: right; }
.btn-icon-red { background: #fee2e2; color: #ef4444; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>
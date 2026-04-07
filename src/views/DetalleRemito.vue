<template>
  <div class="page-container">
    <div class="card-glass">
<div class="print-only-header">
        <div class="header-content">
          <div class="empresa-info">
            <h1>JD SISTEMASINFORMÁTICOS</h1>
            <p>Soluciones en IT y Desarrollo Web</p>
            <p>Dirección de tu empresa | Tel: 1234-5678</p>
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
            <label>Destino (Unidad Entrada)</label>
            <input v-model="form.unidad_hacia" type="text" placeholder="Ej: Taller o Cliente" required />
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
	<tr v-for="(item, index) in form.items" :key="index">
  <td>
    <div class="item-info">
      <span>{{ item.nombre }}</span>
      <small class="stock-hint">Disponible: {{ item.stock_disponible }}</small>
    </div>
  </td>
  <td>
    <input 
      v-model.number="item.cantidad" 
      type="number" 
      :class="{'input-error': item.cantidad > item.stock_disponible}" 
      :readonly="isEdicion" 
    />
  </td>
  </tr>
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
              <small>Stock: {{ p.cantidad }}</small>
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
                <th width="50" v-if="!isEdicion"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index">
                <td>
                  <input v-model="item.nombre" :readonly="isEdicion" />
                </td>
                <td>
                  <input v-model.number="item.cantidad" type="number" min="1" :readonly="isEdicion" />
                </td>
                <td v-if="!isEdicion">
                  <button type="button" @click="eliminarFila(index)" class="btn-icon-red">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { ref, onMounted, computed, watch } from 'vue'; // Añadimos watch
import { useRouter, useRoute } from 'vue-router';
import { saveRemito, buscarProductoPorCodigo, getRemitoById } from '@/services/data';

const router = useRouter();
const route = useRoute();
const cargando = ref(false);
const busqueda = ref("");
const resultados = ref([]);

// Forzamos la detección de "nuevo" basándonos en el path o el param
const isEdicion = computed(() => {
  return route.params.id !== 'nuevo' && route.path !== '/remitos/nuevo';
});

const form = ref({
  unidad_desde: 'Depósito Central',
  unidad_hacia: '',
  numero: 'R-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
  fecha: new Date().toISOString().substr(0, 10),
  comentarios: '',
  items: []
});

// Función centralizada para limpiar o cargar
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
    // RESET TOTAL PARA NUEVO REMITO
    form.value = {
      unidad_desde: 'Depósito Central',
      unidad_hacia: '',
      numero: 'R-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0'),
      fecha: new Date().toISOString().substr(0, 10),
      comentarios: '',
      items: [] 
    };
    busqueda.value = "";
    resultados.value = [];
  }
}

onMounted(inicializar);

// IMPORTANTE: Si el usuario está en un remito y hace clic en "Nuevo", 
// necesitamos que el componente reaccione al cambio de URL
watch(() => route.params.id, () => {
  inicializar();
});

async function buscar() {
  if (busqueda.value.length < 2) {
    resultados.value = [];
    return;
  }
  // Llamamos a la función de tu data.js que ya usa ilike
  resultados.value = await buscarProductoPorCodigo(busqueda.value);
}

function seleccionarProducto(p) {
  // 1. Validar si hay stock físico antes de dejar agregar
  if (p.cantidad <= 0) {
    alert(`⚠️ No hay stock disponible de: ${p.nombre}. (Stock: 0)`);
    return; // Bloqueamos la adición
  }

  const existe = form.value.items.find(item => item.producto_id === p.id);
  
  if (existe) {
    // 2. Si ya existe en la lista, verificar que al sumar 1 no superemos el stock
    if (existe.cantidad + 1 > p.cantidad) {
      alert(`⚠️ No puedes agregar más de ${p.cantidad} unidades de ${p.nombre}.`);
      return;
    }
    existe.cantidad++;
  } else {
    form.value.items.push({
      producto_id: p.id,
      nombre: p.nombre,
      cantidad: 1,
      codigo: p.codigo,
      stock_disponible: p.cantidad // Guardamos este valor para validar luego
    });
  }
  
  busqueda.value = "";
  resultados.value = [];
}

function eliminarFila(index) {
  form.value.items.splice(index, 1);
}

async function generarRemito() {
  if (form.value.items.length === 0) return alert("⚠️ Agregue productos al remito.");
  if (!form.value.cliente_nombre) return alert("⚠️ Seleccione un cliente de destino.");

  // VALIDACIÓN DE STOCK NEGATIVO
  for (const item of form.value.items) {
    if (item.cantidad > item.stock_disponible) {
      alert(`❌ Error: Estás intentando enviar ${item.cantidad} unidades de "${item.nombre}", pero solo hay ${item.stock_disponible} en stock.`);
      return; // Detiene la ejecución aquí
    }
    if (item.cantidad <= 0) {
      alert(`⚠️ La cantidad de "${item.nombre}" debe ser mayor a 0.`);
      return;
    }
  }

  try {
    cargando.value = true;
    await saveRemito(form.value);
    alert("✅ Remito registrado y stock actualizado con éxito.");
    router.push('/remitos');
  } catch (error) {
    alert("Error al guardar el remito.");
  } finally {
    cargando.value = false;
  }
}

function imprimir() { window.print(); }
</script>

<style scoped>
/* (Mantenemos tus estilos y agregamos los del buscador) */
.search-section { position: relative; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
.input-search { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; margin-top: 5px; }
.results-list { position: absolute; z-index: 10; width: 95%; background: white; border: 1px solid #ddd; border-radius: 6px; list-style: none; padding: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.results-list li { padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; justify-content: space-between; }
.results-list li:hover { background: #f1f5f9; }
.input-readonly { background: #f1f5f9; color: #64748b; font-weight: bold; }
.btn-print { background: #1e293b; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.stock-hint { display: block; font-size: 10px; color: #64748b; }
.input-error { border: 1px solid #ef4444 !important; color: #ef4444; background: #fef2f2; }
@media print {
  /* Ocultar todo menos el remito */
  .btn-secondary, .btn-primary, .btn-print, .search-section, .btn-icon-red, .header-action button {
    display: none !important;
  }
  
  .page-container { padding: 0; margin: 0; }
  .card-glass { border: none; box-shadow: none; }
  
  /* Formato de remito */
  .grid-form { 
    grid-template-columns: 1fr 1fr; 
    border-bottom: 2px solid #000;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }
  
  input, textarea {
    border: none !important;
    background: transparent !important;
  }
@media print {
  /* 1. Ocultar elementos innecesarios */
  .btn-secondary, 
  .btn-primary, 
  .btn-print, 
  .search-section, 
  .btn-icon-red, 
  .header-action,
  nav, 
  sidebar { 
    display: none !important; 
  }

  /* 2. Mostrar cabecera de impresión */
  .print-only-header {
    display: block !important;
    margin-bottom: 20px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  /* 3. Resetear el contenedor para que ocupe toda la hoja */
  .page-container {
    padding: 0;
    margin: 0;
    background: white;
  }

  .card-glass {
    background: white !important;
    border: none !important;
    box-shadow: none !important;
    width: 100%;
  }

  /* 4. Estilizar inputs para que parezcan texto plano */
  input, textarea {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    color: black !important;
    box-shadow: none !important;
  }

  label {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 11px;
    color: #333;
  }

  .grid-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 4px;
  }

  /* 5. Estilizar la tabla de items */
  .table-items {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  .table-items th {
    background: #f0f0f0 !important;
    color: black !important;
    border: 1px solid #ccc;
    padding: 8px;
  }

  .table-items td {
    border: 1px solid #ccc;
    padding: 8px;
  }
}
}
</style>
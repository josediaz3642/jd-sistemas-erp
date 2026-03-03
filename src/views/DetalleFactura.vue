<template>
  <div class="detalle-container" v-if="!loading && factura">
    <div class="actions-bar no-print">
      <button @click="$router.back()" class="btn-secundario">← Volver</button>
      <button @click="imprimir" class="btn-primario">🖨️ Imprimir PDF</button>
    </div>

    <div class="factura-papel" id="print-area">
      <header class="header-doc">
        <div class="col-izq">
          <div class="logo-empresa">
            <img v-if="empresa?.logo" :src="empresa.logo" />
            <h1 v-else>{{ empresa?.nombre || 'Mi Empresa' }}</h1>
          </div>
          <div class="datos-empresa">
            <p><strong>{{ empresa?.razon_social || empresa?.nombre }}</strong></p>
            <p>{{ empresa?.direccion || 'S/D' }}</p>
            <p>Tel: {{ empresa?.telefono || 'S/D' }}</p>
            <p>Email: {{ empresa?.email || '' }}</p>
          </div>
        </div>

        <div class="col-centro">
          <div class="tipo-comp">
            <span>{{ factura.tipo_comprobante || 'A' }}</span>
            <small>Cod. 01</small>
          </div>
        </div>

        <div class="col-der">
          <h2 class="titulo-doc">FACTURA</h2>
          <p><strong>Punto Venta:</strong> {{ String(factura.punto_venta || 1).padStart(4, '0') }}</p>
          <p><strong>Nº Comprobante:</strong> {{ String(factura.numero_factura || factura.numero || 0).padStart(8, '0') }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(factura.fecha) }}</p>
          <p><strong>CUIT:</strong> {{ empresa?.cuit || '00-00000000-0' }}</p>
        </div>
      </header>

      <hr class="divisor">

      <section class="datos-cliente">
        <p><strong>Cliente:</strong> {{ factura.cliente_nombre || cliente?.nombre || 'Consumidor Final' }}</p>
        <p><strong>Dirección:</strong> {{ cliente?.direccion || 'S/D' }}</p>
        <p><strong>Cond. IVA:</strong> {{ cliente?.condicion_iva || 'Consumidor Final' }}</p>
        <p v-if="cliente?.cuit"><strong>CUIT:</strong> {{ cliente.cuit }}</p>
      </section>

      <table class="tabla-items">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-center">Cant.</th>
            <th class="text-right">Precio Unit.</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in itemsProcesados" :key="index">
            <td>{{ item.nombre || getNombreProducto(item.producto_id || item.id) }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-right">${{ Number(item.precio).toLocaleString() }}</td>
            <td class="text-right">${{ (item.cantidad * item.precio).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="footer-factura">
        <div class="cae-section">
          <p v-if="factura.cae"><strong>CAE:</strong> {{ factura.cae }}</p>
          <p v-if="factura.cae_vto"><strong>Vto. CAE:</strong> {{ formatDate(factura.cae_vto) }}</p>
          <div class="barcode" v-if="factura.cae">
            || ||| || |||| || ||| ||||
          </div>
        </div>
        <div class="totales-factura">
          <p>Subtotal: <span>${{ Number(factura.subtotal || 0).toLocaleString() }}</span></p>
          <p v-if="factura.iva">IVA (21%): <span>${{ Number(factura.iva).toLocaleString() }}</span></p>
          <h3 class="total-final">TOTAL: <span>${{ Number(factura.total || 0).toLocaleString() }}</span></h3>
        </div>
      </footer>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
     Cargando comprobante...
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/supabase';
import { getEmpresa, getStockItems, getClienteById } from '@/services/data';

const route = useRoute();
const factura = ref(null);
const empresa = ref(null);
const cliente = ref(null);
const productos = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const id = route.params.id;

  // 1. Cargar Factura desde Supabase
  const { data: fData, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('id', id)
    .single();

  if (!error) {
    factura.value = fData;
    
    // 2. Cargar datos complementarios
    empresa.value = await getEmpresa();
    productos.value = await getStockItems();
    
    if (fData.cliente_id) {
      cliente.value = await getClienteById(fData.cliente_id);
    }
  }
  loading.value = false;
});

const itemsProcesados = computed(() => {
  if (!factura.value?.items) return [];
  // Supabase puede devolver el JSON como objeto o como string dependiendo de la config
  return typeof factura.value.items === 'string' 
    ? JSON.parse(factura.value.items) 
    : factura.value.items;
});

const getNombreProducto = (id) => {
  const p = productos.value.find(p => p.id === id);
  return p ? p.nombre : 'Producto';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-AR');
};

const imprimir = () => {
  window.print();
};
</script>

<style scoped>
/* Se mantienen tus estilos base pero con ajustes de robustez */
.detalle-container { padding: 20px; background: #f1f5f9; min-height: 100vh; }
.loading-state { padding: 100px; text-align: center; font-size: 1.2rem; color: #64748b; }
.no-print { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }

.factura-papel {
  background: white;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 40px 60px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  color: #1e293b;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.header-doc { display: flex; justify-content: space-between; align-items: flex-start; }
.titulo-doc { margin: 0; font-size: 1.8rem; letter-spacing: 2px; }

.col-centro { border: 2px solid #1e293b; padding: 5px 20px; background: white; z-index: 10; }
.tipo-comp span { font-size: 3rem; font-weight: 900; line-height: 1; }

.divisor { margin: 25px 0; border: 0; border-top: 2px solid #1e293b; }

.tabla-items { width: 100%; border-collapse: collapse; margin: 40px 0; }
.tabla-items th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; font-size: 0.9rem; }
.tabla-items td { border: 1px solid #e2e8f0; padding: 12px; font-size: 0.9rem; }

.footer-factura { display: flex; justify-content: space-between; margin-top: 60px; align-items: flex-end; }
.totales-factura { text-align: right; min-width: 250px; }
.totales-factura p { margin: 5px 0; display: flex; justify-content: space-between; }
.total-final { font-size: 1.8rem; border-top: 3px solid #1e293b; margin-top: 15px; padding-top: 10px; }

.barcode { font-family: 'Libre Barcode 39', cursive; font-size: 2rem; margin-top: 10px; opacity: 0.5; }

@media print {
  .no-print { display: none !important; }
  .detalle-container { padding: 0; background: white; }
  .factura-papel { box-shadow: none; margin: 0; width: 100%; padding: 0; }
  body { background: white; }
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.btn-primario { background: #1e293b; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-secundario { background: white; border: 1px solid #e2e8f0; padding: 12px 25px; border-radius: 8px; cursor: pointer; }
</style>
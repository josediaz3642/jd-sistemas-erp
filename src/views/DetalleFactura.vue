<template>
  <div class="detalle-container" v-if="!loading && factura">
    <div class="actions-bar no-print">
      <button @click="$router.back()" class="btn-secundario">← Volver</button>
      <button @click="imprimir" class="btn-primario">🖨️ Imprimir Factura</button>
    </div>

    <div class="factura-papel" id="print-area">
      <header class="header-doc">
        <div class="col-izq">
          <div class="logo-empresa">
            <img v-if="empresa?.logo" :src="empresa.logo" />
            <h1 v-else>JD SISTEMAS</h1>
          </div>
          <div class="datos-empresa">
            <p><strong>{{ empresa?.nombre }}</strong></p>
            <p>{{ empresa?.direccion }}</p>
            <p>Tel: {{ empresa?.telefono }}</p>
            <p>Email: {{ empresa?.email }}</p>
          </div>
        </div>

        <div class="col-centro">
          <div class="tipo-comp">
            <span>{{ factura.tipo_comprobante || 'C' }}</span>
            <small>Cod. 011</small>
          </div>
        </div>

        <div class="col-der">
          <h2 class="titulo-doc">FACTURA</h2>
          <p><strong>Nº:</strong> {{ String(factura.numero || 0).padStart(8, '0') }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(factura.fecha) }}</p>
          <p><strong>Condición:</strong> <span class="badge-pago">{{ factura.metodo_pago || 'Contado' }}</span></p>
          <p><strong>CUIT:</strong> {{ empresa?.cuit }}</p>
        </div>
      </header>

      <hr class="divisor">

      <section class="datos-cliente">
        <div class="grid-cliente">
          <div>
            <p><strong>Señor(es):</strong> {{ factura.cliente_nombre || 'Consumidor Final' }}</p>
            <p><strong>Domicilio:</strong> {{ cliente?.direccion || 'S/D' }}</p>
          </div>
          <div>
            <p><strong>Cond. IVA:</strong> {{ cliente?.condicion_iva || 'Consumidor Final' }}</p>
            <p v-if="cliente?.cuit"><strong>CUIT/DNI:</strong> {{ cliente.cuit }}</p>
          </div>
        </div>
      </section>

      <table class="tabla-items">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-center">Cant.</th>
            <th class="text-right">Unitario</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in itemsProcesados" :key="index">
            <td>{{ item.nombre }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-right">$ {{ Number(item.precio).toLocaleString('es-AR') }}</td>
            <td class="text-right">$ {{ (item.cantidad * item.precio).toLocaleString('es-AR') }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="footer-factura">
        <div class="cae-section">
          <p v-if="factura.cae"><strong>CAE:</strong> {{ factura.cae }}</p>
          <p v-if="factura.cae_vto"><strong>Vto. CAE:</strong> {{ formatDate(factura.cae_vto) }}</p>
          <div class="barcode" v-if="factura.cae">|| ||| || |||| || ||| ||||</div>
        </div>
        <div class="totales-factura">
          <p>Subtotal: <span>${{ Number(factura.subtotal || 0).toLocaleString('es-AR') }}</span></p>
          <p v-if="factura.iva">IVA (21%): <span>${{ Number(factura.iva).toLocaleString('es-AR') }}</span></p>
          <h3 class="total-final">TOTAL: <span>${{ Number(factura.total || 0).toLocaleString('es-AR') }}</span></h3>
        </div>
      </footer>
    </div>
  </div>

  <div v-else class="loading-state">Cargando comprobante...</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/supabase';
import { getEmpresa, getClienteById } from '@/services/data';

const route = useRoute();
const factura = ref(null);
const empresa = ref(null);
const cliente = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data: fData } = await supabase.from('facturas').select('*').eq('id', route.params.id).single();
    if (fData) {
      factura.value = fData;
      empresa.value = await getEmpresa();
      if (fData.cliente_id) cliente.value = await getClienteById(fData.cliente_id);
    }
  } finally {
    loading.value = false;
  }
});

const itemsProcesados = computed(() => {
  if (!factura.value?.items) return [];
  return Array.isArray(factura.value.items) ? factura.value.items : JSON.parse(factura.value.items);
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '-';
const imprimir = () => window.print();
</script>

<style scoped>
/* Estilos para que parezca una factura de verdad */
.detalle-container { padding: 20px; background: #e2e8f0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
.factura-papel {
  background: white;
  width: 210mm;
  padding: 50px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  color: #000;
}
.header-doc { display: flex; justify-content: space-between; }
.logo-empresa img { max-width: 150px; }
.col-centro { border: 2px solid #000; padding: 10px; text-align: center; }
.tipo-comp span { font-size: 2.5rem; font-weight: bold; }
.badge-pago { background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
.grid-cliente { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
.tabla-items { width: 100%; border-collapse: collapse; margin-top: 30px; }
.tabla-items th { border-bottom: 2px solid #000; padding: 10px; text-align: left; }
.tabla-items td { padding: 10px; border-bottom: 1px solid #eee; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.footer-factura { display: flex; justify-content: space-between; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
.total-final { font-size: 2rem; }

@media print {
  .no-print { display: none !important; }
  .detalle-container { background: none; padding: 0; }
  .factura-papel { box-shadow: none; width: 100%; padding: 0; }
}
</style>
<template>
  <div class="detalle-container" v-if="factura">
    <div class="actions-bar no-print">
      <button @click="$router.back()" class="btn-secundario">← Volver</button>
      <button @click="imprimir" class="btn-primario">🖨️ Imprimir PDF</button>
    </div>

    <div class="factura-papel" id="print-area">
      <header class="header-doc">
        <div class="col-izq">
          <div class="logo-empresa">
            <img v-if="empresa?.logo" :src="empresa.logo" />
            <h1 v-else>{{ empresa?.nombre || 'SaaS ERP' }}</h1>
          </div>
          <div class="datos-empresa">
            <p><strong>{{ empresa?.razon_social }}</strong></p>
            <p>{{ empresa?.direccion || 'Calle Falsa 123' }}</p>
            <p>Tel: {{ empresa?.telefono || '12345678' }}</p>
          </div>
        </div>

        <div class="col-centro">
          <div class="tipo-comp">
            <span>{{ factura.tipoComprobante }}</span>
            <small>Cod. 01</small>
          </div>
        </div>

        <div class="col-der">
          <h2>FACTURA</h2>
          <p><strong>Punto Venta:</strong> {{ String(factura.puntoVenta).padStart(4, '0') }}</p>
          <p><strong>Nº Comprobante:</strong> {{ String(factura.numero).padStart(8, '0') }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(factura.fecha) }}</p>
          <p><strong>CUIT:</strong> {{ empresa?.cuit || '00-00000000-0' }}</p>
        </div>
      </header>

      <hr class="divisor">

      <section class="datos-cliente">
        <p><strong>Cliente:</strong> {{ cliente?.nombre }}</p>
        <p><strong>Dirección:</strong> {{ cliente?.direccion || 'S/D' }}</p>
        <p><strong>Cond. IVA:</strong> {{ cliente?.condicionIva || 'Consumidor Final' }}</p>
        <p><strong>CUIT:</strong> {{ cliente?.cuit || '00-00000000-0' }}</p>
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
          <tr v-for="item in factura.items" :key="item.productoId">
            <td>{{ getNombreProducto(item.productoId) }}</td>
            <td class="text-center">{{ item.cantidad }}</td>
            <td class="text-right">${{ item.precio.toLocaleString() }}</td>
            <td class="text-right">${{ (item.cantidad * item.precio).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="footer-factura">
        <div class="cae-section">
          <p><strong>CAE:</strong> 7412589632145</p>
          <p><strong>Vto. CAE:</strong> {{ formatDate(factura.fecha) }}</p>
        </div>
        <div class="totales-factura">
          <p>Subtotal: <span>${{ factura.subtotal.toLocaleString() }}</span></p>
          <p>IVA (21%): <span>${{ factura.iva.toLocaleString() }}</span></p>
          <h3 class="total-final">TOTAL: <span>${{ factura.total.toLocaleString() }}</span></h3>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFacturaById, getEmpresa, getClienteById, getStockItems } from '@/services/data';

const route = useRoute();
const factura = ref(null);
const empresa = ref(null);
const cliente = ref(null);
const productos = ref([]);

onMounted(() => {
  const id = route.params.id;
  factura.value = getFacturaById(id);
  empresa.value = getEmpresa();
  productos.value = getStockItems();
  
  if (factura.value) {
    cliente.value = getClienteById(factura.value.clienteId);
  }
});

const getNombreProducto = (id) => {
  return productos.value.find(p => p.id === id)?.nombre || 'Producto';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const imprimir = () => {
  window.print();
};
</script>

<style scoped>
/* ESTILOS PARA LA PANTALLA */
.detalle-container { padding: 20px; background: #f1f5f9; min-height: 100vh; }
.actions-bar { margin-bottom: 20px; display: flex; gap: 10px; }

.factura-papel {
  background: white;
  width: 210mm; /* Ancho A4 */
  min-height: 297mm;
  margin: 0 auto;
  padding: 50px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  color: #333;
}

.header-doc { display: flex; justify-content: space-between; }
.col-centro { border: 1px solid #333; padding: 5px 15px; height: fit-content; }
.tipo-comp { text-align: center; }
.tipo-comp span { font-size: 2.5rem; font-weight: bold; display: block; }

.tabla-items { width: 100%; border-collapse: collapse; margin: 30px 0; }
.tabla-items th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; }
.tabla-items td { border: 1px solid #cbd5e1; padding: 10px; }

.footer-factura { display: flex; justify-content: space-between; margin-top: 50px; }
.total-final { font-size: 1.5rem; border-top: 2px solid #333; padding-top: 10px; }

.text-right { text-align: right; }
.text-center { text-align: center; }

.btn-primario { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-secundario { background: white; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; }

/* ESTILOS PARA LA IMPRESORA */
@media print {
  .no-print { display: none; }
  .detalle-container { padding: 0; background: white; }
  .factura-papel { box-shadow: none; margin: 0; width: 100%; padding: 0; }
}
.logo-empresa img {
  max-height: 80px;
  max-width: 200px;
  object-fit: contain;
  margin-bottom: 10px;
}

.divisor {
  margin: 20px 0;
  border: 0;
  border-top: 2px solid #333;
}

.datos-cliente {
  margin-bottom: 20px;
  line-height: 1.5;
}
</style>
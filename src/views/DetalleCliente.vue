<template>
  <div class="card detalle-page">
    <h1>Detalle de Cliente</h1>

    <div v-if="!cliente" class="alert error">Cliente no encontrado.</div>

    <div v-else>
      <div class="cliente-header">
        <h2>{{ cliente.nombre }}</h2>
        <p>CUIT: {{ cliente.cuit }}</p>
        <p>Dirección: {{ cliente.direccion }}</p>
        <p>IVA: {{ cliente.condicionIVA }}</p>
      </div>

      <div class="acciones">
        <button class="btn btn-primary" @click="irFacturar">Crear Factura</button>
        <button class="btn" @click="exportAllFacturas">Exportar facturas (PDF/JSON)</button>
      </div>

      <section class="lista">
        <h3>Facturas</h3>
        <table v-if="facturas.length" class="table">
          <thead><tr><th>Tipo</th><th>N°</th><th>Fecha</th><th>Total</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="f in facturas" :key="f.id">
              <td>{{ f.tipo }}</td>
              <td>{{ f.puntoVenta }}-{{ f.numero }}</td>
              <td>{{ f.fecha }}</td>
              <td>{{ formatMoney(f.total) }}</td>
              <td>
                <button class="btn btn-sm" @click="verFactura(f)">Ver</button>
                <button class="btn btn-sm" @click="exportFactura(f)">Exportar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">No hay facturas para este cliente.</p>
      </section>

      <section class="lista">
        <h3>Cheques</h3>
        <table v-if="cheques.length" class="table">
          <thead><tr><th>Tipo</th><th>N°</th><th>Fecha</th><th>Monto</th></tr></thead>
          <tbody>
            <tr v-for="c in cheques" :key="c.id">
              <td>{{ c.tipo || 'N/A' }}</td>
              <td>{{ c.numero || '-' }}</td>
              <td>{{ c.fecha || '-' }}</td>
              <td>{{ formatMoney(c.monto || 0) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">No hay cheques asociados.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getClienteById, getFacturasByCliente, getChequesByCliente } from '@/services/data';

// util: intentar usar jspdf si está disponible
let jsPDFLib = null;
try { jsPDFLib = (await import('jspdf')).jsPDF; } catch(e){ jsPDFLib = null; }

const route = useRoute();
const router = useRouter();

const cliente = ref(null);
const facturas = ref([]);
const cheques = ref([]);

function formatMoney(v) {
  return `$${Number(v || 0).toFixed(2)}`;
}

onMounted(() => {
  const id = Number(route.params.id);
  cliente.value = getClienteById(id);
  if (!cliente.value) return;
  facturas.value = getFacturasByCliente(id) || [];
  cheques.value = getChequesByCliente(id) || [];
});

function verFactura(f) {
  // navegar a facturación en modo edición (si tenés ruta)
  router.push({ path: '/facturacion', query: { editId: f.id } });
}

function irFacturar() {
  router.push({ path: '/facturacion', query: { clienteId: cliente.value.id } });
}

function exportFactura(f) {
  // intenta pdf, si no disponible descarga JSON
  if (jsPDFLib) {
    try {
      const doc = new jsPDFLib();
      doc.setFontSize(14);
      doc.text(`Factura ${f.tipo} ${f.puntoVenta}-${f.numero}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Cliente: ${cliente.value.nombre}`, 14, 28);
      doc.text(`Fecha: ${f.fecha}`, 14, 34);

      const rows = (f.items || []).map(i => [i.cantidad, i.descripcion, i.precio.toFixed(2), (i.cantidad*i.precio).toFixed(2)]);
      // si autoTable no existe, volcamos manual
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({ startY: 42, head: [['Cant', 'Desc', 'P.Unit', 'Subtotal']], body: rows });
      } else {
        let y = 42;
        rows.forEach(r => {
          doc.text(r.join(' | '), 14, y);
          y += 6;
        });
      }
      doc.save(`Factura_${f.puntoVenta}_${f.numero}.pdf`);
      return;
    } catch(e) {
      console.warn('Error generando PDF, descargando JSON...', e);
    }
  }

  // fallback: descargar JSON
  const blob = new Blob([JSON.stringify(f, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Factura_${f.puntoVenta}_${f.numero}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllFacturas() {
  const data = facturas.value;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Facturas_Cliente_${cliente.value.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.detalle-page { max-width: 980px; margin: 20px auto; padding: 20px; }
.cliente-header { margin-bottom: 12px; }
.lista { margin-top: 18px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 8px; border-bottom: 1px solid var(--border-color); text-align: left; }
.empty { color: var(--text-secondary); }
.acciones { display:flex; gap:10px; margin-bottom:10px; }
</style>

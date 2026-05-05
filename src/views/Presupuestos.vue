<template>
  <div class="presupuestos-container">
    <header class="page-header">
      <div>
        <h2>Presupuestos</h2>
        <p class="subtitle">Gestión de cotizaciones y presupuestos a clientes.</p>
      </div>
      <button @click="router.push('/presupuestos/nuevo')" class="btn-nueva">
        <span>+</span> Nuevo Presupuesto
      </button>
    </header>

    <div class="table-container glass-card shadow-lg">
      <table class="table-moderna">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nro.</th>
            <th>Cliente</th>
            <th>Total</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in presupuestos" :key="p.id">
            <td>{{ new Date(p.fecha).toLocaleDateString() }}</td>
            <td class="font-mono">#{{ p.numero }}</td>
            <td class="font-bold">{{ p.cliente_nombre }}</td>
            <td class="text-blue-600 font-bold">${{ p.total.toLocaleString() }}</td>
            <td class="text-right actions-cell">
              <button @click="verPresupuesto(p)" class="btn-icon" title="Ver detalle">👁️ Ver</button>
              <button @click="imprimirPresupuesto(p)" class="btn-icon" title="Imprimir">🖨️ Imprimir</button>
              <button @click="enviarWhatsapp(p)" class="btn-icon" title="Enviar por WhatsApp">📱 WhatsApp</button>
            </td>
          </tr>
          <tr v-if="presupuestos.length === 0">
            <td colspan="5" class="text-center p-4 text-gray-500">No hay presupuestos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL VISTA PREVIA PRESUPUESTO -->
    <div v-if="presupuestoSeleccionado" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content print-area">
        <div class="modal-header hide-on-print">
          <h3>Presupuesto #{{ presupuestoSeleccionado.numero }}</h3>
          <button @click="cerrarModal" class="btn-close">✕</button>
        </div>
        <div class="presupuesto-detalle">
          <div class="presupuesto-header">
            <div>
              <img v-if="authStore.empresa?.logo" :src="authStore.empresa.logo" style="max-height: 60px; margin-bottom: 10px;" />
              <h2>PRESUPUESTO</h2>
              <p>Fecha: {{ new Date(presupuestoSeleccionado.fecha).toLocaleDateString() }}</p>
              <div v-if="authStore.empresa" class="company-info-print mt-2" style="font-size: 0.8rem; color: #475569;">
                <strong>{{ authStore.empresa.razon_social }}</strong><br>
                CUIT: {{ authStore.empresa.cuit || 'S/D' }}<br>
                Tel: {{ authStore.empresa.telefono || 'S/D' }}
              </div>
            </div>
            <div class="text-right">
              <strong>Facturar a:</strong><br/>
              {{ presupuestoSeleccionado.cliente_nombre }}<br/>
              <span v-if="presupuestoSeleccionado.cliente_documento" style="font-size: 0.85rem; color: #475569;">
                CUIT/DNI: {{ presupuestoSeleccionado.cliente_documento }}
              </span>
            </div>
          </div>
          
          <table class="table-items mt-4">
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in (presupuestoSeleccionado.items || [])" :key="idx">
                <td>{{ item.desc || 'Ítem' }}</td>
                <td class="text-center">{{ item.cant }}</td>
                <td class="text-right">${{ item.precio.toLocaleString() }}</td>
                <td class="text-right">${{ (item.cant * item.precio).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="presupuesto-total mt-4">
            <h3>TOTAL: ${{ presupuestoSeleccionado.total.toLocaleString() }}</h3>
          </div>
        </div>
        <div class="modal-footer hide-on-print mt-4">
          <button @click="imprimirPresupuesto(presupuestoSeleccionado)" class="btn-primary">🖨️ Imprimir</button>
          <button @click="enviarWhatsapp(presupuestoSeleccionado)" class="btn-success">📱 WhatsApp</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getEmpresaId } from '@/services/data';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const presupuestos = ref([]);
const presupuestoSeleccionado = ref(null);

onMounted(() => {
  const key = `contasoft_presupuestos_${getEmpresaId()}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    presupuestos.value = JSON.parse(saved);
  }
});

function verPresupuesto(p) {
  presupuestoSeleccionado.value = p;
}

function cerrarModal() {
  presupuestoSeleccionado.value = null;
}

function imprimirPresupuesto(p) {
  presupuestoSeleccionado.value = p;
  setTimeout(() => {
    window.print();
  }, 300);
}

function enviarWhatsapp(p) {
  let text = `*PRESUPUESTO #${p.numero}*\n`;
  text += `Cliente: ${p.cliente_nombre}\n`;
  text += `Fecha: ${new Date(p.fecha).toLocaleDateString()}\n\n`;
  if (p.items && p.items.length) {
    p.items.forEach(item => {
      text += `- ${item.cant}x ${item.desc} ($${item.precio}) = $${item.cant * item.precio}\n`;
    });
  }
  text += `\n*TOTAL: $${p.total.toLocaleString()}*`;
  
  const encodedText = encodeURIComponent(text);
  const telefono = p.cliente_telefono ? p.cliente_telefono.replace(/\D/g, '') : '';
  const url = telefono ? `https://wa.me/${telefono}?text=${encodedText}` : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank');
}
</script>

<style scoped>
.presupuestos-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.subtitle { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
.btn-nueva { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.table-container { background: white; border-radius: 12px; overflow: hidden; }
.table-moderna { width: 100%; border-collapse: collapse; }
.table-moderna th { text-align: left; padding: 15px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.table-moderna td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.font-mono { font-family: monospace; }
.font-bold { font-weight: bold; }
.text-blue-600 { color: #2563eb; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: background 0.2s; }
.btn-icon:hover { background: #f8fafc; }

/* MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 600px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
.modal-header h3 { margin: 0; font-size: 1.2rem; }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; }

.presupuesto-header { display: flex; justify-content: space-between; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; }
.presupuesto-header h2 { margin: 0 0 10px 0; color: #1e293b; }
.table-items { width: 100%; border-collapse: collapse; }
.table-items th { border-bottom: 2px solid #e2e8f0; padding: 10px; text-align: left; }
.table-items td { border-bottom: 1px solid #f1f5f9; padding: 10px; }
.presupuesto-total { text-align: right; border-top: 2px solid #e2e8f0; padding-top: 15px; }

.mt-4 { margin-top: 1.5rem; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-success { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }

@media print {
  body * { visibility: hidden; }
  .print-area, .print-area * { visibility: visible; }
  .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
  .hide-on-print { display: none !important; }
}
</style>

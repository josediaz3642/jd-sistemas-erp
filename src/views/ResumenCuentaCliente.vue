<template>
  <div class="resumen-container">
    <header v-if="cliente" class="cliente-header glass-card">
      <div class="info-principal">
        <div class="avatar">{{ cliente.nombre.charAt(0) }}</div>
        <div>
          <h1>{{ cliente.nombre }}</h1>
          <p>
            {{ cliente.nro_documento || 'Sin Documento' }} | 
            {{ cliente.direccion || 'Sin dirección' }}
          </p>
          <p class="phone-label">📞 {{ cliente.telefono || 'Sin teléfono' }}</p>
        </div>
      </div>
      <div class="saldo-card" :class="{ 'saldo-deudor': saldo > 0 }">
        <span class="label">Saldo de Cuenta</span>
        <h2 class="monto">${{ saldo.toLocaleString() }}</h2>
        <span class="badge">{{ saldo > 0 ? 'Deuda Pendiente' : 'Al día' }}</span>
      </div>
    </header>

    <div class="dashboard-grid">
      <section class="stats-section">
        <div class="mini-card glass-card">
          <span class="icon">📄</span>
          <div>
            <h3>{{ facturas.length }}</h3>
            <p>Facturas Emitidas</p>
          </div>
        </div>
        <div class="mini-card glass-card">
          <span class="icon">💰</span>
          <div>
            <h3>{{ pagos.length }}</h3>
            <p>Pagos Recibidos</p>
          </div>
        </div>
        
        <button 
          v-if="cliente && cliente.telefono" 
          @click="enviarWhatsApp" 
          class="btn-whatsapp-full"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" />
          Enviar Estado de Cuenta
        </button>
      </section>

      <section class="items-section glass-card">
        <h3>🛍️ Ranking de Productos Comprados</h3>
        <div class="table-scroll">
          <table class="simple-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cantidad Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.producto">
                <td>{{ item.producto }}</td>
                <td class="text-right font-bold">{{ item.cantidad }}</td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="2" class="text-center py-4">Sin registro de artículos.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="footer-actions">
        <button @click="$router.back()" class="btn-outline">← Volver al Listado</button>
        <button @click="imprimirResumen" class="btn-primary">🖨️ Imprimir Estado</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { 
  getFacturasCliente, 
  getPagosCliente, 
  getItemsVendidosCliente,  
  getClienteById, 
  getNotasByCliente 
} from "@/services/data";

const route = useRoute();
const id = route.params.id;

const cliente = ref(null);
const facturas = ref([]);
const pagos = ref([]);
const items = ref([]);
const notas = ref([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    const [cData, fData, pData, iData, nData] = await Promise.all([
      getClienteById(id),
      getFacturasCliente(id),
      getPagosCliente(id),
      getItemsVendidosCliente(id),
      getNotasByCliente(id)
    ]);

    cliente.value = cData;
    facturas.value = fData || [];
    pagos.value = pData || [];
    items.value = iData || [];
    notas.value = nData || [];

  } catch (e) {
    console.error("Error al cargar el resumen:", e);
  } finally {
    loading.value = false;
  }
});

const saldo = computed(() => {
  const totalFacturas = facturas.value.reduce((acc, f) => acc + (Number(f.total) || 0), 0);
  const totalPagos = pagos.value.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  const totalND = notas.value.filter(n => n.tipo_comprobante === 'ND').reduce((acc, n) => acc + (Number(n.monto) || 0), 0);
  const totalNC = notas.value.filter(n => n.tipo_comprobante === 'NC').reduce((acc, n) => acc + (Number(n.monto) || 0), 0);
  return (totalFacturas + totalND) - (totalPagos + totalNC);
});

// FUNCIÓN WHATSAPP PROFESIONAL
function enviarWhatsApp() {
  if (!cliente.value || !cliente.value.telefono) return;
  
  const num = cliente.value.telefono.replace(/\D/g, '');
  const mensaje = `*RESUMEN DE CUENTA - CONTASOFT ERP*\n\n` +
                  `Hola *${cliente.value.nombre}*,\n` +
                  `Te informamos tu estado de cuenta actualizado:\n\n` +
                  `💰 *Saldo Actual: $${saldo.value.toLocaleString()}*\n` +
                  `📊 Facturas: ${facturas.value.length}\n` +
                  `✅ Pagos: ${pagos.value.length}\n\n` +
                  `Si tienes dudas, por favor contáctanos.`;
  
  const url = `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

function imprimirResumen() { window.print(); }
</script>

<style scoped>
.phone-label { font-size: 0.8rem; color: #64748b; margin-top: 5px; }

.btn-whatsapp-full {
  background: #22c55e;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
}

.btn-whatsapp-full:hover {
  transform: scale(1.02);
  background: #16a34a;
.resumen-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.cliente-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px !important;
  margin-bottom: 20px;
}

.info-principal {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.saldo-card {
  text-align: right;
  padding: 15px 25px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.saldo-deudor {
  background: #fff1f2;
  border-color: #fecaca;
}

.saldo-deudor .monto { color: #e11d48; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mini-card {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 20px !important;
}

.mini-card h3 { font-size: 1.5rem; margin: 0; }
.mini-card p { color: #64748b; font-size: 0.85rem; margin: 0; }

.simple-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.simple-table th { text-align: left; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; padding-bottom: 10px; }
.simple-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }

.footer-actions {
  grid-column: span 2;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-primary { background: #1e293b; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-outline { background: white; border: 1px solid #e2e8f0; padding: 12px 25px; border-radius: 8px; cursor: pointer; }

@media (max-width: 768px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .cliente-header { flex-direction: column; text-align: center; gap: 20px; }
  .saldo-card { text-align: center; width: 100%; }
}
</style>
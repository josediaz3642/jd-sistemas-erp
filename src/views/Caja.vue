<template>
  <div class="page-container">
    <header class="header-section">
      <h2>💰 Control de Caja</h2>
      <div class="actions">
        <button @click="abrirModal('ingreso')" class="btn-ingreso">+ Nuevo Ingreso</button>
        <button @click="abrirModal('egreso')" class="btn-egreso">- Nuevo Egreso</button>
      </div>
    </header>

    <div class="grid-resumen">
      <div class="card-kpi efectivo">
        <span class="label">💵 Efectivo en Caja</span>
        <h3 class="monto">$ {{ formatMonto(totalEfectivo) }}</h3>
      </div>
      <div class="card-kpi banco">
        <span class="label">🏦 Banco / Transferencias</span>
        <h3 class="monto">$ {{ formatMonto(totalBanco) }}</h3>
      </div>
      <div class="card-kpi total" :class="{ negativo: balanceTotal < 0 }">
        <span class="label">📊 Balance Total</span>
        <h3 class="monto">$ {{ formatMonto(balanceTotal) }}</h3>
      </div>
    </div>

    <div class="card-glass mt-20">
      <table class="minimal-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Categoría</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movimientos" :key="m.id" :class="m.tipo">
            <td>{{ new Date(m.fecha).toLocaleDateString() }}</td>
            <td><strong>{{ m.concepto }}</strong></td>
            <td><span class="tag">{{ m.categoria }}</span></td>
            <td>{{ m.metodo_pago }}</td>
            <td class="text-right monto-celda">
              {{ m.tipo === 'egreso' ? '-' : '+' }} $ {{ formatMonto(m.monto) }}
            </td>
          </tr>
          <tr v-if="movimientos.length === 0">
            <td colspan="5" class="text-center">No hay movimientos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modalAbierto" class="modal-overlay">
      <div class="modal-content card-glass">
        <div class="header-modal">
          <h3>{{ nuevoMov.tipo === 'ingreso' ? '🟢 Nuevo Ingreso' : '🔴 Nuevo Egreso' }}</h3>
          <button @click="cerrarModal" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="confirmarMovimiento" class="form-modal">
          <div class="form-group">
            <label>Concepto / Descripción</label>
            <input v-model="nuevoMov.concepto" type="text" placeholder="Ej: Venta de materiales" required />
          </div>

          <div class="grid-form">
            <div class="form-group">
              <label>Monto ($)</label>
              <input v-model.number="nuevoMov.monto" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Método de Pago</label>
              <select v-model="nuevoMov.metodo_pago" required>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Tarjeta">💳 Tarjeta</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Categoría</label>
            <select v-model="nuevoMov.categoria">
              <option value="Ventas">Ventas</option>
              <option value="Servicios">Servicios IT</option>
              <option value="Gastos Fijos">Gastos Fijos</option>
              <option value="Insumos">Compra de Insumos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <footer class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" :disabled="guardando" class="btn-primary">
              {{ guardando ? 'Guardando...' : 'Confirmar' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { guardarMovimiento, getMovimientosCaja } from '@/services/data';

const movimientos = ref([]);
const modalAbierto = ref(false);
const guardando = ref(false);
const nuevoMov = ref({
  tipo: 'ingreso',
  monto: 0,
  concepto: '',
  metodo_pago: 'Efectivo',
  categoria: 'Ventas'
});

const cargarDatos = async () => {
  try {
    const data = await getMovimientosCaja();
    movimientos.value = data;
    // 🔍 ESTO NOS DIRÁ QUÉ HAY EN LA BASE DE DATOS REALMENTE
    console.log("DATOS RECUPERADOS:", data);
  } catch (error) {
    console.error("Error al cargar caja:", error);
  }
};

// CÁLCULOS DE TOTALES (Versión "Tolerante" a datos viejos)
const totalEfectivo = computed(() => {
  return movimientos.value
    .filter(m => {
      // 🕵️ Detectamos la columna real. Si no hay nada, asumimos 'efectivo'
      const met = (m.metodo || m.metodo_pago || m.forma_pago || "efectivo").toLowerCase();
      return met === 'efectivo';
    })
    .reduce((acc, m) => {
      const valor = Number(m.monto) || 0;
      return m.tipo.toLowerCase() === 'ingreso' ? acc + valor : acc - valor;
    }, 0);
});

const totalBanco = computed(() => {
  return movimientos.value
    .filter(m => {
      const met = (m.metodo || m.metodo_pago || m.forma_pago || "").toLowerCase();
      return met === 'transferencia' || met === 'tarjeta';
    })
    .reduce((acc, m) => {
      const valor = Number(m.monto) || 0;
      return m.tipo.toLowerCase() === 'ingreso' ? acc + valor : acc - valor;
    }, 0);
});
const balanceTotal = computed(() => totalEfectivo.value + totalBanco.value);

const abrirModal = (tipo) => {
  nuevoMov.value = {
    tipo: tipo,
    monto: null,
    concepto: '',
    metodo_pago: 'Efectivo',
    categoria: tipo === 'ingreso' ? 'Ventas' : 'Gastos Fijos'
  };
  modalAbierto.value = true;
};

const cerrarModal = () => modalAbierto.value = false;

const confirmarMovimiento = async () => {
  if (!nuevoMov.value.monto || nuevoMov.value.monto <= 0) return alert("Monto inválido");
  try {
    guardando.value = true;
    await guardarMovimiento(nuevoMov.value);
    await cargarDatos(); 
    cerrarModal();
  } catch (error) {
    alert("Error al guardar");
  } finally {
    guardando.value = false;
  }
};

const formatMonto = (valor) => {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2 });
};

onMounted(cargarDatos);
</script>

<style scoped>
.page-container { padding: 20px; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }

.grid-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.card-kpi {
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-left: 5px solid #ddd;
}
.efectivo { border-left-color: #10b981; }
.banco { border-left-color: #3b82f6; }
.total { border-left-color: #1e293b; }
.total.negativo { border-left-color: #ef4444; }

.label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; }
.monto { font-size: 24px; margin-top: 5px; }

.minimal-table { width: 100%; border-collapse: collapse; }
.minimal-table th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; }
.minimal-table td { padding: 12px; border-bottom: 1px solid #eee; }

.ingreso .monto-celda { color: #10b981; font-weight: bold; }
.egreso .monto-celda { color: #ef4444; font-weight: bold; }

.tag { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
.text-right { text-align: right; }
.text-center { text-align: center; padding: 20px; color: #999; }
.mt-20 { margin-top: 20px; }

.btn-ingreso { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-egreso { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-left: 10px; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content { width: 95%; max-width: 500px; background: white; padding: 25px; border-radius: 12px; }
.header-modal { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-close { background: none; border: none; font-size: 20px; cursor: pointer; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-primary { background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #666; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>
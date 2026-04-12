<template>
  <div class="page-container">
    <header class="header-section">
      <h2>💰 Control de Caja</h2>
      <div class="actions">
        <button @click="abrirModal('ingreso')" class="btn-ingreso">+ Nuevo Ingreso</button>
        <button @click="abrirModal('egreso')" class="btn-egreso">- Nuevo Egreso</button>
      </div>
    </header>

    <div class="filter-bar card-glass">
      <button @click="setFiltro('hoy')" :class="{ active: filtroActivo === 'hoy' }">Hoy</button>
      <button @click="setFiltro('semana')" :class="{ active: filtroActivo === 'semana' }">Esta Semana</button>
      <button @click="setFiltro('mes')" :class="{ active: filtroActivo === 'mes' }">Este Mes</button>
      <button @click="setFiltro('todos')" :class="{ active: filtroActivo === 'todos' }">Todos</button>
    </div>

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
          <tr v-for="m in movimientosFiltrados" :key="m.id" :class="m.tipo">
            <td>{{ new Date(m.fecha).toLocaleDateString() }}</td>
            <td><strong>{{ m.concepto }}</strong></td>
            <td><span class="tag">{{ m.categoria }}</span></td>
            <td>{{ m.metodo || m.metodo_pago || 'Efectivo' }}</td>
            <td class="text-right monto-celda">
              {{ m.tipo === 'egreso' ? '-' : '+' }} $ {{ formatMonto(m.monto) }}
            </td>
          </tr>
          <tr v-if="movimientosFiltrados.length === 0">
            <td colspan="5" class="text-center">No hay movimientos en este período.</td>
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

// --- ESTADOS ---
const movimientos = ref([]);
const modalAbierto = ref(false);
const guardando = ref(false);
const filtroActivo = ref('hoy');

const nuevoMov = ref({
  tipo: 'ingreso',
  monto: 0,
  concepto: '',
  metodo_pago: 'Efectivo',
  categoria: 'Ventas'
});

// --- CARGA DE DATOS ---
const cargarDatos = async () => {
  try {
    const data = await getMovimientosCaja();
    movimientos.value = data || [];
    console.log("Datos de caja actualizados:", data);
  } catch (error) {
    console.error("Error al cargar caja:", error);
  }
};

// --- FILTRADO ---
const setFiltro = (tipo) => {
  filtroActivo.value = tipo;
};

const movimientosFiltrados = computed(() => {
  const ahora = new Date();
  const inicioHoy = new Date(ahora.setHours(0, 0, 0, 0));
  
  return movimientos.value.filter(m => {
    const fechaM = new Date(m.fecha);
    if (filtroActivo.value === 'hoy') {
      return fechaM >= inicioHoy;
    } else if (filtroActivo.value === 'semana') {
      const sieteDiasAtras = new Date();
      sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
      return fechaM >= sieteDiasAtras;
    } else if (filtroActivo.value === 'mes') {
      return fechaM.getMonth() === ahora.getMonth() && 
             fechaM.getFullYear() === ahora.getFullYear();
    }
    return true; // 'todos'
  });
});

// --- CÁLCULOS (Usan los movimientos filtrados) ---
const totalEfectivo = computed(() => {
  return movimientosFiltrados.value
    .filter(m => {
      const met = (m.metodo || m.metodo_pago || m.forma_pago || "efectivo").toLowerCase();
      return met === 'efectivo';
    })
    .reduce((acc, m) => {
      const valor = Number(m.monto) || 0;
      return m.tipo.toLowerCase() === 'ingreso' ? acc + valor : acc - valor;
    }, 0);
});

const totalBanco = computed(() => {
  return movimientosFiltrados.value
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

// --- ACCIONES ---
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

const cerrarModal = () => (modalAbierto.value = false);

const confirmarMovimiento = async () => {
  if (!nuevoMov.value.monto || nuevoMov.value.monto <= 0) return alert("Monto inválido");
  try {
    guardando.value = true;
    await guardarMovimiento(nuevoMov.value);
    await cargarDatos(); 
    cerrarModal();
  } catch (error) {
    console.error(error);
    alert("Error al guardar el movimiento");
  } finally {
    guardando.value = false;
  }
};

const formatMonto = (valor) => {
  return Number(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(cargarDatos);
</script>

<style scoped>
.page-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }

.filter-bar {
  display: flex; gap: 10px; padding: 12px; margin-bottom: 25px;
  justify-content: center; background: #ffffff; border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.filter-bar button {
  padding: 8px 18px; border: 1px solid #e2e8f0; background: white;
  border-radius: 20px; cursor: pointer; font-size: 13px;
  transition: all 0.2s; color: #64748b;
}

.filter-bar button.active {
  background: #1e293b; color: white; border-color: #1e293b;
}

.grid-resumen {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px; margin-bottom: 25px;
}

.card-kpi {
  padding: 20px; border-radius: 12px; background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 5px solid #ddd;
}
.efectivo { border-left-color: #10b981; }
.banco { border-left-color: #3b82f6; }
.total { border-left-color: #1e293b; }
.total.negativo { border-left-color: #ef4444; }

.label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
.monto { font-size: 26px; margin-top: 5px; font-weight: 600; color: #1e293b; }

.minimal-table { width: 100%; border-collapse: collapse; background: white; }
.minimal-table th { text-align: left; padding: 15px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 13px; }
.minimal-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

.ingreso .monto-celda { color: #10b981; font-weight: bold; }
.egreso .monto-celda { color: #ef4444; font-weight: bold; }

.tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #475569; }
.text-right { text-align: right; }
.text-center { text-align: center; padding: 40px; color: #94a3b8; }
.mt-20 { margin-top: 20px; }

.btn-ingreso { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
.btn-egreso { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-left: 10px; transition: opacity 0.2s; }
.btn-ingreso:hover, .btn-egreso:hover { opacity: 0.9; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content { width: 90%; max-width: 500px; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.header-modal { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #1e293b; }
.form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
.form-group input:focus { outline: 2px solid #3b82f6; border-color: transparent; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
.btn-primary { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>
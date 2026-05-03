<template>
  <div class="page">
    <div class="header-main">
      <button @click="volver" class="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver al Listado
      </button>
      <div class="acciones-header" v-if="!isNuevo">
        <button @click="enviarWhatsApp" class="btn-whatsapp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>

    <div class="grid-layout">
      <!-- LEFT COLUMN: Client Data + Balance + Abonos -->
      <div class="col-datos">
        <div class="card-glass">
          <h2 class="title-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Datos del Cliente
          </h2>
          <form @submit.prevent="guardar">
            <div class="field">
              <label>Nombre o Razón Social</label>
              <input v-model="cliente.nombre" required />
            </div>
            <div class="grid-2">
              <div class="field">
                <label>DNI / CUIT</label>
                <input v-model="cliente.nro_documento" />
              </div>
              <div class="field">
                <label>Teléfono</label>
                <input v-model="cliente.telefono" />
              </div>
            </div>
            <button type="submit" class="cs-btn cs-btn-primary" style="width:100%; margin-top:16px;" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Confirmar Datos" }}
            </button>
          </form>
        </div>

        <template v-if="idClienteValido">
          <!-- BALANCE CARD -->
          <div class="balance-card" :class="saldoTotal > 0 ? 'balance-deuda' : 'balance-favor'">
            <div class="balance-header">
              <span class="balance-label">Estado de Cuenta</span>
              <span class="balance-status" :class="saldoTotal > 0 ? 'status-pill error' : 'status-pill success'">
                {{ saldoTotal > 0 ? 'DEUDOR' : 'AL DÍA' }}
              </span>
            </div>
            <h3 class="balance-amount">${{ Math.abs(saldoTotal).toLocaleString() }}</h3>
            <div class="balance-breakdown">
              <div class="bb-item">
                <span>Facturado</span>
                <span class="font-mono">${{ totalFacturado.toLocaleString() }}</span>
              </div>
              <div class="bb-item">
                <span>Pagos + Cheques</span>
                <span class="font-mono txt-green">-${{ totalPagado.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- CHEQUES SECTION -->
          <div class="card-glass cheques-section" v-if="chequesCliente.length > 0">
            <h2 class="title-card">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Cheques Vinculados
              <span class="cheques-count">{{ chequesCliente.length }}</span>
            </h2>
            <div class="cheques-list">
              <div v-for="ch in chequesCliente" :key="ch.id" class="cheque-item">
                <div class="cheque-left">
                  <span class="cheque-estado" :class="'estado-' + (ch.estado || 'CARTERA').toLowerCase()">
                    {{ ch.estado || 'CARTERA' }}
                  </span>
                  <div class="cheque-info">
                    <strong>#{{ ch.numero }} — {{ ch.banco }}</strong>
                    <span>Vence: {{ ch.fecha_vencimiento ? new Date(ch.fecha_vencimiento).toLocaleDateString() : 'S/F' }}</span>
                  </div>
                </div>
                <span class="cheque-monto font-mono">${{ Number(ch.monto).toLocaleString() }}</span>
              </div>
            </div>
            <div class="cheques-total">
              <span>Total en cheques</span>
              <strong class="font-mono">${{ totalCheques.toLocaleString() }}</strong>
            </div>
          </div>

          <div style="margin-top: 20px;">
            <GestionAbonos :clienteId="route.params.id" />
          </div>
        </template>
      </div>

      <!-- RIGHT COLUMN: Timeline de Movimientos -->
      <div class="col-historial" v-if="idClienteValido">
        <div class="card-glass">
          <h2 class="title-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Movimientos
          </h2>

          <!-- Timeline -->
          <div class="timeline">
            <div v-for="(m, index) in movimientos" :key="index" class="timeline-item">
              <div class="timeline-dot" :class="m.clase"></div>
              <div class="timeline-content">
                <div class="timeline-top">
                  <span class="tipo-tag" :class="m.clase">{{ m.tipo }}</span>
                  <span class="timeline-date">{{ new Date(m.fecha).toLocaleDateString() }}</span>
                </div>
                <p class="timeline-detail">{{ m.detalle }}</p>
                <span class="timeline-monto font-mono" :class="m.impacto === '+' ? 'txt-red' : 'txt-green'">
                  {{ m.impacto }}${{ m.monto.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="movimientos.length === 0" class="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <p>Sin movimientos registrados.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/supabase";
import { getClienteById, saveCliente } from "@/services/data";
import GestionAbonos from "@/components/GestionAbonos.vue";

const route = useRoute();
const router = useRouter();
const guardando = ref(false);
const movimientos = ref([]);
const chequesCliente = ref([]);
const cliente = ref({ nombre: "", email: "", telefono: "", nro_documento: "" });

const isNuevo = computed(() => route.params.id === "nuevo");
const idClienteValido = computed(() => {
  const id = route.params.id;
  return id && id !== 'nuevo' && id !== 'undefined' && id.length > 10; 
});

const totalFacturado = computed(() => {
  return movimientos.value.filter(m => m.impacto === '+').reduce((acc, m) => acc + m.monto, 0);
});

const totalPagado = computed(() => {
  return movimientos.value.filter(m => m.impacto === '-').reduce((acc, m) => acc + m.monto, 0);
});

const totalCheques = computed(() => {
  return chequesCliente.value.reduce((acc, c) => acc + Number(c.monto || 0), 0);
});

const saldoTotal = computed(() => {
  return totalFacturado.value - totalPagado.value;
});

onMounted(async () => {
  if (!idClienteValido.value) return;

  const id = route.params.id; 
  
  try {
    const data = await getClienteById(id);
    if (data) cliente.value = data;

    const [f, p, n] = await Promise.all([
      supabase.from('facturas').select('*').eq('cliente_id', id),
      supabase.from('pagos_cuentas').select('*').eq('cliente_id', id),
      supabase.from('notas').select('*').eq('cliente_id', id)
    ]);

    // Load cheques linked to this client by name
    if (cliente.value.nombre) {
      const { data: cheqData } = await supabase
        .from('cheques')
        .select('*')
        .ilike('emisor', `%${cliente.value.nombre}%`);
      chequesCliente.value = cheqData || [];
    }

    const raw = [
      ...(f.data || []).map(i => ({ fecha: i.fecha, tipo: 'FAC', detalle: `Factura #${i.id.toString().slice(-5)}`, monto: i.total, impacto: '+', clase: 'fac' })),
      ...(p.data || []).map(i => ({ fecha: i.fecha, tipo: 'REC', detalle: `Recibo ${i.metodo_pago || ''}`, monto: i.monto, impacto: '-', clase: 'rec' })),
      ...(n.data || []).map(i => ({ 
        fecha: i.fecha, tipo: i.tipo_comprobante, 
        detalle: i.motivo || 'Ajuste', monto: i.monto, 
        impacto: i.tipo_comprobante === 'NC' ? '-' : '+', clase: 'nota' 
      })),
      // Add cheques as movements too
      ...chequesCliente.value.map(c => ({
        fecha: c.fecha_recepcion || c.created_at,
        tipo: 'CHQ',
        detalle: `Cheque #${c.numero} (${c.banco}) - ${c.estado || 'CARTERA'}`,
        monto: Number(c.monto),
        impacto: '-',
        clase: 'cheque'
      }))
    ];
    movimientos.value = raw.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
  } catch (err) {
    console.error("Error en la carga:", err);
  }
});

// FUNCIÓN PARA ENVIAR ESTADO DE CUENTA POR WHATSAPP
function enviarWhatsApp() {
  if (!cliente.value.telefono) return alert("El cliente no tiene teléfono.");
  
  const telefonoLimpio = cliente.value.telefono.replace(/\D/g, '');
  let msj = `*CONTASOFT - ESTADO DE CUENTA*%0A`;
  msj += `👤 *Cliente:* ${cliente.value.nombre}%0A`;
  msj += `💰 *Saldo Actual:* $${saldoTotal.value.toLocaleString()}%0A`;
  if (chequesCliente.value.length > 0) {
    msj += `🎫 *Cheques en cartera:* ${chequesCliente.value.length} ($${totalCheques.value.toLocaleString()})%0A`;
  }
  msj += `--------------------------%0A`;
  msj += `_Por favor, verifique sus movimientos pendientes._`;

  window.open(`https://wa.me/${telefonoLimpio}?text=${msj}`, '_blank');
}

async function guardar() {
  guardando.value = true;
  try {
    await saveCliente(cliente.value);
    alert("¡Cliente guardado!");
    router.push("/clientes");
  } catch (e) {
    alert("Error al guardar");
  } finally {
    guardando.value = false;
  }
}

function volver() { router.push("/clientes"); }
</script>

<style scoped>
.page { max-width: 1300px; margin: 0 auto; }

.header-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.btn-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--cs-text-muted); cursor: pointer; font-weight: 600; font-size: 0.85rem; padding: 8px 0; }
.btn-back:hover { color: var(--cs-text-primary); transform: none; }
.btn-whatsapp { background: #22c55e; color: white; border: none; padding: 8px 18px; border-radius: var(--cs-radius-md); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: all var(--cs-transition); }
.btn-whatsapp:hover { background: #16a34a; transform: translateY(-1px); }

.grid-layout { display: grid; grid-template-columns: 420px 1fr; gap: 24px; }

.title-card { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 800; margin-bottom: 20px; color: var(--cs-text-primary); }

.field { margin-bottom: 14px; }
.field label { display: block; font-size: 0.7rem; font-weight: 700; color: var(--cs-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* BALANCE CARD */
.balance-card {
  background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft);
  border-radius: var(--cs-radius-lg); padding: 20px; margin-top: 16px;
  box-shadow: var(--cs-shadow-sm);
}
.balance-deuda { border-top: 3px solid var(--cs-error); }
.balance-favor { border-top: 3px solid var(--cs-success); }
.balance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.balance-label { font-size: 0.75rem; font-weight: 700; color: var(--cs-text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
.balance-amount { font-size: 2rem; font-weight: 900; color: var(--cs-text-primary); font-family: var(--cs-font-mono); text-align: center; margin: 12px 0; }
.balance-breakdown { display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid var(--cs-border-soft); }
.bb-item { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--cs-text-secondary); }

/* CHEQUES SECTION */
.cheques-section { margin-top: 16px; border-top: 3px solid var(--cs-brand-500); }
.cheques-count { margin-left: auto; background: var(--cs-brand-100); color: var(--cs-brand-700); font-size: 0.65rem; padding: 2px 8px; border-radius: var(--cs-radius-full); font-weight: 800; }

.cheques-list { display: flex; flex-direction: column; gap: 8px; }
.cheque-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; background: var(--cs-bg-tertiary);
  border-radius: var(--cs-radius-md); border: 1px solid var(--cs-border-soft);
}
.cheque-left { display: flex; align-items: center; gap: 10px; }
.cheque-estado {
  font-size: 0.55rem; font-weight: 800; text-transform: uppercase;
  padding: 2px 8px; border-radius: var(--cs-radius-full); letter-spacing: 0.03em;
}
.estado-cartera { background: var(--cs-info-bg); color: var(--cs-info); }
.estado-depositado { background: var(--cs-warning-bg); color: var(--cs-warning-dark); }
.estado-cobrado { background: var(--cs-success-bg); color: var(--cs-success); }
.estado-rechazado { background: var(--cs-error-bg); color: var(--cs-error); }

.cheque-info { display: flex; flex-direction: column; }
.cheque-info strong { font-size: 0.8rem; color: var(--cs-text-primary); }
.cheque-info span { font-size: 0.7rem; color: var(--cs-text-muted); }
.cheque-monto { font-weight: 800; font-size: 0.9rem; color: var(--cs-brand-600); }

.cheques-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; margin-top: 10px; background: rgba(79,70,229,0.05);
  border-radius: var(--cs-radius-md); border: 1px dashed rgba(79,70,229,0.2);
  font-size: 0.8rem; color: var(--cs-text-secondary);
}
.cheques-total strong { color: var(--cs-brand-600); font-size: 0.95rem; }

/* TIMELINE */
.timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
.timeline::before {
  content: ''; position: absolute; left: 11px; top: 6px; bottom: 6px;
  width: 2px; background: var(--cs-border-soft);
}

.timeline-item { display: flex; gap: 16px; padding: 12px 0; position: relative; }
.timeline-dot {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; border: 3px solid var(--cs-bg-primary);
}
.timeline-dot.fac { background: var(--cs-info); }
.timeline-dot.rec { background: var(--cs-success); }
.timeline-dot.nota { background: var(--cs-warning); }
.timeline-dot.cheque { background: var(--cs-brand-500); }

.timeline-content { flex: 1; min-width: 0; }
.timeline-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.timeline-date { font-size: 0.7rem; color: var(--cs-text-muted); }
.timeline-detail { font-size: 0.82rem; color: var(--cs-text-secondary); margin-bottom: 4px; }
.timeline-monto { font-weight: 900; font-size: 0.9rem; }

.tipo-tag { padding: 2px 8px; border-radius: var(--cs-radius-full); font-size: 0.6rem; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.03em; }
.fac { background: var(--cs-info); }
.rec { background: var(--cs-success); }
.nota { background: var(--cs-warning); }
.cheque { background: var(--cs-brand-500); }

.txt-red { color: var(--cs-error); }
.txt-green { color: var(--cs-success); }

.empty-state { text-align: center; padding: 40px 20px; }
.empty-state p { margin-top: 10px; color: var(--cs-text-muted); font-size: 0.85rem; }

@media (max-width: 1000px) { .grid-layout { grid-template-columns: 1fr; } }
</style>
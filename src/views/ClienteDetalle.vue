<template>
  <div class="page">
    <div class="header-main">
      <button @click="volver" class="btn-back">← Volver al Listado</button>
      <div class="acciones-header" v-if="!isNuevo">
        <button @click="enviarWhatsApp" class="btn-whatsapp">💬 WhatsApp</button>
      </div>
    </div>

    <div class="grid-layout">
      <div class="col-datos">
        <div class="card-glass">
          <h2 class="title-card">Datos del Cliente</h2>
          <form @submit.prevent="guardar">
            <div class="field">
              <label>Nombre o Razón Social</label>
              <input v-model="cliente.nombre" required class="search-input-alt" />
            </div>
            <div class="grid-2">
              <div class="field">
                <label>DNI / CUIT</label>
                <input v-model="cliente.nro_documento" class="search-input-alt" />
              </div>
              <div class="field">
                <label>Teléfono</label>
                <input v-model="cliente.telefono" class="search-input-alt" />
              </div>
            </div>
            <div class="actions" style="margin-top: 20px;">
              <button type="submit" class="btn-primary" :disabled="guardando">
                {{ guardando ? "Guardando..." : "Confirmar Datos" }}
              </button>
            </div>
          </form>
        </div>

        <template v-if="idClienteValido">
          <div class="card-glass saldo-box" :class="saldoTotal > 0 ? 'deuda' : 'favor'">
            <p>Estado de Cuenta Actual</p>
            <h3 class="font-mono">${{ saldoTotal.toLocaleString() }}</h3>
          </div>

          <div style="margin-top: 20px;">
            <GestionAbonos :clienteId="route.params.id" />
          </div>
        </template>
      </div>

      <div class="col-historial" v-if="idClienteValido">
        <div class="card-glass">
          <h2 class="title-card">Movimientos Asociados</h2>
          <table class="table-moderna-lite">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, index) in movimientos" :key="index">
                <td style="font-size: 0.8rem;">{{ new Date(m.fecha).toLocaleDateString() }}</td>
                <td><span :class="['tipo-tag', m.clase]">{{ m.tipo }}</span></td>
                <td style="font-size: 0.85rem;">{{ m.detalle }}</td>
                <td :class="['font-black', m.impacto === '+' ? 'txt-red' : 'txt-green']" style="text-align: right;">
                  {{ m.impacto }}${{ m.monto.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="movimientos.length === 0" style="text-align: center; padding: 20px; color: #94a3b8;">
            Sin movimientos registrados.
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
const cliente = ref({ nombre: "", email: "", telefono: "", nro_documento: "" });

const isNuevo = computed(() => route.params.id === "nuevo");
const idClienteValido = computed(() => {
  const id = route.params.id;
  return id && id !== 'nuevo' && id !== 'undefined' && id.length > 10; 
});

const saldoTotal = computed(() => {
  return movimientos.value.reduce((acc, m) => m.impacto === '+' ? acc + m.monto : acc - m.monto, 0);
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

    const raw = [
      ...(f.data || []).map(i => ({ fecha: i.fecha, tipo: 'FAC', detalle: `Factura #${i.id.toString().slice(-5)}`, monto: i.total, impacto: '+', clase: 'fac' })),
      ...(p.data || []).map(i => ({ fecha: i.fecha, tipo: 'REC', detalle: `Recibo ${i.metodo_pago || ''}`, monto: i.monto, impacto: '-', clase: 'rec' })),
      ...(n.data || []).map(i => ({ 
        fecha: i.fecha, tipo: i.tipo_comprobante, 
        detalle: i.motivo || 'Ajuste', monto: i.monto, 
        impacto: i.tipo_comprobante === 'NC' ? '-' : '+', clase: 'nota' 
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
  let msj = `*JD SISTEMAS - ESTADO DE CUENTA*%0A`;
  msj += `👤 *Cliente:* ${cliente.value.nombre}%0A`;
  msj += `💰 *Saldo Actual:* $${saldoTotal.value.toLocaleString()}%0A`;
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
/* (Tus estilos se mantienen iguales) */
.page { padding: 25px; max-width: 1300px; margin: 0 auto; font-family: 'Inter', sans-serif; }
.header-main { display: flex; justify-content: space-between; margin-bottom: 25px; }
.grid-layout { display: grid; grid-template-columns: 420px 1fr; gap: 25px; }
.card-glass { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
.title-card { font-size: 1.2rem; font-weight: 900; margin-bottom: 20px; color: #0f172a; }
.field { margin-bottom: 15px; }
.field label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
.search-input-alt { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: 0.3s; font-size: 0.9rem; }
.search-input-alt:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.table-moderna-lite { width: 100%; border-collapse: collapse; }
.table-moderna-lite th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; }
.table-moderna-lite td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; }
.txt-red { color: #dc2626; }
.txt-green { color: #16a34a; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.tipo-tag { padding: 4px 8px; border-radius: 8px; font-size: 0.65rem; font-weight: 900; color: white; text-transform: uppercase; }
.fac { background: #3b82f6; }
.rec { background: #10b981; }
.nota { background: #f59e0b; }
.saldo-box { margin-top: 20px; text-align: center; }
.saldo-box.deuda { border-top: 4px solid #ef4444; }
.saldo-box.favor { border-top: 4px solid #10b981; }
.saldo-box h3 { font-size: 2.2rem; margin: 10px 0; font-weight: 900; }
.btn-primary { background: #2563eb; color: white; border: none; width: 100%; padding: 14px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }
.btn-whatsapp { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.btn-back { background: none; border: none; color: #64748b; cursor: pointer; font-weight: 700; }
@media (max-width: 1000px) { .grid-layout { grid-template-columns: 1fr; } }
</style>
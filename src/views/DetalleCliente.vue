<template>
  <div class="page">
    <div class="header-main">
      <button @click="volver" class="btn-back">← Volver al Listado</button>
      <div class="acciones-header" v-if="!isNuevo">
        <button @click="enviarWhatsApp" class="btn-whatsapp">
          <span>💬</span> WhatsApp
        </button>
      </div>
    </div>

    <div class="grid-layout">
      <div class="col-datos">
        <div class="card-glass shadow">
          <h2 class="title-card">Ficha del Cliente</h2>
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

            <div class="field">
              <label>Límite de Crédito ($)</label>
              <input v-model.number="cliente.limite_credito" type="number" placeholder="0 = Sin límite" />
            </div>
	<div class="field">
  <label>Correo Electrónico</label>
  <input v-model="cliente.email" type="email" placeholder="ejemplo@correo.com" />
</div>

<div class="field">
  <label>Dirección Física / Técnica</label>
  <input v-model="cliente.direccion" placeholder="Calle, Ciudad, Provincia" />
</div>

<div v-if="cargandoDatos" class="loading-overlay">
  <p>Sincronizando con JD Sistemas...</p>
</div>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Actualizar Información" }}
            </button>
          </form>
        </div>

        <div class="card-glass saldo-box" v-if="!isNuevo" :class="saldoTotal > 0 ? 'deuda' : 'favor'">
          <p>Saldo en Cuenta Corriente</p>
          <h3>${{ saldoTotal.toLocaleString() }}</h3>
          
          <div v-if="cliente.limite_credito > 0" class="limit-container">
            <div class="limit-bar">
              <div class="limit-fill" :style="{ width: porcentajeCredito + '%', background: porcentajeCredito > 90 ? '#ef4444' : '#3b82f6' }"></div>
            </div>
            <small>{{ porcentajeCredito }}% del crédito utilizado</small>
          </div>
          
          <span class="status-pill" :class="{ 'alerta': saldoTotal > cliente.limite_credito && cliente.limite_credito > 0 }">
            {{ saldoTotal > cliente.limite_credito && cliente.limite_credito > 0 ? 'EXCEDIDO DE CRÉDITO' : (saldoTotal > 0 ? 'PENDIENTE' : 'AL DÍA') }}
          </span>
        </div>

        <div class="acciones-rapidas" v-if="!isNuevo">
          <button @click="router.push('/facturar?cliente=' + cliente.id)" class="btn-sec">Nueva Factura</button>
          <button @click="router.push('/remitos/nuevo?cliente=' + cliente.id)" class="btn-sec">Nuevo Remito</button>
        </div>
      </div>

      <div class="col-historial" v-if="!isNuevo">
        <div class="card-glass historial-card shadow">
          <div class="historial-header">
            <h2>Movimientos de Cuenta</h2>
            <div class="filtros">
               <span class="badge fac">FAC</span>
               <span class="badge rec">REC</span>
               <span class="badge nota">NOT</span>
               <span class="badge rem">REM</span>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in movimientos" :key="m.id">
                  <td>{{ new Date(m.fecha).toLocaleDateString('es-AR') }}</td>
                  <td><span class="tipo-tag" :class="m.clase">{{ m.tipo }}</span></td>
                  <td class="detalle-text">{{ m.detalle }}</td>
                  <td class="text-right" :class="m.colorClass">
                    {{ m.prefijo }}{{ m.monto > 0 ? '$' + m.monto.toLocaleString() : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
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

const route = useRoute();
const router = useRouter();

// ESTADOS
const guardando = ref(false);
const cargandoDatos = ref(false); // <--- NUEVO: Feedback visual
const movimientos = ref([]);
const cliente = ref({ 
  nombre: "", 
  email: "", 
  telefono: "", 
  nro_documento: "", 
  limite_credito: 0,
  direccion: "" // <--- NUEVO: Campo necesario
});

const isNuevo = computed(() => route.params.id === "nuevo");
const idValido = computed(() => route.params.id && route.params.id !== "nuevo" && route.params.id !== "undefined");

// LÓGICA DE NEGOCIO
const saldoTotal = computed(() => {
  return movimientos.value.reduce((acc, m) => {
    const monto = Number(m.monto) || 0;
    return m.impacto === '+' ? acc + monto : (m.impacto === '-' ? acc - monto : acc);
  }, 0);
});

// CARGA DE DATOS PROFESIONAL
onMounted(async () => {
  if (!idValido.value) return;

  cargandoDatos.value = true;
  const id = route.params.id;
  
  try {
    // Ejecutamos todo en paralelo para máxima velocidad
    const [resCliente, f, p, n, r] = await Promise.all([
      getClienteById(id),
      supabase.from('facturas').select('*').eq('cliente_id', id),
      supabase.from('pagos_cuentas').select('*').eq('cliente_id', id),
      supabase.from('notas').select('*').eq('cliente_id', id),
      supabase.from('remitos').select('*').eq('cliente_id', id)
    ]);

    if (resCliente) cliente.value = resCliente;

    // Mapeo limpio de movimientos
    const raw = [
      ...(f.data || []).map(i => ({ ...i, tipo: 'FAC', detalle: `Factura #${i.numero}`, impacto: '+', clase: 'fac', colorClass: 'txt-red', prefijo: '+' })),
      ...(p.data || []).map(i => ({ ...i, tipo: 'REC', detalle: `Pago Recibido`, impacto: '-', clase: 'rec', colorClass: 'txt-green', prefijo: '-' })),
      ...(n.data || []).map(i => ({ 
        ...i, 
        tipo: i.tipo_comprobante, 
        detalle: i.motivo || 'Nota de crédito/débito', 
        impacto: i.tipo_comprobante === 'NC' ? '-' : '+', 
        clase: 'nota', 
        colorClass: i.tipo_comprobante === 'NC' ? 'txt-green' : 'txt-red', 
        prefijo: i.tipo_comprobante === 'NC' ? '-' : '+' 
      })),
      ...(r.data || []).map(i => ({ ...i, tipo: 'REM', detalle: `Remito #${i.numero || ''}`, monto: 0, impacto: '0', clase: 'rem', colorClass: '', prefijo: '' }))
    ];

    movimientos.value = raw.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (err) {
    console.error("❌ JD Sistemas Error:", err);
  } finally {
    cargandoDatos.value = false;
  }
});

async function guardar() {
  if (!cliente.value.nombre) return alert("El nombre es obligatorio");
  
  guardando.value = true;
  try {
    await saveCliente(cliente.value);
    // Un toque más profesional: un toast o mensaje sutil
    alert("✅ Ficha actualizada correctamente");
    if (isNuevo.value) router.push('/clientes');
  } catch (error) {
    alert("❌ Error al conectar con el servidor");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
/* Estilos anteriores + Mejoras de barra de crédito */
.limit-container { margin: 15px 0; }
.limit-bar { height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 5px; }
.limit-fill { height: 100%; transition: width 0.5s ease; }
.status-pill.alerta { background: #fee2e2; color: #ef4444; border: 1px solid #ef4444; }

.page { padding: 30px; max-width: 1300px; margin: 0 auto; color: #334155; }
.grid-layout { display: grid; grid-template-columns: 380px 1fr; gap: 30px; }
.card-glass { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 25px; }
.title-card { font-size: 1.1rem; border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 20px; }
.field { display: flex; flex-direction: column; margin-bottom: 15px; }
label { font-size: 0.75rem; font-weight: bold; color: #94a3b8; margin-bottom: 5px; }
input { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; }
.btn-primary { background: #2563eb; color: white; border: none; width: 100%; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; }
.btn-sec { background: #f8fafc; border: 1px solid #e2e8f0; width: 100%; padding: 10px; border-radius: 10px; margin-top: 10px; cursor: pointer; }
.tipo-tag { padding: 3px 8px; border-radius: 5px; font-size: 0.7rem; color: white; font-weight: bold; }
.fac { background: #3b82f6; } .rec { background: #10b981; } .nota { background: #f59e0b; } .rem { background: #64748b; }
.txt-red { color: #ef4444; font-weight: bold; } .txt-green { color: #10b981; font-weight: bold; }
.text-right { text-align: right; }
table { width: 100%; border-collapse: collapse; }
td, th { padding: 12px; border-bottom: 1px solid #f1f5f9; }
</style>
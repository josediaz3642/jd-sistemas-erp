<template>
  <div class="card-glass abonos-section">
    <div class="inventory-header">
      <div>
        <h2 class="title-card">Abonos Mensuales</h2>
        <p class="subtitle">Servicios recurrentes IT</p>
      </div>
      <button class="btn-add-sm" @click="mostrarForm = !mostrarForm">
        {{ mostrarForm ? '×' : '+' }}
      </button>
    </div>

    <div v-if="mostrarForm" class="form-abono-fast">
      <input v-model="nuevo.servicio" type="text" placeholder="Servicio (ej: Hosting)" class="search-input-alt" />
      <div class="grid-2" style="margin-top:10px">
        <input v-model.number="nuevo.monto" type="number" placeholder="Monto $" class="search-input-alt" />
        <input v-model.number="nuevo.dia_vencimiento" type="number" placeholder="Día" class="search-input-alt" />
      </div>
      <button class="btn-primary" @click="guardarAbono" style="margin-top:10px; padding: 8px;">Guardar</button>
    </div>

    <table class="table-moderna-lite">
      <thead>
        <tr>
          <th>Servicio</th>
          <th class="text-right">Monto</th>
          <th class="text-right">Día</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in abonos" :key="a.id">
          <td class="font-black" style="font-size: 0.85rem;">{{ a.servicio }}</td>
          <td class="text-right font-mono txt-green">${{ a.monto.toLocaleString() }}</td>
          <td class="text-right" style="color: #94a3b8">#{{ a.dia_vencimiento }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="abonos.length === 0 && !loading" class="empty">Sin abonos activos.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from "@/supabase";

const props = defineProps(['clienteId']);
const abonos = ref([]);
const loading = ref(true);
const mostrarForm = ref(false);
const nuevo = ref({ servicio: '', monto: '', dia_vencimiento: 10 });

// Dentro de GestionAbonos.vue, modificá el cargarAbonos:

async function cargarAbonos() {
  // Si el ID es "nuevo" o no existe, no hacemos nada
  if (!props.clienteId || props.clienteId === 'nuevo') {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const { data } = await supabase
      .from('abonos')
      .select('*')
      .eq('cliente_id', props.clienteId);
    abonos.value = data || [];
  } catch (error) {
    console.error("Error abonos:", error);
  } finally {
    loading.value = false;
  }
}
async function guardarAbono() {
  if (!nuevo.value.servicio || !nuevo.value.monto) return;
  await supabase.from('abonos').insert([{ cliente_id: props.clienteId, ...nuevo.value }]);
  nuevo.value = { servicio: '', monto: '', dia_vencimiento: 10 };
  mostrarForm.value = false;
  cargarAbonos();
}

onMounted(cargarAbonos);
</script>

<style scoped>
.abonos-section { margin-top: 20px; border-top: 4px solid #3b82f6; }
.subtitle { color: #64748b; font-size: 0.75rem; margin-top: -15px; margin-bottom: 15px; font-weight: 700; text-transform: uppercase; }
.form-abono-fast { background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px dashed #e2e8f0; }
.btn-add-sm { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: bold; }
.empty { text-align: center; padding: 20px; font-size: 0.8rem; color: #94a3b8; }
/* Reutiliza tus clases globales de ClienteDetalle */
.title-card { font-size: 1.1rem; font-weight: 900; color: #0f172a; }
.font-black { font-weight: 900; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.txt-green { color: #16a34a; }
.text-right { text-align: right; }
</style>
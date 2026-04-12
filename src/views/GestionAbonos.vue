<template>
  <div class="card-glass">
    <div class="inventory-header">
      <div>
        <h2>Abonos Mensuales</h2>
        <p style="color: #64748b; font-size: 0.85rem;">Servicios recurrentes contratados por el cliente</p>
      </div>
      <button class="btn-primary" @click="mostrarForm = !mostrarForm">
        {{ mostrarForm ? 'Cancelar' : '+ Agregar Abono' }}
      </button>
    </div>

    <div v-if="mostrarForm" class="form-nuevo-abono">
      <div class="grid-inputs">
        <input v-model="nuevo.servicio" type="text" placeholder="Ej: Mantenimiento IT" class="search-input" />
        <input v-model.number="nuevo.monto" type="number" placeholder="Monto $" class="search-input" />
        <input v-model.number="nuevo.dia_vencimiento" type="number" placeholder="Día (1-28)" class="search-input" />
      </div>
      <button class="btn-primary" @click="guardarAbono" style="margin-top: 10px; width: 100%; justify-content: center;">
        Confirmar Alta de Abono
      </button>
    </div>

    <table class="table-moderna">
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Día Vence</th>
          <th class="text-right">Monto</th>
          <th class="text-center">Estado</th>
          <th class="text-right">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in abonos" :key="a.id">
          <td class="font-black">{{ a.servicio }}</td>
          <td>Día {{ a.dia_vencimiento }}</td>
          <td class="text-right font-mono font-black">$ {{ a.monto.toLocaleString() }}</td>
          <td class="text-center">
            <span class="status-pill" :class="a.activo ? 'success' : 'warn'">
              {{ a.activo ? 'ACTIVO' : 'PAUSADO' }}
            </span>
          </td>
          <td class="text-right">
            <button @click="eliminarAbono(a.id)" class="btn-delete">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="abonos.length === 0" class="loader">Este cliente no tiene servicios recurrentes.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from "@/supabase";

const props = defineProps(['clienteId']);
const abonos = ref([]);
const mostrarForm = ref(false);
const nuevo = ref({ servicio: '', monto: '', dia_vencimiento: 10 });

async function cargarAbonos() {
  const { data } = await supabase.from('abonos').select('*').eq('cliente_id', props.clienteId);
  abonos.value = data || [];
}

async function guardarAbono() {
  if (!nuevo.value.servicio || !nuevo.value.monto) return alert("Completa los datos");
  
  await supabase.from('abonos').insert([{
    cliente_id: props.clienteId,
    ...nuevo.value
  }]);
  
  nuevo.value = { servicio: '', monto: '', dia_vencimiento: 10 };
  mostrarForm.value = false;
  cargarAbonos();
}

async function eliminarAbono(id) {
  if (confirm("¿Eliminar este abono?")) {
    await supabase.from('abonos').delete().eq('id', id);
    cargarAbonos();
  }
}

onMounted(cargarAbonos);
</script>

<style scoped>
/* Reutilizamos tus clases y añadimos toques específicos */
.grid-inputs { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; }
.form-nuevo-abono { background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px dashed #cbd5e1; }
.btn-delete { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.6; }
.btn-delete:hover { opacity: 1; transform: scale(1.1); }
</style>
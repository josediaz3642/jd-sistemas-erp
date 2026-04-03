<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
      
      <div :class="tipo === 'ND' ? 'bg-blue-600' : 'bg-green-600'" class="p-5 text-white">
        <h3 class="text-xl font-bold">
          {{ tipo === 'ND' ? '➕ Nota de Débito' : '➖ Nota de Crédito' }}
        </h3>
        <p class="text-sm opacity-80 mt-1">Cliente: {{ clienteNombre }}</p>
      </div>

      <div class="p-6 bg-gray-50">
        <form @submit.prevent="guardarAjuste">
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Monto a ajustar ($)</label>
            <input 
              v-model.number="form.monto" 
              type="number" 
              step="0.01"
              required
              autofocus
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="0.00"
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Motivo del ajuste</label>
            <textarea 
              v-model="form.motivo" 
              required
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Ej: Recargo por flete, Descuento especial..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button 
              type="button" 
              @click="$emit('close')"
              class="px-5 py-2.5 text-gray-500 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="cargando"
              :class="tipo === 'ND' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'"
              class="px-6 py-2.5 text-white rounded-lg font-bold shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="cargando">Procesando...</span>
              <span v-else>Confirmar e Imprimir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
// Importación unificada desde data.js
import { saveNotaAjuste, imprimirComprobanteAjuste } from '@/services/data';

const props = defineProps({
  show: Boolean,
  clienteId: String,
  clienteNombre: String,
  tipo: String // 'NC' o 'ND'
});

const emit = defineEmits(['close', 'success']);

const cargando = ref(false);
const form = reactive({
  monto: null,
  motivo: ''
});

const guardarAjuste = async () => {
  if (form.monto <= 0) return alert("El monto debe ser mayor a cero");
  
  cargando.value = true;
  try {    
    // 1. Guardar en Supabase
    await saveNotaAjuste({
      clienteId: props.clienteId,
      tipo: props.tipo,
      monto: form.monto,
      motivo: form.motivo
    });
    
    // 2. Ejecutar impresión profesional (Logo JD Sistemasinformáticos)
    imprimirComprobanteAjuste({
      cliente: props.clienteNombre,
      tipo: props.tipo,
      monto: form.monto,
      motivo: form.motivo,
      fecha: new Date().toLocaleDateString()
    });

    // 3. Limpiar y cerrar
    form.monto = null;
    form.motivo = '';
    
    emit('success'); 
    emit('close');   
  } catch (error) {
    console.error("Error en operación:", error);
    alert("Error al registrar: " + error.message);
  } finally {
    cargando.value = false;
  }
};
</script>
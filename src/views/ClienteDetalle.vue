<template>
  <div class="page">
    <div class="card-glass shadow-lg p-6 bg-white rounded-xl">
      <button class="btn bg-gray-100 px-4 py-2 rounded mb-4 hover:bg-gray-200" @click="volver">← Volver</button>

      <div v-if="loading" class="text-center p-10">Cargando datos del cliente...</div>

      <div v-else-if="cliente">
        <h1 class="text-3xl font-bold text-blue-800">{{ cliente.nombre }}</h1>
        <p class="text-gray-500">{{ cliente.cuit || 'Sin CUIT' }} | {{ cliente.condicion_iva }}</p>

        <hr class="my-6" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="resumen-card bg-blue-50 p-4 rounded-lg">
            <h3 class="font-bold text-lg mb-2">Resumen Comercial</h3>
            <p><strong>Total Facturado:</strong> <span class="text-green-600 font-bold">${{ totalFacturado.toLocaleString() }}</span></p>
            <p><strong>Cantidad de Facturas:</strong> {{ facturasCliente.length }}</p>
          </div>
          
          <div class="flex items-center justify-center">
            <button class="btn-primary bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition" @click="nuevaFactura">
              + Nueva factura para este cliente
            </button>
          </div>
        </div>

        <hr class="my-6" />

        <h3 class="font-bold text-xl mb-4">Historial de Facturas</h3>

        <div class="overflow-x-auto">
          <table v-if="facturasCliente.length > 0" class="w-full text-left">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-3">Número</th>
                <th class="p-3">Fecha</th>
                <th class="p-3">Estado</th>
                <th class="p-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="f in facturasCliente" :key="f.id" class="border-b hover:bg-gray-50">
                <td class="p-3 font-mono">#{{ f.numero_factura || f.id.toString().slice(0,8) }}</td>
                <td class="p-3">{{ new Date(f.fecha).toLocaleDateString("es-AR") }}</td>
                <td class="p-3">
                   <span :class="f.estado === 'ANULADA' ? 'text-red-500' : 'text-green-500'">
                    {{ f.estado || 'Emitida' }}
                   </span>
                </td>
                <td class="p-3 text-right font-bold">${{ f.total.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-center py-10 text-gray-400">No hay facturas registradas en la nube para este cliente.</p>
        </div>
      </div>
      
      <div v-else class="text-center p-10 text-red-500">
        No se encontró el cliente solicitado.
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/supabase"; // Importación directa para mayor control de filtros

const route = useRoute();
const router = useRouter();

const cliente = ref(null);
const facturasCliente = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const clienteId = route.params.id;

    // 1. Traer datos del cliente
    const { data: dataCliente, error: errC } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (errC) throw errC;
    cliente.value = dataCliente;

    // 2. Traer facturas relacionadas a este cliente_id
    const { data: dataFacturas, error: errF } = await supabase
      .from('facturas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });

    if (errF) throw errF;
    facturasCliente.value = dataFacturas;

  } catch (error) {
    console.error("Error cargando detalle:", error.message);
  } finally {
    loading.value = false;
  }
});

const totalFacturado = computed(() =>
  facturasCliente.value
    .filter(f => f.estado !== 'ANULADA')
    .reduce((acc, f) => acc + Number(f.total), 0)
);

function volver() {
  router.push("/clientes");
}

function nuevaFactura() {
  router.push({
    path: "/facturacion",
    query: { clienteId: cliente.value.id, nombre: cliente.value.nombre }
  });
}
</script>
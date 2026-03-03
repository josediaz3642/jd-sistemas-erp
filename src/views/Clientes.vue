<template>
  <div class="page">
    <div class="card-glass header">
      <h1>Clientes</h1>
      <button class="btn-primary" @click="nuevoCliente">
        + Nuevo Cliente
      </button>
    </div>

    <div class="card-glass">
      <div v-if="loading" class="empty">Cargando clientes desde la nube...</div>
      
      <table v-else-if="clientes.length > 0">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Facturas</th>
            <th>Total Facturado</th>
            <th>Última Compra</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in clientes"
            :key="c.id"
            @click="verCliente(c.id)"
            style="cursor:pointer"
          >
            <td>{{ c.nombre }}</td>
            <td>{{ obtenerResumen(c.id, c.nombre).cantidad }}</td>
            <td>${{ obtenerResumen(c.id, c.nombre).total.toLocaleString() }}</td>
            <td>
              {{
                obtenerResumen(c.id, c.nombre).ultima
                  ? new Date(obtenerResumen(c.id, c.nombre).ultima).toLocaleDateString("es-AR")
                  : "-"
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">No hay clientes cargados en la base de datos.</p>
    </div>

    <div class="card-glass ranking">
      <h2>Top 5 Mejores Clientes</h2>

      <table v-if="rankingClientes.length > 0">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Facturas</th>
            <th>Total Facturado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in rankingClientes" :key="c.nombre">
            <td>{{ c.nombre }}</td>
            <td>{{ c.cantidad }}</td>
            <td>${{ c.total.toLocaleString() }}</td>
            <td>
              <span :class="estadoCliente(c.nombre, c.id)">
                {{ estadoCliente(c.nombre, c.id).toUpperCase() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">No hay datos de facturación suficientes.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getClientes, getFacturas } from "@/services/data";

const router = useRouter();
const clientes = ref([]);
const facturas = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Llamadas asíncronas a la nube
    const [dataClientes, dataFacturas] = await Promise.all([
      getClientes(),
      getFacturas()
    ]);

    clientes.value = dataClientes || [];
    facturas.value = dataFacturas || [];
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  } finally {
    loading.value = false;
  }
});

function nuevoCliente() {
  router.push("/cliente/nuevo");
}

function verCliente(id) {
  router.push(`/cliente/${id}`);
}

// Modificada para buscar por cliente_id o nombre (compatibilidad)
function obtenerResumen(clienteId, clienteNombre) {
  const facturasCliente = facturas.value.filter(
    f => f.cliente_id === clienteId || f.cliente === clienteNombre
  );

  const total = facturasCliente.reduce((acc, f) => acc + Number(f.total), 0);

  const facturasOrdenadas = [...facturasCliente].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const ultima = facturasOrdenadas.length > 0 ? facturasOrdenadas[0].fecha : null;

  return {
    cantidad: facturasCliente.length,
    total,
    ultima
  };
}

function estadoCliente(clienteNombre, clienteId) {
  const res = obtenerResumen(clienteId, clienteNombre);
  if (res.cantidad === 0) return "inactivo";

  const ultimaFecha = new Date(res.ultima);
  const hoy = new Date();
  const diferenciaDias = (hoy - ultimaFecha) / (1000 * 60 * 60 * 24);

  if (diferenciaDias <= 30) return "activo";
  if (diferenciaDias <= 60) return "medio";
  return "inactivo";
}

/* RANKING CLIENTES */
const rankingClientes = computed(() => {
  const mapa = {};

  facturas.value.forEach(f => {
    // Usamos el nombre para el mapa del ranking visual
    const key = f.cliente || 'Desconocido';
    if (!mapa[key]) {
      mapa[key] = {
        nombre: key,
        id: f.cliente_id,
        total: 0,
        cantidad: 0
      };
    }
    mapa[key].total += Number(f.total);
    mapa[key].cantidad += 1;
  });

  return Object.values(mapa)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});
</script>

<style scoped>
/* Tus estilos se mantienen iguales */
.page { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.card-glass { backdrop-filter: blur(15px); background: rgba(255, 255, 255, 0.15); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.25); padding: 20px; }
.btn-primary { background: rgba(0, 123, 255, 0.85); border: none; color: white; padding: 10px 16px; border-radius: 10px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; }
.empty { text-align: center; opacity: 0.7; padding: 20px; }
.activo { color: #51cf66; font-weight: bold; }
.medio { color: #fcc419; font-weight: bold; }
.inactivo { color: #ff6b6b; font-weight: bold; }
</style>
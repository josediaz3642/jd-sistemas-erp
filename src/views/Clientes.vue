<template>
  <div class="page">

    <!-- HEADER -->
    <div class="card-glass header">
      <h1>Clientes</h1>
      <button class="btn-primary" @click="nuevoCliente">
        + Nuevo Cliente
      </button>
    </div>

    <!-- TABLA PRINCIPAL -->
    <div class="card-glass">
      <table v-if="clientes.length > 0">
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
            <td>{{ obtenerResumen(c.nombre).cantidad }}</td>
            <td>${{ obtenerResumen(c.nombre).total }}</td>
            <td>
              {{
                obtenerResumen(c.nombre).ultima
                  ? new Date(
                      obtenerResumen(c.nombre).ultima
                    ).toLocaleDateString("es-AR")
                  : "-"
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">
        No hay clientes cargados
      </p>
    </div>

    <!-- RANKING -->
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
            <td>${{ c.total }}</td>
            <td>
              <span :class="estadoCliente(c.nombre)">
                {{ estadoCliente(c.nombre).toUpperCase() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">
        No hay datos suficientes.
      </p>
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

onMounted(() => {
  const dataClientes = getClientes();
  const dataFacturas = getFacturas();

  clientes.value = Array.isArray(dataClientes) ? dataClientes : [];
  facturas.value = Array.isArray(dataFacturas) ? dataFacturas : [];
});

function nuevoCliente() {
  router.push("/cliente/nuevo");
}

function verCliente(id) {
  router.push(`/cliente/${id}`);
}

function obtenerResumen(clienteNombre) {
  const facturasCliente = facturas.value.filter(
    f => f.cliente === clienteNombre
  );

  const total = facturasCliente.reduce(
    (acc, f) => acc + f.total,
    0
  );

  const ultima =
    facturasCliente.length > 0
      ? [...facturasCliente].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        )[0].fecha
      : null;

  return {
    cantidad: facturasCliente.length,
    total,
    ultima
  };
}
function estadoCliente(clienteNombre) {
  const facturasCliente = facturas.value
    .filter(f => f.cliente === clienteNombre)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (facturasCliente.length === 0) return "inactivo";

  const ultimaFecha = new Date(facturasCliente[0].fecha);
  const hoy = new Date();

  const diferenciaDias =
    (hoy - ultimaFecha) / (1000 * 60 * 60 * 24);

  if (diferenciaDias <= 30) return "activo";
  if (diferenciaDias <= 60) return "medio";

  return "inactivo";
}

/* =========================
   RANKING CLIENTES
========================= */

const rankingClientes = computed(() => {
  const mapa = {};

  facturas.value.forEach(f => {
    if (!mapa[f.cliente]) {
      mapa[f.cliente] = {
        nombre: f.cliente,
        total: 0,
        cantidad: 0
      };
    }

    mapa[f.cliente].total += f.total;
    mapa[f.cliente].cantidad += 1;
  });

  return Object.values(mapa)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});
</script>

<style scoped>
.page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-glass {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 20px;
}

.btn-primary {
  background: rgba(0, 123, 255, 0.85);
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
}

.empty {
  text-align: center;
  opacity: 0.7;
}
.ranking {
  margin-top: 25px;
}
.activo {
  color: #51cf66;
  font-weight: bold;
}

.medio {
  color: #fcc419;
  font-weight: bold;
}

.inactivo {
  color: #ff6b6b;
  font-weight: bold;
}

</style>

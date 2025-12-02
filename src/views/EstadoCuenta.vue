<template>
  <div class="card">
    <h1>Estado de Cuenta — {{ titulo }}</h1>

    <div class="info-box">
      <p><strong>Nombre:</strong> {{ entidad?.nombre }}</p>
      <p><strong>CUIT:</strong> {{ entidad?.cuit }}</p>
      <p><strong>Dirección:</strong> {{ entidad?.direccion }}</p>
    </div>

    <h2>📌 Resumen</h2>
    <div class="grid">
      <div class="box">
        <h3>Facturas</h3>
        <p>Total: <strong>{{ facturas.length }}</strong></p>
        <p>Importe: <strong>${{ totalFacturas }}</strong></p>
      </div>

      <div class="box">
        <h3>Cheques</h3>
        <p>Total: <strong>{{ cheques.length }}</strong></p>
        <p>Importe: <strong>${{ totalCheques }}</strong></p>
      </div>

      <div class="box">
        <h3>Items</h3>
        <p>Total vendidos/comprados: <strong>{{ totalItems }}</strong></p>
      </div>
    </div>

    <h2>📄 Facturas</h2>
    <table class="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in facturas" :key="f.id">
          <td>{{ f.id }}</td>
          <td>{{ f.fecha }}</td>
          <td>${{ f.total }}</td>
        </tr>
      </tbody>
    </table>

    <h2>💰 Cheques</h2>
    <table class="tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cheques" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.fecha }}</td>
          <td>${{ c.importe }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { 
  getClienteById,
  getProveedores,
  getFacturasByCliente,
  getFacturasProveedorById,
  getChequesByCliente,
  getPagosProveedorById
} from "@/services/data";

const props = defineProps({
  tipo: String,  // "cliente" o "proveedor"
  id: Number
});

const entidad = ref(null);
const facturas = ref([]);
const cheques = ref([]);

const titulo = computed(() =>
  props.tipo === "cliente" ? "Cliente" : "Proveedor"
);

onMounted(() => {
  if (props.tipo === "cliente") {
    entidad.value = getClienteById(props.id);
    facturas.value = getFacturasByCliente(props.id);
    cheques.value = getChequesByCliente(props.id);
  } else {
    entidad.value = getProveedores().find(p => p.id == props.id);
    facturas.value = getFacturasProveedorById(props.id);
    cheques.value = getPagosProveedorById(props.id);
  }
});

const totalFacturas = computed(() =>
  facturas.value.reduce((t, f) => t + Number(f.total || 0), 0)
);

const totalCheques = computed(() =>
  cheques.value.reduce((t, c) => t + Number(c.importe || 0), 0)
);

const totalItems = computed(() =>
  facturas.value.reduce((t, f) => t + (f.items?.length || 0), 0)
);
</script>

<style scoped>
.card { padding: 20px; background: #fff; border-radius: 10px; }
.grid { display: flex; gap: 20px; margin-bottom: 20px; }
.box { background: #f5f5f5; padding: 15px; border-radius: 8px; width: 30%; }
.tabla { width: 100%; border-collapse: collapse; margin-top: 10px; }
.tabla th, .tabla td { border: 1px solid #ddd; padding: 8px; }
.info-box { background: #f0f8ff; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
</style>

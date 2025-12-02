<template>
  <div class="card page">
    <h1>Proveedores</h1>

    <button class="btn btn-primary" @click="nuevoProveedor">
      Nuevo Proveedor
    </button>

    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>CUIT</th>
          <th>Teléfono</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in proveedores" :key="p.id">
          <td>{{ p.nombre }}</td>
          <td>{{ p.cuit }}</td>
          <td>{{ p.telefono }}</td>
          <td>
            <button class="btn btn-secondary"
              @click="verDetalle(p.id)">
              Ver
            </button>
            <button class="btn btn-danger" @click="eliminar(p.id)">
              Borrar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getProveedores, deleteProveedor } from "@/services/data";

const router = useRouter();
const proveedores = ref([]);

onMounted(() => {
  proveedores.value = getProveedores();
});

function verDetalle(id) {
  router.push(`/proveedor/${id}`);
}

function nuevoProveedor() {
  router.push(`/proveedor/0`);
}

function eliminar(id) {
  if (confirm("¿Eliminar proveedor?")) {
    deleteProveedor(id);
    proveedores.value = getProveedores();
  }
}
</script>

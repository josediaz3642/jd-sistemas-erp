<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getStockItems } from "@/services/data";

const router = useRouter();
const stock = ref([]);

onMounted(() => {
  stock.value = getStockItems();
});

function nuevo() {
  router.push("/stock/nuevo");
}

function editar(id) {
  router.push(`/stock/${id}`);
}
</script>

<template>
  <div class="page">
    <div class="card-glass">
      <h1>Stock</h1>

      <button class="btn-primary" @click="nuevo">
        + Nuevo producto
      </button>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in stock"
            :key="p.id"
            class="row-click"
            @click="editar(p.id)"
          >
            <td>{{ p.nombre }}</td>
            <td>${{ p.precio }}</td>
            <td>{{ p.cantidad }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

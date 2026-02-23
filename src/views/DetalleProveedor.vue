<template>
  <div class="page">
    <div class="card-glass header">
      <h1>
        {{ isNuevo ? "Nuevo Proveedor" : "Editar Proveedor" }}
      </h1>
    </div>

    <div class="card-glass">
      <form @submit.prevent="guardar">
        <div class="field">
          <label>Nombre</label>
          <input v-model="proveedor.nombre" required />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="proveedor.email" type="email" />
        </div>

        <div class="field">
          <label>Teléfono</label>
          <input v-model="proveedor.telefono" />
        </div>

        <div class="field">
          <label>CUIT</label>
          <input v-model="proveedor.cuit" />
        </div>

        <div class="actions">
          <button type="submit" class="btn-primary">
            Guardar
          </button>

          <button type="button" class="btn" @click="volver">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getProveedorById,
  saveProveedor
} from "@/services/data";

const route = useRoute();
const router = useRouter();

const proveedor = ref({
  nombre: "",
  email: "",
  telefono: "",
  cuit: ""
});

const isNuevo = computed(() => route.params.id === "nuevo");

onMounted(() => {
  if (!isNuevo.value) {
    const data = getProveedorById(route.params.id);
    if (data) {
      proveedor.value = { ...data };
    }
  }
});

function guardar() {
  saveProveedor(proveedor.value);
  router.push("/proveedores");
}

function volver() {
  router.push("/proveedores");
}
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
  align-items: center;
}

.card-glass {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 24px;
  max-width: 500px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

input {
  padding: 10px;
  border-radius: 10px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  background: rgba(0, 123, 255, 0.85);
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
}

.btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
}
</style>

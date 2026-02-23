<template>
  <div class="page">
    <div class="card-glass header">
      <h1>
        {{ isNuevo ? "Nuevo Cliente" : "Editar Cliente" }}
      </h1>
    </div>

    <div class="card-glass">
      <form @submit.prevent="guardar">
        <div class="field">
          <label>Nombre</label>
          <input v-model="cliente.nombre" required />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="cliente.email" type="email" />
        </div>

        <div class="field">
          <label>Teléfono</label>
          <input v-model="cliente.telefono" />
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
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getClienteById,
  saveCliente
} from "@/services/data";

const route = useRoute();
const router = useRouter();

const cliente = ref({
  nombre: "",
  email: "",
  telefono: ""
});

const isNuevo = computed(() => route.params.id === "nuevo");

onMounted(() => {
  if (!isNuevo.value) {
    const data = getClienteById(route.params.id);
    if (data) {
      cliente.value = { ...data };
    }
  }
});

function guardar() {
  saveCliente(cliente.value);
  router.push("/clientes");
}

function volver() {
  router.push("/clientes");
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
.card-glass {
  background: white; /* Cambiamos de transparent a blanco sólido para legibilidad */
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

label {
  font-size: 0.9rem;
  font-weight: 600; /* Más negrita para leer mejor */
  color: #475569; /* Gris oscuro legible */
  margin-bottom: 6px;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1; /* Borde definido */
  background: #f8fafc;
  color: #1e293b;
  font-size: 1rem;
}

input:focus {
  border-color: #2563eb;
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
</style>

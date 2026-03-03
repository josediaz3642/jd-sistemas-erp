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
          <label>Nombre o Razón Social</label>
          <input v-model="cliente.nombre" placeholder="Ej: Juan Pérez o Empresa S.A." required />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="cliente.email" type="email" placeholder="correo@ejemplo.com" />
        </div>

        <div class="field">
          <label>Teléfono</label>
          <input v-model="cliente.telefono" placeholder="Ej: 11 1234 5678" />
        </div>

        <div class="actions">
          <button type="submit" class="btn-primary" :disabled="guardando">
            {{ guardando ? "Guardando..." : "Guardar en Nube" }}
          </button>

          <button type="button" class="btn" @click="volver" :disabled="guardando">
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
import { getClienteById, saveCliente } from "@/services/data";

const route = useRoute();
const router = useRouter();

const guardando = ref(false);
const cliente = ref({
  nombre: "",
  email: "",
  telefono: ""
});

const isNuevo = computed(() => route.params.id === "nuevo");

onMounted(async () => {
  if (!isNuevo.value) {
    try {
      // Llamada asíncrona a Supabase
      const data = await getClienteById(route.params.id);
      if (data) {
        cliente.value = { ...data };
      }
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
      alert("No se pudo cargar la información del cliente.");
    }
  }
});

async function guardar() {
  if (guardando.value) return;
  
  guardando.value = true;
  try {
    // saveCliente ahora usa upsert de Supabase
    await saveCliente(cliente.value);
    router.push("/clientes");
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    alert("Error al guardar en la base de datos.");
  } finally {
    guardando.value = false;
  }
}

function volver() {
  router.push("/clientes");
}
</script>

<style scoped>
.page { padding: 20px; display: flex; flex-direction: column; gap: 20px; align-items: center; }
.header { width: 100%; max-width: 500px; display: flex; align-items: center; }

.card-glass {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.field { display: flex; flex-direction: column; margin-bottom: 16px; }

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #1e293b;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  border-color: #2563eb;
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.actions { display: flex; gap: 12px; margin-top: 20px; }

.btn-primary {
  background: #2563eb;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

.btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  color: #475569;
}

.btn:hover { background: #e2e8f0; }
</style>
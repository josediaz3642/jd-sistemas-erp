<template>
  <div class="page">
    <div class="card-glass header">
      <h1>
        {{ isNuevo ? "Nuevo Proveedor" : "Editar Proveedor" }}
      </h1>
    </div>

    <div class="card-glass content-form">
      <div v-if="loading" class="text-center p-4">Cargando datos...</div>
      
      <form v-else @submit.prevent="guardar">
        <div class="field">
          <label>Nombre / Razón Social</label>
          <input v-model="proveedor.nombre" placeholder="Nombre del proveedor" required />
        </div>

        <div class="field">
          <label>Email de Contacto</label>
          <input v-model="proveedor.email" type="email" placeholder="ejemplo@proveedor.com" />
        </div>

        <div class="field">
          <label>Teléfono</label>
          <input v-model="proveedor.telefono" placeholder="WhatsApp o fijo" />
        </div>

        <div class="field">
          <label>CUIT</label>
          <input v-model="proveedor.cuit" placeholder="00-00000000-0" />
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProveedorById, saveProveedor } from "@/services/data";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const guardando = ref(false);
const proveedor = ref({
  nombre: "",
  email: "",
  telefono: "",
  cuit: ""
});

const isNuevo = computed(() => route.params.id === "nuevo");

onMounted(async () => {
  if (!isNuevo.value) {
    loading.value = true;
    try {
      const data = await getProveedorById(route.params.id);
      if (data) {
        proveedor.value = { ...data };
      }
    } catch (e) {
      console.error("Error al cargar proveedor:", e);
    } finally {
      loading.value = false;
    }
  }
});

async function guardar() {
  if (guardando.value) return;
  
  guardando.value = true;
  try {
    // saveProveedor ahora hace un upsert asíncrono en Supabase
    await saveProveedor(proveedor.value);
    router.push("/proveedores");
  } catch (e) {
    alert("Error al guardar el proveedor en la nube.");
    console.error(e);
  } finally {
    guardando.value = false;
  }
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
  align-items: center;
}

.header {
  width: 100%;
  max-width: 500px;
}

.content-form {
  background: white; /* Mejoramos legibilidad */
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

input {
  padding: 12px;
  border-radius: 10px;
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

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  background: #2563eb;
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  color: #475569;
}
</style>
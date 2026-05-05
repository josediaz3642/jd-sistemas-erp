<template>
  <div class="page">
    <div class="card-glass header" style="display: flex; justify-content: space-between;">
      <h1>
        {{ isNuevo ? "Nuevo Proveedor" : "Editar Proveedor" }}
      </h1>
      <button v-if="!isNuevo && esSuperAdmin" @click="eliminarProveedorActual" class="btn" style="background: #ef4444; color: white;">
        Eliminar
      </button>
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
import { getProveedorById, saveProveedor, deleteProveedor } from "@/services/data";
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const esSuperAdmin = computed(() => authStore.user?.email === 'josediaz3642@gmail.com');

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

const isNuevo = computed(() => route.params.id === "nuevo" || !route.params.id);

onMounted(async () => {
  if (!isNuevo.value) {
    loading.value = true;
    try {
      const data = await getProveedorById(route.params.id);
      if (data) {
        proveedor.value = { ...data };
      } else {
        console.warn("No se encontró el proveedor");
        router.push("/proveedores");
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
    await saveProveedor(proveedor.value);
    router.push("/proveedores");
  } catch (e) {
    alert("Error al guardar el proveedor en la nube.");
    console.error(e);
  } finally {
    guardando.value = false;
  }
}

async function eliminarProveedorActual() {
  if (!confirm("¿Seguro que deseas eliminar este proveedor? Se perderán sus datos.")) return;
  try {
    await deleteProveedor(route.params.id);
    alert("Proveedor eliminado");
    router.push("/proveedores");
  } catch (e) {
    alert("Error al eliminar. Puede tener compras asociadas.");
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
.card-glass {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.header h1 { margin: 0; font-size: 1.5rem; color: #1e293b; text-align: center; }
.field { display: flex; flex-direction: column; margin-bottom: 16px; }
label { font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
input { padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 1rem; }
input:focus { border-color: #2563eb; outline: none; background: white; }
.actions { display: flex; gap: 12px; margin-top: 20px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; flex: 1; }
.btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; cursor: pointer; }
</style>
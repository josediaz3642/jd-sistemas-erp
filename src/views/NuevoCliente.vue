<template>
  <div class="container-center">
    <div class="card-glass form-card">
      <header class="form-header">
        <div class="icon-circle">👤</div>
        <div>
          <h1>Nuevo Cliente</h1>
          <p>Complete los datos para la ficha de facturación.</p>
        </div>
      </header>

      <form @submit.prevent="guardar" class="modern-form">
        <div class="input-group">
          <label>Nombre o Razón Social</label>
          <input 
            v-model="cliente.nombre" 
            placeholder="Ej: Juan Pérez o Empresa S.A." 
            required 
            :disabled="enviando"
          />
        </div>

        <div class="grid-inputs">
          <div class="input-group">
            <label>CUIT / CUIL</label>
            <input 
              v-model="cliente.cuit" 
              placeholder="00-00000000-0" 
              :disabled="enviando"
            />
          </div>
          <div class="input-group">
            <label>Condición IVA</label>
            <select v-model="cliente.condicion_iva" :disabled="enviando">
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Exento">Exento</option>
            </select>
          </div>
        </div>

        <div class="grid-inputs">
          <div class="input-group">
            <label>Teléfono</label>
            <input 
              v-model="cliente.telefono" 
              placeholder="Ej: +54 9 11 1234-5678" 
              :disabled="enviando"
            />
          </div>
          <div class="input-group">
            <label>Correo Electrónico</label>
            <input 
              v-model="cliente.email" 
              type="email"
              placeholder="email@cliente.com" 
              :disabled="enviando"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$router.back()">Cancelar</button>
          <button type="submit" class="btn-save" :disabled="enviando">
            {{ enviando ? 'Guardando...' : 'Crear Cliente' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { saveCliente } from "@/services/data";

const router = useRouter();
const enviando = ref(false);

const cliente = reactive({
  nombre: "",
  cuit: "",
  direccion: "",
  email: "",
  telefono: "",
  condicion_iva: "Consumidor Final"
});

async function guardar() {
  if (!cliente.nombre) return;
  
  enviando.value = true;
  try {
    // saveCliente en Supabase ahora devuelve el nuevo objeto con su ID real
    const nuevo = await saveCliente({ ...cliente });
    
    if (nuevo && nuevo.id) {
      router.push(`/cliente/${nuevo.id}`);
    } else {
      throw new Error("No se pudo obtener el ID del cliente");
    }
  } catch (error) {
    alert("Error al guardar el cliente: " + error.message);
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped>
.container-center {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  min-height: 80vh;
}

.form-card {
  width: 100%;
  max-width: 550px;
  padding: 30px !important;
}

.form-header {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
}

.icon-circle {
  width: 50px;
  height: 50px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.input-group input, .input-group select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-group input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.grid-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-save {
  flex: 2;
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-save:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
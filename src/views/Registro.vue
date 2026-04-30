<template>
  <div class="auth-container">
    <div class="card-glass register-card">
      <header class="auth-header">
        <div class="logo-circle">🚀</div>
        <h1>Únete a ContaSoft</h1>
        <p class="subtitle">Comienza a gestionar tu negocio en la nube.</p>
      </header>

      <form @submit.prevent="onRegister" class="auth-form">
        <div class="input-group">
          <label>Nombre de la Empresa / Usuario</label>
          <input 
            v-model="nombre" 
            type="text" 
            placeholder="Ej: Distribuidora Global" 
            required 
            :disabled="cargando"
          />
        </div>

        <div class="input-group">
          <label>Correo Electrónico</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="admin@empresa.com" 
            required 
            :disabled="cargando"
          />
        </div>

        <div class="input-group">
          <label>Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Mínimo 6 caracteres" 
            required 
            :disabled="cargando"
          />
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="cargando">
            {{ cargando ? 'Creando cuenta...' : 'Registrarme ahora' }}
          </button>
          
          <button 
            class="btn-text" 
            type="button" 
            @click="$router.push('/login')"
            :disabled="cargando"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>

        <transition name="slide-up">
          <div v-if="msg" class="msg-box success" key="success">
            {{ msg }}
          </div>
          <div v-else-if="error" class="msg-box error" key="error">
            {{ error }}
          </div>
        </transition>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 1. Cambiamos la importación vieja por la del Store
import { useAuthStore } from '@/stores/authStore'; 

const router = useRouter();
const authStore = useAuthStore(); // 2. Instanciamos el store

const nombre = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const msg = ref('');
const cargando = ref(false);

async function onRegister() {
  error.value = '';
  msg.value = '';

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  cargando.value = true;
  try {
    // 3. Usamos la acción 'register' del Store que configuramos antes
    await authStore.register(email.value, password.value, nombre.value);

    msg.value = '¡Cuenta creada! Redirigiendo...';
    
    setTimeout(() => {
      router.push('/dashboard'); // Si el store ya lo loguea, vamos al dashboard
    }, 2000);

  } catch (e) {
    // Manejamos errores comunes de Supabase (como usuario ya existente)
    if (e.message.includes('already registered')) {
      error.value = 'Este correo ya está registrado.';
    } else {
      error.value = e.message || 'Error al registrar el usuario';
    }
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8fafc;
}

.register-card {
  width: 100%;
  max-width: 450px;
  padding: 40px !important;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
}

.input-group input {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  transition: border 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #2563eb;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:disabled { background: #94a3b8; }

.btn-text {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
}

.msg-box {
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 10px;
}

.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

/* Estilos de la transición */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
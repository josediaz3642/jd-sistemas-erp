<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importamos 'login', que es como se llama en auth.js
import { login } from '@/services/auth'; 

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const cargando = ref(false);

async function onLogin() {
  if (!email.value || !password.value) return;
  
  error.value = '';
  cargando.value = true;
  
  try {
    // CAMBIO AQUÍ: Usamos 'login' en lugar de 'loginUser'
    const user = await login(email.value, password.value);
    
    if (!user) {
      error.value = 'Credenciales incorrectas o usuario no encontrado';
      return;
    }

    // Si todo va bien, redirigimos al dashboard
    router.push('/dashboard');
  } catch (e) {
    // Si el error viene del 'throw' de auth.js, mostramos ese mensaje
    error.value = e.message || 'Error al conectar con el servidor.';
    console.error(e);
  } finally {
    cargando.value = false;
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="card-glass login-card">
      <div class="brand">
        <div class="logo-icon">C</div>
        <h1>ContaSoft</h1>
      </div>
      
      <p class="subtitle">Bienvenido de nuevo. Ingrese a su panel.</p>

      <form @submit.prevent="onLogin" class="auth-form">
        <div class="field">
          <label>Correo Electrónico</label>
          <input 
            v-model="email" 
            class="input-moderno" 
            type="email" 
            placeholder="nombre@empresa.com" 
            required 
            :disabled="cargando"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input 
            v-model="password" 
            class="input-moderno" 
            type="password" 
            placeholder="••••••••" 
            required 
            :disabled="cargando"
          />
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="cargando">
            {{ cargando ? 'Verificando...' : 'Iniciar Sesión' }}
          </button>
          
          <button 
            class="btn-text" 
            type="button" 
            @click="$router.push('/registro')"
            :disabled="cargando"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>

        <transition name="fade">
          <p v-if="error" class="error-msg">{{ error }}</p>
        </transition>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se mantienen igual, están excelentes */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #2563eb10, transparent),
              radial-gradient(circle at bottom right, #1e293b10, transparent);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px !important;
  text-align: center;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: #2563eb;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.auth-form {
  text-align: left;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.input-moderno {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  transition: all 0.2s;
}

.input-moderno:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0f172a;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: wait;
}

.btn-text {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.error-msg {
  margin-top: 20px;
  padding: 10px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.8rem;
  text-align: center;
  border: 1px solid #fee2e2;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
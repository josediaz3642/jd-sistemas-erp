<template>
  <div class="login-page card">
    <h1>JD Sistemas Informáticos</h1>
    <p>Inicio de sesión</p>

    <form @submit.prevent="handleLogin">
      <input v-model="usuario" placeholder="Usuario" required />
      <input v-model="clave" type="password" placeholder="Contraseña" required />
      <button type="submit" class="btn-login">Ingresar</button>
      
      <p v-if="error" class="error">{{ error }}</p>

      <div class="separator">O</div>
      
      <!-- Nuevo botón para crear usuario -->
      <button type="button" @click="goToCreateUser" class="btn-secondary">
        Crear Usuario (Registro)
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/auth'; // Asegúrate de que esta ruta sea correcta

const router = useRouter();
const usuario = ref('');
const clave = ref('');
const error = ref('');

function handleLogin() {
  error.value = '';
  const user = loginUser(usuario.value, clave.value);
  if (user) {
    router.push('/dashboard');
  } else {
    error.value = 'Usuario o contraseña incorrectos';
  }
}

function goToCreateUser() {
  // Redirige al usuario a la vista de Mantenimiento (donde está la gestión de usuarios)
  // Deberás asegurarte de que tu router tenga una ruta '/mantenimiento'
  router.push('/mantenimiento?mode=create');
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 10vh auto;
  padding: 40px;
  text-align: center;
}
.login-page input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-sizing: border-box;
}
.btn-login {
    margin-top: 20px;
    width: 100%;
    padding: 12px;
    background: var(--accent);
}
.btn-secondary {
    margin-top: 10px;
    width: 100%;
    padding: 12px;
    background: var(--card-bg);
    color: var(--text);
    border: 1px solid var(--border);
}
.btn-secondary:hover {
    background: var(--hover);
    color: white;
}
.error {
  color: var(--error);
  margin-top: 10px;
}
.separator {
    margin: 20px 0 10px 0;
    color: var(--text);
    opacity: 0.6;
    font-size: 0.9em;
}
</style>
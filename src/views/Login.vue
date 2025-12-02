<template>
  <div class="card login-card">
    <h1>Contasoft ERP</h1>
    <p>Inicio de sesión</p>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="usuario">Usuario</label>
        <input id="usuario" v-model="usuario" class="form-input"
               placeholder="Usuario" required />
      </div>

      <div class="form-group">
        <label for="clave">Contraseña</label>
        <input id="clave" v-model="clave" type="password" class="form-input"
               placeholder="Contraseña" required />
      </div>

      <button type="submit" class="btn btn-primary">
        Ingresar
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/auth';

const router = useRouter();
const usuario = ref('');
const clave = ref('');
const error = ref('');

async function handleLogin() {
  const user = await loginUser(usuario.value, clave.value);

  if (user) {
    router.push('/dashboard');
  } else {
    error.value = "Usuario o contraseña incorrectos.";
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: auto;
  margin-top: 10vh;
  text-align: center;
}
.form-group { margin-bottom: 15px; text-align: left; }
.form-input { width: 100%; padding: 10px; border-radius: 8px; }
.error-message { color: red; margin-top: 10px; }
</style>

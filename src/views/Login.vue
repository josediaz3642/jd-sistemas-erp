<template>
  <div class="container">
    <div class="card-glass" style="max-width:420px; margin:auto;">
      <h1 style="margin-bottom:6px;">Iniciar sesión</h1>
      <p class="kv">Ingrese sus credenciales</p>

      <form @submit.prevent="onLogin" style="margin-top:12px;">
        <input v-model="email" class="input" type="email" placeholder="Email" required />
        <input v-model="password" class="input" type="password" placeholder="Contraseña" required style="margin-top:10px;" />
        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="btn" type="submit">Ingresar</button>
          <button class="btn secondary" type="button" @click="$router.push('/registro')">Registrarme</button>
        </div>

        <p v-if="error" class="status-error" style="margin-top:10px;">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

async function onLogin() {
  error.value = '';
  try {
    // loginUser puede retornar objeto o lanzar error dependiendo de tu implementación
    const res = loginUser(email.value, password.value);
    // si tu loginUser devuelve { ok: false, message } manejarlo:
    if (res && res.ok === false) {
      error.value = res.message || 'Credenciales inválidas';
      return;
    }
    // si lanzó o devolvió user como objeto:
    router.push('/dashboard');
  } catch (e) {
    error.value = e?.message || 'Error al iniciar sesión';
  }
}
</script>

<style scoped>
.container { padding-top:40px; }
</style>

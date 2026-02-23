<template>
  <div class="container">
    <div class="card-glass" style="max-width:480px; margin:auto;">
      <h1>Registro</h1>
      <p class="kv">Crea una cuenta de usuario</p>

      <form @submit.prevent="onRegister" style="margin-top:12px;">
        <input v-model="nombre" class="input" type="text" placeholder="Nombre completo" required />
        <input v-model="email" class="input" type="email" placeholder="Email" required style="margin-top:8px;" />
        <input v-model="password" class="input" type="password" placeholder="Contraseña" required style="margin-top:8px;" />

        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="btn" type="submit">Crear Cuenta</button>
          <button class="btn secondary" type="button" @click="$router.push('/login')">Volver</button>
        </div>

        <p v-if="msg" class="status-success" style="margin-top:10px;">{{ msg }}</p>
        <p v-if="error" class="status-error" style="margin-top:10px;">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { saveUsuario, getUsuarios } from '@/services/data';
import { useRouter } from 'vue-router';

const router = useRouter();
const nombre = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const msg = ref('');

function onRegister() {
  error.value = '';
  msg.value = '';

  // simple validations
  if (!email.value || !password.value || !nombre.value) {
    error.value = 'Completa todos los campos';
    return;
  }

  // check duplicate
  const exists = getUsuarios().some(u => u.email === email.value);
  if (exists) {
    error.value = 'El email ya está registrado';
    return;
  }

  const user = {
    nombre: nombre.value,
    email: email.value,
    password: password.value,
    rol: 'user'
  };
  saveUsuario(user);
  msg.value = 'Usuario registrado. Redirigiendo a login...';
  setTimeout(() => router.push('/login'), 900);
}
</script>

<style scoped></style>

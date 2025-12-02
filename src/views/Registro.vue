<template>
  <div class="registro-page">
    <h1>Crear Nuevo Usuario</h1>

    <form @submit.prevent="registrar">
      <input v-model="usuario" placeholder="Usuario" required />
      <input v-model="nombre" placeholder="Nombre Completo" required />
      <input v-model="clave" type="password" placeholder="Contraseña" required />
      <input v-model="confirmarClave" type="password"
             placeholder="Confirmar Contraseña" required />

      <button type="submit" class="btn">
        Registrar
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>

    <a href="#" @click.prevent="goLogin">Volver a iniciar sesión</a>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUser, getCurrentUser } from '@/services/auth';

const usuario = ref('');
const nombre = ref('');
const clave = ref('');
const confirmarClave = ref('');
const error = ref('');
const success = ref('');

const router = useRouter();

async function registrar() {
  error.value = "";
  success.value = "";

  // Solo admin puede crear
  const current = getCurrentUser();
  if (!current || current.rol !== 'admin') {
    error.value = "Solo un administrador puede crear usuarios.";
    return;
  }

  if (clave.value !== confirmarClave.value) {
    error.value = "Las contraseñas no coinciden.";
    return;
  }

  try {
    await createUser({
      usuario: usuario.value,
      nombre: nombre.value,
      clave: clave.value
    });

    success.value = "Usuario creado exitosamente.";
    setTimeout(() => router.push('/login'), 1500);

  } catch (e) {
    error.value = e.message;
  }
}

function goLogin() {
  router.push('/login');
}
</script>

<style scoped>
.registro-page {
  max-width: 400px;
  margin: auto;
  margin-top: 10vh;
  text-align: center;
}
input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}
.error { color: red; }
.success { color: green; }
.btn {
  padding: 10px;
  width: 100%;
  font-size: 1.1em;
}
</style>

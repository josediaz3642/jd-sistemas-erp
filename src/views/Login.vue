<template>
  <div class="auth-wrapper">
    <div class="auth-card card-glass">
      <div class="brand-section">
        <div class="logo-box">C</div>
        <h1>Contasoft <span>ERP</span></h1>
        <p class="subtitle">JD Sistemasinformáticos</p>
      </div>

      <form v-if="!mostrandoRegistro" @submit.prevent="handleLogin" class="auth-form">
        <h2>Iniciar Sesión</h2>
        <div class="input-group">
          <label>Email</label>
          <input v-model="loginForm.email" type="email" placeholder="admin@admin.com" required />
        </div>
        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
        </div>
        
        <div v-if="errorMsg" class="error-badge">{{ errorMsg }}</div>

        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Verificando...' : 'Entrar 🚀' }}
        </button>
        
        <p class="switch-text">
          ¿No tienes cuenta? <a @click.prevent="mostrandoRegistro = true">Regístrate aquí</a>
        </p>
      </form>

      <form v-else @submit.prevent="handleRegistro" class="auth-form">
        <h2>Crear Nueva Empresa</h2>
        <p class="info-text">Obtén tu propio espacio de base de datos aislado y único.</p>
        
        <div class="input-group">
          <label>Tu Nombre Completo</label>
          <input v-model="registroForm.nombre" type="text" placeholder="Juan Pérez" required />
        </div>
        <div class="input-group">
          <label>Email Corporativo</label>
          <input v-model="registroForm.email" type="email" placeholder="contacto@tuempresa.com" required />
        </div>
        <div class="input-group">
          <label>Contraseña (Mín. 6 caracteres)</label>
          <input v-model="registroForm.password" type="password" placeholder="••••••••" required minlength="6"/>
        </div>

        <div v-if="errorMsg" class="error-badge">{{ errorMsg }}</div>

        <button type="submit" class="btn-success" :disabled="cargando">
          {{ cargando ? 'Creando espacio...' : 'Crear Mi ERP ✅' }}
        </button>

        <p class="switch-text">
          ¿Ya tienes cuenta? <a @click.prevent="mostrandoRegistro = false">Volver al Login</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser, registerUser } from '@/services/auth';

const router = useRouter();
const cargando = ref(false);
const errorMsg = ref('');
const mostrandoRegistro = ref(false);

const loginForm = ref({ email: '', password: '' });
const registroForm = ref({ nombre: '', email: '', password: '' });

// LÓGICA DE LOGIN
const handleLogin = async () => {
  errorMsg.value = '';
  if (!loginForm.value.email || !loginForm.value.password) return;

  try {
    cargando.value = true;
    await loginUser(loginForm.value.email, loginForm.value.password);
    router.push('/dashboard'); // Redirigir al panel
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    cargando.value = false;
  }
};

// LÓGICA DE REGISTRO (CREAR EMPRESA AISLADA)
const handleRegistro = async () => {
  errorMsg.value = '';
  try {
    cargando.value = true;
    const usuarioCreado = await registerUser(registroForm.value);
    
    // Opcional: Logear automáticamente tras registrarse
    await loginUser(usuarioCreado.email, usuarioCreado.password);
    
    alert("¡Empresa creada con éxito! Bienvenido a Contasoft.");
    router.push('/dashboard');
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Estilos Monocromáticos JD Sistemas */
.auth-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f1f5f9; /* Fondo gris muy suave */
}

.auth-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.brand-section { text-align: center; margin-bottom: 30px; }
.logo-box { background: #0f172a; color: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin: 0 auto 10px; font-weight: bold; font-size: 1.2rem; }
.brand-section h1 { font-size: 1.5rem; margin: 0; color: #0f172a; }
.brand-section h1 span { color: #64748b; font-weight: 300; }
.subtitle { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }

.auth-form h2 { font-size: 1.1rem; text-align: center; margin-bottom: 20px; color: #334155; }
.info-text { font-size: 0.8rem; color: #64748b; text-align: center; margin-top: -15px; margin-bottom: 20px; }

.input-group { margin-bottom: 15px; }
.input-group label { display: block; font-size: 0.8rem; font-weight: bold; color: #475569; margin-bottom: 5px; }
.input-group input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; transition: 0.2s; }
.input-group input:focus { border-color: #0f172a; outline: none; box-shadow: 0 0 0 3px rgba(15,23,42,0.1); }

.error-badge { background: #fee2e2; color: #ef4444; padding: 10px; border-radius: 6px; font-size: 0.8rem; text-align: center; margin-bottom: 15px; border: 1px solid #fecaca; }

.btn-primary, .btn-success { width: 100%; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
.btn-primary { background: #0f172a; color: white; }
.btn-primary:hover { background: #1e293b; }

.btn-success { background: #16a34a; color: white; }
.btn-success:hover { background: #15803d; }

button:disabled { opacity: 0.5; cursor: not-allowed; }

.switch-text { font-size: 0.8rem; text-align: center; color: #64748b; margin-top: 20px; }
.switch-text a { color: #2563eb; cursor: pointer; font-weight: bold; text-decoration: none; }
.switch-text a:hover { text-decoration: underline; }
</style>
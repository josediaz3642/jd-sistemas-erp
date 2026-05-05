<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <LogoContasoft :size="44" />
        <h1>Creá tu espacio<br/>de trabajo.</h1>
        <p>Registrate y obtené tu propia base de datos aislada. Empezá a gestionar tu empresa en minutos.</p>
        <div class="auth-features">
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Verificación por email</div>
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Setup en menos de 2 minutos</div>
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Sin tarjeta de crédito</div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <div class="mobile-logo"><LogoContasoft :size="36" /></div>
          <h2>Crear Cuenta</h2>
          <p>Completá tus datos para comenzar</p>
        </div>

        <form @submit.prevent="onRegister" class="auth-form">
          <div class="field">
            <label>Nombre de la Empresa</label>
            <input v-model="nombre" type="text" placeholder="Ej: Distribuidora Global" required :disabled="cargando" />
          </div>
          <div class="field">
            <label>Correo Electrónico</label>
            <input v-model="email" type="email" placeholder="contacto@tuempresa.com" required :disabled="cargando" />
          </div>
          <div class="field">
            <label>Contraseña (mín. 6 caracteres)</label>
            <input v-model="password" type="password" placeholder="••••••••" required minlength="6" :disabled="cargando" />
          </div>

          <transition name="fade">
            <div v-if="error" class="error-msg">{{ error }}</div>
            <div v-else-if="msg" class="success-msg">{{ msg }}</div>
          </transition>

          <button class="btn-submit" type="submit" :disabled="cargando">
            <span v-if="cargando" class="spinner-sm"></span>
            {{ cargando ? 'Creando cuenta...' : 'Registrarme ahora' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tenés cuenta? <router-link to="/login">Iniciá sesión</router-link></p>
          <router-link to="/" class="back-link">← Volver al inicio</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LogoContasoft from '@/components/LogoContasoft.vue';

const router = useRouter();
const authStore = useAuthStore();
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
  msg.value = 'Enviando...';
  try {
    await authStore.register(email.value, password.value, nombre.value);
    
    // Verificar si se inició sesión automáticamente o requiere confirmación
    if (authStore.user) {
      msg.value = '¡Usuario creado correctamente! Redirigiendo al dashboard...';
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      msg.value = 'Usuario creado correctamente por favor confirmar e mail';
      setTimeout(() => router.push('/login'), 4000);
    }
  } catch (e) {
    msg.value = '';
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
.auth-page { display: flex; min-height: 100vh; }

.auth-left {
  flex: 1; background: var(--cs-gradient-hero);
  display: flex; align-items: center; justify-content: center;
  padding: 60px; position: relative; overflow: hidden;
}
.auth-left::after {
  content: ''; position: absolute; top: -40%; left: -20%;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
}
.auth-left-content { max-width: 420px; position: relative; z-index: 1; }
.auth-left-content h1 { font-size: 2.8rem; font-weight: 900; color: #fff; margin: 24px 0 16px; line-height: 1.1; letter-spacing: -0.03em; }
.auth-left-content p { font-size: 1rem; color: rgba(148,163,184,0.8); line-height: 1.7; margin-bottom: 32px; }
.auth-features { display: flex; flex-direction: column; gap: 12px; }
.af { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: rgba(148,163,184,0.7); font-weight: 500; }
.af svg { stroke: var(--cs-accent-400); flex-shrink: 0; }

.auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--cs-bg-root); }
.auth-card { width: 100%; max-width: 420px; }
.auth-card-header { margin-bottom: 32px; }
.mobile-logo { display: none; margin-bottom: 20px; }
.auth-card-header h2 { font-size: 1.5rem; font-weight: 800; color: var(--cs-text-primary); margin-bottom: 6px; }
.auth-card-header p { font-size: 0.85rem; color: var(--cs-text-muted); }

.auth-form { display: flex; flex-direction: column; gap: 18px; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--cs-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }

.error-msg { background: var(--cs-error-bg); color: var(--cs-error); padding: 10px 14px; border-radius: var(--cs-radius-md); font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(239,68,68,0.15); }
.success-msg { background: var(--cs-success-bg); color: var(--cs-success); padding: 10px 14px; border-radius: var(--cs-radius-md); font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(22,163,106,0.15); }

.btn-submit { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: var(--cs-gradient-brand); color: white; border: none; border-radius: var(--cs-radius-md); font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 15px rgba(79,70,229,0.3); transition: all var(--cs-transition); }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.spinner-sm { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: cs-spin 0.8s linear infinite; }

.auth-footer { margin-top: 28px; text-align: center; }
.auth-footer p { font-size: 0.85rem; color: var(--cs-text-muted); }
.auth-footer a { color: var(--cs-brand-500); font-weight: 700; text-decoration: none; }
.auth-footer a:hover { text-decoration: underline; }
.back-link { display: inline-block; margin-top: 12px; font-size: 0.8rem; color: var(--cs-text-muted) !important; font-weight: 500 !important; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }

@media (max-width: 900px) {
  .auth-left { display: none; }
  .auth-right { padding: 24px; }
  .mobile-logo { display: block; }
}
</style>
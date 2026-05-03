<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <LogoContasoft :size="44" />
        <h1>Bienvenido<br/>de vuelta.</h1>
        <p>Accedé a tu espacio de gestión empresarial y retomá el control de tu negocio.</p>
        <div class="auth-features">
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Datos encriptados y seguros</div>
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Base de datos aislada por empresa</div>
          <div class="af"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Acceso desde cualquier dispositivo</div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <div class="mobile-logo"><LogoContasoft :size="36" /></div>
          <h2>Iniciar Sesión</h2>
          <p>Ingresá tus credenciales para acceder</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="field">
            <label>Email</label>
            <div class="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="input-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input v-model="loginForm.email" type="email" placeholder="tu@empresa.com" required />
            </div>
          </div>
          <div class="field">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="input-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="loginForm.password" type="password" placeholder="••••••••" required />
            </div>
          </div>
          
          <transition name="fade">
            <div v-if="errorMsg" class="error-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ errorMsg }}
            </div>
          </transition>

          <button type="submit" class="btn-submit" :disabled="cargando">
            <span v-if="cargando" class="spinner-sm"></span>
            {{ cargando ? 'Verificando...' : 'Ingresar' }}
            <svg v-if="!cargando" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tenés cuenta? <router-link to="/registro">Registrate gratis</router-link></p>
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
const cargando = ref(false);
const errorMsg = ref('');
const loginForm = ref({ email: '', password: '' });

const handleLogin = async () => {
  errorMsg.value = '';
  if (!loginForm.value.email || !loginForm.value.password) return;
  try {
    cargando.value = true;
    await authStore.login(loginForm.value.email, loginForm.value.password);
    router.push('/dashboard'); 
  } catch (err) {
    errorMsg.value = "Credenciales incorrectas o error de conexión.";
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
}

/* Left Panel */
.auth-left {
  flex: 1;
  background: var(--cs-gradient-hero);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}
.auth-left::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -30%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%);
}

.auth-left-content {
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.auth-left-content h1 {
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  margin: 24px 0 16px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.auth-left-content p {
  font-size: 1rem;
  color: rgba(148,163,184,0.8);
  line-height: 1.7;
  margin-bottom: 32px;
}

.auth-features { display: flex; flex-direction: column; gap: 12px; }
.af {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: rgba(148,163,184,0.7);
  font-weight: 500;
}
.af svg { stroke: var(--cs-accent-400); flex-shrink: 0; }

/* Right Panel */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--cs-bg-root);
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-card-header {
  margin-bottom: 32px;
}
.mobile-logo { display: none; margin-bottom: 20px; }
.auth-card-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--cs-text-primary);
  margin-bottom: 6px;
}
.auth-card-header p {
  font-size: 0.85rem;
  color: var(--cs-text-muted);
}

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 20px; }

.field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--cs-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
}
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cs-text-muted);
  pointer-events: none;
}
.input-wrapper input {
  padding-left: 42px !important;
  height: 46px;
  border-radius: var(--cs-radius-md) !important;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--cs-error-bg);
  color: var(--cs-error);
  padding: 10px 14px;
  border-radius: var(--cs-radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(239,68,68,0.15);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: var(--cs-gradient-brand);
  color: white;
  border: none;
  border-radius: var(--cs-radius-md);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(79,70,229,0.3);
  transition: all var(--cs-transition);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79,70,229,0.4);
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.spinner-sm {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: cs-spin 0.8s linear infinite;
}

/* Footer */
.auth-footer {
  margin-top: 28px;
  text-align: center;
}
.auth-footer p {
  font-size: 0.85rem;
  color: var(--cs-text-muted);
}
.auth-footer a {
  color: var(--cs-brand-500);
  font-weight: 700;
  text-decoration: none;
}
.auth-footer a:hover { text-decoration: underline; }
.back-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--cs-text-muted) !important;
  font-weight: 500 !important;
}

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }

@media (max-width: 900px) {
  .auth-left { display: none; }
  .auth-right { padding: 24px; }
  .mobile-logo { display: block; }
}
</style>
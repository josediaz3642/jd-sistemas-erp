<template>
  <div class="perfil-container">
    <header class="page-header">
      <div>
        <h2 class="page-title">👤 Mi Perfil</h2>
        <p class="page-sub">Gestiona tu información personal y preferencias de la cuenta.</p>
      </div>
    </header>

    <div class="perfil-grid">
      <section class="perfil-section card-glass text-center">
        <div class="avatar-large">{{ initials }}</div>
        <h3 class="user-name-large">{{ user?.email?.split('@')[0] || 'Usuario' }}</h3>
        <p class="user-email-text">{{ user?.email }}</p>
        <span class="role-badge">Super Admin</span>
      </section>

      <section class="perfil-section card-glass">
        <h3 class="title-card">Datos Personales Extra</h3>
        <p class="text-xs text-muted mb-4">Estos datos son privados y ayudan a personalizar tu experiencia en la plataforma.</p>
        
        <div class="form-grid">
          <div class="field">
            <label>Nombre Completo</label>
            <input v-model="perfil.nombre_completo" type="text" placeholder="Ej: Juan Pérez">
          </div>
          <div class="field">
            <label>Teléfono de Contacto</label>
            <input v-model="perfil.telefono" type="text" placeholder="+54 9 11 1234-5678">
          </div>
          <div class="field full">
            <label>Cargo / Puesto en la Empresa</label>
            <input v-model="perfil.cargo" type="text" placeholder="Ej: Gerente General">
          </div>
          <div class="field full">
            <label>Biografía Breve</label>
            <textarea v-model="perfil.biografia" rows="3" placeholder="Cuéntanos un poco sobre ti y tu negocio..."></textarea>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer-actions">
      <button @click="guardarCambios" class="cs-btn cs-btn-primary cs-btn-lg" :disabled="guardando">
        {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const guardando = ref(false);

const perfil = ref({
  nombre_completo: '',
  telefono: '',
  cargo: '',
  biografia: ''
});

const user = computed(() => authStore.user);
const initials = computed(() => {
  if (perfil.value.nombre_completo) return perfil.value.nombre_completo.charAt(0).toUpperCase();
  if (user.value?.email) return user.value.email.charAt(0).toUpperCase();
  return 'U';
});

onMounted(() => {
  if (user.value?.id) {
    const saved = localStorage.getItem(`perfil_${user.value.id}`);
    if (saved) {
      perfil.value = JSON.parse(saved);
    }
  }
});

const guardarCambios = () => {
  guardando.value = true;
  setTimeout(() => {
    if (user.value?.id) {
      localStorage.setItem(`perfil_${user.value.id}`, JSON.stringify(perfil.value));
    }
    guardando.value = false;
    alert("¡Perfil guardado correctamente!");
  }, 600);
};
</script>

<style scoped>
.perfil-container { max-width: 1000px; margin: 0 auto; padding-bottom: 40px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 900; color: var(--cs-text-primary); }
.page-sub { font-size: 0.85rem; color: var(--cs-text-muted); margin-top: 4px; }

.perfil-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
.card-glass { background: var(--cs-bg-primary); border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-lg); padding: 24px; box-shadow: var(--cs-shadow-sm); }

.avatar-large {
  width: 100px; height: 100px; border-radius: 50%;
  background: var(--cs-gradient-brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.5rem; font-weight: 900; margin: 0 auto 16px;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}
.user-name-large { font-size: 1.2rem; font-weight: 800; color: var(--cs-text-primary); margin-bottom: 4px; }
.user-email-text { font-size: 0.85rem; color: var(--cs-text-muted); margin-bottom: 16px; }
.role-badge { background: rgba(79, 70, 229, 0.1); color: var(--cs-brand-500); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

.title-card { font-size: 1rem; font-weight: 800; color: var(--cs-text-primary); margin-bottom: 4px; }
.text-xs { font-size: 0.75rem; }
.text-muted { color: var(--cs-text-muted); }
.mb-4 { margin-bottom: 16px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field.full { grid-column: span 2; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--cs-text-secondary); text-transform: uppercase; margin-bottom: 6px; }
input, textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-md); background: var(--cs-bg-primary); color: var(--cs-text-primary); }
input:focus, textarea:focus { outline: none; border-color: var(--cs-brand-500); }
textarea { resize: vertical; }

.footer-actions { margin-top: 32px; display: flex; justify-content: flex-end; }

@media (max-width: 768px) {
  .perfil-grid { grid-template-columns: 1fr; }
}
</style>

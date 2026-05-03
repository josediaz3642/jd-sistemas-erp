<template>
  <div class="ajustes-container">
    <header class="page-header">
      <div>
        <h2 class="page-title">⚙️ Configuración del Sistema</h2>
        <p class="page-sub">Administra los datos de tu empresa y preferencias de facturación.</p>
      </div>
    </header>

    <div class="ajustes-grid">
      <section class="ajustes-section card-glass">
        <h3 class="title-card">Datos Fiscales</h3>
        <div class="form-grid">
          <div class="field full">
            <label>Nombre Comercial</label>
            <input v-model="empresa.nombre" type="text" placeholder="Ej: Contasoft ERP">
          </div>
          <div class="field">
            <label>Razón Social</label>
            <input v-model="empresa.razon_social" type="text">
          </div>
          <div class="field">
            <label>CUIT</label>
            <input v-model="empresa.cuit" type="text" placeholder="00-00000000-0">
          </div>
          <div class="field">
            <label>Condición IVA</label>
            <select v-model="empresa.condicion_iva">
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Exento">Exento</option>
            </select>
          </div>
          <div class="field">
            <label>Dirección</label>
            <input v-model="empresa.direccion" type="text">
          </div>
        </div>
      </section>

      <div class="col-right">
        <!-- SUSCRIPCIÓN PANEL -->
        <section class="ajustes-section card-glass plan-section" :class="planCardClass">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="title-card mb-1" style="margin-bottom: 4px;">Mi Suscripción</h3>
              <p class="text-xs text-slate-500 font-medium">Gestiona tu plan de Contasoft ERP</p>
            </div>
            <span class="cs-badge" :class="badgePlanClass">{{ subStore.estadoDisplay.toUpperCase() }}</span>
          </div>

          <div class="plan-details mb-6">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-bold text-slate-700">Días Restantes:</span>
              <span class="text-sm font-mono font-bold" :class="diasRestantes <= 5 ? 'txt-red' : 'txt-green'">
                {{ diasRestantes }} días
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :class="diasRestantes <= 5 ? 'bg-red' : 'bg-brand'" :style="{ width: Math.min((diasRestantes / 30) * 100, 100) + '%' }"></div>
            </div>
          </div>

          <a href="https://link.mercadopago.com.ar/contasofterp" target="_blank" class="cs-btn cs-btn-primary w-full justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Pagar / Renovar Plan
          </a>
        </section>

        <section class="ajustes-section card-glass">
          <h3 class="title-card">Logo de la Empresa</h3>
          <div class="logo-upload">
            <div class="preview-logo">
              <img v-if="empresa.logo" :src="empresa.logo" alt="Logo preview">
              <div v-else class="no-logo">Sin Logo</div>
            </div>
            <div class="upload-controls">
              <p>Sube tu logo para que aparezca en las facturas.</p>
              <input type="file" @change="subirLogo" accept="image/*" id="file-logo" class="hidden">
              <label for="file-logo" class="cs-btn cs-btn-secondary cs-btn-sm">Seleccionar Imagen</label>
            </div>
          </div>
        </section>

        <section class="ajustes-section card-glass">
          <h3 class="title-card">Parámetros de Venta</h3>
          <div class="form-grid">
            <div class="field">
              <label>Punto de Venta Predeterminado</label>
              <input v-model.number="empresa.punto_venta" type="number">
            </div>
            <div class="field">
              <label>Próximo Nº de Factura</label>
              <input v-model.number="empresa.proximo_numero" type="number">
            </div>
          </div>
        </section>
      </div>
    </div>

    <footer class="footer-actions">
      <button @click="guardarCambios" class="cs-btn cs-btn-primary cs-btn-lg" :disabled="guardando">
        {{ guardando ? 'Guardando...' : 'Guardar Configuración' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getEmpresa, saveEmpresa } from '@/services/data';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const authStore = useAuthStore();
const subStore = useSubscriptionStore();
const guardando = ref(false);
const empresa = ref({
  nombre: '',
  razon_social: '',
  cuit: '',
  condicion_iva: 'Responsable Inscripto',
  direccion: '',
  logo: null,
  punto_venta: 1,
  proximo_numero: 1
});

onMounted(async () => {
  const data = await getEmpresa(); 
  if (data) {
    empresa.value = { ...empresa.value, ...data };
  }
  
  if (authStore.user?.id) {
    subStore.fetchSuscripcion(authStore.user.id);
  }
});

const diasRestantes = computed(() => subStore.diasRestantes);

const badgePlanClass = computed(() => {
  if (subStore.estadoDisplay === 'suspendida' || diasRestantes.value <= 0) return 'cs-badge-error';
  if (subStore.estadoDisplay === 'trial') return 'cs-badge-info';
  return 'cs-badge-success';
});

const planCardClass = computed(() => {
  if (diasRestantes.value <= 5) return 'border-danger';
  return '';
});

const subirLogo = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 1000000) { 
    alert("El logo es muy pesado. Intenta con uno menor a 1MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    empresa.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
};

const guardarCambios = async () => {
  guardando.value = true;
  try {
    await saveEmpresa(empresa.value); 
    await authStore.fetchSession(); // Update global auth store state so Header changes instantly
    alert("¡Configuración guardada correctamente!");
  } catch (error) {
    console.error(error);
    alert("Error al guardar la configuración.");
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.ajustes-container { max-width: 1000px; margin: 0 auto; padding-bottom: 40px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: 900; color: var(--cs-text-primary); }
.page-sub { font-size: 0.85rem; color: var(--cs-text-muted); margin-top: 4px; }

.ajustes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.col-right { display: flex; flex-direction: column; gap: 24px; }

.title-card { font-size: 1rem; font-weight: 800; color: var(--cs-text-primary); margin-bottom: 16px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field.full { grid-column: span 2; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--cs-text-secondary); text-transform: uppercase; margin-bottom: 6px; }
input, select { width: 100%; padding: 10px 14px; border: 1px solid var(--cs-border-soft); border-radius: var(--cs-radius-md); background: var(--cs-bg-primary); color: var(--cs-text-primary); }
input:focus, select:focus { outline: none; border-color: var(--cs-brand-500); }

.logo-upload { display: flex; align-items: center; gap: 20px; }
.preview-logo { width: 100px; height: 100px; border: 2px dashed var(--cs-border-medium); border-radius: var(--cs-radius-lg); display: flex; align-items: center; justify-content: center; overflow: hidden; background: var(--cs-bg-tertiary); flex-shrink: 0; }
.preview-logo img { width: 100%; height: 100%; object-fit: contain; }
.no-logo { color: var(--cs-text-muted); font-size: 0.75rem; font-weight: 600; }
.hidden { display: none; }
.upload-controls p { font-size: 0.8rem; color: var(--cs-text-muted); margin-bottom: 10px; }

.footer-actions { margin-top: 32px; display: flex; justify-content: flex-end; }

/* Plan Card Styles */
.plan-section { position: relative; overflow: hidden; }
.border-danger { border-color: var(--cs-error) !important; box-shadow: 0 0 0 1px var(--cs-error); }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-2 { margin-bottom: 8px; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.font-mono { font-family: var(--cs-font-mono); }
.text-slate-500 { color: var(--cs-text-muted); }
.text-slate-700 { color: var(--cs-text-primary); }
.txt-red { color: var(--cs-error); }
.txt-green { color: var(--cs-success); }
.w-full { width: 100%; }
.justify-center { justify-content: center; }

.progress-bar { width: 100%; height: 6px; background: var(--cs-bg-tertiary); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.bg-brand { background: var(--cs-brand-500); }
.bg-red { background: var(--cs-error); }

@media (max-width: 768px) {
  .ajustes-grid { grid-template-columns: 1fr; }
}
</style>
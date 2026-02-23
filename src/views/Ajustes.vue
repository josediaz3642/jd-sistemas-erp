<template>
  <div class="ajustes-container">
    <header class="page-header">
      <h2>⚙️ Configuración del Sistema</h2>
      <p>Administra los datos de tu empresa y preferencias de facturación.</p>
    </header>

    <div class="ajustes-grid">
      <section class="ajustes-section glass-card">
        <h3>Datos Fiscales</h3>
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

      <section class="ajustes-section glass-card">
        <h3>Logo de la Empresa</h3>
        <div class="logo-upload">
          <div class="preview-logo">
            <img v-if="empresa.logo" :src="empresa.logo" alt="Logo preview">
            <div v-else class="no-logo">Sin Logo</div>
          </div>
          <div class="upload-controls">
            <p>Sube tu logo para que aparezca en las facturas.</p>
            <input type="file" @change="subirLogo" accept="image/*" id="file-logo" class="hidden">
            <label for="file-logo" class="btn-subir">Seleccionar Imagen</label>
          </div>
        </div>
      </section>

      <section class="ajustes-section glass-card">
        <h3>Parámetros de Venta</h3>
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

    <footer class="footer-actions">
      <button @click="guardarCambios" class="btn-guardar">Guardar Configuración</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getEmpresa, saveEmpresa } from '@/services/data'; // Cambiamos saveWithTenant por saveEmpresa

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

onMounted(() => {
  const data = getEmpresa();
  if (data) {
    // Fusionamos los datos existentes con el estado inicial para no perder campos
    empresa.value = { ...empresa.value, ...data };
  }
});

const subirLogo = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validación de tamaño (opcional, para no saturar el LocalStorage)
  if (file.size > 500000) { // 500kb
    alert("El logo es muy pesado. Intenta con uno menor a 500kb.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    empresa.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
};

const guardarCambios = () => {
  try {
    saveEmpresa(empresa.value); // Usamos la nueva función
    alert("¡Configuración guardada correctamente!");
    // Recargar la página para que el logo se actualice en todo el sitio
    window.location.reload(); 
  } catch (error) {
    console.error(error);
    alert("Error al guardar los ajustes.");
  }
};
</script>
<style scoped>
.ajustes-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
.ajustes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
.ajustes-section { padding: 25px !important; }
.ajustes-section h3 { margin-bottom: 20px; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.field.full { grid-column: span 2; }
.field label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 5px; }
.field input, .field select { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }

.logo-upload { display: flex; align-items: center; gap: 20px; }
.preview-logo { width: 120px; height: 120px; border: 2px dashed #cbd5e1; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f8fafc; }
.preview-logo img { width: 100%; height: 100%; object-fit: contain; }
.hidden { display: none; }
.btn-subir { background: #f1f5f9; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; border: 1px solid #e2e8f0; }

.footer-actions { margin-top: 30px; display: flex; justify-content: flex-end; }
.btn-guardar { background: #2563eb; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; cursor: pointer; }
</style>
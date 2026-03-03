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
import { getEmpresa, saveEmpresa } from '@/services/data';

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

// CAMBIO 1: El onMounted ahora es async para poder usar await
onMounted(async () => {
  const data = await getEmpresa(); // Esperamos a que Supabase responda
  if (data) {
    empresa.value = { ...empresa.value, ...data };
  }
});

const subirLogo = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Supabase permite logos más pesados que LocalStorage, 
  // pero mantengamos la precaución de tamaño.
  if (file.size > 1000000) { // 1MB
    alert("El logo es muy pesado. Intenta con uno menor a 1MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    empresa.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
};

// CAMBIO 2: El guardar ahora es async
const guardarCambios = async () => {
  try {
    await saveEmpresa(empresa.value); // Esperamos a que se guarde en la nube
    alert("¡Configuración guardada en la nube correctamente!");
    // window.location.reload(); // Ya no es estrictamente necesario, pero puedes dejarlo
  } catch (error) {
    console.error(error);
    alert("Error al conectar con la base de datos.");
  }
};
</script>

<style scoped>
/* Los estilos permanecen igual */
.ajustes-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
.ajustes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
.ajustes-section { padding: 25px !important; }
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
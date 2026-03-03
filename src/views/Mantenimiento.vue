<template>
  <div class="p-8 max-w-5xl mx-auto">
    <header class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900">🛡️ Mantenimiento y Seguridad</h1>
      <p class="text-slate-500">Gestiona la integridad de tus datos y la sincronización híbrida.</p>
    </header>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card-modern bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl md:col-span-2">
        <div class="flex items-center gap-4 mb-4">
          <div class="bg-white/20 p-3 rounded-lg text-2xl">☁️</div>
          <h3 class="font-bold text-xl">Sincronización Maestra con Supabase</h3>
        </div>
        <p class="mb-6 opacity-90 text-lg">Suba sus datos locales (Clientes, Stock y Caja) directamente a la base de datos centralizada. Ideal para trabajar en múltiples dispositivos.</p>
        
        <div class="flex flex-wrap gap-4">
          <button 
            @click="migrarALaNube" 
            :disabled="migrando"
            class="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black hover:scale-105 active:scale-95 transition shadow-lg disabled:opacity-50"
          >
            {{ migrando ? '🚀 SINCRONIZANDO...' : '🚀 INICIAR MIGRACIÓN CLOUD' }}
          </button>
        </div>
      </div>

      <div class="card-modern bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 class="font-bold text-slate-800 text-xl mb-3">Exportar Backup Local</h3>
        <p class="text-slate-500 mb-6">Descarga una copia de seguridad en formato JSON. Útil como resguardo físico fuera de la plataforma.</p>
        <button @click="exportarDatos" class="btn-secondary w-full">
          📥 Descargar Backup (.json)
        </button>
      </div>

      <div class="card-modern bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 class="font-bold text-slate-800 text-xl mb-3 text-red-600">Restauración Crítica</h3>
        <p class="text-slate-500 mb-6 font-medium">⚠️ Esta acción reemplazará los datos del navegador por los del archivo.</p>
        <input type="file" id="fileInput" @change="importarDatos" class="hidden" accept=".json" />
        <label for="fileInput" class="btn-danger w-full cursor-pointer inline-block text-center">
          📤 Subir y Sobrescribir
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/supabase';

const prefix = "contasoft_";
const migrando = ref(false);

const exportarDatos = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(prefix)) {
      data[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `erp_cloud_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importarDatos = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (confirm("¿Confirmar restauración? Se perderán los cambios no sincronizados.")) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) localStorage.removeItem(key);
        });
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        window.location.reload();
      }
    } catch (err) {
      alert("Archivo de backup inválido.");
    }
  };
  reader.readAsText(file);
};

const migrarALaNube = async () => {
  if (migrando.value) return;
  
  const userStr = localStorage.getItem('contasoft_user_session');
  if (!userStr) return alert("Debes estar logueado para migrar a la nube.");
  
  const user = JSON.parse(userStr);
  const empresaId = user.empresaId;

  const confirmacion = confirm("Se copiarán tus datos locales a Supabase. ¿Continuar?");
  if (!confirmacion) return;

  migrando.value = true;
  try {
    // 1. MIGRAR CLIENTES
    const clientesLocales = JSON.parse(localStorage.getItem(`${prefix}clientes_emp_default`) || '[]');
    if (clientesLocales.length > 0) {
      const { error: errC } = await supabase.from('clientes').insert(
        clientesLocales.map(c => ({
          nombre: c.nombre,
          cuit: c.cuit,
          empresa_id: empresaId, // Asignamos ID real de nube
          condicion_iva: c.condicionIva || 'Consumidor Final'
        }))
      );
      if (errC) throw errC;
    }

    // 2. MIGRAR STOCK
    const stockLocal = JSON.parse(localStorage.getItem(`${prefix}stock_emp_default`) || '[]');
    if (stockLocal.length > 0) {
      const { error: errS } = await supabase.from('productos').insert(
        stockLocal.map(p => ({
          nombre: p.nombre,
          precio: p.precioVenta || p.precio,
          cantidad: p.cantidad,
          empresa_id: empresaId
        }))
      );
      if (errS) throw errS;
    }

    alert("✅ ¡Sincronización Exitosa! Ya puedes borrar tus datos locales si lo deseas.");
  } catch (error) {
    console.error(error);
    alert("Error en migración: " + error.message);
  } finally {
    migrando.value = false;
  }
};
</script>

<style scoped>
.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #e2e8f0; }

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-danger:hover { background: #fecaca; }

.card-modern {
  transition: transform 0.2s ease;
}
</style>
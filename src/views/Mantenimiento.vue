<template>
  <div class="page-container bg-slate-50 min-h-screen">
    <header class="p-6 bg-white border-b border-slate-200">
      <h1 class="text-2xl font-black text-slate-900 flex items-center gap-2">
        <span class="text-indigo-600">🛡️</span> Mantenimiento
      </h1>
      <p class="text-sm text-slate-500 font-medium">JD Sistemasinformáticos - Gestión de Integridad</p>
    </header>
    
    <div class="p-4 max-w-4xl mx-auto space-y-4">
      
      <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-lg overflow-hidden relative">
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <span class="bg-indigo-500 p-2 rounded-lg text-xl">☁️</span>
            <h3 class="font-bold text-lg">Nube Supabase</h3>
          </div>
          <p class="text-slate-400 text-sm mb-6">Sincroniza el stock y clientes locales con la base de datos central.</p>
          
          <button 
            @click="migrarALaNube" 
            :disabled="migrando"
            class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <span v-if="migrando" class="animate-spin text-xl">🔄</span>
            {{ migrando ? 'SINCRONIZANDO...' : 'INICIAR MIGRACIÓN CLOUD' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="mb-4">
            <h4 class="font-bold text-slate-800">Copia de Seguridad</h4>
            <p class="text-xs text-slate-500">Exporta tus datos en formato JSON.</p>
          </div>
          <button @click="exportarDatos" class="btn-action-secondary">
            📥 Descargar Backup
          </button>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="mb-4">
            <h4 class="font-bold text-red-600">Restauración</h4>
            <p class="text-xs text-slate-500">Carga un archivo y pisa los datos locales.</p>
          </div>
          <input type="file" id="fileInput" @change="importarDatos" class="hidden" accept=".json" />
          <label for="fileInput" class="btn-action-danger">
            📤 Subir Archivo
          </label>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-bold text-slate-800">Limpieza de Caché</h4>
              <p class="text-xs text-slate-500">Borra los datos temporales del navegador.</p>
            </div>
            <button @click="limpiarLocal" class="text-red-500 font-bold text-sm hover:underline">
              Borrar Todo
            </button>
          </div>
        </div>

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
  
  // 1. Intentamos obtener la sesión o usamos un ID por defecto para JD Sistemas
  const userStr = localStorage.getItem('contasoft_user_session');
  let empresaId = 'emp_default'; // Valor por defecto por si no hay sesión
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      empresaId = user.empresaId || 'emp_default';
    } catch (e) {
      console.error("Error al leer sesión:", e);
    }
  }

  const confirmacion = confirm("Se copiarán tus datos locales a Supabase. ¿Continuar?");
  if (!confirmacion) return;

  migrando.value = true;
  try {
    // --- MIGRAR STOCK ---
    // Usamos el prefijo correcto para buscar en LocalStorage
    const stockLocal = JSON.parse(localStorage.getItem(`${prefix}stock_emp_default`) || '[]');
    
    if (stockLocal.length > 0) {
      const { error: errS } = await supabase.from('stock').insert(
        stockLocal.map(p => ({
          nombre: p.nombre,
          codigo: p.codigo,
          categoria: p.categoria,
          precio_base: Number(p.precio_base) || 0,
          precio_venta: Number(p.precio_publico) || Number(p.precio) || 0,
          precio: Number(p.precio_publico) || Number(p.precio) || 0,
          cantidad: Number(p.stock) || Number(p.cantidad) || 0,
          ganancia_porcentaje: Number(p.ganancia_porcentaje) || 35,
          stock_minimo: Number(p.stock_minimo) || 5,
          empresa_id: empresaId
        }))
      );
      if (errS) throw errS;
    }

    // --- MIGRAR CLIENTES (Si tenés la tabla creada) ---
    const clientesLocales = JSON.parse(localStorage.getItem(`${prefix}clientes_emp_default`) || '[]');
    if (clientesLocales.length > 0) {
      const { error: errC } = await supabase.from('clientes').insert(
        clientesLocales.map(c => ({
          nombre: c.nombre,
          cuit: c.cuit,
          empresa_id: empresaId,
          condicion_iva: c.condicionIva || 'Consumidor Final'
        }))
      );
      if (errC) {
        console.warn("Error en clientes (puede que la tabla no exista):", errC.message);
      }
    }

    alert("✅ ¡Sincronización Exitosa! Los datos ya están en la nube.");
  } catch (error) {
    console.error("Error detallado:", error);
    alert("Error en migración: " + (error.message || "Revisá la consola"));
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
.btn-action-secondary {
  @apply w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors;
}

.btn-action-danger {
  @apply w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors inline-block text-center cursor-pointer;
}

/* Ajuste para que en iOS el scroll sea suave */
.page-container {
  -webkit-overflow-scrolling: touch;
}

/* Efecto de presión en botones para feedback táctil */
button:active {
  transform: scale(0.98);
}
</style>
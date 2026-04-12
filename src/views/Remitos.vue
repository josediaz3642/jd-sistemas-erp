<template>
  <div class="remitos-container">
    <header class="header-section">
      <h2>Gestión de Remitos</h2>
      <div class="actions">
        <input 
          type="text" 
          v-model="filtro" 
          placeholder="Buscar por cliente o número..." 
          class="search-input"
        />     
<router-link to="/remitos/nuevo" class="btn-primary">
  + Nuevo Remito
</router-link>
      </div>
	
    </header>

    <div class="table-responsive">
      <table class="minimal-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="remito in remitosFiltrados" :key="remito.id">
            <td>{{ formatFecha(remito.fecha) }}</td>
            <td>#{{ remito.numero || remito.id.toString().slice(0, 8) }}</td>
            <td>{{ remito.cliente_nombre }}</td>
            <td>
              <span :class="['badge', remito.estado?.toLowerCase()]">
                {{ remito.estado || 'Pendiente' }}
              </span>
            </td>
            <td class="text-right">
              <button @click="verDetalle(remito.id)" class="btn-icon" title="Ver detalle">
                👁️
              </button>
              <button @click="imprimir(remito)" class="btn-icon" title="Imprimir">
                🖨️
              </button>
            </td>
          </tr>
          <tr v-if="remitosFiltrados.length === 0">
            <td colspan="5" class="text-center">No se encontraron remitos.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getRemitos } from '@/services/data';
import { registrarMovimientoCaja } from '@/services/data';

const remitoPagado = ref(true); // Por defecto marcado
const metodoPagoRemito = ref('Efectivo');
const router = useRouter();
const remitos = ref([]);
const filtro = ref('');

const cargarRemitos = async () => {
  try {
    remitos.value = await getRemitos();
  } catch (error) {
    console.error("Error al cargar remitos:", error);
  }
};
const guardarRemitoCompleto = async () => {
  try {
    // 1. Primero guardamos el remito (tu lógica actual)
    const nuevoRemito = await guardarRemito(datosRemito.value);
    
    // 2. Si se marcó como pagado, registramos en caja
    if (remitoPagado.value && nuevoRemito) {
      await registrarMovimientoCaja(
        'ingreso', 
        totalRemito.value, 
        `Pago Remito N° ${nuevoRemito.numero || nuevoRemito.id.slice(0,5)}`, 
        'Ventas',
        clienteSeleccionado.value.id // Vinculamos al cliente
      );
    }
    
    alert("Remito guardado y pago registrado en caja.");
  } catch (error) {
    console.error("Error en proceso completo:", error);
  }
};
const remitosFiltrados = computed(() => {
  if (!remitos.value) return [];
  if (!filtro.value) return remitos.value;
  const f = filtro.value.toLowerCase();
  return remitos.value.filter(r => 
    r.cliente_nombre?.toLowerCase().includes(f) || 
    r.numero?.toString().includes(f)
  );
});

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  return new Date(fechaStr).toLocaleDateString('es-AR');
};

const verDetalle = (id) => {
  router.push(`/remitos/${id}`); // Asegúrate que sea plural
};

const imprimir = (remito) => { 
  router.push({ 
    name: 'DetalleRemito', 
    params: { id: remito.id }, 
    query: { imprimir: 'true' } 
  });
};

onMounted(cargarRemitos);
</script>

<style scoped>
.remitos-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.actions {
  display: flex;
  gap: 15px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}

.btn-primary {
  background-color: #000;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.8;
}

.minimal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.minimal-table th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #eee;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.minimal-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.text-right { text-align: right; }
.text-center { padding: 40px; color: #999; }

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.badge.pendiente { background: #fff3cd; color: #856404; }
.badge.entregado { background: #d4edda; color: #155724; }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  font-size: 16px;
}
</style>
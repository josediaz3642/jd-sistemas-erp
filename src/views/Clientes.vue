<template>
  <div class="page">
    <div class="card-glass header">
      <h1>Clientes</h1>
      <button class="btn-primary" @click="nuevoCliente">
        + Nuevo Cliente
      </button>
    </div>

    <div class="card-glass">
      <div v-if="loading" class="empty">Cargando clientes desde la nube...</div>
      
      <table v-else-if="clientes.length > 0">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Facturas</th>
            <th>Total Facturado</th>
            <th>Saldo Actual</th> <th>Última Compra</th>
            <th>Acciones</th> 
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in clientes"
            :key="c.id"
            @click="verCliente(c.id)"
            style="cursor:pointer"
          >
            <td>{{ c.nombre }}</td>
            <td>{{ obtenerResumen(c).cantidad }}</td>
            <td>${{ obtenerResumen(c).total.toLocaleString() }}</td>
            <td :class="c.saldo > 0 ? 'deuda' : 'a-favor'">
              ${{ (c.saldo || 0).toLocaleString() }}
            </td>
<td>
  <button 
    @click="enviarWhatsApp(c)" 
    class="btn-wa-tabla"
    title="Enviar WhatsApp"
  >
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" />
  </button>
</td>
            <td>
              {{
                obtenerResumen(c).ultima
                  ? new Date(obtenerResumen(c).ultima).toLocaleDateString("es-AR")
                  : "-"
              }}
            </td>
            <td class="actions">
              <div class="flex-actions">
                <button 
                  type="button"
                  @click.stop="abrirAjuste(c, 'ND')" 
                  class="btn-icon btn-nd"
                  title="Nota de Débito (+ Deuda)"
                > + </button>
                
                <button 
                  type="button"
                  @click.stop="abrirAjuste(c, 'NC')" 
                  class="btn-icon btn-nc"
                  title="Nota de Crédito (- Deuda)"
                > - </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="empty">No hay clientes cargados en la base de datos.</p>
    </div>

    <div class="card-glass ranking">
      <h2>Top 5 Mejores Clientes</h2>
      <table v-if="rankingClientes.length > 0">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Facturas</th>
            <th>Total Facturado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in rankingClientes" :key="c.nombre">
            <td>{{ c.nombre }}</td>
            <td>{{ c.cantidad }}</td>
            <td>${{ c.total.toLocaleString() }}</td>
            <td>
              <span :class="estadoCliente(c.nombre, c.id)">
                {{ estadoCliente(c.nombre, c.id).toUpperCase() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalAjuste 
      v-if="modalConfig.show"
      :show="modalConfig.show"
      :tipo="modalConfig.tipo"
      :clienteId="modalConfig.clienteId"
      :clienteNombre="modalConfig.nombre"
      @close="modalConfig.show = false"
      @success="handleExito"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getClientes, getFacturas } from "@/services/data";
import ModalAjuste from '@/components/ModalAjuste.vue';

const router = useRouter();
const clientes = ref([]);
const facturas = ref([]);
const loading = ref(true);

const modalConfig = ref({
  show: false,
  tipo: 'ND',
  clienteId: null,
  nombre: ''
});
// Dentro del <script setup> de Clientes.vue

function enviarWhatsApp(cliente) {
  if (!cliente.telefono) {
    alert("Este cliente no tiene un número de teléfono registrado.");
    return;
  }
  
  // Limpiamos el número (solo dejamos dígitos)
  const numeroLimpio = cliente.telefono.replace(/\D/g, '');
  
  // Mensaje predeterminado para el listado general
  const mensaje = `Hola *${cliente.nombre}*, te saludamos de JD Sistemas. ¿Cómo podemos ayudarte?`;
  
  const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  
  // Abrir en pestaña nueva
  window.open(url, '_blank');
}
// FUNCIÓN DE CARGA ÚNICA (Corregida)
const cargarDatos = async () => {
  try {
    loading.value = true;
    const [dataClientes, dataFacturas] = await Promise.all([
      getClientes(),
      getFacturas()
    ]);
    clientes.value = dataClientes || [];
    facturas.value = dataFacturas || [];
  } catch (error) {
    console.error("Error al cargar datos:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(cargarDatos);

const abrirAjuste = (cliente, tipo) => {
  modalConfig.value = {
    show: true,
    tipo: tipo,
    clienteId: cliente.id,
    nombre: cliente.nombre
  };
};

const handleExito = () => {
  cargarDatos(); // Recarga para ver el saldo impactado
};

function nuevoCliente() {
  router.push("/cliente/nuevo");
}

function verCliente(id) {
  router.push(`/cliente/${id}`);
}

// Resumen optimizado
function obtenerResumen(cliente) {
  const facturasCliente = facturas.value.filter(
    f => f.cliente_id === cliente.id || f.cliente === cliente.nombre
  );
  
  const total = facturasCliente.reduce((acc, f) => acc + Number(f.total), 0);
  const facturasOrdenadas = [...facturasCliente].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  const ultima = facturasOrdenadas.length > 0 ? facturasOrdenadas[0].fecha : null;

  return { cantidad: facturasCliente.length, total, ultima };
}

function estadoCliente(nombre, id) {
  const res = obtenerResumen({ id, nombre });
  if (res.cantidad === 0) return "inactivo";
  const diferenciaDias = (new Date() - new Date(res.ultima)) / (1000 * 60 * 60 * 24);
  if (diferenciaDias <= 30) return "activo";
  if (diferenciaDias <= 60) return "medio";
  return "inactivo";
}

const rankingClientes = computed(() => {
  const mapa = {};
  facturas.value.forEach(f => {
    const key = f.cliente || 'Desconocido';
    if (!mapa[key]) mapa[key] = { nombre: key, id: f.cliente_id, total: 0, cantidad: 0 };
    mapa[key].total += Number(f.total);
    mapa[key].cantidad += 1;
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5);
});
</script>

<style scoped>
.btn-wa-tabla {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-wa-tabla:hover {
  background: #dcfce7; /* Un verde muy clarito */
}

.btn-wa-tabla img {
  display: block;
}
.page { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.card-glass { backdrop-filter: blur(15px); background: rgba(255, 255, 255, 0.1); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; }
.btn-primary { background: #007bff; border: none; color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }

.deuda { color: #ff8787; font-weight: bold; }
.a-favor { color: #69db7c; font-weight: bold; }
.activo { color: #51cf66; }
.medio { color: #fcc419; }
.inactivo { color: #ff6b6b; }

.flex-actions { display: flex; gap: 10px; justify-content: center; }
.btn-icon {
  width: 32px; height: 32px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.2); color: white; cursor: pointer; font-weight: bold;
}
.btn-nd:hover { background: #2563eb; }
.btn-nc:hover { background: #16a34a; }
.empty { text-align: center; opacity: 0.5; padding: 40px; }
</style>
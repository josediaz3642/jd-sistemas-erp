<template>
  <div class="container">
    <div class="card-glass">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h1>Proveedores</h1>
        <button class="btn" @click="nuevo">Nuevo Proveedor</button>
      </div>

      <table class="table" style="margin-top:12px;">
        <thead><tr><th>Nombre</th><th>CUIT</th><th>Tel</th><th></th></tr></thead>
        <tbody>
          <tr v-for="p in proveedores" :key="p.id">
            <td>{{ p.nombre }}</td>
            <td>{{ p.cuit }}</td>
            <td>{{ p.telefono }}</td>
            <td>
              <button class="btn secondary" @click="ver(p.id)">Ver</button>
              <button class="btn" @click="editar(p)">Editar</button>
            </td>
          </tr>
          <tr v-if="proveedores.length===0"><td colspan="4" class="kv">No hay proveedores</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProveedores } from '@/services/data';

const router = useRouter();
const proveedores = ref([]);

onMounted(() => { proveedores.value = getProveedores(); });

function nuevo() { router.push('/proveedor/0'); }
function ver(id) { router.push(`/proveedor/${id}`); }
function editar(p) { router.push(`/proveedor/${p.id}`); }
</script>

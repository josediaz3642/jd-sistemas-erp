<template>
  <div class="factura-page">
    <h1>Facturación</h1>

    <div class="empresa">
      <img src="/logo.png" alt="Logo empresa" class="logo" />
      <div>
        <h2>{{ empresa.nombre }}</h2>
        <p>CUIT: {{ empresa.cuit }}</p>
        <p>Dirección: {{ empresa.direccion }}</p>
        <p>IVA: {{ empresa.condicionIVA }}</p>
      </div>
    </div>

    <form @submit.prevent="generarPDF">
      <div class="factura-info">
        <label>Tipo de Comprobante:</label>
        <select v-model="factura.tipo">
          <option value="A">Factura A</option>
          <option value="B">Factura B</option>
          <option value="C">Factura C</option>
        </select>

        <label>Punto de Venta:</label>
        <input v-model="factura.puntoVenta" type="text" />

        <label>Número:</label>
        <input v-model="factura.numero" type="text" />

        <label>Fecha:</label>
        <input v-model="factura.fecha" type="date" />
      </div>

      <div class="cliente">
        <h3>Datos del Cliente</h3>
        <label>Nombre/Razón Social:</label>
        <input v-model="factura.cliente.nombre" />

        <label>CUIT/DNI:</label>
        <input v-model="factura.cliente.cuit" />

        <label>Condición frente al IVA:</label>
        <input v-model="factura.cliente.iva" />
      </div>

      <div class="items">
        <h3>Detalle de Productos/Servicios</h3>
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in factura.items" :key="i">
              <td><input v-model="item.descripcion" /></td>
              <td><input v-model.number="item.cantidad" type="number" min="1" /></td>
              <td><input v-model.number="item.precio" type="number" min="0" step="0.01" /></td>
              <td>{{ (item.cantidad * item.precio).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <button type="button" @click="agregarItem">Agregar Ítem</button>
      </div>

      <div class="totales">
        <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
        <p>IVA (21%): ${{ iva.toFixed(2) }}</p>
        <h3>Total: ${{ total.toFixed(2) }}</h3>
      </div>

      <button type="submit">💾 Generar y Guardar PDF</button>
      <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const empresa = ref({
  nombre: 'Mi Empresa S.A.',
  cuit: '30-12345678-9',
  direccion: 'Av. Siempre Viva 123, Buenos Aires',
  condicionIVA: 'Responsable Inscripto',
});

const factura = ref({
  tipo: 'B',
  puntoVenta: '0001',
  numero: '00000001',
  fecha: new Date().toISOString().split('T')[0],
  cliente: { nombre: '', cuit: '', iva: '' },
  items: [{ descripcion: '', cantidad: 1, precio: 0 }],
});

const mensaje = ref('');

function agregarItem() {
  factura.value.items.push({ descripcion: '', cantidad: 1, precio: 0 });
}

const subtotal = computed(() =>
  factura.value.items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
);
const iva = computed(() => subtotal.value * 0.21);
const total = computed(() => subtotal.value + iva.value);

function generarPDF() {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(empresa.value.nombre, 14, 15);
  doc.setFontSize(10);
  doc.text(`CUIT: ${empresa.value.cuit}`, 14, 21);
  doc.text(empresa.value.direccion, 14, 26);
  doc.text(`IVA: ${empresa.value.condicionIVA}`, 14, 31);

  doc.setFontSize(12);
  doc.text(`Factura ${factura.value.tipo}`, 160, 15);
  doc.text(`Punto de Venta: ${factura.value.puntoVenta}`, 160, 21);
  doc.text(`Número: ${factura.value.numero}`, 160, 26);
  doc.text(`Fecha: ${factura.value.fecha}`, 160, 31);

  doc.setFontSize(11);
  doc.text('Cliente:', 14, 45);
  doc.text(`Nombre: ${factura.value.cliente.nombre}`, 14, 51);
  doc.text(`CUIT: ${factura.value.cliente.cuit}`, 14, 56);
  doc.text(`IVA: ${factura.value.cliente.iva}`, 14, 61);

  // Tabla de ítems
  const rows = factura.value.items.map(i => [
    i.descripcion,
    i.cantidad,
    `$${i.precio.toFixed(2)}`,
    `$${(i.cantidad * i.precio).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: rows,
  });

  const y = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: $${subtotal.value.toFixed(2)}`, 140, y);
  doc.text(`IVA (21%): $${iva.value.toFixed(2)}`, 140, y + 6);
  doc.setFontSize(13);
  doc.text(`Total: $${total.value.toFixed(2)}`, 140, y + 14);

  // Guardar automáticamente
  const nombreArchivo = `Factura_${factura.value.tipo}_${factura.value.numero}.pdf`;
  doc.save(nombreArchivo);
  mensaje.value = `✅ Factura generada y guardada: ${nombreArchivo}`;
}
</script>

<style scoped>
.factura-page {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  background: var(--card);
  color: var(--text);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.empresa {
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.logo {
  height: 70px;
  border-radius: 12px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

input, select {
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  background: var(--bg);
  color: var(--text);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ccc;
  padding: 6px;
}
th {
  background: var(--accent);
  color: white;
}

button {
  align-self: flex-start;
}

.totales {
  text-align: right;
  font-size: 1rem;
}
.mensaje {
  margin-top: 10px;
  color: var(--accent);
}
</style>

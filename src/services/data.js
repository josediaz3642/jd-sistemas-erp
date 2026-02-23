// src/services/data.js
import { getCurrentUser } from "./auth";

const STORAGE = {
  clientes: "contasoft_clientes",
  proveedores: "contasoft_proveedores",
  usuarios: "contasoft_usuarios",
  empresa: "contasoft_empresa",
  facturas: "contasoft_facturas",
  stock: "contasoft_stock",
  cheques: "contasoft_cheques",
  productos: "contasoft_productos",
  compras: "contasoft_compras"
};

// --- HELPERS INTERNOS (No se exportan) ---
function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    const user = getCurrentUser();
    if (!raw) return fallback;
    let data = JSON.parse(raw);
    if (!Array.isArray(data)) data = [data]; 
    if (!user) return fallback;
    if (key === STORAGE.usuarios) return data;
    const filtrados = data.filter(item => item.empresaId === user.empresaId);
    if (key === STORAGE.empresa) {
      return filtrados.length > 0 ? filtrados[0] : (Array.isArray(fallback) ? null : fallback);
    }
    return filtrados;
  } catch (e) { return fallback; }
}

function saveWithTenant(key, value) {
  const user = getCurrentUser();
  if (!user) return;
  const raw = localStorage.getItem(key);
  let allData = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    allData = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) { allData = []; }

  if (!Array.isArray(value)) {
    const item = { ...value, empresaId: user.empresaId };
    const idKey = (key === STORAGE.empresa) ? 'empresaId' : 'id';
    const idx = allData.findIndex(i => i[idKey] === item[idKey]);
    if (idx !== -1) allData[idx] = item;
    else allData.push(item);
  } else {
    const otrasEmpresas = allData.filter(i => i.empresaId !== user.empresaId);
    const estaEmpresa = value.map(i => ({ ...i, empresaId: user.empresaId }));
    allData = [...otrasEmpresas, ...estaEmpresa];
  }
  localStorage.setItem(key, JSON.stringify(allData));
}

// --- EXPORTS DE DATOS ---
export function initializeDataService() { 
  if (!localStorage.getItem(STORAGE.usuarios)) {
    localStorage.setItem(STORAGE.usuarios, JSON.stringify([{ 
      id: 1, nombre: "Admin", email: "admin@admin.com", password: "1234", rol: "admin", empresaId: "emp_default" 
    }]));
  }
}

// Empresa
export function getEmpresa() { return load(STORAGE.empresa, null); }
export function saveEmpresa(empresa) { saveWithTenant(STORAGE.empresa, empresa); }

// Facturas
export function getFacturas() { return load(STORAGE.facturas); }
export function saveFactura(f) {
  if (!f.id) f.id = Date.now();
  saveWithTenant(STORAGE.facturas, f);
  return f;
}

// Clientes y Proveedores
export function getClientes() { return load(STORAGE.clientes); }
export function saveCliente(c) { if (!c.id) c.id = Date.now(); saveWithTenant(STORAGE.clientes, c); }
export function getProveedores() { return load(STORAGE.proveedores); }
export function saveProveedor(p) { if (!p.id) p.id = Date.now(); saveWithTenant(STORAGE.proveedores, p); }

// Stock y Productos
export function getStockItems() { return load(STORAGE.stock); }
export function saveStockItem(i) { if (!i.id) i.id = Date.now(); saveWithTenant(STORAGE.stock, i); }

// Cheques (UNIFICADOS)
export function getCheques() { return load(STORAGE.cheques); }
export function saveCheque(c) { if (!c.id) c.id = Date.now(); saveWithTenant(STORAGE.cheques, c); }
export function updateChequesList(lista) { saveWithTenant(STORAGE.cheques, lista); }

// Compras
export function getCompras() { return load(STORAGE.compras); }
export function saveCompra(c) { if (!c.id) c.id = Date.now(); saveWithTenant(STORAGE.compras, c); }

// Usuarios (Para Auth)
export function getUsuarios() { return load(STORAGE.usuarios); }
export function saveUsuario(u) {
  const us = getUsuarios();
  const i = us.findIndex(x => x.id === u.id || (u.email && x.email === u.email));
  if (i !== -1) us[i] = u; else us.push(u);
  localStorage.setItem(STORAGE.usuarios, JSON.stringify(us));
}
export function deleteUser(id) {
  const us = getUsuarios().filter(u => u.id !== id);
  localStorage.setItem(STORAGE.usuarios, JSON.stringify(us));
}

// --- LOGICA DE NEGOCIO ---
export function registrarPago(id, monto, metodo = "Transferencia") {
  const facturas = getFacturas();
  const f = facturas.find(x => x.id == id);
  if (!f) return;
  if (!f.pagos) f.pagos = [];
  f.pagos.push({ id: Date.now(), fecha: new Date().toISOString().split("T")[0], monto: Number(monto), metodo });
  f.montoPagado = f.pagos.reduce((acc, p) => acc + p.monto, 0);
  saveWithTenant(STORAGE.facturas, facturas);
}
// --- FUNCIONES DE DASHBOARD ---
export function getDashboardKPIs() {
  const facturas = getFacturas().filter(f => f.estado !== 'ANULADA');
  const clientes = getClientes();
  const stock = getStockItems();

  return {
    totalFacturado: facturas.reduce((acc, f) => acc + (Number(f.total) || 0), 0),
    totalFacturas: facturas.length,
    totalClientes: clientes.length,
    stockBajo: stock.filter(i => i.cantidad < 5).length
  };
}
// --- FUNCIONES DE BÚSQUEDA ESPECÍFICA (Añadir al final de data.js) ---

export function getClienteById(id) {
  const clientes = getClientes();
  // Usamos == en lugar de === por si el ID viene como String desde la URL
  return clientes.find(c => c.id == id) || null;
}

export function getProveedorById(id) {
  const proveedores = getProveedores();
  return proveedores.find(p => p.id == id) || null;
}
// --- FUNCIONES DE FACTURACIÓN Y STOCK (Añadir al final de data.js) ---

export function getNextNumeroFactura(puntoVenta, tipo) {
  const facturas = getFacturas();
  // Filtramos las facturas del mismo punto de venta y tipo
  const filtradas = facturas.filter(f => f.puntoVenta === puntoVenta && f.tipoComprobante === tipo);
  
  if (filtradas.length === 0) return { numero: 1 };
  
  // Buscamos el número más alto
  const maxNumero = Math.max(...filtradas.map(f => f.numero || 0));
  return { numero: maxNumero + 1 };
}

export function descontarStock(productoId, cantidad) {
  const productos = getStockItems();
  const index = productos.findIndex(p => p.id == productoId);
  
  if (index !== -1) {
    productos[index].cantidad -= cantidad;
    // Guardamos la lista actualizada
    saveWithTenant(STORAGE.stock, productos);
  }
}
// --- FUNCIONES DE BÚSQUEDA ESPECÍFICA (Añadir a data.js) ---

export function getFacturaById(id) {
  const facturas = getFacturas();
  // Usamos == para comparar string/number sin problemas
  return facturas.find(f => f.id == id) || null;
}
// --- FUNCIONES DE CAJA (Añadir al final de data.js) ---

export function getMovimientosCaja() {
  const facturas = getFacturas().filter(f => f.estado !== 'ANULADA');
  const compras = getCompras();

  // Mapeamos ventas como ingresos
  const ingresos = facturas.map(f => ({
    id: f.id,
    fecha: f.fecha,
    concepto: `Venta - Factura Nº ${f.numero}`,
    tipo: 'INGRESO',
    metodo: f.metodoPago || 'Efectivo',
    monto: f.total
  }));

  // Mapeamos compras como egresos
  const egresos = compras.map(c => ({
    id: c.id,
    fecha: c.fecha,
    concepto: `Compra - Proveedor: ${c.proveedorId}`, // Podrías buscar el nombre del proveedor aquí
    tipo: 'EGRESO',
    metodo: c.metodoPago || 'Efectivo',
    monto: -c.total
  }));

  // Unimos y ordenamos por fecha (más reciente primero)
  return [...ingresos, ...egresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}
// --- FUNCIONES DE STOCK FALTANTES (Añadir a data.js) ---

export function getStockById(id) {
  const items = getStockItems();
  return items.find(i => i.id == id) || null;
}

export function deleteStockItem(id) {
  const items = getStockItems().filter(i => i.id != id);
  saveWithTenant(STORAGE.stock, items);
}
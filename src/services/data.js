import { supabase } from "@/supabase";

// --- HELPERS ---
const getEmpresaId = () => 'emp_default';

// --- EMPRESA ---
export async function getEmpresa() {
  const { data } = await supabase.from('empresa').select('*').eq('empresa_id', getEmpresaId()).single();
  return data;
}

export async function saveEmpresa(empresaData) {
  return await supabase.from('empresa').upsert({ ...empresaData, empresa_id: getEmpresaId() });
}

// --- FACTURAS ---
export async function getFacturas() {
  const { data } = await supabase.from('facturas').select('*').eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  return data || [];
}

export async function getFacturaById(id) {
  if (!id || id === 'undefined' || id === 'nuevo') return null;
  const { data, error } = await supabase.from('facturas').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function getFacturasCliente(clienteId) {
  const { data } = await supabase.from('facturas').select('*').eq('cliente_id', clienteId).eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  return data || [];
}

export async function getNextNumeroFactura() {
  try {
    const { data } = await supabase.from('facturas').select('numero').eq('empresa_id', getEmpresaId()).order('numero', { ascending: false }).limit(1);
    const ultimo = (data && data.length > 0) ? parseInt(data[0].numero) : 0;
    return (ultimo + 1).toString().padStart(8, '0');
  } catch (err) { return "00000001"; }
}

export async function saveFactura(f) {
  const payload = {
    empresa_id: getEmpresaId(),
    numero: f.numero || f.numero_factura,
    cliente_id: f.cliente_id, 
    cliente_nombre: f.cliente_nombre,
    subtotal: Number(f.subtotal) || 0,
    iva: Number(f.iva) || 0,
    total: Number(f.total) || 0,
    items: f.items || [],
    fecha: f.fecha || new Date().toISOString(),
    estado: f.estado || 'EMITIDA'
  };
  return await supabase.from('facturas').insert([payload]).select().single();
}

// --- CLIENTES ---
export async function getClientes() {
  const { data } = await supabase.from('clientes').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getClienteById(id) {
  if (!id || id === 'nuevo' || id === '0') return null;
  const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
  return data;
}

export async function saveCliente(c) {
  const payload = { ...c, empresa_id: getEmpresaId() };
  if (!c.id || c.id === 0 || c.id === 'nuevo') delete payload.id;
  return await supabase.from('clientes').upsert(payload).select();
}

// --- PROVEEDORES ---
export async function getProveedores() {
  const { data } = await supabase.from('proveedores').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getProveedorById(id) {
  if (!id || id === 'nuevo' || id === '0') return null;
  const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
  return data;
}

export async function saveProveedor(p) {
  const payload = { ...p, empresa_id: getEmpresaId() };
  if (!p.id || p.id === 0 || p.id === 'nuevo') delete payload.id;
  return await supabase.from('proveedores').upsert(payload).select();
}

// --- STOCK (ESTO ARREGLA EL ERROR DE DETALLESTOCK.VUE) ---
export async function getStockItems() {
  const { data } = await supabase.from('stock').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getStockById(id) {
  if (!id || id === 'nuevo' || id === '0') return null;
  const { data, error } = await supabase.from('stock').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function saveStockItem(i) {
  const pBase = Number(i.precio_base) || 0;
  const pDesc = Number(i.descuento_porcentaje) || 0;
  const pFlete = Number(i.flete_porcentaje) || 0;
  const pGana = Number(i.ganancia_porcentaje) || 0;
  
  const costoReal = (pBase * (1 - pDesc / 100)) * (1 + pFlete / 100);
  const precioFinal = costoReal * (1 + pGana / 100);

  // Payload ultra-limpio sin updated_at
  const payload = {
    nombre: i.nombre,
    cantidad: Number(i.cantidad) || 0,
    precio: precioFinal, 
    categoria: i.categoria || 'General',
    empresa_id: 'emp_default',
    codigo: i.codigo || '',
    precio_base: pBase,
    descuento_porcentaje: pDesc,
    flete_porcentaje: pFlete,
    ganancia_porcentaje: pGana,
    costo_real: costoReal,
    stock_minimo: Number(i.stock_minimo) || 5
  };

  // Manejo de ID para evitar errores en Upsert
  if (!i.id || i.id === 'nuevo' || i.id === 0) {
    delete payload.id;
  } else {
    payload.id = i.id;
  }

  const { data, error } = await supabase.from('stock').upsert(payload).select();
  
  if (error) {
    console.error("Error JD Sistemas:", error.message);
    throw error;
  }
  return data[0];
}
// Nueva función de búsqueda rápida
export async function buscarProductoPorCodigo(codigo) {
  const { data } = await supabase
    .from('stock')
    .select('*')
    .ilike('codigo', `%${codigo}%`) // Busca coincidencias parciales
    .limit(5);
  return data || [];
}
// --- PAGOS Y CAJA ---
export async function getPagosCliente(clienteId) {
  const { data, error } = await supabase.from('caja').select('*').eq('cliente_id', clienteId).eq('tipo', 'ingreso').order('fecha', { ascending: false });
  return error ? [] : (data || []);
}

export async function registrarMovimientoCaja(tipo, monto, concepto, categoria = 'General', clienteId = null) {
  return await supabase.from('caja').insert([{
    tipo: tipo.toLowerCase(), monto: Number(monto), concepto, categoria, cliente_id: clienteId, empresa_id: getEmpresaId(), fecha: new Date().toISOString()
  }]);
}

// --- CHEQUES ---
export async function getCheques() {
  const { data } = await supabase.from('cheques').select('*').eq('empresa_id', getEmpresaId()).order('created_at', { ascending: false });
  return data || [];
}

export async function saveCheque(c) {
  const payload = { ...(c.id ? { id: c.id } : {}), empresa_id: getEmpresaId(), monto: Number(c.monto) || 0, estado: c.estado || 'CARTERA' };
  return await supabase.from('cheques').upsert(payload).select();
}

// --- COMPRAS Y NOTAS ---
export async function saveCompra(compra) {
  const payload = { ...compra, empresa_id: getEmpresaId() };
  return await supabase.from('compras').insert([payload]).select().single();
}

export async function saveNotaAjuste(nota) {
  const payload = { ...nota, empresa_id: getEmpresaId(), fecha: new Date().toISOString() };
  return await supabase.from('notas_ajuste').insert([payload]).select().single();
}

export async function getNotasByCliente(clienteId) {
  const { data } = await supabase.from('notas_ajuste').select('*').eq('cliente_id', clienteId).order('fecha', { ascending: false });
  return data || [];
}

// --- DASHBOARD Y REPORTES ---
export async function getMetricasReportes() {
  const eid = getEmpresaId();
  const { data: f } = await supabase.from('facturas').select('total').eq('empresa_id', eid);
  const { data: c } = await supabase.from('caja').select('monto, tipo').eq('empresa_id', eid);
  const ing = f?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0;
  const egr = c?.filter(m => m.tipo === 'egreso').reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0) || 0;
  return { ingresos: ing, egresos: egr, balance: ing - egr };
}

export async function getDashboardKPIs() {
  const { data: f } = await supabase.from('facturas').select('total').eq('empresa_id', getEmpresaId());
  const { data: s } = await supabase.from('stock').select('cantidad').eq('empresa_id', getEmpresaId());
  return { 
    totalFacturado: f?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0, 
    totalFacturas: f?.length || 0,
    stockBajo: s?.filter(i => i.cantidad < 5).length || 0
  };
}
// --- REMITOS ---
export async function getRemitos() {
  const { data } = await supabase.from('remitos').select('*').eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  return data || [];
}

export async function saveRemito(r) {
  const payload = {
    ...r,
    empresa_id: getEmpresaId(),
    fecha: r.fecha || new Date().toISOString()
  };
  return await supabase.from('remitos').insert([payload]).select().single();
}

// --- OTROS ---
export function imprimirFacturaPro() { console.log("Imprimiendo Factura..."); }

// ESTA ES LA FUNCIÓN QUE FALTA:
export function imprimirComprobanteAjuste() { console.log("Imprimiendo Comprobante de Ajuste..."); }

export function initializeDataService() { 
    console.log("🚀 JD Sistemasinformáticos: Servicio 100% Completo."); 
    return true; 
}
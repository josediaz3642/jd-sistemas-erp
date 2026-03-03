import { supabase } from "@/supabase";
import { getCurrentUser } from "./auth";

// --- HELPERS ---
const getEmpresaId = () => getCurrentUser()?.empresa_id || 'emp_default';

// --- EMPRESA ---
export async function getEmpresa() {
  const { data } = await supabase.from('empresa').select('*').eq('empresa_id', getEmpresaId()).single();
  return data;
}

export async function saveEmpresa(empresaData) {
  return await supabase.from('empresa').upsert({ ...empresaData, empresa_id: getEmpresaId() });
}

// --- FACTURAS (VENTAS) ---
export async function getFacturas() {
  const { data } = await supabase.from('facturas').select('*').eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  return data || [];
}

export async function getFacturaById(id) {
  const { data } = await supabase.from('facturas').select('*').eq('id', id).single();
  return data;
}

export async function saveFactura(f) {
  return await supabase.from('facturas').insert([{ ...f, empresa_id: getEmpresaId() }]).select().single();
}

export async function getNextNumeroFactura() {
  const { data } = await supabase.from('facturas').select('numero').order('numero', { ascending: false }).limit(1);
  const ultimo = (data && data.length > 0) ? parseInt(data[0].numero) : 0;
  return (ultimo + 1).toString().padStart(8, '0');
}

// --- CLIENTES ---
export async function getClientes() {
  const { data } = await supabase.from('clientes').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getClienteById(id) {
  const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
  return data;
}

export async function saveCliente(c) {
  return await supabase.from('clientes').upsert({ ...c, empresa_id: getEmpresaId() });
}

// --- PROVEEDORES ---
export async function getProveedores() {
  const { data } = await supabase.from('proveedores').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getProveedorById(id) {
  const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
  return data;
}

export async function saveProveedor(p) {
  return await supabase.from('proveedores').upsert({ ...p, empresa_id: getEmpresaId() });
}

// --- STOCK / PRODUCTOS ---
export async function getStockItems() {
  const { data } = await supabase.from('stock').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getStockItemById(id) {
  const { data } = await supabase.from('stock').select('*').eq('id', id).single();
  return data;
}

export async function saveStockItem(i) {
  return await supabase.from('stock').upsert({ ...i, empresa_id: getEmpresaId() });
}

export async function sumarStock(id, cant) {
  const { data } = await supabase.from('stock').select('cantidad').eq('id', id).single();
  if (data) await supabase.from('stock').update({ cantidad: data.cantidad + cant }).eq('id', id);
}

// --- COMPRAS ---
export async function saveCompra(compra) {
  return await supabase.from('compras').insert([{ ...compra, empresa_id: getEmpresaId() }]).select().single();
}

// --- CHEQUES ---
export async function getCheques() {
  const { data } = await supabase.from('cheques').select('*').eq('empresa_id', getEmpresaId()).order('fecha_vencimiento');
  return data || [];
}

export async function saveCheque(c) {
  return await supabase.from('cheques').upsert({ ...c, empresa_id: getEmpresaId() });
}

// --- CAJA ---
export async function registrarMovimientoCaja(tipo, monto, concepto, categoria = 'General') {
  return await supabase.from('caja').insert([{
    tipo: tipo.toLowerCase(),
    monto: Number(monto),
    concepto,
    categoria,
    empresa_id: getEmpresaId(),
    fecha: new Date().toISOString()
  }]);
}

// --- DASHBOARD ---
export async function getDashboardKPIs() {
  const { data: facturas } = await supabase.from('facturas').select('total').neq('estado', 'ANULADA').eq('empresa_id', getEmpresaId());
  const { data: stock } = await supabase.from('stock').select('cantidad').eq('empresa_id', getEmpresaId());
  const totalFacturado = facturas?.reduce((acc, f) => acc + (Number(f.total) || 0), 0) || 0;
  return {
    totalFacturado,
    totalFacturas: facturas?.length || 0,
    stockBajo: stock?.filter(i => i.cantidad < 5).length || 0
  };
}

// --- USUARIOS ---
export async function getUsuarios() {
  const { data } = await supabase.from('usuarios').select('*').eq('empresa_id', getEmpresaId());
  return data || [];
}

export async function saveUsuario(u) {
  const { data, error } = await supabase
    .from('usuarios')
    .upsert({ ...u, empresa_id: u.empresa_id || getEmpresaId() })
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteUser(id) {
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- REPORTES ---
export async function getMetricasReportes(periodoDias = "30") {
  const empresaId = getEmpresaId();
  const fechaCorte = new Date();
  fechaCorte.setDate(fechaCorte.getDate() - parseInt(periodoDias));
  const fechaIso = fechaCorte.toISOString();

  const { data: facturas } = await supabase
    .from('facturas')
    .select('total, items')
    .eq('empresa_id', empresaId)
    .gte('fecha', fechaIso)
    .neq('estado', 'ANULADA');

  const { data: egresos } = await supabase
    .from('caja')
    .select('monto, categoria')
    .eq('empresa_id', empresaId)
    .eq('tipo', 'egreso')
    .gte('fecha', fechaIso);

  const ingresosTotales = facturas?.reduce((acc, f) => acc + (Number(f.total) || 0), 0) || 0;
  const egresosTotales = egresos?.reduce((acc, e) => acc + (Number(e.monto) || 0), 0) || 0;

  const catMap = {};
  egresos?.forEach(e => {
    catMap[e.categoria] = (catMap[e.categoria] || 0) + Number(e.monto);
  });
  const gastosPorCategoria = Object.entries(catMap).map(([categoria, monto]) => ({
    categoria,
    monto,
    porcentaje: egresosTotales > 0 ? (monto / egresosTotales * 100) : 0
  }));

  return {
    ingresos: ingresosTotales,
    egresos: egresosTotales,
    gastosPorCategoria,
    topProductos: []
  };
}

export function initializeDataService() {
    console.log("🚀 Servicio de datos de ContaSoft inicializado correctamente.");
    return true;
}
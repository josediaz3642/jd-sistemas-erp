import { supabase } from "@/supabase";
import { getCurrentUser } from "./auth";

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
  // Si el id es basura, no molestamos a Supabase
  if (!id || id === 'undefined' || id === 'nuevo' || id === '[object Object]') return null;
  
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function saveFactura(f) {
  const empresaId = getEmpresaId();

  // Limpiamos el objeto para que coincida EXACTAMENTE con las columnas de tu SQL
  const payload = {
    empresa_id: empresaId,
    numero: f.numero || f.numero_factura, // Adaptamos si viene con otro nombre
    cliente_id: f.cliente_id,
    cliente_nombre: f.cliente_nombre,
    subtotal: Number(f.subtotal) || 0,
    iva: Number(f.iva) || 0,
    total: Number(f.total) || 0,
    items: f.items || [], // Asegúrate que sea un array
    estado: f.estado || 'EMITIDA',
    fecha: f.fecha || new Date().toISOString()
  };

  // Si estamos editando (id existe y no es 'nuevo')
  if (f.id && f.id !== 'nuevo' && f.id !== 0) {
    payload.id = f.id;
  }

  const { data, error } = await supabase
    .from('facturas')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error detallado en Factura:", error.message);
    throw error;
  }
  return data;
}
export async function getNextNumeroFactura() {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select('numero')
      .eq('empresa_id', getEmpresaId())
      .order('numero', { ascending: false })
      .limit(1);

    if (error) throw error;

    const ultimo = (data && data.length > 0) ? parseInt(data[0].numero) : 0;
    const siguiente = ultimo + 1;
    return siguiente.toString().padStart(8, '0');
  } catch (err) {
    console.error("Error al generar número de factura:", err);
    return "00000001"; // Si falla o está vacía, empezamos en 1
  }
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
  
  const { data, error } = await supabase.from('clientes').upsert(payload).select();
  if (error) {
    console.error("Detalle del error en Clientes:", error.message, error.details);
    throw error;
  }
  return data[0];
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
  
  const { data, error } = await supabase.from('proveedores').upsert(payload).select();
  if (error) {
    console.error("Detalle del error en Proveedores:", error.message, error.details);
    throw error;
  }
  return data[0];
}

// --- STOCK ---
export async function getStockItems() {
  const { data } = await supabase.from('stock').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getStockById(id) {
  if (!id || id === 'nuevo' || id === '0') return null;
  const { data } = await supabase.from('stock').select('*').eq('id', id).single();
  return data;
}

export async function saveStockItem(i) {
  const payload = { ...i, empresa_id: getEmpresaId() };
  if (!i.id || i.id === 0 || i.id === 'nuevo') delete payload.id;
  
  const { data, error } = await supabase.from('stock').upsert(payload).select();
  if (error) {
    console.error("Detalle del error en Stock:", error.message, error.details);
    throw error;
  }
  return data[0];
}
export async function deleteStockItem(id) {
  const { error } = await supabase.from('stock').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- CAJA (LA QUE FALTABA) ---
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
  const empresaId = getEmpresaId();
  const { data: facturas } = await supabase.from('facturas').select('total').eq('empresa_id', empresaId);
  const { data: stock } = await supabase.from('stock').select('cantidad').eq('empresa_id', empresaId);
  return {
    totalFacturado: facturas?.reduce((acc, f) => acc + (Number(f.total) || 0), 0) || 0,
    totalFacturas: facturas?.length || 0,
    stockBajo: stock?.filter(i => i.cantidad < 5).length || 0
  };
}

// --- CHEQUES ---
export async function getCheques() {
  const { data, error } = await supabase
    .from('cheques')
    .select('*')
    .eq('empresa_id', getEmpresaId()) // Asegúrate de que getEmpresaId() devuelva algo
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error cargando cheques:", error.message);
    return [];
  }
  return data;
}

export async function saveCheque(c) {
  const empresaId = getEmpresaId();
  
  const payload = {
    empresa_id: empresaId,
    numero: String(c.numero || ''),
    banco: c.banco || '',
    emisor: c.emisor || '',
    monto: Number(c.monto) || 0,
    fecha_emision: c.fecha_emision || new Date().toISOString().split('T')[0],
    fecha_vencimiento: c.fecha_vencimiento || null,
    estado: c.estado || 'CARTERA'
  };

  console.log("Enviando a Supabase:", payload); // <-- MIRA ESTO EN CONSOLA

  const { data, error } = await supabase
    .from('cheques')
    .upsert(payload)
    .select();

  if (error) {
    console.error("Error en Supabase al guardar cheque:", error.message);
    throw error;
  }
  return data[0];
}

export function initializeDataService() {
    console.log("🚀 Servicio de datos completo inicializado.");
    return true;
}
// --- COMPRAS ---
export async function saveCompra(compra) {
  const payload = { ...compra, empresa_id: getEmpresaId() };
  // Si es una compra nueva, eliminamos el ID para que Supabase lo genere
  if (!compra.id || compra.id === 0 || compra.id === 'nuevo') delete payload.id;
  
  const { data, error } = await supabase
    .from('compras')
    .insert([payload])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// --- REPORTES Y MÉTRICAS (Por si las moscas) ---
export async function getMetricasReportes(periodoDias = "30") {
  const empresaId = getEmpresaId();
  const { data: facturas } = await supabase
    .from('facturas')
    .select('total')
    .eq('empresa_id', empresaId)
    .neq('estado', 'ANULADA');

  const { data: egresos } = await supabase
    .from('caja')
    .select('monto')
    .eq('empresa_id', empresaId)
    .eq('tipo', 'egreso');

  return {
    ingresos: facturas?.reduce((acc, f) => acc + (Number(f.total) || 0), 0) || 0,
    egresos: egresos?.reduce((acc, e) => acc + (Number(e.monto) || 0), 0) || 0,
    gastosPorCategoria: []
  };
}
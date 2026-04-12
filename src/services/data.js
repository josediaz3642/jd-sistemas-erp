import { supabase } from "@/supabase";


const getEmpresaId = () => {
  const user = JSON.parse(localStorage.getItem("contasoft_user_sesion"));
  return user ? user.empresa_id : 'emp_default';
};

// --- EMPRESA ---
export async function getEmpresa() {
  const { data } = await supabase.from('empresa').select('*').eq('empresa_id', getEmpresaId()).single();
  return data;
}

export async function saveEmpresa(empresaData) {
  const eid = getEmpresaId();
  
   const payload = { 
    empresa_id: eid,
    nombre: empresaData.nombre,
    direccion: empresaData.direccion,
    telefono: empresaData.telefono,
    cuit: empresaData.cuit,
    condicion_iva: empresaData.condicion_iva,
    localidad: empresaData.localidad,
    provincia: empresaData.provincia,
    email: empresaData.email,
    logo: empresaData.logo 
  };

  const { data, error } = await supabase
    .from('empresa')
    .upsert(payload, { onConflict: 'empresa_id' }) 
    .select();

  if (error) {
    console.error("Error al guardar empresa JD:", error.message);
    throw error;
  }
  return data ? data[0] : null;
}
export async function uploadLogo(file) {
  const empresaId = getEmpresaId();
  const fileExt = file.name.split('.').pop();
  const fileName = `${empresaId}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // 1. Subir el archivo al Storage
  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // 2. Obtener la URL pública
  const { data } = supabase.storage
    .from('logos')
    .getPublicUrl(filePath);

  return data.publicUrl; // Este es el texto que guardaremos en la tabla
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

// En src/services/data.js
export async function getClienteById(id) {
  // SI EL ID NO ES VÁLIDO, NO SIGAS
  if (!id || id === 'nuevo') return null; 

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}

export async function saveCliente(clienteData) {
  const user = JSON.parse(localStorage.getItem("contasoft_user_sesion"));
  
  const payload = {
    ...clienteData,
    empresa_id: user.empresa_id // Nos aseguramos de que el cliente pertenezca a tu empresa
  };

  const { data, error } = await supabase
    .from('clientes')
    .upsert(payload)
    .select();

  if (error) throw error;
  return data;
}
// --- CUENTAS CORRIENTES ---

export async function registrarMovimientoFactura(factura, metodoPago) {
  const eid = getEmpresaId();
  
  if (metodoPago === 'Cuenta Corriente') {
    // 1. Impacta en la Deuda del Cliente
    const payloadCtaCte = {
      empresa_id: eid,
      cliente_id: factura.cliente_id,
      factura_id: factura.id,
      monto_original: factura.total,
      saldo_pendiente: factura.total,
      fecha: new Date().toISOString(),
      estado: 'PENDIENTE'
    };
    return await supabase.from('cuentas_corrientes').insert([payloadCtaCte]);
  } else {
    // 2. Impacta en la Caja (Efectivo, Transf, Tarjeta)
    return await registrarMovimientoCaja(
      'ingreso',
      factura.total,
      `Factura ${factura.numero} - ${factura.cliente_nombre}`,
      'Ventas',
      factura.cliente_id,
      metodoPago
    );
  }
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
 
  const payload = {
    nombre: i.nombre,
    cantidad: Number(i.cantidad) || 0,
    precio: precioFinal, 
    categoria: i.categoria || 'General',
    empresa_id: getEmpresaId(), // <--- CAMBIO AQUÍ: Antes decía 'emp_default'
    codigo: i.codigo || '',
    precio_base: pBase,
    descuento_porcentaje: pDesc,
    flete_porcentaje: pFlete,
    ganancia_porcentaje: pGana,
    costo_real: costoReal,
    stock_minimo: Number(i.stock_minimo) || 5
  };

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
  
  return data ? data[0] : null;
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

export async function getMovimientosCaja() {
  const { data, error } = await supabase
    .from('caja')
    .select('*')
    .eq('empresa_id', getEmpresaId())
    .order('fecha', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function guardarMovimiento(m) {
  const eid = getEmpresaId();
  
  const payload = {
    tipo: m.tipo.toLowerCase(),
    monto: Number(m.monto),
    concepto: m.concepto,
    categoria: m.categoria || 'General',
    empresa_id: eid,
    fecha: m.fecha || new Date().toISOString(),
    // IMPORTANTE: Asegurate que en Supabase la columna se llame 'metodo_pago' o 'metodo'
    metodo_pago: m.metodo_pago || 'Efectivo', 
    cliente_id: m.cliente_id || null
  };

  const { data, error } = await supabase
    .from('caja')
    .insert([payload])
    .select();

  if (error) {
    console.error("❌ Error en Caja:", error.message);
    throw error;
  }
  return data ? data[0] : null;
}

// Esta es la que usaremos desde Remitos
export async function registrarMovimientoCaja(tipo, monto, concepto, categoria = 'Ventas', clienteId = null, metodo = 'Efectivo') {
  return await guardarMovimiento({
    tipo,
    monto,
    concepto,
    categoria,
    metodo_pago: metodo,
    cliente_id: clienteId
  });
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
  const empresa_id = getEmpresaId();
  
  // 1. Preparar el payload del remito
  const payload = {
    ...r,
    empresa_id,
    fecha: r.fecha || new Date().toISOString()
  };

  // 2. Insertar el remito en Supabase
  const { data: remito, error: rError } = await supabase
    .from('remitos')
    .insert([payload])
    .select()
    .single();

  if (rError) {
    console.error("Error al guardar remito:", rError.message);
    throw rError;
  }

  // 3. ACTUALIZAR STOCK: Recorremos los ítems del remito
  if (r.items && r.items.length > 0) {
    for (const item of r.items) {
      // Buscamos el stock actual del producto
      const { data: producto, error: pError } = await supabase
        .from('stock')
        .select('cantidad')
        .eq('id', item.producto_id)
        .single();

      if (!pError && producto) {
        // Calculamos el nuevo stock (Restamos lo que sale en el remito)
        const nuevaCantidad = Number(producto.cantidad) - Number(item.cantidad);

        // Actualizamos la tabla de stock
        await supabase
          .from('stock')
          .update({ cantidad: nuevaCantidad })
          .eq('id', item.producto_id);
          
        console.log(`Stock actualizado para ${item.nombre}: ${nuevaCantidad}`);
      }
    }
  }

  return remito;
}
export async function getRemitoById(id) {
  if (!id || id === 'nuevo') return null;
  const { data, error } = await supabase
    .from('remitos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}
// --- OTROS ---
export function imprimirFacturaPro() { console.log("Imprimiendo Factura..."); }

// ESTA ES LA FUNCIÓN QUE FALTA:
export function imprimirComprobanteAjuste() { console.log("Imprimiendo Comprobante de Ajuste..."); }

export function initializeDataService() { 
    console.log("🚀 JD Sistemasinformáticos: Servicio 100% Completo."); 
    return true; 
}
// Agregá esto al final de tu data.js o donde tengas las funciones de Supabase
export const getPagosCliente = async (clienteId) => {
  const { data, error } = await supabase
    .from('pagos_cuentas') // Asegurate que el nombre de la tabla coincida
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
  return data;
};
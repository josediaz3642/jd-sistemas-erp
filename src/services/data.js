import { supabase } from "@/supabase";

export const getEmpresaId = () => {
  const user = JSON.parse(localStorage.getItem("contasoft_user_sesion"));
  return user ? user.empresa_id : 'emp_default';
};

// --- 1. AUDITORÍA Y FLUJO ---
export async function registrarEvento(datos) {
  const { error } = await supabase
    .from('flujo_sistema')
    .insert([{
      modulo: datos.modulo,
      tipo_movimiento: datos.tipo,
      monto: datos.monto || 0,
      cantidad: datos.cantidad || 0,
      referencia_id: datos.refId,
      descripcion: datos.desc,
      entidad_nombre: datos.entidad,
      empresa_id: getEmpresaId()
    }]);
  if (error) console.error("Error en auditoría:", error);
}

// --- 2. EMPRESA ---
export async function getEmpresa() {
  const { data } = await supabase.from('empresas').select('*').eq('id', getEmpresaId()).maybeSingle();
  
  // Mix with local storage for frontend-only fields
  const localDataStr = localStorage.getItem(`empresa_local_${getEmpresaId()}`);
  const localData = localDataStr ? JSON.parse(localDataStr) : {};
  
  return { ...data, ...localData };
}

export async function saveEmpresa(empData) {
  const payload = { ...empData, id: getEmpresaId() };
  
  // Guardar campos extra en local storage ya que no existen en Supabase
  const localFields = ['nombre', 'logo', 'punto_venta', 'proximo_numero'];
  const localData = {};
  localFields.forEach(f => {
    if (payload[f] !== undefined) {
      localData[f] = payload[f];
      delete payload[f];
    }
  });
  localStorage.setItem(`empresa_local_${getEmpresaId()}`, JSON.stringify(localData));

  const { data, error } = await supabase.from('empresas').upsert(payload, { onConflict: 'id' }).select();
  if (error) throw error;
  return data ? { ...data[0], ...localData } : null;
}

// --- 3. CLIENTES ---
export async function getClientes() {
  const { data } = await supabase.from('clientes').select('*').eq('empresa_id', getEmpresaId()).order('nombre');
  return data || [];
}

export async function getClienteById(id) {
  if (!id || id === 'nuevo') return null;
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function saveCliente(c) {
  const payload = { ...c, empresa_id: getEmpresaId() };
  const { data, error } = await supabase.from('clientes').upsert(payload).select();
  if (error) throw error;
  return data;
}

export async function deleteCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- 4. FACTURACIÓN ---
export async function getFacturas() {
  const { data } = await supabase.from('facturas').select('*').eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  return data || [];
}

export async function getFacturaById(id) {
  if (!id || id === 'nuevo' || id === 'undefined') return null;
  const { data, error } = await supabase.from('facturas').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function getNextNumeroFactura() {
  try {
    // Check if user set a custom starting number in Settings
    const localDataStr = localStorage.getItem(`empresa_local_${getEmpresaId()}`);
    const localData = localDataStr ? JSON.parse(localDataStr) : {};
    const baseNumero = localData.proximo_numero ? parseInt(localData.proximo_numero) - 1 : 0;

    const { data } = await supabase.from('facturas').select('numero').eq('empresa_id', getEmpresaId()).order('numero', { ascending: false }).limit(1);
    const ultimo = (data && data.length > 0) ? parseInt(data[0].numero) : baseNumero;
    
    // Auto-update proximo_numero in localStorage
    localData.proximo_numero = ultimo + 2;
    localStorage.setItem(`empresa_local_${getEmpresaId()}`, JSON.stringify(localData));

    return (Math.max(ultimo, baseNumero) + 1).toString().padStart(8, '0');
  } catch (err) { return "00000001"; }
}

export async function saveFactura(f) {
  const payload = {
    empresa_id: getEmpresaId(),
    numero: f.numero,
    cliente_id: f.cliente_id || null,
    cliente_nombre: f.cliente_nombre,
    total: Number(f.total) || 0,
    items: f.items || [],
    fecha: f.fecha || new Date().toISOString(),
    estado: f.estado || 'EMITIDA'
  };
  const res = await supabase.from('facturas').insert([payload]).select().single();
  if (!res.error) {
    await registrarEvento({
      modulo: 'CAJA', tipo: 'ENTRADA', monto: payload.total,
      desc: `Factura #${payload.numero}`, entidad: payload.cliente_nombre, refId: res.data.id
    });
  }
  return res;
}

// --- 5. STOCK ---
export async function getStockItems() {
  const { data, error } = await supabase.from('stock').select('*').eq('empresa_id', getEmpresaId()).order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCategorias() {
  const { data } = await supabase.from('categorias').select('*').eq('empresa_id', getEmpresaId());
  return data || [];
}

export async function getStockById(id) {
  if (!id || id === 'nuevo') return null;
  const { data, error } = await supabase.from('stock').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function saveStockItem(i) {
  const payload = { ...i, empresa_id: getEmpresaId() };
  if (i.id && i.id !== 'nuevo') payload.id = i.id;
  const { data, error } = await supabase.from('stock').upsert(payload).select();
  if (error) throw error;
  return data ? data[0] : null;
}

export async function buscarProductoPorCodigo(codigo) {
  const { data } = await supabase.from('stock').select('*').eq('empresa_id', getEmpresaId()).ilike('codigo', `%${codigo}%`).limit(5);
  return data || [];
}

// --- 6. REMITOS ---
export async function getRemitos() {
  const { data, error } = await supabase.from('remitos').select('*').eq('empresa_id', getEmpresaId()).order('fecha', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRemitoById(id) {
  if (!id || id === 'nuevo') return null;
  const { data, error } = await supabase.from('remitos').select('*').eq('id', id).single();
  return error ? null : data;
}

export async function saveRemito(r) {
  if (r.items) {
    for (const item of r.items) {
      const { data: p } = await supabase.from('stock').select('cantidad, nombre').eq('id', item.producto_id).single();
      if (p && Number(p.cantidad) < Number(item.cantidad)) throw new Error(`Stock insuficiente: ${p.nombre}`);
    }
  }
  const payload = {
    empresa_id: getEmpresaId(),
    unidad_desde: r.unidad_desde,
    unidad_hacia: r.unidad_hacia,
    numero: r.numero,
    fecha: r.fecha || new Date().toISOString().split('T')[0],
    items: r.items || [],
    estado: 'Pendiente',
    cliente: r.cliente_nombre || r.cliente || ''
  };
  const { data: remito, error } = await supabase.from('remitos').insert([payload]).select().single();
  if (error) throw error;

  for (const item of r.items) {
    const { data: p } = await supabase.from('stock').select('cantidad').eq('id', item.producto_id).single();
    if (p) {
      await supabase.from('stock').update({ cantidad: Number(p.cantidad) - Number(item.cantidad) }).eq('id', item.producto_id);
      await registrarEvento({
        modulo: 'STOCK', tipo: 'SALIDA', cantidad: item.cantidad,
        desc: `Remito #${remito.numero}`, entidad: remito.cliente, refId: remito.id
      });
    }
  }
  return remito;
}

export async function updateRemitoEstado(id, nuevoEstado) {
  return await supabase.from('remitos').update({ estado: nuevoEstado }).eq('id', id);
}

export async function deleteRemito(id) {
  return await supabase.from('remitos').delete().eq('id', id);
}

// --- 7. PROVEEDORES ---
export async function getProveedores() {
  const { data } = await supabase.from('proveedores').select('*').eq('empresa_id', getEmpresaId());
  return data || [];
}

export async function getProveedorById(id) {
  if (!id || id === 'nuevo') return null;
  const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
  return data;
}

export async function saveProveedor(p) {
  const payload = { ...p, empresa_id: getEmpresaId() };
  if (!p.id || p.id === 'nuevo') {
    delete payload.id;
    return await supabase.from('proveedores').insert([payload]).select();
  } else {
    return await supabase.from('proveedores').update(payload).eq('id', p.id).select();
  }
}

export async function deleteProveedor(id) {
  const { error } = await supabase.from('proveedores').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- 8. CAJA Y MÉTRICAS ---
export async function getDashboardKPIs() {
  const eid = getEmpresaId();
  const { data: f } = await supabase.from('facturas').select('total').eq('empresa_id', eid);
  const { data: s } = await supabase.from('stock').select('cantidad').eq('empresa_id', eid);
  return {
    totalFacturado: f?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0,
    totalFacturas: f?.length || 0,
    stockBajo: s?.filter(i => i.cantidad < 5).length || 0
  };
}

// --- 9. IMPRESIÓN ---
export function imprimirComprobanteAjuste() { window.print(); }
export function imprimirFacturaPro() { window.print(); }

export function initializeDataService() {
  console.log("🚀 JD Sistemasinformáticos: Servicio Unificado y Limpio.");
  return true;
}
// --- 10. NOTAS DE AJUSTE (Para ModalAjuste.vue) ---

/**
 * Guarda una nota de ajuste de stock o saldo
 */
export async function saveNotaAjuste(nota) {
  const payload = { 
    ...nota, 
    empresa_id: getEmpresaId(), 
    fecha: new Date().toISOString() 
  };
  
  const { data, error } = await supabase
    .from('notas_ajuste')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error al guardar nota de ajuste:", error.message);
    throw error;
  }

  // Opcional: Registrar en el flujo general si querés auditoría de esto
  await registrarEvento({
    modulo: 'STOCK',
    tipo: 'AJUSTE',
    cantidad: nota.cantidad || 0,
    desc: `Ajuste: ${nota.motivo || 'Manual'}`,
    entidad: 'Sistema',
    refId: data.id
  });

  return data;
}

/**
 * Obtiene las notas de ajuste de un cliente
 */
export async function getNotasByCliente(clienteId) {
  const { data, error } = await supabase
    .from('notas_ajuste')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false });
    
  if (error) return [];
  return data;
}
// --- 11. MOVIMIENTOS DE CAJA ---

/**
 * Registra un movimiento de caja (ingreso/egreso) y dispara la auditoría
 */
export async function registrarMovimientoCaja(tipo, monto, concepto, categoria = 'Ventas', clienteId = null, metodo = 'Efectivo') {
  const payload = {
    empresa_id: getEmpresaId(),
    tipo: tipo.toLowerCase(), // 'ingreso' o 'egreso'
    monto: Number(monto),
    concepto: concepto,
    categoria: categoria,
    metodo_pago: metodo,
    cliente_id: clienteId || null,
    fecha: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('caja')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("❌ Error en Caja:", error.message);
    throw error;
  }

  // Registrar también en el Flujo Universal para el Libro Diario
  await registrarEvento({
    modulo: 'CAJA',
    tipo: tipo.toUpperCase(),
    monto: monto,
    desc: concepto,
    entidad: 'Varios',
    refId: data.id
  });

  return data;
}

/**
 * Específicamente para facturas: Decide si va a Caja o a Cuenta Corriente
 */
export async function registrarMovimientoFactura(factura, metodoPago) {
  const eid = getEmpresaId();
  
  if (metodoPago === 'Cuenta Corriente') {
    const payloadCtaCte = {
      empresa_id: eid,
      cliente_id: factura.cliente_id || null,
      factura_id: factura.id,
      monto_original: factura.total,
      saldo_pendiente: factura.total,
      fecha: new Date().toISOString(),
      estado: 'PENDIENTE'
    };
    return await supabase.from('cuentas_corrientes').insert([payloadCtaCte]);
  } else {
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

/**
 * Obtiene el historial de caja
 */
export async function getMovimientosCaja() {
  const { data, error } = await supabase
    .from('caja')
    .select('*')
    .eq('empresa_id', getEmpresaId())
    .order('fecha', { ascending: false });
  
  if (error) throw error;
  return data || [];
}
// --- 12. FUNCIONES DE STOCK (NOMBRES ESPECÍFICOS PARA COMPONENTES) ---

/**
 * Función que pide Stock.vue para crear productos nuevos
 */
export async function createStockItem(itemData) {
    // Reutilizamos la lógica de saveStockItem para mantener consistencia
    return await saveStockItem(itemData);
}

/**
 * Función para actualizar items existentes
 */
export async function updateStockItem(id, updateData) {
    const payload = { ...updateData, id: id, empresa_id: getEmpresaId() };
    const { data, error } = await supabase
        .from('stock')
        .update(payload)
        .eq('id', id)
        .select();
        
    if (error) throw error;
    return data[0];
}

/**
 * Función para eliminar productos del stock
 */
export async function deleteStockItem(id) {
    const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
    return true;
}

/**
 * Alias de búsqueda que suelen usar los modales de selección
 */
export async function getStock() {
    return await getStockItems();
}
// --- 13. CARTERA DE CHEQUES ---

export async function getCheques() {
  const { data, error } = await supabase
    .from('cheques')
    .select('*')
    .eq('empresa_id', getEmpresaId())
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error al obtener cheques:", error.message);
    return [];
  }
  return data || [];
}
export async function registrarMovimientoCtaCte(movimiento) {
  const { data, error } = await supabase
    .from('movimientos_cta_cte') // Asegurate de que el nombre coincida con tu SQL
    .insert([movimiento]);

  if (error) throw error;
  return data;
}
/**
 * Guarda un cheque nuevo o actualiza uno existente
 */
export async function saveCheque(c) {
  // Obtenemos la fecha de hoy en formato YYYY-MM-DD para la recepción
  const hoy = new Date().toISOString().split('T')[0];

  const payload = { 
    empresa_id: getEmpresaId(), 
    monto: Number(c.monto) || 0, 
    estado: c.estado || 'CARTERA',
    banco: c.banco || 'S/D',
    emisor: c.emisor || 'S/D',
    // Si no tiene fecha de recepción (ej: es nuevo), le clavamos la de hoy
    fecha_recepcion: c.fecha_recepcion || hoy 
  };

  if (c.numero) payload.numero = String(c.numero);
  
  // Usamos el nombre correcto de la columna: fecha_vencimiento
  if (c.fecha_vencimiento) payload.fecha_vencimiento = c.fecha_vencimiento;

  try {
    if (c.id && c.id !== 'nuevo') {
      const { data, error } = await supabase
        .from('cheques')
        .update(payload)
        .eq('id', c.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cheques')
        .insert([payload])
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("❌ Error en Supabase:", error.message);
    throw error;
  }
}
export async function deleteCheque(id) {
  const { error } = await supabase
    .from('cheques')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}
// --- 14. COMPRAS Y GASTOS ---

/**
 * Registra una compra a proveedores y actualiza stock si es necesario
 */
export async function saveCompra(compra) {
  const payload = { 
    ...compra, 
    empresa_id: getEmpresaId(),
    fecha: compra.fecha || new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('compras')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  // Registrar egreso en auditoría
  await registrarEvento({
    modulo: 'CAJA',
    tipo: 'SALIDA',
    monto: compra.total,
    desc: `Compra a Proveedor: ${compra.proveedor_nombre || 'S/D'}`,
    entidad: compra.proveedor_nombre,
    refId: data.id
  });

  return data;
}

// --- 15. EXTRAS DE CLIENTES ---

/**
 * Obtiene los pagos realizados por un cliente a sus cuentas corrientes
 */
export async function getPagosRealizados(clienteId) {
  const { data, error } = await supabase
    .from('pagos_cuentas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false });
    
  return error ? [] : data;
}
// --- 16. MÓDULO DE CAJA (CORRECCIÓN PARA CAJA.VUE) ---

/**
 * Función que pide Caja.vue para guardar ingresos/egresos manuales
 */
export async function guardarMovimiento(m) {
  // Mapeamos los datos del componente al formato de la DB
  const datosParaRegistrar = {
    tipo: m.tipo,
    monto: m.monto,
    concepto: m.concepto,
    categoria: m.categoria || 'General',
    cliente_id: m.cliente_id || null,
    metodo_pago: m.metodo_pago || 'Efectivo',
    entidad_nombre: m.entidad_nombre || 'Varios'
  };

  // Reutilizamos la lógica central de Caja
  return await registrarMovimientoCaja(
    datosParaRegistrar.tipo,
    datosParaRegistrar.monto,
    datosParaRegistrar.concepto,
    datosParaRegistrar.categoria,
    datosParaRegistrar.cliente_id,
    datosParaRegistrar.metodo_pago
  );
}

// --- 17. REPORTES Y MÉTRICAS (Para Dashboard/Caja) ---

/**
 * Obtiene métricas rápidas de ingresos y egresos para balances
 */
export async function getMetricasReportes() {
  const eid = getEmpresaId();
  
  // Traemos facturas (ingresos potenciales) y movimientos de caja (realidad)
  const { data: facturas } = await supabase.from('facturas').select('total').eq('empresa_id', eid);
  const { data: caja } = await supabase.from('caja').select('monto, tipo').eq('empresa_id', eid);
  
  const ingresosFacturados = facturas?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0;
  
  const totalEgresos = caja?.filter(m => m.tipo === 'egreso')
    .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0) || 0;
    
  const totalIngresosCaja = caja?.filter(m => m.tipo === 'ingreso')
    .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0) || 0;

  return { 
    ingresos: ingresosFacturados, 
    egresos: totalEgresos, 
    cajaReal: totalIngresosCaja - totalEgresos,
    balance: ingresosFacturados - totalEgresos 
  };
}
// --- 18. FUNCIONES DE FACTURACIÓN POR CLIENTE (Para ResumenCuentas.vue) ---

/**
 * Obtiene todas las facturas de un cliente específico
 */
export async function getFacturasCliente(clienteId) {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('empresa_id', getEmpresaId())
    .order('fecha', { ascending: false });
    
  if (error) {
    console.error("Error al obtener facturas del cliente:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Obtiene el saldo total pendiente de un cliente en Cta Cte
 */
export async function getSaldoPendienteCliente(clienteId) {
  const { data, error } = await supabase
    .from('cuentas_corrientes')
    .select('saldo_pendiente')
    .eq('cliente_id', clienteId)
    .eq('estado', 'PENDIENTE');

  if (error) return 0;
  return data.reduce((acc, curr) => acc + (Number(curr.saldo_pendiente) || 0), 0);
}

// --- 19. RECURSOS PARA EL COMPONENTE DE FACTURACIÓN ---

/**
 * Registra el evento de impresión de factura para auditoría
 */
export async function logImpresionFactura(facturaId, numero) {
  await registrarEvento({
    modulo: 'FACTURACION',
    tipo: 'IMPRESION',
    desc: `Se imprimió/generó PDF de Factura #${numero}`,
    refId: facturaId
  });
}
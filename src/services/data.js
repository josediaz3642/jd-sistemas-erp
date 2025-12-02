// ==============================
//  STORAGE KEYS
// ==============================
const STORAGE_KEYS = {
  clientes: "clientes",
  cheques: "cheques",
  stock: "stock",
  usuarios: "usuarios",
  empresa: "empresa_data",
  proveedores: "proveedores",
  facturas: "facturas",
  facturasProveedor: "facturasProveedor",
  pagosProveedor: "pagosProveedor"
};

// ==============================
//  CLIENTES
// ==============================
export function getClientes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.clientes) || "[]");
}

export function saveCliente(cliente) {
  let data = getClientes();
  if (cliente.id) {
    const index = data.findIndex(c => c.id === cliente.id);
    if (index > -1) data[index] = cliente;
  } else {
    cliente.id = Date.now();
    data.push(cliente);
  }
  localStorage.setItem(STORAGE_KEYS.clientes, JSON.stringify(data));
  return true;
}

export function deleteCliente(id) {
  let data = getClientes().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.clientes, JSON.stringify(data));
  return true;
}

export function getClienteById(id) {
  return getClientes().find(c => c.id == id) || null;
}

// ==============================
//  CHEQUES
// ==============================
export function getCheques() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.cheques) || "[]");
}

export function saveCheque(cheque) {
  let data = getCheques();
  if (cheque.id) {
    const index = data.findIndex(c => c.id === cheque.id);
    if (index > -1) data[index] = cheque;
  } else {
    cheque.id = Date.now();
    data.push(cheque);
  }
  localStorage.setItem(STORAGE_KEYS.cheques, JSON.stringify(data));
  return true;
}

export function deleteCheque(id) {
  let data = getCheques().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.cheques, JSON.stringify(data));
  return true;
}

export function getChequesByCliente(clienteId) {
  return getCheques().filter(c => c.clienteId == clienteId);
}

// ==============================
//  STOCK
// ==============================
export function getStockItems() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.stock) || "[]");
}

export function saveStockItem(producto) {
  let data = getStockItems();
  if (producto.id) {
    const index = data.findIndex(p => p.id === producto.id);
    if (index > -1) data[index] = producto;
  } else {
    producto.id = Date.now();
    data.push(producto);
  }
  localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify(data));
  return true;
}

export function deleteStockItem(id) {
  let data = getStockItems().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify(data));
  return true;
}

// ==============================
//  USUARIOS
// ==============================
export function getUsuarios() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.usuarios) || "[]");
}

export function saveUsuario(usuario) {
  let data = getUsuarios();
  if (usuario.id) {
    const index = data.findIndex(u => u.id === usuario.id);
    if (index > -1) data[index] = usuario;
  } else {
    usuario.id = Date.now();
    data.push(usuario);
  }
  localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(data));
  return true;
}

// ==============================
//  EMPRESA
// ==============================
export function getDocument(key) {
  return JSON.parse(localStorage.getItem(key) || "null");
}

export function getEmpresa() {
  return getDocument(STORAGE_KEYS.empresa);
}

// ==============================
//  FACTURAS CLIENTES
// ==============================
export function getFacturas() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.facturas) || "[]");
}

export function getFacturasByCliente(clienteId) {
  return getFacturas().filter(f => f.clienteId == clienteId);
}

export function saveFactura(factura) {
  let data = getFacturas();
  if (factura.id) {
    const index = data.findIndex(f => f.id === factura.id);
    if (index > -1) data[index] = factura;
  } else {
    factura.id = Date.now();
    data.push(factura);
  }
  localStorage.setItem(STORAGE_KEYS.facturas, JSON.stringify(data));
  return true;
}

// ==============================
//  PROVEEDORES
// ==============================
export function getProveedores() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.proveedores) || "[]");
}

export function saveProveedor(proveedor) {
  let data = getProveedores();
  if (proveedor.id) {
    const index = data.findIndex(p => p.id === proveedor.id);
    if (index > -1) data[index] = proveedor;
  } else {
    proveedor.id = Date.now();
    data.push(proveedor);
  }
  localStorage.setItem(STORAGE_KEYS.proveedores, JSON.stringify(data));
  return true;
}

export function deleteProveedor(id) {
  let data = getProveedores().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.proveedores, JSON.stringify(data));
  return true;
}

// ==============================
//  FACTURAS POR PROVEEDOR
// ==============================
export function getFacturasProveedor() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.facturasProveedor) || "[]");
}

export function getFacturasProveedorById(proveedorId) {
  return getFacturasProveedor().filter(f => f.proveedorId == proveedorId);
}

export function saveFacturaProveedor(factura) {
  let data = getFacturasProveedor();
  if (factura.id) {
    const index = data.findIndex(f => f.id === factura.id);
    if (index > -1) data[index] = factura;
  } else {
    factura.id = Date.now();
    data.push(factura);
  }
  localStorage.setItem(STORAGE_KEYS.facturasProveedor, JSON.stringify(data));
  return true;
}

// ==============================
//  PAGOS A PROVEEDORES
// ==============================
export function getPagosProveedor() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.pagosProveedor) || "[]");
}

export function getPagosProveedorById(proveedorId) {
  return getPagosProveedor().filter(p => p.proveedorId == proveedorId);
}

export function savePagoProveedor(pago) {
  let data = getPagosProveedor();
  pago.id = Date.now();
  data.push(pago);
  localStorage.setItem(STORAGE_KEYS.pagosProveedor, JSON.stringify(data));
  return true;
}

// ==============================
//  SEED DATA
// ==============================
export function seedData() {
  if (!localStorage.getItem(STORAGE_KEYS.empresa)) {
    localStorage.setItem(
      STORAGE_KEYS.empresa,
      JSON.stringify({
        nombre: "Contasoft ERP (Demo)",
        cuit: "30-12345678-9",
        direccion: "Av. Siempre Viva 742",
        condicionIVA: "Responsable Inscripto"
      })
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.usuarios)) {
    localStorage.setItem(
      STORAGE_KEYS.usuarios,
      JSON.stringify([
        { id: 1, nombre: "Administrador", usuario: "admin", clave: "admin123", rol: "admin" }
      ])
    );
  }
}

seedData();

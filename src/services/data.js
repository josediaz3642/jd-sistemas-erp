// src/services/data.js

const CLIENTES_KEY = 'clientes';
const FACTURAS_KEY = 'facturas';
const STOCK_KEY = 'stock';
const CHEQUES_KEY = 'cheques';

// Función genérica para obtener datos de forma segura
export const getData = (key) => {
  const data = localStorage.getItem(key);
  
  // Manejo de errores de JSON.parse()
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error al parsear datos de ${key}. Se devolverá un array vacío.`, e);
      // Borrar el dato corrupto para prevenir futuros errores si es necesario
      // localStorage.removeItem(key); 
      return [];
    }
  }
  
  // Inicializar clientes de prueba si no existen datos
  if (key === CLIENTES_KEY) {
      return [
          { id: 'C001', nombre: 'Cliente RI Ejemplo', cuit: '20123456789', email: 'ri@example.com', telefono: '1111', direccion: 'Calle Falsa 123', condicionIVA: 'RI' }
      ];
  }

  return [];
};

// Función genérica para guardar datos
export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// -----------------------------------------------------------------
// CRUD Clientes
// -----------------------------------------------------------------
export const getClientes = () => getData(CLIENTES_KEY);

export const saveCliente = (cliente) => {
  const items = getClientes();
  if (cliente.id) {
    const index = items.findIndex(i => i.id === cliente.id);
    if (index !== -1) items[index] = cliente;
  } else {
    cliente.id = `C${Date.now()}`;
    items.push(cliente);
  }
  saveData(CLIENTES_KEY, items);
};


// -----------------------------------------------------------------
// CRUD Stock
// -----------------------------------------------------------------
export const getStockItems = () => getData(STOCK_KEY);

export const saveStockItem = (item) => {
  const items = getStockItems();
  
  if (item.id) {
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) items[index] = item;
  } else {
    item.id = Date.now();
    items.push(item);
  }
  saveData(STOCK_KEY, items);
};

// -----------------------------------------------------------------
// CRUD Cheques
// -----------------------------------------------------------------
export const getCheques = () => getData(CHEQUES_KEY);

export const saveCheque = (cheque) => {
  const items = getCheques();
  if (cheque.id) {
    const index = items.findIndex(i => i.id === cheque.id);
    if (index !== -1) items[index] = cheque;
  } else {
    cheque.id = `CH${Date.now()}`;
    items.push(cheque);
  }
  saveData(CHEQUES_KEY, items);
};

export const deleteCheque = (id) => {
  let items = getCheques();
  items = items.filter(c => c.id !== id);
  saveData(CHEQUES_KEY, items);
};

// -----------------------------------------------------------------
// Facturas (Solo lectura/escritura)
// -----------------------------------------------------------------
export const getFacturas = () => getData(FACTURAS_KEY);
export const saveFactura = (factura) => { 
  const facturas = getFacturas();
  facturas.push(factura);
  saveData(FACTURAS_KEY, facturas);
};
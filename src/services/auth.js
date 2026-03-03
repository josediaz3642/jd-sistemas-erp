// src/services/auth.js
import * as dataService from "./data";

// USUARIO ACTUAL
export function getCurrentUser() {
  const user = localStorage.getItem("contasoft_user_sesion");
  return user ? JSON.parse(user) : null;
}

// LOGIN
export async function login(email, password) {
  const usuarios = await dataService.getUsuarios();
  const user = usuarios.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem("contasoft_user_sesion", JSON.stringify(user));
    return user;
  }
  throw new Error("Credenciales inválidas");
}

// LOGOUT
export function logoutUser() {
  localStorage.removeItem("contasoft_user_sesion");
}

// REGISTRO
export async function registerUser(userData) {
  const usuarios = await dataService.getUsuarios();
  if (usuarios.some(u => u.email === userData.email)) {
    throw new Error("El email ya está registrado");
  }

  const nuevo = {
    nombre: userData.nombre,
    email: userData.email,
    password: userData.password, 
    rol: "admin",
    empresa_id: userData.empresaId || "emp_" + Date.now()
  };

  return await dataService.saveUsuario(nuevo);
}

// ELIMINAR
export async function deleteUser(id) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    throw new Error("No puedes eliminar tu propio usuario");
  }
  return await dataService.deleteUser(id);
}
// --- CLIENTES (Agregar esta si no está) ---
export async function getClienteById(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener cliente:", error);
  return data;
}

// --- PROVEEDORES (Agregar esta por si acaso) ---
export async function getProveedorById(id) {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener proveedor:", error);
  return data;
}

// --- STOCK (Agregar esta para DetalleStock.vue) ---
export async function getStockItemById(id) {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener producto:", error);
  return data;
}
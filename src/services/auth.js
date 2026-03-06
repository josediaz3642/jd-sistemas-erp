import { supabase } from "@/supabase";
import * as dataService from "./data";
export { login as loginUser };

export function getCurrentUser() {
  const user = localStorage.getItem("contasoft_user_sesion");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}


export async function login(email, password) {  
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !usuarios) {
    console.error("Error en login:", error);
    throw new Error("Credenciales inválidas");
  }
  localStorage.setItem("contasoft_user_sesion", JSON.stringify(usuarios));
  return usuarios;
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

// --- CLIENTES ---
export async function getClienteById(id) {
  const { data, error } = await supabase // Ahora sí funcionará
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener cliente:", error);
  return data;
}

// --- PROVEEDORES ---
export async function getProveedorById(id) {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener proveedor:", error);
  return data;
}

// --- STOCK ---
export async function getStockItemById(id) {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('id', id)
    .single();
  if (error) console.error("Error al obtener producto:", error);
  return data;
}
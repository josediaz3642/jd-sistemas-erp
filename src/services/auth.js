import { supabase } from "@/supabase";

const SESION_KEY = "contasoft_user_sesion";

// --- HELPERS DE SESIÓN ---
export function getCurrentUser() {
  const user = localStorage.getItem(SESION_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    localStorage.removeItem(SESION_KEY); 
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(SESION_KEY);
  // Redirección forzada para limpiar estado de Vue
  window.location.href = "/login"; 
}

export { login as loginUser }; 
export const iniciarSesionFinal = login;
// --- LOGIN (AUTENTICACIÓN) ---
export async function login(email, password) {
  // 1. Buscamos al usuario solo por email para evitar errores 406/RLS
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .maybeSingle(); // No lanza error si no encuentra nada

  if (error) {
    console.error("Error JD Sistemas (DB Login):", error.message);
    throw new Error("Error de conexión con la base de datos");
  }

  // 2. Validaciones manuales
  if (!usuario) {
    throw new Error("El email no está registrado");
  }

  if (usuario.password !== password) { // String plano para desarrollo
    throw new Error("Contraseña incorrecta");
  }

  // 3. Guardar Sesión y retornar
  localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
  return usuario;
}


export async function registerUser(userData) {
  try {
    const nuevoEmpresaId = 'emp_' + Date.now();

    const nuevoUsuario = {
      nombre: userData.nombre,
      apellido: userData.apellido, // NUEVO
      email: userData.email,
      password: userData.password,
      telefono: userData.telefono, // NUEVO
      nro_documento: userData.nro_documento, // NUEVO
      rol: 'admin',
      empresa_id: nuevoEmpresaId,
      estado: 'activo',
      // Preferencias de envío
      prefiere_resumen_email: userData.prefiere_resumen_email || true,
      prefiere_resumen_whatsapp: userData.prefiere_resumen_whatsapp || false
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert([nuevoUsuario])
      .select()
      .single();

    if (error) throw new Error("Error al crear cuenta: " + error.message);
    return data;
  } catch (err) {
    throw err;
  }
}
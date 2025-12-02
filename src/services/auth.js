// =====================================
//  AUTH LOCALSTORAGE (SIN FIREBASE)
// =====================================

import { ref } from "vue";
import { getUsuarios, saveUsuario } from "@/services/data";

// ------------------------
// Sesión reactiva
// ------------------------
const currentUserRef = ref(null);

(function restoreSession() {
  try {
    const raw = localStorage.getItem("erp_user_session");
    if (raw) currentUserRef.value = JSON.parse(raw);
  } catch {}
})();

function saveSession(user) {
  currentUserRef.value = user;
  localStorage.setItem("erp_user_session", JSON.stringify(user));
}

export function logoutUser() {
  currentUserRef.value = null;
  localStorage.removeItem("erp_user_session");
}

export function getCurrentUser() {
  return currentUserRef.value;
}

// ------------------------
// Crear ADMIN si no existe
// ------------------------
(function ensureAdminExists() {
  let usuarios = getUsuarios();
  const existe = usuarios.find(u => u.usuario === "admin");

  if (!existe) {
    const admin = {
      id: Date.now(),
      nombre: "Administrador",
      usuario: "admin",
      clave: "admin123",
      rol: "admin"
    };
    usuarios.push(admin);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    console.log("⚡ Usuario admin creado por defecto");
  }
})();

// ------------------------
// LOGIN
// ------------------------
export async function loginUser(usuario, clave) {
  const usuarios = getUsuarios();
  const user = usuarios.find(
    u => u.usuario === usuario && u.clave === clave
  );

  if (!user) return null;

  saveSession(user);
  return user;
}

// ------------------------
// CRUD SOLO ADMIN
// ------------------------
export async function createUser({ usuario, nombre, clave }) {
  const current = getCurrentUser();
  if (!current || current.rol !== "admin") {
    throw new Error("Solo un administrador puede crear usuarios.");
  }

  let usuarios = getUsuarios();

  if (usuarios.find(u => u.usuario === usuario)) {
    throw new Error("El usuario ya existe.");
  }

  const newUser = {
    id: Date.now(),
    usuario,
    nombre,
    clave,
    rol: "usuario"
  };

  usuarios.push(newUser);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  return newUser;
}

export async function listUsers() {
  const current = getCurrentUser();
  if (!current || current.rol !== "admin")
    throw new Error("No autorizado.");

  return getUsuarios();
}

export async function updateUser(id, patch) {
  const current = getCurrentUser();
  if (!current || current.rol !== "admin")
    throw new Error("No autorizado.");

  let usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) throw new Error("Usuario no encontrado.");

  usuarios[index] = { ...usuarios[index], ...patch };
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

export async function deleteUser(id) {
  const current = getCurrentUser();
  if (!current || current.rol !== "admin")
    throw new Error("No autorizado.");

  let usuarios = getUsuarios().filter(u => u.id !== id);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

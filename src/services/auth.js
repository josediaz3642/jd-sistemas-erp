// src/services/auth.js
import { getUsuarios, saveUsuario, deleteUser as deleteUsuarioLS } from "./data";

// -------------------------------
// LOGIN
// -------------------------------
export function loginUser(email, password) {
    const usuarios = getUsuarios(); // Trae todos para validar credenciales

    const user = usuarios.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        throw new Error("Credenciales inválidas o usuario inexistente");
    }

    // Guardamos la sesión del usuario
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
}

// -------------------------------
// LOGOUT
// -------------------------------
export function logoutUser() {
    localStorage.removeItem("currentUser");
}

// -------------------------------
// USUARIO ACTUAL
// -------------------------------
export function getCurrentUser() {
  const user = localStorage.getItem("contasoft_user_sesion");
  return user ? JSON.parse(user) : null;
}
// -------------------------------
// REGISTRO (Alta de nueva empresa/cliente)
// -------------------------------
export function createUser(data) {
    const usuarios = getUsuarios();

    if (usuarios.some(u => u.email === data.email)) {
        throw new Error("Ya existe un usuario con ese email");
    }

    // Si el que crea es un ADMIN del sistema, quizás quiera asignar empresaId.
    // Si es un registro nuevo, generamos un empresaId nuevo (un nuevo cliente del SaaS).
    const nuevoEmpresaId = data.empresaId || "emp_" + Date.now(); 

    const nuevo = {
        id: Date.now(),
        nombre: data.nombre,
        email: data.email,
        password: data.password, // Nota: En producción usar hashing (bcrypt)
        rol: data.rol || "admin", 
        empresaId: nuevoEmpresaId 
    };

    saveUsuario(nuevo);
    return nuevo;
}

// -------------------------------
// LISTAR USUARIOS (Filtrado por empresa)
// -------------------------------
export function listUsers() {
    const currentUser = getCurrentUser();
    const todos = getUsuarios();

    if (!currentUser) return [];

    // Si eres "superadmin" podrías ver todos, 
    // pero para el cliente que alquila, solo mostramos sus empleados:
    return todos.filter(u => u.empresaId === currentUser.empresaId);
}

// -------------------------------
// EDITAR
// -------------------------------
export function updateUser(user) {
    const currentUser = getCurrentUser();
    
    // Validamos que el usuario que se edita pertenece a la misma empresa
    // para evitar que alguien edite usuarios ajenos por consola
    if (user.empresaId !== currentUser.empresaId && currentUser.rol !== 'superadmin') {
        throw new Error("No tienes permisos para modificar este usuario");
    }

    saveUsuario(user);
}

// -------------------------------
// ELIMINAR
// -------------------------------
export function deleteUser(id) {
    // Aquí podrías agregar una lógica para que un usuario no se borre a sí mismo
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
        throw new Error("No puedes eliminar tu propio usuario");
    }
    
    deleteUsuarioLS(id);
}
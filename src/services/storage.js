// src/services/storage.js

// 🔹 Nombre de la clave donde guardamos los usuarios
const STORAGE_KEY = "app_users";

// Obtener usuarios desde localStorage
export function getUsers() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

// Guardar usuarios
export function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Crear usuario nuevo
export function addUser(user) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}

// Actualizar usuario existente
export function updateUserStorage(updated) {
    const users = getUsers().map(u => u.id === updated.id ? updated : u);
    saveUsers(users);
}

// Eliminar usuario
export function deleteUserStorage(id) {
    const users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
}

// 🔹 Crear admin por defecto si no existe
export function ensureDefaultAdmin() {
    const users = getUsers();
    const exists = users.some(u => u.email === "admin@admin.com");

    if (!exists) {
        const admin = {
            id: crypto.randomUUID(),
            name: "Administrador",
            email: "admin@admin.com",
            password: "admin123",
            role: "admin",
            verified: true,
            createdAt: new Date().toISOString()
        };

        users.push(admin);
        saveUsers(users);
        console.log("✔ Usuario admin creado automáticamente");
    }
}

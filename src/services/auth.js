// src/services/auth.js

const USERS_KEY = 'usuarios';
const CURRENT_USER_KEY = 'current_user';

if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([
    { id: 1, nombre: 'Admin', usuario: 'admin', clave: '1234', rol: 'admin' },
    { id: 2, nombre: 'Gerente', usuario: 'gerente', clave: '1234', rol: 'gerente' },
    { id: 3, nombre: 'Usuario', usuario: 'usuario', clave: '1234', rol: 'usuario' }
  ]));
}

export function loginUser(usuario, clave) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.usuario === usuario && u.clave === clave);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

export function getUsuarios() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

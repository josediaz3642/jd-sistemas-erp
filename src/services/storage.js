/**
 * Carga una colección completa desde localStorage.
 * @param {string} key - La clave de la colección (e.g., 'users', 'clientes').
 * @returns {Array<Object>}
 */
export const loadCollection = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error cargando colección ${key} de localStorage:`, error);
    return [];
  }
};

/**
 * Guarda una colección completa en localStorage.
 * @param {string} key - La clave de la colección.
 * @param {Array<Object>} collection - El array de objetos a guardar.
 */
export const saveCollection = (key, collection) => {
  try {
    localStorage.setItem(key, JSON.stringify(collection));
  } catch (error) {
    console.error(`Error guardando colección ${key} en localStorage:`, error);
  }
};
const KEY = "gastos";

export function getGastos() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveGasto(gasto) {
  const gastos = getGastos();
  gastos.push(gasto);
  localStorage.setItem(KEY, JSON.stringify(gastos));
}

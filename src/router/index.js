import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "@/services/auth";
import Login from "@/views/Login.vue";
import Registro from "@/views/Registro.vue";
import Dashboard from "@/views/Dashboard.vue";
import Clientes from "@/views/Clientes.vue";
import DetalleCliente from "@/views/DetalleCliente.vue";
import Proveedores from "@/views/Proveedores.vue";
import DetalleProveedor from "@/views/DetalleProveedor.vue";
import Facturacion from "@/views/Facturacion.vue";
import FacturaCliente from "@/views/FacturaCliente.vue";
import Stock from "@/views/Stock.vue";
import Cheques from "@/views/Cheques.vue";
import Mantenimiento from "@/views/Mantenimiento.vue";
import DetalleFactura from "@/views/DetalleFactura.vue";
import ClienteDetalle from "@/views/ClienteDetalle.vue";
import Caja from "@/views/Caja.vue";
import Ajustes from "@/views/Ajustes.vue";
import NuevaCompra from "@/views/NuevaCompra.vue";
import Reportes from "@/views/Reportes.vue";

const routes = [
  // La raíz ahora es el Login directamente para evitar rebotes
  { path: "/", name: "LoginRoot", component: Login },
  { path: "/login", name: "Login", component: Login },
  { path: "/registro", name: "Registro", component: Registro },
  
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/facturacion", component: Facturacion },
  { path: "/factura/nueva", component: FacturaCliente },
  { path: "/facturacion/:id", component: DetalleFactura },
  { path: "/ajustes", component: Ajustes },
  { path: "/caja", component: Caja },
  { path: "/reportes", component: Reportes },
  
  // CLIENTES
  { path: "/clientes", component: Clientes },
  { path: "/cliente/nuevo", component: DetalleCliente },  
  { path: "/cliente/:id", component: ClienteDetalle },

  // STOCK
  { path: "/stock", component: Stock },
  { path: "/stock/nuevo", component: () => import("@/views/DetalleStock.vue") },
  { path: "/stock/:id", component: () => import("@/views/DetalleStock.vue") },

  // PROVEEDORES
  { path: "/proveedores", component: Proveedores },
  { path: "/proveedor/nuevo", component: DetalleProveedor },
  { path: "/proveedor/:id", component: DetalleProveedor },
  { path: "/compras/nueva", component: NuevaCompra },

  { path: "/cheques", component: Cheques },

  // ADMIN
  {
    path: "/mantenimiento",
    component: Mantenimiento,
    meta: { role: ["admin"] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// GUARDIA CORREGIDA: Permite entrar a "/" y "/login" sin estar logueado
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  
  // Si intenta ir a login o a la raíz, dejamos pasar
  if (to.path === "/login" || to.path === "/") {
    return next();
  }

  // Si no hay usuario y va a cualquier otra ruta, al login
  if (!user) {
    return next("/");
  }

  // Si hay reglas de rol
  if (to.meta?.role && !to.meta.role.includes(user.rol)) {
    return next("/dashboard");
  }

  next();
});

export default router;
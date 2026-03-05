import { createRouter, createWebHistory } from "vue-router";
import { getCurrentUser } from "@/services/auth";

// Imports de vistas
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
  { path: "/", name: "LoginRoot", component: Login },
  { path: "/login", name: "Login", component: Login },
  { path: "/registro", name: "Registro", component: Registro },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/facturacion", component: Facturacion },
  { path: "/factura-nueva", name: "FacturaNueva", component: FacturaCliente },
  { path: "/facturacion/:id", component: DetalleFactura },
  { path: "/ajustes", component: Ajustes },
  { path: "/caja", component: Caja },
  { path: "/reportes", component: Reportes },
  { path: "/clientes", component: Clientes },
  { path: "/cliente/nuevo", component: DetalleCliente },
  { path: "/cliente/:id", component: ClienteDetalle },
  { path: "/stock", component: Stock },
  { path: "/stock/nuevo", component: () => import("@/views/DetalleStock.vue") },
  { path: "/stock/:id", component: () => import("@/views/DetalleStock.vue") },
  { path: "/proveedores", component: Proveedores },
  { path: "/proveedor/nuevo", component: DetalleProveedor },
  { path: "/proveedor/:id", component: DetalleProveedor },
  { path: "/compras/nueva", component: NuevaCompra },
  { path: "/cheques", component: Cheques },
  { path: "/mantenimiento",component: Mantenimiento,meta: { role: ["admin"] }}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// GUARDIA CORREGIDA SIN ERRORES DE SINTAXIS
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  
  // 1. Si va a login o raíz, permitir siempre
  if (to.path === "/login" || to.path === "/") {
    return next();
  }

  // 2. Si no hay usuario, mandar al login
  if (!user) {
    return next("/login");
  }

  // 3. Verificación de roles
  if (to.meta?.role && !to.meta.role.includes(user.rol)) {
    return next("/dashboard");
  }

  next();
});

export default router;
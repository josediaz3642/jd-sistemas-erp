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
import Caja from "@/views/Caja.vue"; // 
import Ajustes from "@/views/Ajustes.vue";
import NuevaCompra from "@/views/NuevaCompra.vue";
import Reportes from "@/views/Reportes.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/registro", component: Registro },
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/facturacion", component: Facturacion },
  { path: "/factura/nueva", component: FacturaCliente },
  { path: "/facturacion/:id", component: DetalleFactura }, // Ya estaba, verificamos que el path sea correcto
	{ path: "/ajustes", component: Ajustes },
  { path: "/caja", component: Caja }, //   
  { path: "/cheques", component: Cheques },
  { path: "/reportes", component: Reportes },
  // CLIENTES
  { path: "/clientes", component: Clientes },
  { path: "/cliente/nuevo", component: DetalleCliente },  
  { path: "/cliente/:id",component: ClienteDetalle},

// STOCK
{ path: "/stock", component: Stock },
{ path: "/stock/nuevo", component: () => import("@/views/DetalleStock.vue") },
{ path: "/stock/:id", component: () => import("@/views/DetalleStock.vue") },

  // PROVEEDORES
  { path: "/proveedores", component: Proveedores },
  { path: "/proveedor/nuevo", component: DetalleProveedor },
  { path: "/proveedor/:id", component: DetalleProveedor },
	{ path: "/compras/nueva", component: NuevaCompra },
  // FACTURACIÓN
  { path: "/facturacion", component: Facturacion },
  { path: "/factura/nueva", component: FacturaCliente },
{ path: "/facturacion/:id", component: DetalleFactura },

  // OTROS  
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

// GUARDIA
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  if (to.path !== "/login" && !user) return next("/login");
  if (to.meta?.role && !to.meta.role.includes(user.rol)) return next("/dashboard");
  next();
});

export default router;

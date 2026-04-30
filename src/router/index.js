import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/authStore';

// Imports de vistas
import Login from "@/views/Login.vue";
import Registro from "@/views/Registro.vue";
import Dashboard from "@/views/Dashboard.vue";
import Facturacion from "@/views/Facturacion.vue";
import FacturaCliente from "@/views/FacturaCliente.vue";
import DetalleFactura from "@/views/DetalleFactura.vue";
import Clientes from "@/views/Clientes.vue";
import DetalleCliente from "@/views/DetalleCliente.vue";
import ClienteDetalle from "@/views/ClienteDetalle.vue";
import Proveedores from "@/views/Proveedores.vue";
import DetalleProveedor from "@/views/DetalleProveedor.vue";
import Stock from "@/views/Stock.vue";
import Caja from "@/views/Caja.vue";
import Ajustes from "@/views/Ajustes.vue";
import Reportes from "@/views/Reportes.vue";
import Cheques from "@/views/Cheques.vue";
import Mantenimiento from "@/views/Mantenimiento.vue";
import Remitos from "@/views/Remitos.vue";

const routes = [
  { path: "/", redirect: "/login" },
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
  { path: "/cuentas-corrientes", name: "CuentasCorrientes", component: () => import('../views/ResumenCuentas.vue') },
  { path: "/stock", component: Stock },
  { path: "/stock/nuevo", component: () => import("@/views/DetalleStock.vue") },
  { path: "/stock/:id", component: () => import("@/views/DetalleStock.vue") },
  { path: "/proveedores", component: Proveedores },
  { path: "/proveedor/nuevo", component: DetalleProveedor },
  { path: "/proveedor/:id", component: DetalleProveedor },
  { path: "/compras/nueva", component: () => import("@/views/NuevaCompra.vue") },
  { path: "/cheques", component: Cheques },
  { path: '/inventario', name: 'Inventario', component: () => import('@/views/Stock.vue') },
  { path: "/mantenimiento", component: Mantenimiento, meta: { role: ["admin"] } },
  { path: "/remitos", name: "Remitos", component: Remitos },
  { path: "/remitos/nuevo", name: "NuevoRemito", component: () => import("@/views/DetalleRemito.vue") },
  { path: "/remitos/:id", name: "DetalleRemito", component: () => import("@/views/DetalleRemito.vue") }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// GUARD DE NAVEGACIÓN
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Si hay una sesión en curso pero no está cargada en el Store, la recuperamos
  if (!authStore.user && authStore.loading) {
    await authStore.fetchSession();
  }

  const isPublicPage = ['/login', '/registro'].includes(to.path);
  const isAuthenticated = !!authStore.user;

  if (!isPublicPage && !isAuthenticated) {
    next('/login');
  } else if (isPublicPage && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
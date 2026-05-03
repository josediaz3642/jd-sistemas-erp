import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/authStore';

// Imports de vistas
import LandingPage from "@/views/LandingPage.vue";
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
import Presupuestos from "@/views/Presupuestos.vue";

const routes = [
  // --- RUTAS PÚBLICAS ---
  { path: "/", name: "Landing", component: LandingPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/registro", name: "Registro", component: Registro },

  // --- RUTAS PRIVADAS (ERP) ---
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/crm", name: "CRM", component: () => import("@/views/CRM.vue") },
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
  { path: '/ajuste-precios', name: 'AjustePrecios', component: () => import('../views/AjustePrecios.vue') },
  { path: '/inventario', name: 'Inventario', component: () => import('@/views/Stock.vue') },
  { path: "/mantenimiento", component: Mantenimiento, meta: { role: ["admin"] } },
  { path: "/remitos", name: "Remitos", component: Remitos },
  { path: "/remitos/nuevo", name: "NuevoRemito", component: () => import("@/views/DetalleRemito.vue") },
  { path: "/remitos/:id", name: "DetalleRemito", component: () => import("@/views/DetalleRemito.vue") },
  { path: "/presupuestos", name: "Presupuestos", component: Presupuestos },
  { path: "/presupuestos/nuevo", name: "NuevoPresupuesto", component: () => import("@/views/NuevoPresupuesto.vue") },

  // --- RUTAS NUEVAS ---
  { path: "/usuarios", name: "Usuarios", component: () => import("@/views/Usuarios.vue") },
  { path: "/admin/suscripciones", name: "AdminSuscripciones", component: () => import("@/views/AdminSuscripciones.vue"), meta: { role: ["superadmin"] } },
  { path: "/perfil", name: "Perfil", component: () => import("@/views/Perfil.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  }
});

// GUARD DE NAVEGACIÓN
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (!authStore.user && authStore.loading) {
    await authStore.fetchSession();
  }

  const publicPages = ['/', '/login', '/registro'];
  const isPublicPage = publicPages.includes(to.path);
  const isAuthenticated = !!authStore.user;

  if (!isPublicPage && !isAuthenticated) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/registro') && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
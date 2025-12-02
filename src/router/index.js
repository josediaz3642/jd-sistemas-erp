import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import Clientes from "@/views/Clientes.vue";
import Facturacion from "@/views/Facturacion.vue";
import Cheques from "@/views/Cheques.vue";
import Stock from "@/views/Stock.vue";
import Mantenimiento from "@/views/Mantenimiento.vue";
import { getCurrentUser } from "@/services/auth";

const routes = [
  { path: "/login", component: Login },
  { path: "/", redirect: "/dashboard" },

  // DASHBOARD
  { path: "/dashboard", component: Dashboard },
  { path: "/dashboard-avanzado", component: () => import("@/views/DashboardAvanzado.vue") },

  // CLIENTES
  { path: "/clientes", component: Clientes },
  { path: "/cliente/:id", component: () => import("@/views/DetalleCliente.vue") },
  { path: "/resumen-clientes", component: () => import("@/views/ResumenCuentaCliente.vue") },

  // PROVEEDORES
  { path: "/proveedores", component: () => import("@/views/Proveedores.vue") },
  { path: "/proveedor/:id", component: () => import("@/views/DetalleProveedor.vue") },
  { path: "/proveedor/:id/facturas", component: () => import("@/views/FacturasProveedor.vue") },
  { path: "/proveedor/:id/pagos", component: () => import("@/views/PagosProveedor.vue") },
  { path: "/resumen-proveedores", component: () => import("@/views/ResumenCuentaProveedor.vue") },

  // OTROS MÓDULOS
  { path: "/facturacion", component: Facturacion },
  { path: "/cheques", component: Cheques },
  { path: "/stock", component: Stock },

  // ADMIN
  { 
    path: "/mantenimiento",
    component: Mantenimiento,
    meta: { role: ["admin"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// PROTECCIÓN DE RUTAS
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  if (to.path !== "/login" && !user) return next("/login");
  if (to.meta.role && !to.meta.role.includes(user?.rol)) return next("/dashboard");
  next();
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Clientes from '@/views/Clientes.vue';
import Facturacion from '@/views/Facturacion.vue';
import Cheques from '@/views/Cheques.vue';
import Stock from '@/views/Stock.vue';
import Mantenimiento from '@/views/Mantenimiento.vue';
import { getCurrentUser } from '@/services/auth';

const routes = [
  { path: '/login', component: Login },
  { path: '/', redirect: '/login' },
  { path: '/dashboard', component: Dashboard },
  { path: '/clientes', component: Clientes },
  { path: '/facturacion', component: Facturacion },
  { path: '/cheques', component: Cheques },
  { path: '/stock', component: Stock },
  { path: '/mantenimiento', component: Mantenimiento, meta: { role: ['admin', 'gerente'] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  if (to.path !== '/login' && !user) {
    return next('/login');
  }

  // Control de roles
  if (to.meta.role && !to.meta.role.includes(user?.rol)) {
    alert('Acceso denegado');
    return next('/dashboard');
  }

  next();
});

export default router;

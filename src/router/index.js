import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // 🔹 Router guard globale
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    // Se la rotta richiede login e non c'è token → reindirizza al login
    if (to.meta.requiresAuth && !token) return next('/login')

    // Controllo accesso per ruolo
    if (to.meta.role && !to.meta.role.includes(role)) {
      // Se la rotta è dipendente, admin e segreteria possono comunque accedere
      if (to.path.startsWith('/dipendente') && (role === 'admin' || role === 'segreteria')) {
        return next()
      }

      // Altrimenti reindirizza al login
      return next('/login')
    }

    next()
  })

  return Router
})

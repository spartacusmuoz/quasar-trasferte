const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'home' },

      // DASHBOARD DIPENDENTE (dipendente + admin + segreteria)
      {
        path: 'dipendente/dashboard',
        component: () => import('pages/DashboardDipendente.vue'),
        name: 'dashboard-dipendente',
        meta: { requiresAuth: true, role: ['dipendente', 'admin', 'segreteria'] }
      },
      {
        path: 'dipendente/prenotazioni',
        component: () => import('pages/DipendentePrenotazioni.vue'),
        name: 'dipendente-prenotazioni',
        meta: { requiresAuth: true, role: ['dipendente', 'admin', 'segreteria'] }
      },
      {
        path: 'dipendente/spese',
        component: () => import('pages/SpesePage.vue'),
        name: 'dipendente-spese',
        meta: { requiresAuth: true, role: ['dipendente', 'admin', 'segreteria'] }
      },
      {
        path: 'dipendente/trasferte',
        component: () => import('pages/PagesNuovaTrasferta.vue'),
        name: 'dipendente-trasferte',
        meta: { requiresAuth: true, role: ['dipendente', 'admin', 'segreteria'] }
      },

      // DASHBOARD SEGRETERIA (solo admin + segreteria)
      {
        path: 'segreteria/dashboard',
        component: () => import('pages/DashboardSegreteria.vue'),
        name: 'dashboard-segreteria',
        meta: { requiresAuth: true, role: ['admin', 'segreteria'] }
      },
      {
        path: 'segreteria/trasferte',
        component: () => import('pages/PagesSegretariaTrasferte.vue'),
        name: 'segreteria-trasferte',
        meta: { requiresAuth: true, role: ['admin', 'segreteria'] }
      },
      {
        path: 'segreteria/trasferte/:idTrasferta/hotel',
        component: () => import('pages/HotelMappa.vue'),
        name: 'hotel-mappa',
        meta: { requiresAuth: true, role: ['admin', 'segreteria'] }
      },
      {
        path: 'segreteria/prenotazioni',
        component: () => import('pages/PagePrenotazione.vue'),
        name: 'segreteria-prenotazioni',
        meta: { requiresAuth: true, role: ['admin', 'segreteria'] }
      },
      {
        path: 'segreteria/spese',
        component: () => import('pages/SegretariaSpese.vue'),
        name: 'segreteria-spese',
        meta: { requiresAuth: true, role: ['admin', 'segreteria'] }
      },

      // LOGIN
      { path: 'login', component: () => import('pages/LoginPage.vue'), name: 'login' },
    ],
  },

  // 404
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue'), name: 'not-found' },
]

export default routes

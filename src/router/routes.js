const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'home' },

      // 🚀 DASHBOARD DIPENDENTE
      { path: 'dipendente/dashboard', component: () => import('pages/DashboardDipendente.vue'), name: 'dashboard-dipendente' },
      { path: 'dipendente/prenotazioni', component: () => import('pages/DipendentePrenotazioni.vue'), name: 'dipendente-prenotazioni' },
      { path: 'dipendente/spese', component: () => import('pages/SpesePage.vue'), name: 'dipendente-spese' },
      { path: 'dipendente/trasferte', component: () => import('pages/PagesNuovaTrasferta.vue'), name: 'dipendente-trasferte' },

      // 🚀 DASHBOARD SEGRETERIA
      { path: 'segreteria/dashboard', component: () => import('pages/DashboardSegreteria.vue'), name: 'dashboard-segreteria' },
      { path: 'segreteria/trasferte', component: () => import('pages/PagesSegretariaTrasferte.vue'), name: 'segreteria-trasferte' },
      { path: 'segreteria/prenotazioni', component: () => import('pages/PagePrenotazione.vue'), name: 'segreteria-prenotazioni' },
      { path: 'segreteria/spese', component: () => import('pages/SegretariaSpese.vue'), name: 'segreteria-spese' },
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue'), name: 'not-found' },
]

export default routes

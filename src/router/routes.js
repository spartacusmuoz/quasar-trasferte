const routes = [
  // 🌟 Layout principale
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), name: 'home' },
      { path: 'spese', component: () => import('pages/SpesePage.vue'), name: 'spese' },
      { path: 'spese-test', component: () => import('pages/SpeseFormTest.vue'), name: 'spese-test' },
      { path: 'nuova-trasferta', component: () => import('pages/PagesNuovaTrasferta.vue'), name: 'nuova-trasferta' },

      // ⭐ Pagine della segreteria
      { path: 'segreteria/trasferte', component: () => import('pages/PagesSegretariaTrasferte.vue'), name: 'segreteria-trasferte' },
      { path: 'segreteria/prenotazioni', component: () => import('pages/PagePrenotazione.vue'), name: 'segreteria-prenotazioni' },
      { path: 'segreteria/spese', component: () => import('pages/SegretariaSpese.vue'), name: 'segreteria-spese' },

      // 🌟 Nuova pagina per le prenotazioni del dipendente
      { path: 'prenotazioni', component: () => import('pages/DipendentePrenotazioni.vue'), name: 'dipendente-prenotazioni' },
    ],
  },

  // 🌟 Rotta di fallback (404)
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue'), name: 'not-found' },
]

export default routes

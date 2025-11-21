const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'spese', component: () => import('pages/SpesePage.vue') },
      { path: 'spese-test', component: () => import('pages/SpeseFormTest.vue') },
      { path: 'nuova-trasferta', component: () => import('pages/PagesNuovaTrasferta.vue') },

      // ⭐ AGGIUNTA QUI: Pagina della Segretaria
      { 
        path: 'segreteria/trasferte', 
        component: () => import('pages/PagesSegretariaTrasferte.vue') 
      },
    ],
  },

  // Not Found
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes

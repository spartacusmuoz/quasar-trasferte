// src/router/routes.js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },        // home
      { path: 'spese', component: () => import('pages/SpesePage.vue') },    // gestione spese
      { path: 'spese-test', component: () => import('pages/SpeseFormTest.vue') }, // <-- nuova pagina di test
      // altre pagine interne...
    ],
  },

  // fallback route per 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

<template>
  <q-layout view="lHh Lpr lFf">

    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Quasar App</q-toolbar-title>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Menu</q-item-label>

        <q-item
          v-for="link in linksList"
          :key="link.title"
          clickable
          :to="link.to ? link.to : null"
          v-bind="link.to ? {} : { href: link.link }"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Voci menu aggiornate
const linksList = [
  // 🌟 Voci Dipendente
  { title: 'Home', icon: 'home', to: '/' },
  { title: 'Spese', icon: 'receipt', to: '/spese' },
  { title: 'Nuova Trasferta', icon: 'flight_takeoff', to: '/nuova-trasferta' },
  { title: 'Le Mie Prenotazioni', icon: 'airplane_ticket', to: '/prenotazioni' },

  // 🌟 Voci Segreteria / Manager
  { title: 'Segreteria - Trasferte', icon: 'assignment', to: '/segreteria/trasferte' },
  { title: 'Segreteria - Prenotazioni', icon: 'flight_land', to: '/segreteria/prenotazioni' },
  { title: 'Segreteria - Spese', icon: 'payments', to: '/segreteria/spese' },
]

</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Portale Segreteria</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Menu</q-item-label>
        <q-item to="/segreteria/dashboard" clickable>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item to="/segreteria/trasferte" clickable>
          <q-item-section>Trasferte</q-item-section>
        </q-item>
        <q-item to="/segreteria/prenotazioni" clickable>
          <q-item-section>Prenotazioni</q-item-section>
        </q-item>
        <q-item to="/segreteria/spese" clickable>
          <q-item-section>Spese</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

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
</script>

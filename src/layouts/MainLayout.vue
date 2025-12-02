<template>
  <q-layout view="lHh Lpr lFf">

    <!-- HEADER -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Menu
        </q-toolbar-title>

       <div>Benvenuto al portale</div>


        <!-- Selezione ruolo -->
        <q-select
          outlined
          dense
          style="width: 150px; margin-left: 16px"
          v-model="currentRole"
          :options="roleOptions"
          emit-value
          map-options
        />
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
          :to="link.to"
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
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// --- RUOLO SELEZIONATO ---
const currentRole = ref('dipendente')

const roleOptions = [
  { label: 'Dipendente', value: 'dipendente' },
  { label: 'Segreteria', value: 'segreteria' }
]

// 🔥 Quando cambia ruolo → vai alla dashboard corretta
watch(currentRole, (newRole) => {
  if (newRole === 'dipendente') {
    router.push('/dipendente/dashboard')
  } else {
    router.push('/segreteria/dashboard')
  }
})

// --- MENU DINAMICO ---
const linksList = computed(() => {
  if (currentRole.value === 'dipendente') {
    return [
      { title: 'Portale Dipendente', icon: 'dashboard', to: '/dipendente/dashboard' },
      { title: 'Prenotazioni', icon: 'assignment', to: '/dipendente/prenotazioni' },
      { title: 'Spese', icon: 'receipt', to: '/dipendente/spese' },
      { title: 'Trasferte', icon: 'flight_takeoff', to: '/dipendente/trasferte' }
    ]
  } else {
    return [
      { title: 'Portale Segreteria', icon: 'dashboard', to: '/segreteria/dashboard' },
      { title: 'Trasferte', icon: 'assignment', to: '/segreteria/trasferte' },
      { title: 'Prenotazioni', icon: 'airplane_ticket', to: '/segreteria/prenotazioni' },
      { title: 'Spese', icon: 'payments', to: '/segreteria/spese' }
    ]
  }
})
</script>

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

        <!-- Selezione ruolo: visibile solo admin e segreteria -->
        <div v-if="canSwitchRole" style="display: flex; align-items: center; margin-left: 16px;">
          <q-icon name="swap_horiz" size="sm" style="margin-right: 8px;" />
          <q-select
            outlined
            dense
            style="width: 180px;"
            v-model="currentRole"
            :options="roleOptions"
            emit-value
            map-options
            label="Visualizza come"
          >
            <template v-slot:prepend>
              <q-icon :name="currentRole === 'dipendente' ? 'person' : 'admin_panel_settings'" />
            </template>
          </q-select>
        </div>

        <!-- Logout button -->
        <q-btn
          flat
          dense
          color="negative"
          icon="logout"
          label="Logout"
          style="margin-left: 16px"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>Menu</span>
            <q-chip 
              :color="currentRole === 'dipendente' ? 'blue' : 'orange'" 
              text-color="white" 
              size="sm"
            >
              {{ currentRole === 'dipendente' ? 'Dipendente' : 'Segreteria' }}
            </q-chip>
          </div>
        </q-item-label>

        <!-- Messaggio se in modalità visualizzazione -->
        <q-item v-if="canSwitchRole && currentRole === 'dipendente'" class="bg-blue-1">
          <q-item-section>
            <q-item-label caption class="text-blue-8">
              <q-icon name="info" size="xs" />
              Stai visualizzando il portale dipendente
            </q-item-label>
          </q-item-section>
        </q-item>

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
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// --- RUOLO ORIGINALE (quello con cui hai fatto login) ---
const originalRole = ref(localStorage.getItem('role') || 'dipendente')

// --- RUOLO CORRENTE (quello che stai visualizzando) ---
const currentRole = ref(localStorage.getItem('viewRole') || originalRole.value)

// --- VERIFICA SE PUÒ CAMBIARE RUOLO ---
const canSwitchRole = computed(() => {
  return originalRole.value === 'segreteria' || originalRole.value === 'admin'
})

// Opzioni per il selettore
const roleOptions = [
  { label: 'Vista Dipendente', value: 'dipendente', icon: 'person' },
  { label: 'Vista Segreteria', value: 'segreteria', icon: 'admin_panel_settings' }
]

// 🔥 Cambio ruolo di visualizzazione
watch(currentRole, (newRole) => {
  // Salva la vista corrente
  localStorage.setItem('viewRole', newRole)
  
  // Naviga alla dashboard corretta
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
      { title: 'Spese', icon: 'payments', to: '/segreteria/spese' },
      { title: 'Dipendenti', icon: 'people', to: '/segreteria/dipendenti' }
    ]
  }
})

// --- LOGOUT ---
function logout() {
  localStorage.clear()
  router.push('/login')
}

// --- CONTROLLO TOKEN ALL'AVVIO ---
onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  } else {
    const role = localStorage.getItem('role')
    originalRole.value = role
    
    // Ripristina l'ultima vista selezionata
    const savedViewRole = localStorage.getItem('viewRole')
    if (savedViewRole && canSwitchRole.value) {
      currentRole.value = savedViewRole
    } else {
      currentRole.value = role
      localStorage.setItem('viewRole', role)
    }
    
    // Naviga alla dashboard corretta
    if (currentRole.value === 'dipendente') {
      router.push('/dipendente/dashboard')
    } else if (currentRole.value === 'segreteria' || currentRole.value === 'admin') {
      router.push('/segreteria/dashboard')
    } else {
      logout()
    }
  }
})
</script>
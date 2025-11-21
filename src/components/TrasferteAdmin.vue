<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md" style="max-width: 600px; margin:auto">
      <q-card-section>
        <div class="text-h6">Nuova Trasferta</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submitTrasferta">

          <!-- Select Dipendente -->
          <q-select
            filled
            v-model="selectedDipendenteId"
            :options="dipendentiOptions"
            :key="dipendentiOptions.length"
            label="Dipendente"
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :loading="loadingDipendenti"
            required
          />

          <!-- Date Partenza -->
          <q-input
            filled
            v-model="data_partenza"
            label="Data Partenza"
            type="date"
            required
          />

          <!-- Date Rientro -->
          <q-input
            filled
            v-model="data_rientro"
            label="Data Rientro"
            type="date"
            required
          />

          <!-- Luogo Destinazione -->
          <q-input filled v-model="luogo_destinazione" label="Destinazione" required />

          <!-- Luogo Extra -->
          <q-input filled v-model="luogo_extra" label="Luogo Extra" />

          <!-- Tipo Commessa -->
          <q-input filled v-model="tipo_commessa" label="Tipo Commessa" />

          <!-- Note Dipendente -->
          <q-input filled v-model="note_dipendente" label="Note Dipendente" type="textarea" />

          <div class="q-mt-md">
            <q-btn label="Invia Trasferta" color="primary" type="submit" />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'

// Form fields
const selectedDipendenteId = ref(null)
const data_partenza = ref(new Date().toISOString().split('T')[0])
const data_rientro = ref(new Date().toISOString().split('T')[0])
const luogo_destinazione = ref('')
const luogo_extra = ref('')
const tipo_commessa = ref('')
const note_dipendente = ref('')
const dipendentiOptions = ref([])
const loadingDipendenti = ref(true)

// =======================
// Carica lista dipendenti
// =======================
const loadDipendenti = async () => {
  loadingDipendenti.value = true
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    dipendentiOptions.value = data.map(d => ({
      label: `${d.nome} ${d.cognome}`,
      value: d.id
    }))
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
    $q.notify({ type: 'negative', message: 'Impossibile caricare i dipendenti' })
  } finally {
    loadingDipendenti.value = false
  }
}

onMounted(loadDipendenti)

// =======================
// Submit trasferta
// =======================
const submitTrasferta = async () => {
  if (!selectedDipendenteId.value) {
    $q.notify({ type: 'warning', message: 'Seleziona un dipendente!' })
    return
  }

  const body = {
    id_dipendente: selectedDipendenteId.value,
    data_partenza: data_partenza.value,
    data_rientro: data_rientro.value,
    luogo_destinazione: luogo_destinazione.value,
    luogo_extra: luogo_extra.value,
    tipo_commessa: tipo_commessa.value,
    stato: 'inviata',
    note_dipendente: note_dipendente.value,
    note_segreteria: ''
  }

  try {
    const res = await axios.post(`${BASE_URL}/trasferte/trasferte/`, body, {
      headers: { 'x-user-id': selectedDipendenteId.value } // se serve header
    })
    $q.notify({ type: 'positive', message: 'Trasferta inviata!' })
    console.log('Trasferta creata:', res.data)

    // Reset form
    selectedDipendenteId.value = null
    data_partenza.value = new Date().toISOString().split('T')[0]
    data_rientro.value = new Date().toISOString().split('T')[0]
    luogo_destinazione.value = ''
    luogo_extra.value = ''
    tipo_commessa.value = ''
    note_dipendente.value = ''
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore durante l\'invio della trasferta' })
  }
}
</script>

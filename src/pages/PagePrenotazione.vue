<template>
  <q-page class="q-pa-md">

    <!-- CREAZIONE PRENOTAZIONE -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Crea Nuova Prenotazione</div>

        <q-form @submit.prevent="creaPrenotazione">

          <!-- Dipendente -->
          <q-select
            filled
            label="Dipendente"
            :options="dipendenti.map(d => ({ label: `${d.nome} ${d.cognome}`, value: d.id }))"
            v-model="nuovaPrenotazione.id_dipendente"
            required
          />

          <!-- Trasferta -->
          <q-select
            filled
            label="Trasferta"
            :options="trasferte.map(t => ({ label: `${t.dipendente_nome} - ${t.luogo_destinazione}`, value: t.id }))"
            v-model="nuovaPrenotazione.id_trasferta"
            required
          />

          <!-- Tipo mezzo -->
          <q-input filled label="Tipo Mezzo" v-model="nuovaPrenotazione.tipo_mezzo" required />

          <!-- Costo -->
          <q-input filled type="number" label="Costo" v-model="nuovaPrenotazione.costo" required />

          <!-- Fornitore -->
          <q-input filled label="Fornitore" v-model="nuovaPrenotazione.fornitore" required />

          <!-- Dettagli -->
          <q-input filled type="textarea" label="Dettagli" v-model="nuovaPrenotazione.dettagli" />

          <!-- Biglietto -->
          <q-uploader
            label="Biglietto"
            @added="onFileAdded"
            :hide-upload-btn="true"
          />

          <q-btn label="Crea Prenotazione" type="submit" color="primary" class="q-mt-md" />

        </q-form>
      </q-card-section>
    </q-card>

    <!-- ELENCO PRENOTAZIONI -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Elenco Prenotazioni</div>
      </q-card-section>

      <q-table
        :rows="prenotazioni"
        :columns="columns"
        row-key="id"
        flat
        bordered
      />
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'
const USER_ID = 6

// --- DATI ---
const dipendenti = ref([])
const trasferte = ref([])
const prenotazioni = ref([])

const nuovaPrenotazione = ref({
  id_dipendente: null,
  id_trasferta: null,
  tipo_mezzo: '',
  costo: 0,
  fornitore: '',
  dettagli: '',
  file_biglietto: null
})

// --- COLONNE TABELLA ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'id_dipendente' },
  { name: 'trasferta', label: 'Trasferta', field: 'id_trasferta' },
  { name: 'tipo_mezzo', label: 'Tipo Mezzo', field: 'tipo_mezzo' },
  { name: 'fornitore', label: 'Fornitore', field: 'fornitore' },
  { name: 'costo', label: 'Costo', field: 'costo' },
  { name: 'dettagli', label: 'Dettagli', field: 'dettagli' }
]

// --- CARICAMENTO DATI ---
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`, { headers: { 'x-user-id': USER_ID } })
    dipendenti.value = data
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
  }
}

const loadTrasferte = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte/`, { headers: { 'x-user-id': USER_ID } })
    trasferte.value = data.map(t => {
      const dip = dipendenti.value.find(d => d.id === t.id_dipendente)
      return { ...t, dipendente_nome: dip ? `${dip.nome} ${dip.cognome}` : 'Sconosciuto' }
    })
  } catch (err) {
    console.error('Errore caricamento trasferte', err)
  }
}

const loadPrenotazioni = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/prenotazioni/`, { headers: { 'x-user-id': USER_ID } })
    prenotazioni.value = data
  } catch (err) {
    console.error('Errore caricamento prenotazioni', err)
  }
}

// --- CREAZIONE PRENOTAZIONE ---
const onFileAdded = (files) => {
  nuovaPrenotazione.value.file_biglietto = files[0]
}

const creaPrenotazione = async () => {
  if (!nuovaPrenotazione.value.id_trasferta) {
    $q.notify({ type: 'negative', message: 'Seleziona una trasferta valida!' })
    return
  }

  const formData = new FormData()

  // Creiamo il JSON della prenotazione come in Postman
  const prenotazioneJson = JSON.stringify({
    id_trasferta: nuovaPrenotazione.value.id_trasferta,
    tipo_mezzo: nuovaPrenotazione.value.tipo_mezzo,
    fornitore: nuovaPrenotazione.value.fornitore,
    costo: Number(nuovaPrenotazione.value.costo),
    dettagli: nuovaPrenotazione.value.dettagli || ""
  })

  // Aggiungiamo il campo prenotazione
  formData.append("prenotazione", prenotazioneJson)

  // Aggiungiamo il file se presente
  if (nuovaPrenotazione.value.file_biglietto) {
    formData.append("file_biglietto", nuovaPrenotazione.value.file_biglietto)
  }

  try {
    await axios.post(`${BASE_URL}/prenotazioni/`, formData, {
      headers: { "x-user-id": USER_ID, "Content-Type": "multipart/form-data" }
    })

    $q.notify({ type: 'positive', message: 'Prenotazione creata!' })
    loadPrenotazioni()

    // Reset del form
    nuovaPrenotazione.value = {
      id_dipendente: null,
      id_trasferta: null,
      tipo_mezzo: '',
      costo: 0,
      fornitore: '',
      dettagli: '',
      file_biglietto: null
    }
  } catch (err) {
    console.error("Errore creazione prenotazione", err)
    const msg = err.response?.data?.detail
      ? JSON.stringify(err.response.data.detail)
      : "Errore nella creazione prenotazione"
    $q.notify({ type: "negative", message: msg })
  }
}

// --- ON MOUNT ---
onMounted(async () => {
  await loadDipendenti()
  await loadTrasferte()
  await loadPrenotazioni()
})
</script>

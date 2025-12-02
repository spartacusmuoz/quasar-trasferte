<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md" style="max-width: 700px; margin:auto">
      <q-card-section>
        <div class="text-h6">Crea Nuova Prenotazione</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="creaPrenotazione">

          <!-- Dipendente -->
          <q-select
            filled
            label="Dipendente"
            :options="dipendentiOptions"
            v-model="selectedDipendenteId"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :loading="loadingDipendenti"
            required
          />

          <!-- Trasferta -->
          <q-select
            filled
            label="Trasferta"
            :options="trasferteOptions"
            v-model="prenotazione.id_trasferta"
            option-label="label"
            option-value="value"
            emit-value
            map-options
          />

          <!-- Tipo mezzo -->
          <q-input filled label="Tipo Mezzo" v-model="prenotazione.tipo_mezzo" />

          <!-- Costo -->
          <q-input filled type="number" label="Costo" v-model="prenotazione.costo" />

          <!-- Fornitore -->
          <q-input filled label="Fornitore" v-model="prenotazione.fornitore" />

          <!-- Dettagli -->
          <q-input filled type="textarea" label="Dettagli" v-model="prenotazione.dettagli" />

          <!-- Alloggio -->
          <q-input filled label="Città" v-model="prenotazione.citta" readonly />
          <q-select
            filled
            label="Tipo Alloggio"
            :options="['Hotel','Bed & Breakfast','Appartamento','Airbnb','Ostello','Altro']"
            v-model="prenotazione.tipo_alloggio"
          />
          <q-input filled label="Nome Struttura" v-model="prenotazione.nome_struttura" />
          <q-input filled type="number" label="Costo Alloggio" v-model="prenotazione.costo_alloggio" />
          <q-input filled label="Indirizzo" v-model="prenotazione.indirizzo" />

          <!-- Upload biglietto -->
          <q-uploader
            label="Biglietto"
            @added="onFileAdded"
            :hide-upload-btn="true"
          />

          <q-btn label="Crea Prenotazione" type="submit" color="primary" class="q-mt-md" />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Tabella Prenotazioni -->
    <q-card class="q-mt-lg">
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
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'
const ADMIN_ID = 6

// ====== State ======
const dipendentiOptions = ref([])
const trasferteOptions = ref([])
const prenotazioni = ref([])
const loadingDipendenti = ref(true)

const selectedDipendenteId = ref(null)

const prenotazione = ref({
  id_trasferta: null,
  tipo_mezzo: '',
  costo: 0,
  fornitore: '',
  dettagli: '',
  file_biglietto: null,
  tipo_alloggio: '',
  nome_struttura: '',
  costo_alloggio: 0,
  indirizzo: '',
  citta: ''
})

// ====== Colonne tabella ======
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome' },
  { name: 'trasferta', label: 'Trasferta', field: 'id_trasferta' },
  { name: 'tipo_mezzo', label: 'Tipo Mezzo', field: 'tipo_mezzo' },
  { name: 'fornitore', label: 'Fornitore', field: 'fornitore' },
  { name: 'costo', label: 'Costo Mezzo', field: 'costo' },
  { name: 'dettagli', label: 'Dettagli', field: 'dettagli' },
  { name: 'tipo_alloggio', label: 'Tipo Alloggio', field: 'tipo_alloggio' },
  { name: 'nome_struttura', label: 'Struttura', field: 'nome_struttura' },
  { name: 'costo_alloggio', label: 'Costo Alloggio', field: 'costo_alloggio' },
  { name: 'indirizzo', label: 'Indirizzo', field: 'indirizzo' },
  { name: 'citta', label: 'Città', field: 'citta' }
]

// ====== Caricamento dipendenti ======
const loadDipendenti = async () => {
  loadingDipendenti.value = true
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    dipendentiOptions.value = data.map(d => ({
      label: `${d.nome} ${d.cognome}`,
      value: d.id
    }))
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento dipendenti' })
  } finally {
    loadingDipendenti.value = false
  }
}

// ====== Caricamento trasferte per dipendente ======
const loadTrasferte = async () => {
  trasferteOptions.value = []
  prenotazione.value.id_trasferta = null
  if (!selectedDipendenteId.value) return

  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { 'x-user-id': selectedDipendenteId.value }
    })
    trasferteOptions.value = data.map(t => ({
      label: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`,
      value: t.id
    }))
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento trasferte' })
  }
}

// Watch sul dipendente selezionato
watch(selectedDipendenteId, loadTrasferte)

// ====== Upload file ======
const onFileAdded = (files) => {
  prenotazione.value.file_biglietto = files[0]
}

// ====== Creazione prenotazione ======
const creaPrenotazione = async () => {
  if (!selectedDipendenteId.value) {
    $q.notify({ type: 'warning', message: 'Seleziona un dipendente!' })
    return
  }

  const payload = {
    id_trasferta: prenotazione.value.id_trasferta,
    tipo_mezzo: prenotazione.value.tipo_mezzo,
    costo: Number(prenotazione.value.costo),
    fornitore: prenotazione.value.fornitore,
    dettagli: prenotazione.value.dettagli,
    tipo_alloggio: prenotazione.value.tipo_alloggio,
    nome_struttura: prenotazione.value.nome_struttura,
    costo_alloggio: Number(prenotazione.value.costo_alloggio),
    indirizzo: prenotazione.value.indirizzo,
    citta: prenotazione.value.citta
  }

  const formData = new FormData()
  formData.append('prenotazione', JSON.stringify(payload))
  if (prenotazione.value.file_biglietto)
    formData.append('file_biglietto', prenotazione.value.file_biglietto)

  try {
    await axios.post(`${BASE_URL}/prenotazioni/crea`, formData, {
      headers: {
        'x-user-id': selectedDipendenteId.value,
        'Content-Type': 'multipart/form-data'
      }
    })
    $q.notify({ type: 'positive', message: 'Prenotazione creata!' })
    loadPrenotazioni()

    // Reset form
    prenotazione.value = {
      id_trasferta: null,
      tipo_mezzo: '',
      costo: 0,
      fornitore: '',
      dettagli: '',
      file_biglietto: null,
      tipo_alloggio: '',
      nome_struttura: '',
      costo_alloggio: 0,
      indirizzo: '',
      citta: ''
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore nella creazione prenotazione' })
  }
}

// ====== Caricamento prenotazioni ======
const loadPrenotazioni = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/prenotazioni/`, {
      headers: { 'x-user-id': ADMIN_ID }
    })
    prenotazioni.value = data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento prenotazioni' })
  }
}

// ====== onMounted ======
onMounted(async () => {
  await loadDipendenti()
  loadPrenotazioni()
})
</script>

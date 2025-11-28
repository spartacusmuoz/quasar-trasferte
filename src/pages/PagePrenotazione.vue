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
            :options="dipendentiOptions"
            v-model="selectedUserId"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            @update:model-value="onUserSelected"
            required
          />

          <!-- Trasferta -->
          <q-select
            filled
            label="Trasferta"
            :options="trasferteOptions"
            v-model="nuovaPrenotazione.id_trasferta"
            option-label="label"
            option-value="value"
            emit-value
            map-options
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

          <!-- ⭐ NUOVI CAMPI ALLOGGIO -->
          <q-select
            filled
            label="Tipo Alloggio"
            :options="['Hotel','Bed & Breakfast','Appartamento','Airbnb','Ostello','Altro']"
            v-model="nuovaPrenotazione.tipo_alloggio"
          />

          <q-input filled label="Nome Struttura" v-model="nuovaPrenotazione.nome_struttura" />

          <q-input filled type="number" label="Costo Alloggio" v-model="nuovaPrenotazione.costo_alloggio" />

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
const ADMIN_ID = 6

// DATI
const dipendentiOptions = ref([])
const trasferteOptions = ref([])
const prenotazioni = ref([])

const selectedUserId = ref(null)

const nuovaPrenotazione = ref({
  id_trasferta: null,
  tipo_mezzo: '',
  costo: 0,
  fornitore: '',
  dettagli: '',
  file_biglietto: null,

  // ⭐ NUOVI CAMPI ALLOGGIO
  tipo_alloggio: '',
  nome_struttura: '',
  costo_alloggio: 0
})

// COLONNE TABELLA
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome' },
  { name: 'trasferta', label: 'Trasferta', field: 'id_trasferta' },
  { name: 'tipo_mezzo', label: 'Tipo Mezzo', field: 'tipo_mezzo' },
  { name: 'fornitore', label: 'Fornitore', field: 'fornitore' },
  { name: 'costo', label: 'Costo Mezzo', field: 'costo' },
  { name: 'dettagli', label: 'Dettagli', field: 'dettagli' },

  // ⭐ NUOVI CAMPI
  { name: 'tipo_alloggio', label: 'Tipo Alloggio', field: 'tipo_alloggio' },
  { name: 'nome_struttura', label: 'Struttura', field: 'nome_struttura' },
  { name: 'costo_alloggio', label: 'Costo Alloggio', field: 'costo_alloggio' }
]

// CARICAMENTO DIPENDENTI
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    dipendentiOptions.value = data.map(d => ({ label: `${d.nome} ${d.cognome}`, value: d.id }))
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
  }
}

const onUserSelected = async (userId) => {
  nuovaPrenotazione.value.id_trasferta = null
  trasferteOptions.value = []

  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { 'x-user-id': userId }
    })

    trasferteOptions.value = data.map(t => ({
      label: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`,
      value: t.id
    }))
  } catch (err) {
    console.error('Errore caricamento trasferte', err)
  }
}

// GET TUTTE LE PRENOTAZIONI
const loadPrenotazioni = async () => {
  try {
    const { data: prenData } = await axios.get(`${BASE_URL}/prenotazioni/`, {
      headers: { 'x-user-id': ADMIN_ID }
    })

    const { data: trasferteData } = await axios.get(`${BASE_URL}/trasferte/`, {
      headers: { 'x-user-id': ADMIN_ID }
    })

    const trasfMap = {}
    trasferteData.forEach(t => {
      const dip = dipendentiOptions.value.find(d => d.value === t.id_dipendente)
      trasfMap[t.id] = dip ? dip.label : 'Sconosciuto'
    })

    // ⭐ Ora includiamo i campi aggiuntivi senza modificare la logica
    prenotazioni.value = prenData.map(p => ({
      ...p,
      dipendente_nome: trasfMap[p.id_trasferta] || 'Sconosciuto'
    }))

  } catch (err) {
    console.error('Errore caricamento prenotazioni', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento prenotazioni' })
  }
}

// CREAZIONE PRENOTAZIONE
const onFileAdded = (files) => {
  nuovaPrenotazione.value.file_biglietto = files[0]
}

const creaPrenotazione = async () => {
  if (!selectedUserId.value || !nuovaPrenotazione.value.id_trasferta) {
    $q.notify({ type: 'negative', message: 'Seleziona dipendente e trasferta valide!' })
    return
  }

  const formData = new FormData()

  formData.append("prenotazione", JSON.stringify({
    id_trasferta: nuovaPrenotazione.value.id_trasferta,
    tipo_mezzo: nuovaPrenotazione.value.tipo_mezzo,
    fornitore: nuovaPrenotazione.value.fornitore,
    costo: Number(nuovaPrenotazione.value.costo),
    dettagli: nuovaPrenotazione.value.dettagli || "",

    // ⭐ NUOVI CAMPI
    tipo_alloggio: nuovaPrenotazione.value.tipo_alloggio || "",
    nome_struttura: nuovaPrenotazione.value.nome_struttura || "",
    costo_alloggio: Number(nuovaPrenotazione.value.costo_alloggio) || 0
  }))

  if (nuovaPrenotazione.value.file_biglietto)
    formData.append("file_biglietto", nuovaPrenotazione.value.file_biglietto)

  try {
    await axios.post(`${BASE_URL}/prenotazioni/crea`, formData, {
      headers: {
        "x-user-id": selectedUserId.value,
        "Content-Type": "multipart/form-data"
      }
    })

    $q.notify({ type: 'positive', message: 'Prenotazione creata!' })
    loadPrenotazioni()

    nuovaPrenotazione.value = {
      id_trasferta: null,
      tipo_mezzo: '',
      costo: 0,
      fornitore: '',
      dettagli: '',
      file_biglietto: null,
      tipo_alloggio: '',
      nome_struttura: '',
      costo_alloggio: 0
    }

  } catch (err) {
    console.error("Errore creazione prenotazione", err)
    $q.notify({ type: "negative", message: "Errore nella creazione prenotazione" })
  }
}

onMounted(async () => {
  await loadDipendenti()
  loadPrenotazioni()
})
</script>

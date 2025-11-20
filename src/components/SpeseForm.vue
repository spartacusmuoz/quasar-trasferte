<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md" style="max-width: 600px; margin:auto">
      <q-card-section>
        <div class="text-h6">Nuova Spesa</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submitSpesa">

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

          <!-- Categoria -->
          <q-input filled v-model="categoria" label="Categoria" required />

          <!-- Importo -->
          <q-input
            filled
            v-model.number="importo"
            label="Importo"
            type="number"
            required
          />

          <!-- Tipo Scontrino -->
          <q-select
            filled
            v-model="tipo_scontrino"
            :options="tipiScontrino"
            label="Tipo Scontrino"
            emit-value
            map-options
            required
          />

          <!-- Data -->
          <q-input
            filled
            v-model="data_spesa"
            label="Data Spesa"
            type="date"
            required
          />

          <!-- File uploader -->
          <q-uploader
            label="Allega file"
            multiple
            ref="uploader"
            hide-upload-btn
            accept="image/*,.pdf"
            style="margin-top: 10px"
          />

          <div class="q-mt-md">
            <q-btn label="Invia Spesa" color="primary" type="submit" />
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
const categoria = ref('')
const importo = ref(null)
const tipo_scontrino = ref('')
const data_spesa = ref(new Date().toISOString().split('T')[0])
const selectedDipendenteId = ref(null)
const dipendentiOptions = ref([])
const uploader = ref(null)
const loadingDipendenti = ref(true)

const tipiScontrino = [
  { label: 'Aereo', value: 'aereo' },
  { label: 'Treno', value: 'treno' },
  { label: 'Taxi', value: 'taxi' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Ristorante', value: 'ristorante' },
  { label: 'Altro', value: 'altro' }
]

// =======================
// Carica lista dipendenti
// =======================
const loadDipendenti = async () => {
  loadingDipendenti.value = true
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    console.log('Dipendenti ricevuti:', data)

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
// Submit spesa
// =======================
const submitSpesa = async () => {
  if (!selectedDipendenteId.value) {
    $q.notify({ type: 'warning', message: 'Seleziona un dipendente!' })
    return
  }

  const formData = new FormData()
  formData.append('id_dipendente', selectedDipendenteId.value)
  formData.append('categoria', categoria.value)
  formData.append('importo', importo.value)
  formData.append('tipo_scontrino', tipo_scontrino.value)
  formData.append('data_spesa', data_spesa.value)

  const files = uploader.value?.files || []
  files.forEach(f => formData.append('files', f))

  try {
    const res = await axios.post(`${BASE_URL}/spese/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    $q.notify({ type: 'positive', message: 'Spesa caricata!' })
    console.log('Spesa caricata:', res.data)

    // Reset form
    categoria.value = ''
    importo.value = null
    tipo_scontrino.value = ''
    data_spesa.value = new Date().toISOString().split('T')[0]
    selectedDipendenteId.value = null
    uploader.value?.reset()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore durante il caricamento della spesa' })
  }
}
</script>

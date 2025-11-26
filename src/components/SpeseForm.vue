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
            v-model="selectedUserId"
            :options="dipendentiOptions"
            label="Dipendente"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :loading="loadingDipendenti"
            @update:model-value="onUserSelected"
            required
          />

          <!-- Select Trasferta -->
          <q-select
            filled
            v-if="trasferteOptions.length > 0"
            v-model="selectedTrasfertaId"
            :options="trasferteOptions"
            label="Trasferta"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :loading="loadingTrasferte"
            required
          />

          <!-- Categoria -->
          <q-input filled v-model="categoria" label="Categoria" required />

          <!-- Importo -->
          <q-input filled v-model.number="importo" label="Importo" type="number" required />

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
          <q-input filled v-model="data_spesa" label="Data Spesa" type="date" required />

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
const selectedUserId = ref(null)
const selectedTrasfertaId = ref(null)
const categoria = ref('')
const importo = ref(null)
const tipo_scontrino = ref('')
const data_spesa = ref(new Date().toISOString().split('T')[0])
const uploader = ref(null)

const dipendentiOptions = ref([])
const trasferteOptions = ref([])
const loadingDipendenti = ref(true)
const loadingTrasferte = ref(false)

const tipiScontrino = [
  { label: 'Aereo', value: 'aereo' },
  { label: 'Treno', value: 'treno' },
  { label: 'Taxi', value: 'taxi' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Ristorante', value: 'ristorante' },
  { label: 'Altro', value: 'altro' }
]

// Carica lista dipendenti
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

// Quando l’utente è selezionato
const onUserSelected = async (userId) => {
  selectedTrasfertaId.value = null
  trasferteOptions.value = []
  loadingTrasferte.value = true
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { 'x-user-id': userId }
    })
    trasferteOptions.value = data.map(t => ({
      label: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`,
      value: t.id
    }))
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento trasferte' })
  } finally {
    loadingTrasferte.value = false
  }
}

onMounted(loadDipendenti)

const submitSpesa = async () => {
  if (!selectedUserId.value || !selectedTrasfertaId.value) {
    $q.notify({ type: 'warning', message: 'Seleziona dipendente e trasferta!' })
    return
  }

  const formData = new FormData()
  formData.append('id_trasferta', selectedTrasfertaId.value)
  formData.append('categoria', categoria.value)
  formData.append('importo', importo.value)
  formData.append('tipo_scontrino', tipo_scontrino.value)
  formData.append('data_spesa', data_spesa.value)

  const files = uploader.value?.files || []
  files.forEach(f => formData.append('files', f))

  try {
    await axios.post(`${BASE_URL}/spese/`, formData, {
      headers: { 'x-user-id': selectedUserId.value }
    })

    $q.notify({ type: 'positive', message: 'Spesa caricata!' })

    // Reset form
    selectedTrasfertaId.value = null
    categoria.value = ''
    importo.value = null
    tipo_scontrino.value = ''
    data_spesa.value = new Date().toISOString().split('T')[0]
    uploader.value?.reset()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore durante il caricamento della spesa' })
  }
}

</script>

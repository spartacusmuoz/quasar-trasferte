<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md" style="max-width: 600px; margin:auto">
      <q-card-section>
        <div class="text-h6">Nuova Spesa</div>
      </q-card-section>

```
  <q-card-section>
    <q-form @submit.prevent="submitSpesa">

      <!-- Select Dipendente (placeholder finché non c'è login) -->
      <q-select
        filled
        v-model="selectedDipendenteId"
        :options="dipendentiOptions"
        label="Dipendente"
        emit-value
        map-options
        required
      />

      <!-- Select Trasferta dell'utente -->
      <q-select
        filled
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
```

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'

// ===== Dipendente placeholder =====
const selectedDipendenteId = ref(1)
const dipendentiOptions = ref([{ label: 'Utente Test', value: 1 }])

// ===== Trasferte utente =====
const selectedTrasfertaId = ref(null)
const trasferteOptions = ref([])
const loadingTrasferte = ref(true)

// ===== Form fields =====
const categoria = ref('')
const importo = ref(null)
const tipo_scontrino = ref('')
const data_spesa = ref(new Date().toISOString().split('T')[0])
const uploader = ref(null)

const tipiScontrino = [
  { label: 'Aereo', value: 'aereo' },
  { label: 'Treno', value: 'treno' },
  { label: 'Taxi', value: 'taxi' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Ristorante', value: 'ristorante' },
  { label: 'Altro', value: 'altro' }
]

// =======================
// Carica trasferte dell'utente
// =======================
const loadTrasferte = async () => {
  loadingTrasferte.value = true
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { 'x-user-id': selectedDipendenteId.value }
    })
    trasferteOptions.value = data.map(t => ({
      label: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`,
      value: t.id
    }))
  } catch (err) {
    console.error('Errore caricamento trasferte:', err)
    $q.notify({ type: 'negative', message: 'Impossibile caricare le trasferte' })
  } finally {
    loadingTrasferte.value = false
  }
}

onMounted(loadTrasferte)

// =======================
// Submit spesa
// =======================
const submitSpesa = async () => {
  if (!selectedTrasfertaId.value) {
    $q.notify({ type: 'warning', message: 'Seleziona una trasferta!' })
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
      headers: { 'x-user-id': selectedDipendenteId.value }
    })
    $q.notify({ type: 'positive', message: 'Spesa caricata!' })

    // Reset form
    categoria.value = ''
    importo.value = null
    tipo_scontrino.value = ''
    data_spesa.value = new Date().toISOString().split('T')[0]
    selectedTrasfertaId.value = null
    uploader.value?.reset()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore durante il caricamento della spesa' })
  }
}
</script>

<template>
  <q-page class="q-pa-md">

    <!-- SELEZIONE DIPENDENTE -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Seleziona Dipendente</div>

        <q-select
          v-model="selectedDipendente"
          :options="dipendentiOptions"
          option-value="id"
          option-label="nomeCompleto"
          label="Dipendente"
          filled
          @update:model-value="loadPrenotazioni"
        />
      </q-card-section>
    </q-card>

    <!-- TABELLA PRENOTAZIONI -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Prenotazioni di {{ selectedDipendente?.nomeCompleto || '—' }}</div>
      </q-card-section>

      <q-table
        :rows="prenotazioni"
        :columns="columns"
        row-key="id"
        flat
        bordered
      >
        <template v-slot:body-cell-file="{ row }">
          <q-btn
            flat
            color="primary"
            label="Visualizza"
            :disable="!row.file_biglietto"
            @click="visualizzaFile(row.id)"
          />
        </template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = "http://127.0.0.1:8000"

// --- DATI ---
const dipendentiOptions = ref([])
const selectedDipendente = ref(null)
const prenotazioni = ref([])

// --- COLONNE TABELLA ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'trasferta', label: 'Trasferta', field: 'trasferta_info' },
  { name: 'tipo_mezzo', label: 'Tipo Mezzo', field: 'tipo_mezzo' },
  { name: 'fornitore', label: 'Fornitore', field: 'fornitore' },
  { name: 'costo', label: 'Costo', field: 'costo' },
  { name: 'dettagli', label: 'Dettagli', field: 'dettagli' },
  { name: 'file', label: 'File', field: 'file_biglietto' }
]


// ===============================
// LOAD DIPENDENTI (Admin)
// ===============================
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    dipendentiOptions.value = data.map(d => ({
      ...d,
      nomeCompleto: `${d.nome} ${d.cognome}`
    }))
  } catch (err) {
    console.error("Errore caricamento dipendenti", err)
    $q.notify({ type: "negative", message: "Errore caricamento dipendenti" })
  }
}


// ===============================
// LOAD PRENOTAZIONI DEL DIPENDENTE
// ===============================
const loadPrenotazioni = async () => {
  if (!selectedDipendente.value) return

  try {
    const { data: prenData } = await axios.get(`${BASE_URL}/prenotazioni/mie`, {
      headers: { "x-user-id": selectedDipendente.value.id }
    })

    const { data: trasferteData } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { "x-user-id": selectedDipendente.value.id }
    })

    const trasfMap = {}
    trasferteData.forEach(t => {
      trasfMap[t.id] = `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`
    })

    prenotazioni.value = prenData.map(p => ({
      ...p,
      trasferta_info: trasfMap[p.id_trasferta] || "Non disponibile"
    }))

  } catch (err) {
    console.error("Errore caricamento prenotazioni", err)
    $q.notify({ type: "negative", message: "Errore caricamento prenotazioni" })
  }
}


// ===============================
// VISUALIZZA FILE
// ===============================
const visualizzaFile = async (prenotazioneId) => {
  try {
    const response = await axios.get(`${BASE_URL}/prenotazioni/file/${prenotazioneId}`, {
      headers: { 'x-user-id': selectedDipendente.value.id },
      responseType: 'blob'
    })

    const mime = response.headers["content-type"] || "application/octet-stream"
    const blob = new Blob([response.data], { type: mime })
    const url = window.URL.createObjectURL(blob)

    window.open(url, "_blank")

  } catch (err) {
    console.error("Errore apertura file", err)
    $q.notify({ type: "negative", message: "Errore caricamento file." })
  }
}


// ===============================
// ON MOUNT
// ===============================
onMounted(() => {
  loadDipendenti()
})
</script>

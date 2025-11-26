<template>
  <q-page class="q-pa-md">

    <!-- FILTRO DIPENDENTE -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Filtra per Dipendente</div>
        <q-select
          filled
          label="Dipendente"
          :options="dipendentiOptions"
          v-model="selectedDipendenteId"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          @update:model-value="filterSpese"
        />
      </q-card-section>
    </q-card>

    <!-- TABELLA SPESE -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Elenco Spese</div>
      </q-card-section>

      <q-table
        :rows="speseFiltrate"
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
            :disable="!row.file_id"
            @click="visualizzaFile(row.file_id, row.dipendente_id)"
          />
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG PER VISUALIZZARE IMMAGINI -->
    <q-dialog v-model="dialogOpen">
      <q-card>
        <q-card-section class="row justify-center">
          <img :src="dialogUrl" style="max-width:100%; max-height:80vh" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Chiudi" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'
const ADMIN_ID = 6 // Admin ID per usare le API protette

// --- DATI ---
const dipendentiOptions = ref([])
const spese = ref([])
const speseFiltrate = ref([])
const selectedDipendenteId = ref(null)

// --- DIALOG IMMAGINE ---
const dialogOpen = ref(false)
const dialogUrl = ref("")

// --- COLONNE TABELLA ---
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome' },
  { name: 'trasferta', label: 'Trasferta', field: 'trasferta_info' },
  { name: 'categoria', label: 'Categoria', field: 'categoria' },
  { name: 'importo', label: 'Importo', field: 'importo', sortable: true },
  { name: 'data', label: 'Data', field: 'data_spesa' },
  { name: 'file', label: 'File', field: 'file_id' }
]

// --- CARICAMENTO DIPENDENTI ---
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/utenti`, {
      headers: { 'x-user-id': ADMIN_ID }
    })
    dipendentiOptions.value = data
      .filter(u => u.ruolo === 'dipendente')
      .map(d => ({ label: `${d.nome} ${d.cognome}`, value: d.id }))
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento dipendenti' })
  }
}

// --- CARICAMENTO SPESE ---
const loadSpese = async () => {
  try {
    const { data: speseData } = await axios.get(`${BASE_URL}/spese/`, {
      headers: { 'x-user-id': ADMIN_ID }
    })

    // Carica trasferte per mappare id_trasferta -> dipendente
    const { data: trasferteData } = await axios.get(`${BASE_URL}/trasferte/`, {
      headers: { 'x-user-id': ADMIN_ID }
    })

    const trasfMap = {}
    trasferteData.forEach(t => {
      trasfMap[t.id] = {
        dipendente_id: t.id_dipendente,
        dipendente_nome: dipendentiOptions.value.find(d => d.value === t.id_dipendente)?.label || 'Sconosciuto',
        info: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`
      }
    })

    // Associa dipendente e info trasferta
    spese.value = speseData.map(s => ({
      ...s,
      dipendente_id: trasfMap[s.id_trasferta]?.dipendente_id || null,
      dipendente_nome: trasfMap[s.id_trasferta]?.dipendente_nome || 'Sconosciuto',
      trasferta_info: trasfMap[s.id_trasferta]?.info || 'Non disponibile',
      file_id: s.files && s.files.length > 0 ? s.files[0].id : null
    }))

    speseFiltrate.value = spese.value
  } catch (err) {
    console.error('Errore caricamento spese', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento spese' })
  }
}

// --- FILTRO SPESE ---
const filterSpese = () => {
  if (!selectedDipendenteId.value) {
    speseFiltrate.value = spese.value
  } else {
    speseFiltrate.value = spese.value.filter(s => s.dipendente_id === selectedDipendenteId.value)
  }
}

// --- VISUALIZZA FILE ---
const visualizzaFile = async (fileId, dipendenteId) => {
  if (!fileId) {
    $q.notify({ type: 'warning', message: 'File non disponibile' })
    return
  }

  try {
    const response = await axios.get(`${BASE_URL}/spese/file/${fileId}`, {
      headers: { 'x-user-id': dipendenteId },
      responseType: 'blob'
    })

    const mime = response.headers["content-type"] || "application/octet-stream"
    const blob = new Blob([response.data], { type: mime })
    const url = window.URL.createObjectURL(blob)

    // Se è un’immagine → mostra in dialog
    if (mime.includes("jpeg") || mime.includes("jpg") || mime.includes("png")) {
      dialogUrl.value = url
      dialogOpen.value = true
      return
    }

    // PDF → download
    if (mime.includes("pdf")) {
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `spesa_${fileId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      return
    }

    // Altri file → download generico
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `spesa_${fileId}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Errore caricamento file', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento file.' })
  }
}

// --- ON MOUNT ---
onMounted(async () => {
  await loadDipendenti()
  await loadSpese()
})
</script>

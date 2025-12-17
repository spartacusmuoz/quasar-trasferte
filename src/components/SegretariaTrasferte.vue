<template>
  <q-page class="q-pa-md">

    <q-card flat bordered class="shadow-2 rounded-borders">

      <q-card-section>
        <div class="text-h6">Richieste di Trasferta</div>
      </q-card-section>

      <q-table
        :rows="trasferte"
        :columns="columns"
        row-key="id"
        flat
        bordered
        dense
        row-hover
        v-model:pagination="pagination"
      >
        <template v-slot:body-cell-stato="props">
          <q-td :props="props">
            <q-badge
              :color="getStatoColor(props.row.stato)"
              align="top"
              label="props.row.stato"
              outline
            >
              {{ props.row.stato }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-azioni="props">
          <q-td class="q-gutter-sm">

            <!-- APRI MAPPA -->
            <q-btn
              color="primary"
              dense
              round
              icon="map"
              @click="$router.push({ name: 'hotel-mappa', params: { idTrasferta: props.row.id } })"
              title="Apri mappa"
            />

            <!-- MODIFICA -->
            <q-btn
              color="warning"
              dense
              round
              icon="edit"
              @click="apriDialog(props.row)"
              title="Modifica Trasferta"
            />

            <!-- ACCETTA -->
            <q-btn
              color="positive"
              dense
              round
              icon="check"
              @click="approva(props.row)"
              title="Approva Trasferta"
            />

            <!-- RIFIUTA -->
            <q-btn
              color="negative"
              dense
              round
              icon="close"
              @click="rifiuta(props.row)"
              title="Rifiuta Trasferta"
            />

          </q-td>
        </template>

      </q-table>
    </q-card>

    <!-- DIALOG MODIFICA -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 420px; max-width: 600px">
        <q-card-section class="text-h6">
          Modifica Trasferta
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editForm.luogo_destinazione"
            label="Destinazione"
            outlined
            dense
            autofocus
          />
          <q-input
            v-model="editForm.data_partenza"
            type="date"
            label="Data Partenza"
            outlined
            dense
          />
          <q-input
            v-model="editForm.data_rientro"
            type="date"
            label="Data Rientro"
            outlined
            dense
          />
          <q-input
            v-model="editForm.note_segreteria"
            type="textarea"
            label="Note Segreteria"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" v-close-popup />
          <q-btn color="primary" label="Salva" @click="salvaModifica" />
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

const USER_ID = localStorage.getItem('user_id') ?? 6
const headers = {
  'x-user-id': USER_ID,
  'Content-Type': 'application/json'
}

// STATE
const trasferte = ref([])
const dipendenti = ref([])
const dialogOpen = ref(false)
const trasfertaSelezionata = ref(null)
const editForm = ref({
  luogo_destinazione: '',
  data_partenza: '',
  data_rientro: '',
  note_segreteria: ''
})
const pagination = ref({ page: 1, rowsPerPage: 10 })

// COLUMNS
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome', sortable: true },
  { name: 'data_partenza', label: 'Partenza', field: 'data_partenza', sortable: true },
  { name: 'data_rientro', label: 'Rientro', field: 'data_rientro', sortable: true },
  { name: 'luogo_destinazione', label: 'Destinazione', field: 'luogo_destinazione' },
  { name: 'stato', label: 'Stato', field: 'stato' },
  { name: 'azioni', label: 'Azioni' }
]

// FUNCTIONS
const getStatoColor = (stato) => {
  switch(stato.toLowerCase()) {
    case 'approvata': return 'positive'
    case 'rifiutata': return 'negative'
    case 'in attesa': return 'warning'
    default: return 'grey'
  }
}

// CARICAMENTO DIPENDENTI
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`, { headers })
    dipendenti.value = data
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento dipendenti' })
  }
}

// CARICAMENTO TRASFERTE
const loadTrasferte = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte`, { headers })
    trasferte.value = data.map(t => {
      const dip = dipendenti.value.find(d => d.id === t.id_dipendente)
      return { ...t, dipendente_nome: dip ? `${dip.nome} ${dip.cognome}` : 'Sconosciuto' }
    })
  } catch (err) {
    console.error('Errore caricamento trasferte', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento trasferte' })
  }
}

onMounted(async () => {
  await loadDipendenti()
  await loadTrasferte()
})

// MODIFICA
const apriDialog = (row) => {
  trasfertaSelezionata.value = row
  editForm.value = {
    luogo_destinazione: row.luogo_destinazione,
    data_partenza: row.data_partenza,
    data_rientro: row.data_rientro,
    note_segreteria: row.note_segreteria
  }
  dialogOpen.value = true
}

const salvaModifica = async () => {
  try {
    await axios.patch(
      `${BASE_URL}/trasferte/${trasfertaSelezionata.value.id}`,
      editForm.value,
      { headers }
    )
    $q.notify({ type: 'positive', message: 'Trasferta aggiornata' })
    dialogOpen.value = false
    loadTrasferte()
  } catch (err) {
    console.error('Errore aggiornamento', err)
    $q.notify({ type: 'negative', message: 'Errore aggiornamento' })
  }
}

// STATO
const approva = async (row) => {
  try {
    await axios.patch(`${BASE_URL}/trasferte/${row.id}/stato`, { stato: 'approvata' }, { headers })
    $q.notify({ type: 'positive', message: 'Trasferta approvata!' })
    loadTrasferte()
  } catch (err) {
    console.error('Errore approvazione', err)
    $q.notify({ type: 'negative', message: 'Errore approvazione' })
  }
}

const rifiuta = async (row) => {
  try {
    await axios.patch(`${BASE_URL}/trasferte/${row.id}/stato`, { stato: 'rifiutata' }, { headers })
    $q.notify({ type: 'negative', message: 'Trasferta rifiutata!' })
    loadTrasferte()
  } catch (err) {
    console.error('Errore rifiuto', err)
    $q.notify({ type: 'negative', message: 'Errore rifiuto' })
  }
}
</script>

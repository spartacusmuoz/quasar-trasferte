<template>
  <q-page class="q-pa-md">

    <!-- CREAZIONE PRENOTAZIONE -->
    <q-card class="q-mb-md shadow-2" style="max-width: 700px; margin:auto">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="add_circle" class="q-mr-sm" />
          Crea Nuova Prenotazione
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="creaPrenotazione">
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
            class="q-mb-md"
          />

          <q-select
            filled
            label="Trasferta"
            :options="trasferteOptions"
            v-model="prenotazione.id_trasferta"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-separator class="q-my-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="directions_car" class="q-mr-sm" />
            Trasporto
          </div>

          <q-select
  filled
  label="Tipo Mezzo"
  v-model="prenotazione.tipo_mezzo"
  :options="tipoMezzoOptions"
  emit-value
  map-options
  class="q-mb-md"
  required
/>

          <q-input filled type="number" label="Costo" v-model="prenotazione.costo" class="q-mb-md" />
          <q-input filled label="Fornitore" v-model="prenotazione.fornitore" class="q-mb-md" />
          <q-input filled type="textarea" label="Dettagli" v-model="prenotazione.dettagli" class="q-mb-md" />

          <q-separator class="q-my-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="hotel" class="q-mr-sm" />
            Alloggio
          </div>

          <q-input filled label="Città" v-model="prenotazione.citta" readonly class="q-mb-md" />
          <q-select
            filled
            label="Tipo Alloggio"
            :options="['Hotel','Bed & Breakfast','Appartamento','Airbnb','Ostello','Altro']"
            v-model="prenotazione.tipo_alloggio"
            class="q-mb-md"
          />
          <q-input filled label="Nome Struttura" v-model="prenotazione.nome_struttura" class="q-mb-md" />
          <q-input filled type="number" label="Costo Alloggio" v-model="prenotazione.costo_alloggio" class="q-mb-md" />
          <q-input filled label="Indirizzo" v-model="prenotazione.indirizzo" class="q-mb-md" />

          <q-separator class="q-my-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="description" class="q-mr-sm" />
            Documenti
          </div>

          <q-uploader
            label="Biglietto"
            @added="onFileAdded"
            :hide-upload-btn="true"
            class="q-mb-md"
          />

          <q-btn label="Crea Prenotazione" type="submit" color="primary" size="lg" class="full-width" />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- TABELLA PRENOTAZIONI -->
    <q-card class="q-mt-lg shadow-2">
      <q-card-section class="bg-grey-2">
        <div class="text-h6">
          <q-icon name="list" class="q-mr-sm" />
          Elenco Prenotazioni
        </div>
      </q-card-section>

      <q-table
        :rows="prenotazioni"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :rows-per-page-options="[10, 25, 50]"
      >
        <template #body-cell-dettagli="props">
          <q-td align="center">
            <q-btn 
              flat 
              dense 
              color="primary" 
              icon="visibility" 
              @click="apriDialogPrenotazione(props.row)"
            >
              <q-tooltip>Visualizza Dettagli</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG DETTAGLI -->
    <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card v-if="prenotazioneSelezionata">
        <q-bar class="bg-primary text-white">
          <q-icon name="event" size="md" />
          <div class="text-h6 q-ml-sm">Prenotazione #{{ prenotazioneSelezionata.id }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-bar>

        <q-card-section style="max-height:80vh; overflow-y:auto">
          
          <!-- INFORMAZIONI GENERALI -->
          <q-card flat bordered class="q-mb-md bg-grey-1">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="person" size="32px" color="accent" />
                <div class="text-h6">Informazioni Generali</div>
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Dipendente</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.dipendente_nome || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Città</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.citta || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Trasporto -->
          <q-card flat bordered class="q-mb-md" v-if="prenotazioneSelezionata.tipo_mezzo">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon :name="iconForTrasporto(prenotazioneSelezionata.tipo_mezzo)" size="32px" color="primary" />
                <div class="text-h6">Trasporto</div>
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Tipo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.tipo_mezzo || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fornitore</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.fornitore || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Costo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.costo ?? 0 }} €</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Dettagli</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.dettagli || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Alloggio -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon :name="iconForAlloggio(prenotazioneSelezionata.tipo_alloggio)" size="32px" color="secondary" />
                <div class="text-h6">Alloggio</div>
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Tipo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.tipo_alloggio || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Struttura</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.nome_struttura || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Indirizzo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.indirizzo || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Costo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.costo_alloggio ?? 0 }} €</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Date -->
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="calendar_today" size="32px" color="accent" />
                <div class="text-h6">Date</div>
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Check-in</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.chk_in || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Check-out</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.chk_out || '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            color="primary"
            label="Visualizza File"
            icon="description"
            :disable="!prenotazioneSelezionata.file_biglietto"
            @click="visualizzaFile(prenotazioneSelezionata)"
          />
          <q-btn color="negative" label="Chiudi" icon="close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
const trasferteAll = ref([])
const prenotazioni = ref([])
const loadingDipendenti = ref(true)
const selectedDipendenteId = ref(null)
const showDialog = ref(false)
const prenotazioneSelezionata = ref(null)
const tipoMezzoOptions = [
  { label: 'Aereo', value: 'aereo' },
  { label: 'Treno', value: 'treno' },
  { label: 'Auto',  value: 'auto'  },
  { label: 'Altro', value: 'altro' }
]

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

// ====== Funzioni per le icone ======
const iconForTrasporto = tipo => {
  if (!tipo) return 'help_outline'
  const t = tipo.toLowerCase()
  if (t.includes('aereo') || t.includes('flight')) return 'flight'
  if (t.includes('treno') || t.includes('train')) return 'train'
  if (t.includes('taxi') || t.includes('auto') || t.includes('car')) return 'directions_car'
  if (t.includes('bus')) return 'directions_bus'
  return 'commute'
}

const iconForAlloggio = tipo => {
  if (!tipo) return 'house'
  const t = tipo.toLowerCase()
  if (t.includes('hotel')) return 'hotel'
  if (t.includes('bed') || t.includes('breakfast')) return 'holiday_village'
  if (t.includes('appartamento')) return 'apartment'
  if (t.includes('airbnb')) return 'home_work'
  if (t.includes('ostello')) return 'groups'
  return 'house'
}

// ====== Colonne tabella ======
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'center' },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome', align: 'left' },
  { name: 'citta', label: 'Città', field: 'citta', align: 'left' },
  { name: 'tipo_mezzo', label: 'Tipo Mezzo', field: 'tipo_mezzo', align: 'left' },
  { name: 'tipo_alloggio', label: 'Tipo Alloggio', field: 'tipo_alloggio', align: 'left' },
  { name: 'nome_struttura', label: 'Struttura', field: 'nome_struttura', align: 'left' },
  { name: 'chk_in', label: 'Check-In', field: 'chk_in', sortable: true, align: 'center' },
  { name: 'chk_out', label: 'Check-Out', field: 'chk_out', sortable: true, align: 'center' },
  { name: 'dettagli', label: 'Azioni', field: 'dettagli', align: 'center' }
]

const apriDialogPrenotazione = (pren) => {
  prenotazioneSelezionata.value = pren
  showDialog.value = true
}

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

// ====== Caricamento trasferte per selezione dipendente ======
const loadTrasferte = async () => {
  trasferteOptions.value = []
  prenotazione.value.id_trasferta = null
  prenotazione.value.citta = ''
  if (!selectedDipendenteId.value) return

  trasferteOptions.value = trasferteAll.value
    .filter(t => t.id_dipendente === selectedDipendenteId.value)
    .map(t => ({
      label: `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`,
      value: t.id,
      id_dipendente: t.id_dipendente,
      luogo_destinazione: t.luogo_destinazione
    }))
}

// ====== Caricamento tutte le trasferte ======
const loadTrasferteAll = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte`, {
      headers: { 'x-user-id': ADMIN_ID }
    })
    trasferteAll.value = data.map(t => ({
      id: t.id,
      id_dipendente: t.id_dipendente,
      luogo_destinazione: t.luogo_destinazione,
      data_partenza: t.data_partenza,
      data_rientro: t.data_rientro
    }))
  } catch (err) {
    console.error('Errore caricamento trasferte', err)
  }
}

watch(selectedDipendenteId, loadTrasferte)

watch(() => prenotazione.value.id_trasferta, (newVal) => {
  if (newVal) {
    const trasferta = trasferteAll.value.find(t => t.id === newVal)
    if (trasferta) {
      prenotazione.value.citta = trasferta.luogo_destinazione
    }
  }
})

// ====== Upload file ======
const onFileAdded = (files) => {
  prenotazione.value.file_biglietto = files[0]
}

// ====== Creazione prenotazione ======
const creaPrenotazione = async () => {
  if (!prenotazione.value.id_trasferta) {
    $q.notify({ type: 'warning', message: 'Seleziona una trasferta!' })
    return
  }

  const trasferta = trasferteAll.value.find(t => t.id === prenotazione.value.id_trasferta)

  const payload = {
    id_trasferta: prenotazione.value.id_trasferta,
    id_dipendente: trasferta ? trasferta.id_dipendente : null,
    tipo_mezzo: prenotazione.value.tipo_mezzo,
    costo: Number(prenotazione.value.costo),
    fornitore: prenotazione.value.fornitore,
    dettagli: prenotazione.value.dettagli,
    tipo_alloggio: prenotazione.value.tipo_alloggio,
    nome_struttura: prenotazione.value.nome_struttura,
    costo_alloggio: Number(prenotazione.value.costo_alloggio),
    indirizzo: prenotazione.value.indirizzo,
    citta: trasferta ? trasferta.luogo_destinazione : ''
  }

  const formData = new FormData()
  formData.append('prenotazione', JSON.stringify(payload))
  if (prenotazione.value.file_biglietto)
    formData.append('file_biglietto', prenotazione.value.file_biglietto)

  try {
    await axios.post(`${BASE_URL}/prenotazioni/crea`, formData, {
      headers: {
        'x-user-id': trasferta ? trasferta.id_dipendente : ADMIN_ID,
        'Content-Type': 'multipart/form-data'
      }
    })
    $q.notify({ type: 'positive', message: 'Prenotazione creata con successo!' })
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
    selectedDipendenteId.value = null
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
      .sort((a, b) => b.id - a.id)
      .map(pren => {
        const trasferta = trasferteAll.value.find(t => t.id === pren.id_trasferta)
        const idDip = trasferta ? trasferta.id_dipendente : null
        const dip = dipendentiOptions.value.find(d => d.value === idDip)
        const dipendente_nome = dip ? dip.label : '-'
        const citta = trasferta ? trasferta.luogo_destinazione : '-'
        return { 
          ...pren, 
          id_dipendente: idDip, 
          dipendente_nome, 
          citta, 
          file_biglietto: pren.file_biglietto 
        }
      })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento prenotazioni' })
  }
}

// ====== Visualizza file - FIX PRINCIPALE ======
const visualizzaFile = async (pren) => {
  try {
    // Trova la trasferta della prenotazione
    const trasferta = trasferteAll.value.find(t => t.id === pren.id_trasferta)
    if (!trasferta) {
      $q.notify({ type: 'negative', message: 'Trasferta non trovata' })
      return
    }

    const res = await axios.get(`${BASE_URL}/prenotazioni/file/${pren.id}`, {
      headers: { 'x-user-id': trasferta.id_dipendente },
      responseType: 'blob'
    })

    const mime = res.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([res.data], { type: mime })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento file' })
  }
}

// ====== onMounted ======
onMounted(async () => {
  await loadDipendenti()
  await loadTrasferteAll()
  loadPrenotazioni()
})
</script>

<style scoped>
.shadow-2 {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

:deep(.q-table thead tr) {
  background-color: #f5f5f5;
}

:deep(.q-table tbody td) {
  padding: 12px 8px;
}
</style>
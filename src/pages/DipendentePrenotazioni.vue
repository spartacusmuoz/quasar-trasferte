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

    <!-- SE NON CI SONO TRASFERTE -->
    <div v-if="trasferte.length === 0" class="text-center text-grey q-pa-xl">
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="text-h6 q-mt-md">Nessuna prenotazione disponibile</div>
    </div>

    <!-- LISTA TRASFERTE E PRENOTAZIONI -->
    <div class="row q-col-gutter-md" v-else>
      <div
        v-for="trasf in trasferte"
        :key="trasf.id"
        class="col-12 col-sm-6 col-md-6"
      >
        <q-card bordered class="shadow-2 q-mb-md">

          <!-- HEADER TRASFERTA -->
          <q-card-section class="row items-center q-gutter-sm bg-grey-2 text-black">
            <q-icon name="place" size="32px"/>
            <div class="text-h6">{{ trasf.trasferta_info || 'Trasferta sconosciuta' }}</div>
            <div class="text-subtitle2 q-ml-xs">ID: {{ trasf.id }}</div>
          </q-card-section>

          <!-- PRENOTAZIONI -->
          <div
            v-for="pren in trasf.prenotazioni"
            :key="pren.id"
            class="q-mt-sm prenotazione-wrapper"
          >
            <div class="q-relative">
              <!-- Expansion item con header colorato -->
              <q-expansion-item
                dense
                expand-icon="event"
                expand-separator
                header-class="text-white text-subtitle1"
                :header-style="{ backgroundColor: colorTrasferta(pren.id), color: 'white' }"
              >
                <!-- Header: mostra id e date (cliccabile per aprire) -->
                <template #header>
                  <div class="row items-center no-wrap full-width">
                    <q-icon name="event" class="q-mr-sm" />
                    <div class="col">
                      <div class="text-weight-medium">Prenotazione #{{ pren.id }}</div>
                      <div class="text-caption">
                        {{ pren.data_inizio }} → {{ pren.data_fine }}
                      </div>
                    </div>
                    <q-btn
                      flat
                      dense
                      round
                      icon="zoom_in"
                      color="white"
                      size="sm"
                      @click.stop="apriDialogPrenotazione(pren)"
                      class="q-ml-sm"
                    >
                      <q-tooltip>Visualizza Dettagli</q-tooltip>
                    </q-btn>
                  </div>
                </template>

                <!-- Contenuto: dettagli base -->
                <q-card flat class="q-pa-sm">
                  <div class="q-pa-sm bg-grey-1 rounded-borders">

                    <!-- TRASPORTO -->
                    <div v-if="pren.tipo_mezzo" class="q-mb-md">
                      <div class="row items-center q-gutter-xs q-mb-xs">
                        <q-icon :name="iconForTrasporto(pren.tipo_mezzo)" size="22px" color="primary"/>
                        <span class="text-subtitle2">{{ pren.tipo_mezzo }}</span>
                      </div>
                      <div class="text-caption q-ml-lg">
                        <div><strong>Costo:</strong> {{ pren.costo != null ? pren.costo + ' €' : '-' }}</div>
                        <div><strong>Fornitore:</strong> {{ pren.fornitore }}</div>
                        <div><strong>Dettagli:</strong> {{ pren.dettagli }}</div>
                      </div>
                    </div>

                    <!-- ALLOGGIO -->
                    <div>
                      <div class="row items-center q-gutter-xs q-mb-xs">
                        <q-icon :name="iconForAlloggio(pren.tipo_alloggio)" size="22px" color="secondary"/>
                        <span class="text-subtitle2">{{ pren.tipo_alloggio }}</span>
                      </div>
                      <div class="text-caption q-ml-lg">
                        <div><strong>Struttura:</strong> {{ pren.nome_struttura }}</div>
                        <div><strong>Indirizzo:</strong> {{ pren.indirizzo }}</div>
                        <div><strong>Costo:</strong> {{ pren.costo_alloggio != null ? pren.costo_alloggio + ' €' : '-' }}</div>
                      </div>
                    </div>

                    <!-- FILE -->
                    <q-card-actions align="center" class="q-mt-sm">
                      <q-btn
                        flat
                        dense
                        color="primary"
                        icon="description"
                        label="Visualizza File"
                        :disable="!pren.file_biglietto"
                        @click="visualizzaFile(pren.id)"
                      />
                    </q-card-actions>

                  </div>
                </q-card>
              </q-expansion-item>

              <!-- MENU HOVER CON CALENDARIO -->
              <q-menu
                :offset="[10, 0]"
                anchor="center right"
                self="center left"
                transition-show="scale"
                transition-hide="scale"
                max-width="450px"
                class="shadow-6"
              >
                <q-card class="calendario-hover-card">
                  <q-card-section class="q-pa-md">
                    
                    <!-- Calendario Mini -->
                    <div class="text-subtitle2 text-center q-mb-sm">
                      📅 Periodo Prenotazione
                    </div>
                    
                    <div class="calendario-mini">
                      <q-date
                        :model-value="getRangeFromPrenotazione(pren)"
                        range
                        readonly
                        color="green"
                        minimal
                        :events="date => isDateInRange(date, pren)"
                        event-color="green"
                      />
                    </div>

                    <q-separator class="q-my-md" />

                    <!-- Info rapide -->
                    <div>
                      <div class="row items-center q-gutter-xs q-mb-sm">
                        <q-icon :name="iconForAlloggio(pren.tipo_alloggio)" size="20px" color="secondary"/>
                        <div class="text-subtitle2">{{ pren.tipo_alloggio }}</div>
                      </div>
                      <div class="text-caption q-ml-lg q-mb-md">
                        {{ pren.nome_struttura }}<br/>
                        {{ pren.indirizzo }}
                      </div>

                      <div v-if="pren.tipo_mezzo" class="row items-center q-gutter-xs q-mb-sm">
                        <q-icon :name="iconForTrasporto(pren.tipo_mezzo)" size="20px" color="primary"/>
                        <div class="text-subtitle2">{{ pren.tipo_mezzo }}</div>
                      </div>
                      <div v-if="pren.tipo_mezzo" class="text-caption q-ml-lg">
                        {{ pren.fornitore }}<br/>
                        Costo: {{ pren.costo != null ? pren.costo + ' €' : '-' }}
                      </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <!-- Chip con date -->
                    <div class="text-center">
                      <q-chip color="green" text-color="white" icon="event" size="md">
                        {{ pren.data_inizio }} → {{ pren.data_fine }}
                      </q-chip>
                    </div>

                  </q-card-section>
                </q-card>
              </q-menu>
            </div>

          </div>
        </q-card>
      </div>
    </div>

    <!-- DIALOG DETTAGLI COMPLETI -->
    <q-dialog v-model="showDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card v-if="prenotazioneSelezionata">
        
        <!-- HEADER -->
        <q-bar class="bg-primary text-white">
          <q-icon name="event" size="md" />
          <div class="text-h6 q-ml-sm">Prenotazione #{{ prenotazioneSelezionata.id }}</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="scroll" style="max-height: 80vh;">
          
          <!-- CALENDARIO GRANDE -->
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">📅 Calendario Prenotazione</div>
            <div class="calendario-wrapper">
              <q-date
                :model-value="getRangeFromPrenotazione(prenotazioneSelezionata)"
                range
                readonly
                color="green"
                class="full-width"
                :events="date => isDateInRange(date, prenotazioneSelezionata)"
                event-color="green"
              />
              <div class="q-mt-md text-center">
                <q-chip color="green" text-color="white" icon="event" size="lg">
                  {{ prenotazioneSelezionata.data_inizio }} → {{ prenotazioneSelezionata.data_fine }}
                </q-chip>
              </div>
            </div>
          </div>

          <!-- DETTAGLI TRASPORTO -->
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
                    <q-item-label>{{ prenotazioneSelezionata.tipo_mezzo }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fornitore</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.fornitore }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Costo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.costo != null ? prenotazioneSelezionata.costo + ' €' : '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Dettagli</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.dettagli }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- DETTAGLI ALLOGGIO -->
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
                    <q-item-label>{{ prenotazioneSelezionata.tipo_alloggio }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Struttura</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.nome_struttura }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Indirizzo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.indirizzo }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Costo</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.costo_alloggio != null ? prenotazioneSelezionata.costo_alloggio + ' €' : '-' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- DATE -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-sm">📆 Date</div>
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Check-in / Partenza</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.data_inizio }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Check-out / Ritorno</q-item-label>
                    <q-item-label>{{ prenotazioneSelezionata.data_fine }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

        </q-card-section>

        <!-- AZIONI -->
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            color="primary"
            label="Visualizza File"
            icon="description"
            :disable="!prenotazioneSelezionata.file_biglietto"
            @click="visualizzaFile(prenotazioneSelezionata.id)"
          />
          <q-btn
            color="negative"
            label="Chiudi"
            icon="close"
            v-close-popup
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- BOTTONE AGGIORNA -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="refresh"
        color="primary"
        @click="loadPrenotazioni"
      >
        <q-tooltip>Aggiorna</q-tooltip>
      </q-btn>
    </q-page-sticky>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = "http://127.0.0.1:8000"
const ADMIN_USER_ID = 6

const getHeaders = (userId = ADMIN_USER_ID) => ({
  'x-user-id': userId,
  'Content-Type': 'application/json'
})

const dipendentiOptions = ref([])
const selectedDipendente = ref(null)
const trasferte = ref([])
const showDialog = ref(false)
const prenotazioneSelezionata = ref(null)

const prenColors = [
  '#FF7043', '#FFB74D', '#81C784', '#4DB6AC', '#64B5F6', '#BA68C8', '#F06292'
]
const colorTrasferta = id => prenColors[id % prenColors.length]

const iconForTrasporto = tipo => {
  if (!tipo) return 'help_outline'
  switch (tipo) {
    case 'aereo': return 'flight'
    case 'treno': return 'train'
    case 'taxi':
    case 'auto': return 'directions_car'
    default: return 'help_outline'
  }
}

const iconForAlloggio = tipo => {
  if (!tipo) return 'house'
  switch (tipo) {
    case 'Hotel': return 'hotel'
    case 'Bed & Breakfast': return 'holiday_village'
    case 'Appartamento': return 'apartment'
    case 'Airbnb': return 'home_work'
    case 'Ostello': return 'groups'
    default: return 'house'
  }
}

const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`, {
      headers: getHeaders()
    })
    dipendentiOptions.value = data.map(d => ({
      ...d,
      nomeCompleto: `${d.nome} ${d.cognome}`
    }))
  } catch (err) {
    console.error('Errore caricamento dipendenti:', err)
    $q.notify({ type: 'negative', message: 'Errore caricamento dipendenti' })
  }
}

const loadPrenotazioni = async () => {
  if (!selectedDipendente.value) return

  try {
    const { data: prenData } = await axios.get(`${BASE_URL}/prenotazioni/mie`, {
      headers: getHeaders(selectedDipendente.value.id)
    })

    console.log('🔍 DATI RICEVUTI DAL BACKEND:', prenData)

    prenData.forEach(p => {
      p.nome_struttura = p.nome_struttura || '-'
      p.indirizzo = p.indirizzo || '-'
      p.costo_alloggio = p.costo_alloggio ?? 0
      p.tipo_alloggio = p.tipo_alloggio || 'Non specificato'
      p.costo = p.costo ?? 0
      p.fornitore = p.fornitore || '-'
      p.dettagli = p.dettagli || '-'

      p.data_inizio = p.chk_in
      p.data_fine = p.chk_out || p.chk_in

      console.log(`📦 Prenotazione ${p.id}:`, {
        tipo_mezzo: p.tipo_mezzo,
        tipo_alloggio: p.tipo_alloggio,
        nome_struttura: p.nome_struttura,
        costo_alloggio: p.costo_alloggio,
        chk_in: p.chk_in,
        chk_out: p.chk_out,
        date: `${p.data_inizio} → ${p.data_fine}`
      })
    })

    const { data: trasferteData } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: getHeaders(selectedDipendente.value.id)
    })

    const mapTrasf = {}
    trasferteData.forEach(t => {
      mapTrasf[t.id] = `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`
    })

    const grouped = {}
    prenData.forEach(p => {
      const idT = p.id_trasferta
      if (!grouped[idT]) {
        grouped[idT] = {
          id: idT,
          trasferta_info: mapTrasf[idT] || 'Sconosciuta',
          prenotazioni: []
        }
      }
      grouped[idT].prenotazioni.push(p)
    })

    trasferteData.forEach(t => {
      if (!grouped[t.id]) {
        grouped[t.id] = {
          id: t.id,
          trasferta_info: mapTrasf[t.id] || 'Sconosciuta',
          prenotazioni: []
        }
      }
    })

    trasferte.value = Object.values(grouped)

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento prenotazioni' })
  }
}

const apriDialogPrenotazione = (pren) => {
  prenotazioneSelezionata.value = pren
  showDialog.value = true
}

const getRangeFromPrenotazione = (pren) => {
  return {
    from: pren.data_inizio,
    to: pren.data_fine
  }
}

const isDateInRange = (dateStr, pren) => {
  if (!pren.data_inizio || !pren.data_fine) return false
  const date = new Date(dateStr)
  const start = new Date(pren.data_inizio)
  const end = new Date(pren.data_fine)
  return date >= start && date <= end
}

const visualizzaFile = async idPren => {
  try {
    const res = await axios.get(`${BASE_URL}/prenotazioni/file/${idPren}`, {
      headers: getHeaders(selectedDipendente.value.id),
      responseType: 'blob'
    })

    const mime = res.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([res.data], { type: mime })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento file.' })
  }
}

onMounted(() => loadDipendenti())
</script>

<style scoped>
.prenotazione-wrapper {
  transition: transform 0.2s ease;
}

.prenotazione-wrapper:hover {
  transform: translateX(4px);
}

.calendario-wrapper {
  max-width: 450px;
  margin: 0 auto;
}

.calendario-mini {
  max-width: 350px;
  margin: 0 auto;
}

.calendario-hover-card {
  min-width: 350px;
  max-width: 450px;
}

:deep(.q-date__event) {
  background-color: #4CAF50 !important;
}

:deep(.q-date__range) {
  background-color: rgba(76, 175, 80, 0.2) !important;
}

:deep(.q-date__range-from),
:deep(.q-date__range-to) {
  background-color: #4CAF50 !important;
  color: white !important;
  font-weight: bold;
}

:deep(.q-expansion-item__content) {
  background-color: #fafafa;
}
</style>
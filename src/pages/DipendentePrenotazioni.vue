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
    <div v-if="trasferte.length === 0" class="text-center text-grey">
      Nessuna prenotazione disponibile.
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
            class="q-mt-sm"
          >

            <!-- Wrapper per attivare il menu/tooltip su hover -->
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
                  <div class="row items-center no-wrap">
                    <q-icon name="event" class="q-mr-sm" />
                    <div>
                      <div>Prenotazione #{{ pren.id }}</div>
                      <div class="text-caption">
                        {{ pren.data_inizio }} → {{ pren.data_fine }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Contenuto: dettagli completi -->
                <q-card flat class="q-pa-sm">
                  <div class="q-pa-sm bg-grey-1 rounded-borders">

                    <div class="text-subtitle2 q-mb-sm">Dettagli Prenotazione</div>

                    <!-- TRASPORTO -->
                    <div v-if="pren.tipo_mezzo">
                      <div class="row items-center q-gutter-xs">
                        <q-icon :name="iconForTrasporto(pren.tipo_mezzo)" size="22px"/>
                        <span class="text-subtitle2">{{ pren.tipo_mezzo }}</span>
                      </div>
                      <div class="q-mt-xs text-caption">
                        <div>Costo: {{ pren.costo != null ? pren.costo + ' €' : '-' }}</div>
                        <div>Fornitore: {{ pren.fornitore }}</div>
                        <div>Dettagli: {{ pren.dettagli }}</div>
                      </div>
                    </div>

                    <!-- ALLOGGIO -->
                    <div class="q-mt-md">
                      <div class="row items-center q-gutter-xs">
                        <q-icon :name="iconForAlloggio(pren.tipo_alloggio)" size="22px"/>
                        <span class="text-subtitle2">{{ pren.tipo_alloggio }}</span>
                      </div>
                      <div class="q-mt-xs text-caption">
                        <div>Struttura: {{ pren.nome_struttura }}</div>
                        <div>Indirizzo: {{ pren.indirizzo }}</div>
                        <div>Costo: {{ pren.costo_alloggio != null ? pren.costo_alloggio + ' €' : '-' }}</div>
                      </div>
                    </div>

                    <!-- FILE -->
                    <q-card-actions align="center" class="q-mt-md">
                      <q-btn
                        flat
                        color="primary"
                        label="Visualizza File"
                        :disable="!pren.file_biglietto"
                        @click="visualizzaFile(pren.id)"
                      />
                    </q-card-actions>

                  </div>
                </q-card>
              </q-expansion-item>

              <!-- MENU / TOOLTIP GIGANTE che appare con hover sull'intera prenotazione -->
              <q-menu
                :offset="[10, 0]"
                anchor="top right"
                self="top left"
                transition-show="scale"
                transition-hide="scale"
                max-width="420px"
                open-on-hover
                class="shadow-6"
              >
                <div class="q-pa-sm" style="min-width:300px; max-width:420px;">

                  <!-- calendario mensile centrato sul mese di inizio -->
                  <q-calendar
                    view="month"
                    :model-value="pren.data_inizio"
                    :day-style="(d) => styleDayPrenotazione(pren, d)"
                    minimal
                    locale="it-IT"
                  />

                  <!-- Info rapide sotto il calendario -->
                  <div class="q-mt-sm">
                    <div class="row items-center q-gutter-xs">
                      <q-icon :name="iconForAlloggio(pren.tipo_alloggio)" size="18px"/>
                      <div class="text-subtitle2 q-ml-xs">{{ pren.tipo_alloggio }}</div>
                    </div>
                    <div class="text-caption q-ml-lg">
                      {{ pren.nome_struttura }}<br/>{{ pren.indirizzo }}
                    </div>

                    <div v-if="pren.tipo_mezzo" class="q-mt-sm">
                      <div class="row items-center q-gutter-xs">
                        <q-icon :name="iconForTrasporto(pren.tipo_mezzo)" size="18px"/>
                        <div class="text-subtitle2 q-ml-xs">{{ pren.tipo_mezzo }}</div>
                      </div>
                      <div class="text-caption q-ml-lg">
                        {{ pren.fornitore }}<br/>Costo: {{ pren.costo != null ? pren.costo + ' €' : '-' }}
                      </div>
                    </div>

                  </div>
                </div>
              </q-menu>
            </div>

          </div>
        </q-card>
      </div>
    </div>

    <q-btn
      label="Aggiorna"
      color="primary"
      class="q-mt-md"
      @click="loadPrenotazioni"
    />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = "http://127.0.0.1:8000"

/* ======================================
   VARIABILI PRINCIPALI
====================================== */
const dipendentiOptions = ref([])
const selectedDipendente = ref(null)
const trasferte = ref([])

/* ======================================
   COLORI PER PRENOTAZIONI
====================================== */
const prenColors = [
  '#FF7043', '#FFB74D', '#81C784',
  '#4DB6AC', '#64B5F6', '#BA68C8',
  '#F06292'
]
const colorTrasferta = id => prenColors[id % prenColors.length]

/* ======================================
   ICONE TRASPORTO
====================================== */
const iconForTrasporto = tipo => {
  if (!tipo) return null
  switch (tipo) {
    case 'aereo': return 'flight'
    case 'treno': return 'train'
    case 'taxi':
    case 'auto': return 'directions_car'
    default: return 'help_outline'
  }
}

/* ======================================
   ICONE ALLOGGIO
====================================== */
const iconForAlloggio = tipo => {
  if (!tipo) return null
  switch (tipo) {
    case 'Hotel': return 'hotel'
    case 'Bed & Breakfast': return 'holiday_village'
    case 'Appartamento': return 'apartment'
    case 'Airbnb': return 'home_work'
    case 'Ostello': return 'groups'
    default: return 'house'
  }
}

/* ======================================
   CARICAMENTO DIPENDENTI
====================================== */
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`)
    dipendentiOptions.value = data.map(d => ({
      ...d,
      nomeCompleto: `${d.nome} ${d.cognome}`
    }))
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento dipendenti' })
  }
}

/* ======================================
   CARICAMENTO PRENOTAZIONI
====================================== */
const loadPrenotazioni = async () => {
  if (!selectedDipendente.value) return

  try {
    /* --- PRENOTAZIONI --- */
    const { data: prenData } = await axios.get(`${BASE_URL}/prenotazioni/mie`, {
      headers: { 'x-user-id': selectedDipendente.value.id }
    })

    prenData.forEach(p => {
      p.nome_struttura = p.nome_struttura || '-'
      p.indirizzo = p.indirizzo || '-'
      p.costo_alloggio = p.costo_alloggio ?? 0
      p.tipo_alloggio = p.tipo_alloggio || 'Non specificato'
      p.costo = p.costo ?? 0
      p.fornitore = p.fornitore || '-'
      p.dettagli = p.dettagli || '-'

      /* normalizzazione date */
      p.data_inizio = p.data_inizio || p.data_partenza
      p.data_fine = p.data_fine || p.data_ritorno || p.data_inizio
    })

    /* --- TRASFERTE --- */
    const { data: trasferteData } = await axios.get(`${BASE_URL}/trasferte/miei`, {
      headers: { 'x-user-id': selectedDipendente.value.id }
    })

    const mapTrasf = {}
    trasferteData.forEach(t => {
      mapTrasf[t.id] = `${t.luogo_destinazione} (${t.data_partenza} - ${t.data_rientro})`
    })

    /* --- RAGGRUPPIAMO PRENOTAZIONI PER TRASFERTA --- */
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

    /* --- ASSICURIAMO CHE TUTTE LE TRASFERTE ESISTANO ANCHE SENZA PRENOTAZIONI --- */
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

/* ======================================
   VISUALIZZA FILE
====================================== */
const visualizzaFile = async idPren => {
  try {
    const res = await axios.get(`${BASE_URL}/prenotazioni/file/${idPren}`, {
      headers: { 'x-user-id': selectedDipendente.value.id },
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

/* ======================================
   COLORAZIONE GIORNI NEL CALENDARIO
====================================== */
const styleDayPrenotazione = (pren, dayObj) => {
  const ds = dayObj.date.toISOString().slice(0, 10)
  return (ds >= pren.data_inizio && ds <= pren.data_fine)
    ? {
        borderRadius: '50%',
        backgroundColor: 'green',
        color: 'white',
        fontWeight: 'bold'
      }
    : {}
}

/* ======================================
   ON MOUNT
====================================== */
onMounted(() => loadDipendenti())
</script>

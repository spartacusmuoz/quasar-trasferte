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

    <!-- DASHBOARD TRASFERTE -->
    <div v-if="trasferte.length === 0" class="text-center text-grey">
      Nessuna prenotazione disponibile.
    </div>

    <div class="row q-col-gutter-md" v-else>
      <!-- CARD TRASFERTA -->
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
            <q-card-section
              class="q-pa-sm rounded-borders shadow-2"
              :style="{ backgroundColor: colorTrasferta(pren.id) }"
            >

              <!-- BLOCCO AFFIANCATO -->
              <div class="row q-col-gutter-md">

                <!-- BLOCCO TRASPORTO -->
                <div class="col-12 col-md-6" v-if="pren.tipo_mezzo">
                  <div class="row items-center q-gutter-xs">
                    <q-icon :name="iconForTrasporto(pren.tipo_mezzo)" size="24px"/>
                    <div class="text-subtitle1">{{ pren.tipo_mezzo }}</div>
                  </div>
                  <div class="q-mt-xs">
                    <div>Costo: {{ pren.costo }} €</div>
                    <div>Fornitore: {{ pren.fornitore }}</div>
                    <div>Dettagli: {{ pren.dettagli }}</div>
                  </div>
                </div>

                <!-- BLOCCO ALLOGGIO -->
                <div class="col-12 col-md-6" v-if="pren.tipo_alloggio">
                  <div class="row items-center q-gutter-xs">
                    <q-icon :name="iconForAlloggio(pren.tipo_alloggio)" size="24px"/>
                    <div class="text-subtitle1">{{ pren.tipo_alloggio }}</div>
                  </div>
                  <div class="q-mt-xs">
                    <div>Struttura: {{ pren.nome_struttura }}</div>
                    <div>Costo: {{ pren.costo_alloggio }} €</div>
                    <div>Tipo: {{ pren.tipo_alloggio }}</div>
                  </div>
                </div>

              </div>

              <!-- PULSANTE VISUALIZZA FILE -->
              <q-card-actions align="center" class="q-mt-md">
                <q-btn
                  flat
                  color="primary"
                  label="Visualizza File"
                  :disable="!pren.file_biglietto"
                  @click="visualizzaFile(pren.id)"
                />
              </q-card-actions>

            </q-card-section>
          </div>

        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const BASE_URL = "http://127.0.0.1:8000"

const dipendentiOptions = ref([])
const selectedDipendente = ref(null)
const trasferte = ref([])

/* ======================================
   COLORI VARI PER LE PRENOTAZIONI
====================================== */
const prenColors = [
  '#FF7043', '#FFB74D', '#81C784', '#4DB6AC', '#64B5F6', '#BA68C8', '#F06292'
]
const colorTrasferta = (id) => prenColors[id % prenColors.length]

/* ======================================
   ICONA PRENOTAZIONE
====================================== */
const iconForTrasporto = (tipo_mezzo) => {
  if (!tipo_mezzo) return null
  switch(tipo_mezzo){
    case 'aereo': return 'flight'
    case 'treno': return 'train'
    case 'taxi':
    case 'auto': return 'directions_car'
    default: return 'help_outline'
  }
}

const iconForAlloggio = (tipo_alloggio) => {
  if (!tipo_alloggio) return null
  switch(tipo_alloggio){
    case 'Hotel': return 'hotel'
    case 'Bed & Breakfast': return 'holiday_village'
    case 'Appartamento': return 'apartment'
    case 'Airbnb': return 'home_work'
    case 'Ostello': return 'groups'
    default: return 'house'
  }
}

/* ======================================
   LOAD DIPENDENTI
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
   LOAD PRENOTAZIONI
====================================== */
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

    const grouped = {}
    prenData.forEach(p => {
      const idT = p.id_trasferta
      if(!grouped[idT]){
        grouped[idT] = { id: idT, trasferta_info: trasfMap[idT] || 'Sconosciuta', prenotazioni: [] }
      }
      grouped[idT].prenotazioni.push(p)
    })

    trasferteData.forEach(t => {
      if(!grouped[t.id]){
        grouped[t.id] = { id: t.id, trasferta_info: trasfMap[t.id] || 'Sconosciuta', prenotazioni: [] }
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
    console.error(err)
    $q.notify({ type: 'negative', message: 'Errore caricamento file.' })
  }
}

onMounted(() => loadDipendenti())
</script>

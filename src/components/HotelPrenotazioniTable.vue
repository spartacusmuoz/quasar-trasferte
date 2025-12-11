<template>
  <div>
    <!-- Selezione hotel -->
    <q-select
      filled
      v-model="selectedHotelDropdown"
      :options="hotels.map(h => ({ label: h.name, value: h }))"
      option-label="label"
      option-value="value"
      emit-value
      map-options
      @update:model-value="aggiungiHotelSelezionato"
      placeholder="Scegli un hotel"
    />

    <!-- Tabella mini hotel -->
    <q-table
      :rows="hotelsSelezionati"
      :columns="columns"
      row-key="name"
      flat
      dense
    >
      <template v-slot:body-cell-azioni="props">
        <q-td>
          <q-btn flat dense color="negative" icon="delete" @click="rimuoviHotel(props.row)" />
          <q-btn flat dense color="primary" icon="info" @click="mostraDettagliHotel(props.row)" />
          <q-btn flat dense color="secondary" label="Usa per Prenotazione" @click="inviaHotelPrenotazione(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useHotelStore } from 'stores/hotelStore'
import axios from 'axios'

const $q = useQuasar()
const BASE_URL = 'http://127.0.0.1:8000'
const token = localStorage.getItem('access_token')
const USER_ID = localStorage.getItem('user_id') ?? 6
const headers = { Authorization: `Bearer ${token}`, 'x-user-id': USER_ID, 'Content-Type': 'application/json' }

const hotels = ref([])
const hotelsSelezionati = ref([])
const selectedHotelDropdown = ref(null)
const prenotazioneSelezionata = ref(null)
const hotelStore = useHotelStore()

const columns = [
  { name: 'name', label: 'Hotel', field: 'name' },
  { name: 'indirizzo', label: 'Indirizzo', field: 'indirizzo' },
  { name: 'azioni', label: 'Azioni' }
]

const aggiungiHotelSelezionato = async (hotel) => {
  if (!hotel) return
  if (!hotelsSelezionati.value.find(h => h.name === hotel.name)) {
    await recuperaIndirizzo(hotel)
    hotelsSelezionati.value.push({ name: hotel.name, indirizzo: hotel.indirizzo })
  }
}

const rimuoviHotel = (hotel) => {
  hotelsSelezionati.value = hotelsSelezionati.value.filter(h => h.name !== hotel.name)
}

const recuperaIndirizzo = async (hotel) => {
  try {
    const geo = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${hotel.lat}&lon=${hotel.lon}`)
    hotel.indirizzo = geo.data.display_name || ''
  } catch {
    hotel.indirizzo = ''
  }
}

const mostraDettagliHotel = (hotel) => {
  $q.notify({ type: 'info', message: `Dettagli hotel: ${hotel.name} - ${hotel.indirizzo}` })
}

const inviaHotelPrenotazione = (hotel) => {
  if (!prenotazioneSelezionata.value) {
    $q.notify({ type: 'warning', message: 'Seleziona o crea una prenotazione prima!' })
    return
  }

  prenotazioneSelezionata.value.tipo_alloggio = 'Hotel'
  prenotazioneSelezionata.value.nome_struttura = hotel.name
  prenotazioneSelezionata.value.indirizzo = hotel.indirizzo

  hotelStore.setHotel({ name: hotel.name, indirizzo: hotel.indirizzo, tipo_alloggio: 'Hotel', costo_alloggio: 0 })

  // Gestione POST o PATCH lato API
  if (prenotazioneSelezionata.value.id) {
    axios.patch(`${BASE_URL}/prenotazioni/${prenotazioneSelezionata.value.id}`, prenotazioneSelezionata.value, { headers })
      .then(() => $q.notify({ type: 'positive', message: 'Prenotazione aggiornata!' }))
      .catch(() => $q.notify({ type: 'negative', message: 'Errore aggiornamento prenotazione' }))
  } else {
    axios.post(`${BASE_URL}/prenotazioni/crea`, { ...prenotazioneSelezionata.value, id_trasferta: prenotazioneSelezionata.value.id_trasferta }, { headers })
      .then(() => $q.notify({ type: 'positive', message: 'Nuova prenotazione creata!' }))
      .catch(() => $q.notify({ type: 'negative', message: 'Errore creazione prenotazione' }))
  }
}
</script>

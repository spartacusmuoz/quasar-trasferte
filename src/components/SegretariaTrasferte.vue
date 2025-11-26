<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Richieste di Trasferta</div>
      </q-card-section>

      <q-table
        :rows="trasferte"
        :columns="columns"
        row-key="id"
        flat
        bordered
      >
        <template v-slot:body-cell-azioni="props">
          <q-td>
            <q-btn
              color="positive"
              icon="check"
              size="sm"
              flat
              @click="approva(props.row)"
            />
            <q-btn
              color="negative"
              icon="close"
              size="sm"
              flat
              @click="rifiuta(props.row)"
            />
          </q-td>
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
const BASE_URL = 'http://127.0.0.1:8000'

// 👉 Recupero token e user ID dal login
const token = localStorage.getItem('access_token')
const USER_ID = localStorage.getItem('user_id') ?? 6

// 👉 Headers comuni
const headers = {
  'Authorization': `Bearer ${token}`,
  'x-user-id': USER_ID,
  'Content-Type': 'application/json'
}

const trasferte = ref([])
const dipendenti = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'dipendente', label: 'Dipendente', field: 'dipendente_nome' },
  { name: 'data_partenza', label: 'Partenza', field: 'data_partenza' },
  { name: 'data_rientro', label: 'Rientro', field: 'data_rientro' },
  { name: 'luogo_destinazione', label: 'Destinazione', field: 'luogo_destinazione' },
  { name: 'stato', label: 'Stato', field: 'stato' },
  { name: 'azioni', label: 'Azioni', field: 'azioni' }
]

// ---------------------------
// CARICA DIPENDENTI
// ---------------------------
const loadDipendenti = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dipendenti`, { headers })
    dipendenti.value = data
  } catch (err) {
    console.error('Errore caricamento dipendenti', err)
  }
}

// ---------------------------
// CARICA TRASFERTE
// ---------------------------
const loadTrasferte = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte`, { headers })

    trasferte.value = data.map(t => {
      const dip = dipendenti.value.find(d => d.id === t.id_dipendente)
      return {
        ...t,
        dipendente_nome: dip ? `${dip.nome} ${dip.cognome}` : 'Sconosciuto'
      }
    })

  } catch (err) {
    console.error('Errore caricamento trasferte', err)
  }
}

onMounted(async () => {
  await loadDipendenti()
  await loadTrasferte()
})

// ---------------------------
// APPROVA
// ---------------------------
const approva = async (row) => {
  try {
    await axios.patch(
      `${BASE_URL}/trasferte/${row.id}/stato`,
      { stato: 'approvata' },
      { headers }
    )

    $q.notify({ type: 'positive', message: 'Trasferta approvata!' })
    loadTrasferte()
  } catch (err) {
    console.error('Errore approvazione', err)
  }
}

// ---------------------------
// RIFIUTA
// ---------------------------
const rifiuta = async (row) => {
  try {
    await axios.patch(
      `${BASE_URL}/trasferte/${row.id}/stato`,
      { stato: 'rifiutata' },
      { headers }
    )

    $q.notify({ type: 'negative', message: 'Trasferta rifiutata' })
    loadTrasferte()
  } catch (err) {
    console.error('Errore rifiuto', err)
  }
}
</script>

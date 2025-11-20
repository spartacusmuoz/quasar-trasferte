<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md" style="max-width: 600px; margin:auto">
      <q-card-section>
        <div class="text-h6">Nuova Spesa - Test Dropdown</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submitSpesa">

          <!-- Select Dipendente -->
          <q-select
            filled
            v-model="selectedDipendenteId"
            :options="dipendentiOptions"
            label="Dipendente"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            required
          />

          <!-- Categoria -->
          <q-input filled v-model="categoria" label="Categoria" required />

          <!-- Importo -->
          <q-input filled v-model.number="importo" label="Importo" type="number" required />

          <!-- Bottone submit -->
          <div class="q-mt-md">
            <q-btn label="Invia Spesa" color="primary" type="submit" />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Form fields
const categoria = ref('')
const importo = ref(null)
const selectedDipendenteId = ref(null)
const dipendentiOptions = ref([])

onMounted(() => {
  console.log('onMounted SpeseForm.vue test')

  // Dati statici di test
  dipendentiOptions.value = [
    { label: 'Mario Rossi', value: 1 },
    { label: 'Luigi Bianchi', value: 2 },
    { label: 'Anna Verdi', value: 3 }
  ]

  console.log('Dipendenti caricati:', dipendentiOptions.value)
})

const submitSpesa = () => {
  console.log('Submit spesa')
  console.log('Dipendente selezionato:', selectedDipendenteId.value)
  console.log('Categoria:', categoria.value)
  console.log('Importo:', importo.value)

  $q.notify({
    type: 'positive',
    message: `Spesa inviata per dipendente ID ${selectedDipendenteId.value}`
  })
}
</script>

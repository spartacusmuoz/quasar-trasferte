<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-lg">Portale Segreteria</div>

    <div class="row q-gutter-md q-mb-md">
      <q-btn
        to="/segreteria/trasferte"
        color="primary"
        label="Gestione Trasferte"
        icon="assignment"
        size="lg"
        class="full-width"
      />
      <q-btn
        to="/segreteria/prenotazioni"
        color="secondary"
        label="Gestione Prenotazioni"
        icon="airplane_ticket"
        size="lg"
        class="full-width"
      />
      <q-btn
        to="/segreteria/spese"
        color="accent"
        label="Gestione Spese"
        icon="payments"
        size="lg"
        class="full-width"
      />
    </div>
  </q-page>
</template>

<script setup>
</script>

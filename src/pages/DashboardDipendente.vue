<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-lg">Portale Dipendente</div>

    <div class="row q-gutter-md q-mb-md">
      <q-btn
        to="/dipendente/prenotazioni"
        color="primary"
        label="Le mie Prenotazioni"
        icon="assignment"
        size="lg"
        class="full-width"
      />
      <q-btn
        to="/dipendente/spese"
        color="secondary"
        label="Le mie Spese"
        icon="receipt"
        size="lg"
        class="full-width"
      />
      <q-btn
        to="/dipendente/trasferte"
        color="accent"
        label="Le mie Trasferte"
        icon="flight_takeoff"
        size="lg"
        class="full-width"
      />
    </div>
  </q-page>
</template>

<script setup>
</script>

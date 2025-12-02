<template>
  <div class="hotel-mapp">
    <h1>Hotel Suggeriti</h1>

    <!-- SELEZIONE TRASFERTA -->
    <div class="form-group">
      <label>Seleziona una Trasferta</label>
      <select v-model.number="selectedTrasferta" @change="generaSuggerimenti">
        <option value="">-- scegli una trasferta --</option>
        <option 
          v-for="t in trasferte" 
          :key="t.id"
          :value="t.id"
        >
          [{{ t.id }}] {{ t.luogo_destinazione }} 
          ({{ t.data_partenza }} → {{ t.data_rientro }})
        </option>
      </select>
    </div>

    <!-- MAPPA -->
    <div id="map" style="height: 500px; margin-top: 20px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --------------------
// VARIABILI
// --------------------
const BASE_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");
const USER_ID = localStorage.getItem("user_id") ?? 6;

const headers = {
  Authorization: `Bearer ${token}`,
  "x-user-id": USER_ID,
  "Content-Type": "application/json"
}

const trasferte = ref([]);
const selectedTrasferta = ref(null);
const hotels = ref([]);

let map = null;

// --------------------
// CARICA TRASFERTE
// --------------------
const loadTrasferte = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte`, { headers });
    trasferte.value = data;
    console.log("Trasferte caricate:", trasferte.value);
  } catch (err) {
    console.error("Errore caricamento trasferte", err);
  }
}

// --------------------
// GENERA HOTEL SUGGERITI
// --------------------
const generaSuggerimenti = async () => {
  if (!selectedTrasferta.value) return;

  console.log("Trasferta selezionata:", selectedTrasferta.value);

  try {
    const res = await axios.post(
      `${BASE_URL}/suggerimenti-hotel/genera/${selectedTrasferta.value}`,
      {}, // body vuoto
      { headers }
    );

    // Prendiamo direttamente la lista results
    hotels.value = res.data.results || [];
    console.log("Hotel generati:", hotels.value);

    caricaHotelSuMappa();
  } catch (err) {
    if (err.response) {
      console.error("Errore generazione hotel:", err.response.data);
    } else {
      console.error("Errore generazione hotel:", err);
    }
  }
}

// --------------------
// MAPPA
// --------------------
const initMap = () => {
  map = L.map("map").setView([41.90, 12.49], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
}

const caricaHotelSuMappa = () => {
  if (!map) return;

  // Rimuove marker vecchi
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });

  // Aggiunge marker hotel
  hotels.value.forEach(h => {
    if (!h.lat || !h.lon) return;

    L.marker([h.lat, h.lon])
      .addTo(map)
      .bindPopup(`<b>${h.nome}</b><br>${h.indirizzo || ""}`);
  });

  // Fit automatico sulla mappa
  if (hotels.value.length > 0) {
    const markers = hotels.value.map(h => L.marker([h.lat, h.lon]));
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds());
  }
}

// --------------------
// AVVIO
// --------------------
onMounted(async () => {
  await loadTrasferte();
  initMap();
});
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  width: 400px;
}
</style>

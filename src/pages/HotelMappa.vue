<template>
  <div class="hotel-mapp">
    <h1>Hotel Suggeriti</h1>

    <!-- Selezione Trasferta -->
    <div class="form-group">
      <label>Seleziona una Trasferta</label>
      <select v-model.number="selectedTrasferta" @change="onTrasfertaChange">
        <option value="">-- scegli una trasferta --</option>
        <option v-for="t in trasferte" :key="t.id" :value="t.id">
          [{{ t.id }}] {{ t.luogo_destinazione }} ({{ t.data_partenza }} → {{ t.data_rientro }})
        </option>
      </select>
    </div>

    <!-- Mappa -->
    <div id="map" style="height: 500px; margin-top: 20px;"></div>

    <!-- Mini‑Tabella Hotel -->
    <table border="1" style="margin-top:20px; width:100%;" v-if="selectedHotels.length > 0">
      <thead>
        <tr>
          <th>Hotel</th>
          <th>ID Hotel</th>
          <th>Trasferta</th>
          <th>Indirizzo</th>
          <th>Stelle</th>
          <th>Immagine</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Prenotazione</th>
          <th>Costo Alloggio</th>
          <th>Azioni</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="h in selectedHotels" :key="h.idHotel">
          <tr>
            <td>{{ h.nome }}</td>
            <td>{{ h.idHotel }}</td>
            <td>{{ h.idTrasferta }}</td>
            <td>{{ h.indirizzo || 'Indirizzo non disponibile' }}</td>
            <td>{{ h.stars || 'N/A' }}</td>
            
            <!-- ✅ IMMAGINE HOTEL -->
            <td style="text-align: center;">
              <img v-if="h.showImage && h.image_url" :src="h.image_url" alt="Hotel Image" style="max-width: 120px; height: auto; border-radius: 4px;" />
              <button v-else @click="mostraImmagine(h)" style="padding: 5px 10px;">
                {{ h.image_url ? 'Mostra Foto' : 'Nessuna Foto' }}
              </button>
            </td>

            <!-- ✅ CHECK-IN -->
            <td>
              <span v-if="h.chk_in">{{ h.chk_in }}</span>
              <span v-else>-</span>
            </td>

            <!-- ✅ CHECK-OUT -->
            <td>
              <span v-if="h.chk_out">{{ h.chk_out }}</span>
              <span v-else>-</span>
            </td>

            <td>
              <select v-model.number="h.selectedPrenotazione">
                <option value="">-- scegli una prenotazione --</option>
                <option v-for="p in prenotazioni" :key="p.id" :value="p.id">
                  [{{ p.id }}] {{ p.nome_struttura || 'Hotel' }} - {{ p.tipo_alloggio }}
                </option>
              </select>
            </td>

            <td>
              <div v-if="h.showRates">
                <select v-model="h.selectedRateCode">
                  <option value="">-- seleziona fornitore --</option>
                  <option v-for="r in h.rates" :key="r.code" :value="r.code">
                    {{ r.name }}: {{ formatCurrency(r.rate + r.tax, h.currencySelected) }}
                  </option>
                </select>
              </div>
              <div v-else>
                {{ h.selectedRate
                  ? formatCurrency(h.selectedRate.rate + h.selectedRate.tax, h.currencySelected || 'EUR')
                  : h.averageRate
                    ? formatCurrency(h.averageRate, h.currencySelected || 'EUR')
                    : '-' }}
              </div>
            </td>

            <td>
              <button @click="confermaHotel(h)">Salva prenotazione</button>
              <button @click="h.showManualParams = !h.showManualParams" style="margin-left:5px;">
                Parametri Manuali
              </button>
              <button v-if="h.selectedPrenotazione" @click="fetchXoteloRates(h)" style="margin-left:5px;">
                Mostra Prezzo
              </button>
            </td>
          </tr>

          <!-- Parametri manuali -->
          <tr v-if="h.showManualParams" :key="'manual-'+h.idHotel" style="background:#f0f0f0;">
            <td colspan="11">
              <div style="display:flex; flex-wrap:wrap; gap:10px;">
                <div>
                  <label>Hotel Key:</label>
                  <input type="text" v-model="h.manualParams.hotel_key" />
                </div>
                <div>
                  <label>Check-in:</label>
                  <input type="date" v-model="h.manualParams.chk_in" />
                </div>
                <div>
                  <label>Check-out:</label>
                  <input type="date" v-model="h.manualParams.chk_out" />
                </div>
                <div>
                  <label>Adulti:</label>
                  <input type="number" v-model.number="h.manualParams.adults" min="1" />
                </div>
                <div>
                  <label>Bambini:</label>
                  <input type="number" v-model.number="h.manualParams.children" min="0" />
                </div>
                <div>
                  <label>Rooms:</label>
                  <input type="number" v-model.number="h.manualParams.rooms" min="1" />
                </div>
                <div>
                  <label>Valuta:</label>
                  <select v-model="h.manualParams.currency">
                    <option v-for="c in currencies" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
                <div style="align-self:flex-end;">
                  <button @click="aggiornaParametriManuali(h)">Aggiorna Tariffe</button>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BASE_URL = 'http://127.0.0.1:8000';
const token = localStorage.getItem('access_token');
const USER_ID = 6;

function getHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    'x-user-id': USER_ID,
    'Content-Type': 'application/json'
  };
}

const currencies = ['USD','GBP','EUR','CAD','CHF','AUD','JPY','CNY','INR','THB','BRL','HKD','RUB','BZD'];
const trasferte = ref([]);
const selectedTrasferta = ref(null);
const hotels = ref([]);
const selectedHotels = ref([]);
const prenotazioni = ref([]);
const hotelKeyMap = ref({});

let map = null;
const trasfertaPos = ref(null);
let trasfertaMarker = null;
let lineToHotel = null;

function formatCurrency(amount, currency) {
  if (!amount) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
}

// ---------- Caricamento dati ----------
async function loadTrasferte() {
  try {
    const { data } = await axios.get(`${BASE_URL}/trasferte`, { headers: getHeaders() });
    trasferte.value = data;
  } catch (err) {
    console.error('Errore caricamento trasferte', err);
  }
}

async function loadAllPrenotazioni() {
  if (!selectedTrasferta.value) return;
  try {
    const { data } = await axios.get(`${BASE_URL}/prenotazioni/`, { headers: getHeaders() });
    prenotazioni.value = data.filter(p => p.id_trasferta === selectedTrasferta.value);
    selectedHotels.value.forEach(h => {
      h.selectedPrenotazione = null;
      h.selectedRateCode = '';
      h.selectedRate = null;
    });
  } catch (err) {
    console.error('Errore caricamento prenotazioni:', err);
    prenotazioni.value = [];
  }
}

async function loadHotelKeys() {
  try {
    const { data } = await axios.get(`${BASE_URL}/hotel-api-params/list-with-names`, { headers: getHeaders() });
    hotelKeyMap.value = {};
    data.forEach(h => {
      hotelKeyMap.value[h.id_hotel] = { hotel_key: h.hotel_key, nome: h.hotel_nome };
    });
  } catch (err) {
    console.error('Errore caricamento hotel_key:', err);
  }
}

// ---------- Sincronizza hotel_key via API Xotelo ----------
async function syncHotelKeys() {
  if (!selectedTrasferta.value) return;
  const t = trasferte.value.find(tr => tr.id === selectedTrasferta.value);
  if (!t || !t.luogo_destinazione) return;

  try {
    const { data } = await axios.post(
      `${BASE_URL}/xotelo/sync-hotel-keys-to-db`,
      {},
      { headers: getHeaders(), params: { city: t.luogo_destinazione, trasferta_id: selectedTrasferta.value } }
    );
    console.log('Sync hotel keys:', data);
  } catch (err) {
    console.error('Errore sincronizzazione hotel keys:', err);
  }
}

// ---------- NUOVA API: Genera hotel suggeriti SOLO SE NON ESISTONO ----------
async function generaHotelSuggeriti() {
  if (!selectedTrasferta.value) return;
  try {
    const { data } = await axios.post(
      `${BASE_URL}/suggerimenti-hotel/genera-suggeriti/${selectedTrasferta.value}`,
      null,
      { headers: getHeaders() }
    );
    console.log('Generazione hotel suggeriti:', data);
  } catch (err) {
    console.error('Errore generazione hotel suggeriti:', err);
  }
}

// ---------- NUOVA API: Copia hotel_key → hotel_api_params ----------
async function syncHotelKeysToApiParams() {
  if (!selectedTrasferta.value) return;

  try {
    const { data } = await axios.post(
      `${BASE_URL}/xotelo/sync-hotel-keys-to-api-params`,
      null,
      { headers: getHeaders(), params: { trasferta_id: selectedTrasferta.value } }
    );
    console.log("Sync hotel_key to api_params:", data);
  } catch (err) {
    console.error("Errore sync hotel_key → api_params:", err);
  }
}

// ---------- Generazione suggerimenti hotel ----------
async function generaSuggerimenti() {
  if (!selectedTrasferta.value) return;
  try {
    const res = await axios.get(`${BASE_URL}/suggerimenti-hotel/lista/${selectedTrasferta.value}`, { headers: getHeaders() });

    hotels.value = res.data.map(h => {
      const hotelKeyEntry = hotelKeyMap.value[h.id] || {};
      return {
        idHotel: h.id,
        idTrasferta: selectedTrasferta.value,
        nome: h.nome,
        lat: h.lat,
        lon: h.lon,
        indirizzo: null,
        stars: h.stars || null,
        image_url: h.image_url || '',
        showImage: false,

        /* ✅ AGGIUNGI QUESTI */
        chk_in: null,
        chk_out: null,

        selectedPrenotazione: null,
        selectedRateCode: '',
        selectedRate: null,
        providers: h.providers || null,
        rates: [],
        showRates: false,
        averageRate: null,
        currencySelected: 'EUR',
        showManualParams: false,
        manualParams: { 
          hotel_key: hotelKeyEntry.hotel_key || '',
          image_url: h.image_url || '', 
          chk_in: '', 
          chk_out:'', 
          adults:1, 
          children:0, 
          rooms:1, 
          currency:'EUR' 
        }
      };
    });
    
    hotels.value.forEach(h => {
      watch(() => h.selectedRateCode, (newCode) => { h.selectedRate = h.rates.find(r => r.code === newCode) || null; });
    });

    caricaHotelSuMappa();
    drawLineToNearestHotel();

  } catch (err) {
    console.error('Errore generazione/lista hotel:', err);
  }
}

// ---------- Watch hotel_name per aggiornare hotel_key ----------
watch(selectedHotels, (hotelsList) => {
  hotelsList.forEach(hotel => {
    watch(() => hotel.nome, (newNome) => {
      const entry = Object.values(hotelKeyMap.value).find(e => e.nome === newNome);
      if (entry) hotel.manualParams.hotel_key = entry.hotel_key;
    }, { immediate: true });
  });
}, { deep: true, immediate: true });

// ---------- Funzione condivisa per caricare la logica hotel ----------
async function caricaLogicaTrasferta() {
  selectedHotels.value = [];

  await syncHotelKeys();
  await syncHotelKeysToApiParams();
  await generaHotelSuggeriti();
  
  await loadHotelKeys();
  await generaSuggerimenti();
  await loadAllPrenotazioni();
}

// ---------- Ottieni bounding box di una città nel mondo ----------
async function getCityBounds(cityName) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName,
        format: 'json',
        limit: 1
      }
    });

    if (!res.data || res.data.length === 0) return null;

    const city = res.data[0];

    if (!city.boundingbox) return null;

    // boundingbox = [south, north, west, east]
    const south = parseFloat(city.boundingbox[0]);
    const north = parseFloat(city.boundingbox[1]);
    const west = parseFloat(city.boundingbox[2]);
    const east = parseFloat(city.boundingbox[3]);

    return L.latLngBounds([[south, west], [north, east]]);
  } catch (err) {
    console.error('Errore getCityBounds:', err);
    return null;
  }
}

// ---------- Trasferta cambia ----------
async function onTrasfertaChange() {
  selectedHotels.value = [];

  await syncHotelKeys();  
  await generaHotelSuggeriti();
  await syncHotelKeysToApiParams();
  await loadHotelKeys();
  await generaSuggerimenti();
  await loadAllPrenotazioni();

  const t = trasferte.value.find(tr => tr.id === selectedTrasferta.value);
  if (!t) return;

  trasfertaPos.value = { lat: t.lat, lon: t.lon };
  if (trasfertaMarker) map.removeLayer(trasfertaMarker);

  trasfertaMarker = L.marker([t.lat, t.lon], { 
    icon: L.icon({ 
      iconUrl: 'https://cdn-icons-png.flaticon.com/684/684908.png',
      iconSize: [30, 30] 
    }) 
  }).addTo(map)
    .bindPopup(`📍 Trasferta: ${t.luogo_destinazione}<br><small>Clicca per entrare in città</small>`);

  trasfertaMarker.on('click', async () => {
    await caricaLogicaTrasferta();

    const hotelsWithCoords = hotels.value.filter(h => h.lat && h.lon);
    if (hotelsWithCoords.length > 0) {
      const bounds = L.latLngBounds(hotelsWithCoords.map(h => [h.lat, h.lon]));
      bounds.extend([t.lat, t.lon]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      const cityBounds = await getCityBounds(t.luogo_destinazione);
      if (cityBounds) {
        map.fitBounds(cityBounds, { padding: [50, 50] });
      } else {
        map.setView([t.lat, t.lon], 16); // fallback se bounding box non disponibile
      }
    }
  });

  // 🔥 Anche al cambio dalla tendina facciamo lo stesso
  const hotelsWithCoords = hotels.value.filter(h => h.lat && h.lon);
  if (hotelsWithCoords.length > 0) {
    const bounds = L.latLngBounds(hotelsWithCoords.map(h => [h.lat, h.lon]));
    bounds.extend([t.lat, t.lon]);
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    const cityBounds = await getCityBounds(t.luogo_destinazione);
    if (cityBounds) {
      map.fitBounds(cityBounds, { padding: [50, 50] });
    } else {
      map.setView([t.lat, t.lon], 16); // fallback
    }
  }
}


// ---------- Mappa ----------
function initMap() {
  map = L.map('map').setView([41.90, 12.49], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
}

function caricaHotelSuMappa() {
  if (!map) return;
  map.eachLayer(layer => { if (layer instanceof L.Marker && layer !== trasfertaMarker) map.removeLayer(layer); });

  hotels.value.forEach(h => {
    if (!h.lat || !h.lon) return;

    const color = h.manualParams.hotel_key ? 'purple' : 'blue';
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0 C23 0 30 7 30 15 C30 25 15 40 15 40 C15 40 0 25 0 15 C0 7 7 0 15 0 Z" fill="${color}" stroke="white" stroke-width="2"/></svg>`,
      iconSize: [30, 40],
      iconAnchor: [15, 40]
    });

    const marker = L.marker([h.lat, h.lon], { icon }).addTo(map);
    marker.bindTooltip(h.nome, { permanent: false, direction: 'top', offset: [0, -10] });

    marker.on('click', async () => {
      try {
        const geo = await axios.get('https://nominatim.openstreetmap.org/reverse', { params: { lat: h.lat, lon: h.lon, format: 'json' } });
        h.indirizzo = geo.data.display_name || 'Indirizzo non disponibile';
      } catch {
        h.indirizzo = 'Indirizzo non disponibile';
      }
      if (!selectedHotels.value.find(sh => sh.idHotel === h.idHotel)) selectedHotels.value.push(h);

      marker.setPopupContent(`<b>${h.nome}</b><br>${h.indirizzo}<br>⭐ ${h.stars ?? 'N/A'}`);

      if (trasfertaPos.value) {
        if (lineToHotel) map.removeLayer(lineToHotel);
        lineToHotel = L.polyline([
          [trasfertaPos.value.lat, trasfertaPos.value.lon],
          [h.lat, h.lon]
        ], { color: 'blue', weight: 3 }).addTo(map);
      }
    });
  });

  if (hotels.value.length > 0) {
    const constMarkers = hotels.value.filter(h => h.lat && h.lon).map(h => L.marker([h.lat, h.lon]));
    const group = L.featureGroup(constMarkers);
    map.fitBounds(group.getBounds());
  }
}

function drawLineToNearestHotel() {
  if (!trasfertaPos.value || hotels.value.length === 0) return;

  let minDist = Infinity;
  let nearestHotel = null;

  hotels.value.forEach(h => {
    if (!h.lat || !h.lon) return;
    const dLat = h.lat - trasfertaPos.value.lat;
    const dLon = h.lon - trasfertaPos.value.lon;
    const dist = Math.sqrt(dLat*dLat + dLon*dLon);
    if (dist < minDist) {
      minDist = dist;
      nearestHotel = h;
    }
  });

  if (!nearestHotel) return;

  if (lineToHotel) map.removeLayer(lineToHotel);

  lineToHotel = L.polyline([
    [trasfertaPos.value.lat, trasfertaPos.value.lon],
    [nearestHotel.lat, nearestHotel.lon]
  ], { color: 'red', weight: 3, dashArray: '5,10' }).addTo(map);

  map.fitBounds(lineToHotel.getBounds(), { padding: [50,50] });
}

// ---------- Tariffe ----------
async function fetchXoteloRates(hotel) {
  if (!hotel.selectedPrenotazione) {
    alert("Seleziona prima una prenotazione!");
    return;
  }

  if (!hotel.latestParamId) {
    alert("Errore: nessun parametro salvato per questo hotel.");
    return;
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/hotel-api-params/xotelo/${hotel.idHotel}`,
      { headers: getHeaders() }
    );

    /* ✅ QUESTO È IL PASSAGGIO CHIAVE */
    hotel.chk_in  = data.result.chk_in;
    hotel.chk_out = data.result.chk_out;

    hotel.rates = data.result?.rates || [];
    hotel.selectedRate = null;
    hotel.selectedRateCode = '';
    hotel.showRates = true;

    hotel.averageRate =
      hotel.rates.length > 0
        ? hotel.rates.reduce((acc, r) => acc + (r.rate || 0), 0) / hotel.rates.length
        : null;

    hotel.currencySelected = hotel.manualParams.currency;

  } catch (err) {
    console.error("Errore caricamento tariffe Xotelo", err);
    hotel.rates = [];
    hotel.showRates = false;
    hotel.averageRate = null;
  }
}

// ---------- Aggiorna parametri manuali ----------
async function aggiornaParametriManuali(hotel) {
  try {
    if (!hotel.idHotel) {
      alert("Errore: idHotel non valido.");
      return;
    }

    const payload = {
      id_hotel: hotel.idHotel,
      hotel_key: hotel.manualParams.hotel_key,
      chk_in: hotel.manualParams.chk_in,
      chk_out: hotel.manualParams.chk_out,
      rooms: hotel.manualParams.rooms,
      adults: hotel.manualParams.adults,
      currency: hotel.manualParams.currency,
      alloggio: hotel.nome,
      exists_in_db: true
    };

    console.log("PAYLOAD INVIATO:", payload);

    const postRes = await axios.post(
      `${BASE_URL}/hotel-api-params/`,
      payload,
      { headers: getHeaders() }
    );

    if (!postRes.data || !postRes.data.id) {
      console.error("ERRORE: POST non ha restituito un id valido:", postRes.data);
      alert("Errore: nessun paramId restituito dal backend.");
      return;
    }

    const paramId = postRes.data.id;
    hotel.latestParamId = paramId;

    console.log("NUOVO PARAM ID CREATO:", paramId);

    const getRes = await axios.get(
      `${BASE_URL}/hotel-api-params/${paramId}`,
      { headers: getHeaders() }
    );

    const savedParams = getRes.data;

    hotel.manualParams = {
      ...hotel.manualParams,
      hotel_key: savedParams.hotel_key,
      chk_in: savedParams.chk_in,
      chk_out: savedParams.chk_out,
      adults: savedParams.adults,
      rooms: savedParams.rooms,
      currency: savedParams.currency
    };

    await fetchXoteloRates(hotel);

    alert("Parametri aggiornati e tariffe caricate con successo!");

  } catch (err) {
    console.error("Errore aggiornando parametri manuali:", err);
    alert("Errore durante salvataggio parametri.");
  }
}

// ---------- Conferma prenotazione ----------
async function confermaHotel(hotel) {
  if (!hotel.selectedPrenotazione) {
    alert('Seleziona prima una prenotazione!');
    return;
  }

  const pren = prenotazioni.value.find(p => p.id === hotel.selectedPrenotazione);
  if (!pren) {
    alert('Prenotazione non trovata!');
    return;
  }

  const costoTotale = hotel.selectedRate
    ? hotel.selectedRate.rate + hotel.selectedRate.tax
    : hotel.averageRate || 0;

  function formatDateForAPI(d) {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.toISOString().split('T')[0];
  }

  const payload = {
    id_hotel: hotel.idHotel,
    costo_alloggio: costoTotale,
    nome_struttura: hotel.nome,
    indirizzo: hotel.indirizzo || '',
    citta: hotel.citta || pren.citta || '',
    chk_in: formatDateForAPI(hotel.chk_in),
    chk_out: formatDateForAPI(hotel.chk_out)
  };

  try {
    const { data } = await axios.patch(
      `${BASE_URL}/prenotazioni/prenotazioni/${hotel.selectedPrenotazione}`,
      payload,
      { headers: getHeaders() }
    );

    const index = prenotazioni.value.findIndex(p => p.id === hotel.selectedPrenotazione);
    if (index !== -1) prenotazioni.value[index] = data;

    alert(`Prenotazione ${hotel.selectedPrenotazione} aggiornata con successo!\nCosto: ${formatCurrency(costoTotale, hotel.currencySelected || 'EUR')}`);
  } catch (err) {
    console.error('Errore conferma prenotazione', err);
    alert('Errore durante l\'aggiornamento della prenotazione.');
  }
}

// ---------- Mostra immagine hotel ----------
function mostraImmagine(hotel) {
  hotel.showImage = true;
}

// ---------- Mounted ----------
onMounted(async () => {
  initMap();
  await loadTrasferte();
});
</script>

<style scoped>
#map { width: 100%; height: 500px; margin-top: 20px; }
.custom-marker { text-align: center; }
</style>
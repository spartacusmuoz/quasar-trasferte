import { defineStore, acceptHMRUpdate } from 'pinia'

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    hotelSelezionato: null,  // qui salviamo l'hotel scelto
  }),

  actions: {
    setHotel(hotel) {
      this.hotelSelezionato = hotel
    },
    clearHotel() {
      this.hotelSelezionato = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHotelStore, import.meta.hot))
}

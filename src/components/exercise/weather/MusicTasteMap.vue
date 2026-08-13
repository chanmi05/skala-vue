<script setup>
import { ref } from 'vue'
import KoreaTasteMap from './KoreaTasteMap.vue'
import WorldTasteMap from './WorldTasteMap.vue'

defineProps({
  cities: { type: Array, default: () => [] },
  selectedCityId: { type: String, default: '' },
})

const emit = defineEmits(['select-city'])
const mapMode = ref('world')

const enterKorea = (city) => {
  emit('select-city', city)
  mapMode.value = 'korea'
}
</script>

<template>
  <Transition name="map-zoom" mode="out-in">
    <WorldTasteMap
      v-if="mapMode === 'world'"
      key="world"
      :cities="cities"
      :selected-city-id="selectedCityId"
      @select-city="emit('select-city', $event)"
      @enter-korea="enterKorea"
    />
    <KoreaTasteMap
      v-else
      key="korea"
      :cities="cities"
      :selected-city-id="selectedCityId"
      @select-city="emit('select-city', $event)"
      @back-world="mapMode = 'world'"
    />
  </Transition>
</template>

<style scoped>
.map-zoom-enter-active,
.map-zoom-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.map-zoom-enter-from {
  opacity: 0;
  transform: scale(1.04);
}

.map-zoom-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .map-zoom-enter-active,
  .map-zoom-leave-active {
    transition: none;
  }
}
</style>

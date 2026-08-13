<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import { KOREA_MAP_CITIES } from './tasteMapCities'

const props = defineProps({
  cities: { type: Array, default: () => [] },
  selectedCityId: { type: String, default: '' },
})

const emit = defineEmits(['select-city', 'back-world'])

const mapCities = computed(() =>
  props.cities
    .filter((city) => KOREA_MAP_CITIES[city.id])
    .map((city) => ({ ...city, ...KOREA_MAP_CITIES[city.id] })),
)
</script>

<template>
  <div class="korea-canvas">
    <div class="map-copy">
      <span>KOREA LISTENING MAP</span>
      <strong>국내 도시별 음악 취향</strong>
    </div>
    <Button
      label="세계지도로"
      icon="pi pi-arrow-left"
      size="small"
      severity="secondary"
      rounded
      outlined
      class="back-button"
      @click="emit('back-world')"
    />

    <svg viewBox="0 0 500 520" role="img" aria-label="음악 취향 대한민국 지도">
      <path
        class="korea-shape"
        d="M226 31 278 47l34 43 35 38-14 50 30 40-18 50 23 49-18 60-45 22-28 58-54 1-43-45-47-19-13-58 33-45-15-54 35-46-5-56 35-32Z"
      />
      <path class="jeju-shape" d="m176 454 63-13 46 16-22 25-68 5-32-15Z" />

      <g
        v-for="city in mapCities"
        :key="city.id"
        class="marker"
        :class="{ selected: city.id === selectedCityId, active: city.likeCount > 0 }"
        :transform="`translate(${city.x} ${city.y})`"
        tabindex="0"
        role="button"
        :aria-label="`${city.name}, 좋아요 ${city.likeCount}곡`"
        @click="emit('select-city', city)"
        @keydown.enter="emit('select-city', city)"
        @keydown.space.prevent="emit('select-city', city)"
      >
        <circle class="marker-halo" :r="city.likeCount > 0 ? 13 : 10" />
        <circle class="marker-core" r="4" />
        <text :x="city.x > 300 ? -14 : 14" y="4" :text-anchor="city.x > 300 ? 'end' : 'start'">
          {{ city.name }}
        </text>
      </g>
    </svg>

    <div class="korea-count">국내 {{ mapCities.length }}개 도시 · 좋아요 {{ mapCities.reduce((sum, city) => sum + city.likeCount, 0) }}곡</div>
  </div>
</template>

<style scoped>
.korea-canvas {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  border-radius: 25px;
  color: #eef0f7;
  background:
    radial-gradient(circle at 50% 45%, rgba(103, 221, 186, 0.13), transparent 35%),
    radial-gradient(circle at 15% 20%, rgba(126, 89, 238, 0.18), transparent 28%),
    #10131c;
}

.map-copy {
  position: absolute;
  z-index: 2;
  top: 25px;
  left: 28px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-copy span { color: #67ddba; font-size: 0.62rem; font-weight: 900; letter-spacing: 0.16em; }
.map-copy strong { font-size: 0.9rem; }
.back-button { position: absolute; z-index: 2; top: 24px; right: 25px; color: #fff; }

svg { width: 100%; height: 560px; display: block; }
.korea-shape,
.jeju-shape { fill: #252b39; stroke: #3b4557; stroke-width: 2; }
.jeju-shape { fill: #2a3040; }
.marker { cursor: pointer; outline: none; }
.marker-halo { fill: rgba(126, 135, 154, 0.16); stroke: rgba(255, 255, 255, 0.17); }
.marker-core { fill: #798394; }
.marker text { fill: #abb2bf; font-size: 10px; font-weight: 700; }
.marker.active .marker-halo { fill: rgba(103, 221, 186, 0.18); stroke: #67ddba; }
.marker.active .marker-core { fill: #67ddba; }
.marker.active text { fill: #fff; }
.marker.selected .marker-halo { fill: rgba(169, 145, 255, 0.32); stroke: #a991ff; stroke-width: 2; }
.marker:hover .marker-core,
.marker:focus .marker-core { fill: #fff; }

.korea-count {
  position: absolute;
  left: 28px;
  bottom: 22px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.67rem;
}
</style>

<script setup>
import { computed } from 'vue'
import { WORLD_MAP_CITIES } from './tasteMapCities'

const props = defineProps({
  cities: { type: Array, default: () => [] },
  selectedCityId: { type: String, default: '' },
})

const emit = defineEmits(['select-city', 'enter-korea'])

const mapCities = computed(() =>
  props.cities
    .filter((city) => WORLD_MAP_CITIES[city.id])
    .map((city) => ({ ...city, ...WORLD_MAP_CITIES[city.id] })),
)

const selectCity = (city) => {
  if (city.country === 'KR') emit('enter-korea', city)
  else emit('select-city', city)
}
</script>

<template>
  <div class="map-canvas world-canvas">
    <div class="map-copy">
      <span>WORLD LISTENING MAP</span>
      <strong>좋아요를 남긴 도시를 눌러보세요</strong>
    </div>

    <svg viewBox="0 0 1000 500" role="img" aria-label="음악 취향 세계지도">
      <g class="continents">
        <path d="M70 102 119 72l84 6 51 32 35 5 26 37-30 26-7 52-35 34-47-12-23-51-46-22-43-34Z" />
        <path d="m257 270 54 18 42 48-14 45-21 55-29-34-20-64-25-38Z" />
        <path d="m425 108 55-24 61 15 34 28 66-14 96 33 85 12 81 60-34 42-77 8-49-24-51 12-39-30-66 17-25 53-44-10-21-59-43-20-19-44Z" />
        <path d="m477 237 80-7 54 36 7 59-37 75-57-27-28-69-39-28Z" />
        <path d="m784 347 76-12 65 36-20 50-78 10-50-38Z" />
        <path d="m883 432 22-11 18 13-17 13Z" />
      </g>

      <g class="map-lines" aria-hidden="true">
        <path d="M205 182 Q480 48 770 188" />
        <path d="M470 166 Q620 118 804 198" />
        <path d="M315 373 Q555 478 830 388" />
      </g>

      <g
        v-for="city in mapCities"
        :key="city.id"
        class="marker"
        :class="{ selected: city.id === selectedCityId, active: city.likeCount > 0 }"
        :transform="`translate(${city.x} ${city.y})`"
        tabindex="0"
        role="button"
        :aria-label="`${city.name}, 좋아요 ${city.likeCount}곡${city.country === 'KR' ? ', 대한민국 지도 열기' : ''}`"
        @click="selectCity(city)"
        @keydown.enter="selectCity(city)"
        @keydown.space.prevent="selectCity(city)"
      >
        <circle class="marker-halo" :r="city.likeCount > 0 ? 16 : 12" />
        <circle class="marker-core" r="5" />
        <text y="-21" text-anchor="middle">{{ city.name }}</text>
        <text v-if="city.likeCount" y="27" text-anchor="middle" class="like-count">
          ♥ {{ city.likeCount }}
        </text>
      </g>
    </svg>

    <div class="map-hint"><span></span> 마커가 밝을수록 좋아요 기록이 있어요</div>
  </div>
</template>

<style scoped>
.map-canvas {
  position: relative;
  min-height: 560px;
  overflow: hidden;
  border-radius: 25px;
  color: #eef0f7;
  background:
    radial-gradient(circle at 70% 35%, rgba(103, 221, 186, 0.1), transparent 22%),
    radial-gradient(circle at 18% 15%, rgba(126, 89, 238, 0.16), transparent 30%),
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
  pointer-events: none;
}

.map-copy span {
  color: #67ddba;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.map-copy strong { font-size: 0.9rem; }

svg {
  width: 100%;
  min-height: 560px;
  display: block;
}

.continents path {
  fill: #242a38;
  stroke: #353d4d;
  stroke-width: 2;
  transition: fill 0.2s ease;
}

.map-lines path {
  fill: none;
  stroke: rgba(103, 221, 186, 0.17);
  stroke-width: 1.5;
  stroke-dasharray: 5 8;
}

.marker { cursor: pointer; outline: none; }
.marker-halo { fill: rgba(126, 135, 154, 0.15); stroke: rgba(255, 255, 255, 0.2); }
.marker-core { fill: #7c8596; }
.marker text { fill: #aeb4c1; font-size: 12px; font-weight: 700; }
.marker .like-count { fill: #ff789c; font-size: 10px; }
.marker.active .marker-halo { fill: rgba(103, 221, 186, 0.16); stroke: rgba(103, 221, 186, 0.62); animation: marker-pulse 2s ease-out infinite; }
.marker.active .marker-core { fill: #67ddba; }
.marker.active text { fill: #f7f8fb; }
.marker.selected .marker-halo { fill: rgba(126, 89, 238, 0.3); stroke: #a991ff; stroke-width: 2; }
.marker:hover .marker-core,
.marker:focus .marker-core { fill: #fff; }

.map-hint {
  position: absolute;
  left: 28px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.67rem;
}

.map-hint span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #67ddba;
  box-shadow: 0 0 0 5px rgba(103, 221, 186, 0.12);
}

@keyframes marker-pulse {
  70% { stroke-width: 8; stroke-opacity: 0; }
  100% { stroke-width: 1; stroke-opacity: 1; }
}

@media (max-width: 700px) {
  .map-canvas,
  svg { min-height: 420px; }
  .map-copy { top: 18px; left: 18px; }
  .map-hint { left: 18px; bottom: 16px; }
}
</style>

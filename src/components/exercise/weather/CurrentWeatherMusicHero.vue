<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { searchITunesTracks } from '../../../api/iTunesApi'
import { useConfigStore } from '../../../stores/configStore'
import { getForecastMusicProfile } from './forecastMusic'
import { getWeatherIcon } from './weatherIcons'

const props = defineProps({
  city: { type: Object, required: true },
  weatherLoading: { type: Boolean, default: false },
})

const configStore = useConfigStore()
const recommendedTracks = ref([])
const activeTrackIndex = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const activeTrack = computed(() => recommendedTracks.value[activeTrackIndex.value] ?? null)
const currentWeather = computed(() => {
  const now = new Date()
  return {
    ...props.city,
    feelsLike: props.city.feelsLike ?? props.city.temp,
    description: props.city.description ?? props.city.status,
    dayLabel:
      props.city.dayLabel ??
      now.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }),
    timeLabel:
      props.city.timeLabel ??
      now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    localHour: props.city.localHour ?? now.getHours(),
    pressure: props.city.pressure ?? null,
    cloudiness: props.city.cloudiness ?? null,
    visibilityKm: props.city.visibilityKm ?? null,
    precipitationVolume: props.city.precipitationVolume ?? 0,
  }
})
const musicProfile = computed(() => getForecastMusicProfile(currentWeather.value))
const weatherIcon = computed(() => getWeatherIcon(currentWeather.value.status))

const dateLabel = computed(() => {
  return `${currentWeather.value.dayLabel} ${currentWeather.value.timeLabel}`
})

let requestController = null

const loadWeatherMusic = async () => {
  requestController?.abort()
  const controller = new AbortController()
  requestController = controller
  isLoading.value = true
  errorMessage.value = ''

  try {
    const profile = getForecastMusicProfile(currentWeather.value)
    recommendedTracks.value = await searchITunesTracks(profile.query, {
      limit: 5,
      signal: controller.signal,
    })
    activeTrackIndex.value = 0

    if (!recommendedTracks.value.length) {
      errorMessage.value = '현재 날씨에 맞는 음악을 찾지 못했어요.'
    }
  } catch (error) {
    if (error.code !== 'ERR_CANCELED') {
      errorMessage.value = '날씨와 음악 추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
      console.error('[CurrentWeatherMusicHero] 추천 로딩 실패:', error)
    }
  } finally {
    if (!controller.signal.aborted) isLoading.value = false
  }
}

const showNextTrack = () => {
  if (!recommendedTracks.value.length) return
  activeTrackIndex.value = (activeTrackIndex.value + 1) % recommendedTracks.value.length
}

watch(
  () => [props.city.id, props.city.status, props.city.localHour, props.weatherLoading],
  () => {
    if (!props.weatherLoading) loadWeatherMusic()
  },
  { immediate: true },
)

onBeforeUnmount(() => requestController?.abort())
</script>

<template>
  <section class="music-hero" aria-labelledby="weather-music-title">
    <div class="hero-glow hero-glow-one"></div>
    <div class="hero-glow hero-glow-two"></div>

    <div v-if="weatherLoading || isLoading" class="hero-state">
      <ProgressSpinner strokeWidth="5" aria-label="날씨 음악 추천 불러오는 중" />
      <strong>{{ city.name }}의 날씨와 음악을 고르는 중이에요.</strong>
      <span>Current Weather Data → 추천 문맥 생성 → iTunes Search</span>
    </div>

    <div v-else-if="errorMessage" class="hero-state hero-error">
      <Message severity="warn" :closable="false">{{ errorMessage }}</Message>
      <Button label="다시 추천받기" icon="pi pi-refresh" rounded @click="loadWeatherMusic" />
    </div>

    <template v-else-if="activeTrack">
      <div class="music-side">
        <div class="hero-kicker">
          <span class="live-dot"></span>
          NOW PLAYING FOR THE WEATHER
        </div>

        <div class="vinyl-stage">
          <div class="vinyl-shadow"></div>
          <div class="vinyl-record">
            <div class="vinyl-ring ring-one"></div>
            <div class="vinyl-ring ring-two"></div>
            <img :src="activeTrack.artworkUrl" :alt="`${activeTrack.album} 앨범 표지`" />
            <span class="vinyl-hole"></span>
          </div>
          <div class="tonearm" aria-hidden="true">
            <span class="tonearm-pivot"></span>
            <span class="tonearm-bar"></span>
            <span class="tonearm-needle"></span>
          </div>
        </div>

        <div class="track-meta">
          <span class="recommendation-label">오늘의 첫 곡</span>
          <h1 id="weather-music-title">{{ activeTrack.title }}</h1>
          <p>{{ activeTrack.artist }} · {{ activeTrack.album }}</p>

          <div class="track-actions">
            <audio
              v-if="activeTrack.previewUrl"
              :key="activeTrack.id"
              :src="activeTrack.previewUrl"
              controls
              preload="none"
            ></audio>
            <Button
              icon="pi pi-forward"
              label="다른 곡"
              severity="contrast"
              rounded
              outlined
              @click="showNextTrack"
            />
            <Button
              as="a"
              :href="activeTrack.storeUrl"
              target="_blank"
              rel="noopener noreferrer"
              icon="pi pi-external-link"
              label="iTunes"
              rounded
              text
            />
          </div>
        </div>
      </div>

      <div class="weather-side">
        <div class="weather-topline">
          <div>
            <span class="weather-caption">CURRENT WEATHER DATA</span>
            <strong>{{ dateLabel }}</strong>
          </div>
          <Tag :value="`${musicProfile.timePeriod.icon} ${musicProfile.timePeriod.label}`" rounded />
        </div>

        <div class="city-weather">
          <div>
            <span class="city-name">{{ city.name }}</span>
            <p>{{ currentWeather.description }}</p>
          </div>
          <span class="weather-symbol">{{ weatherIcon }}</span>
        </div>

        <div class="temperature-row">
          <strong>
            {{ configStore.toDisplayTemp(currentWeather.temp) }}<small>{{ configStore.unitSymbol }}</small>
          </strong>
          <div>
            <span>{{ currentWeather.status }}</span>
            <small>
              체감 {{ configStore.toDisplayTemp(currentWeather.feelsLike) }}{{ configStore.unitSymbol }}
            </small>
          </div>
        </div>

        <div class="weather-metrics">
          <div class="metric">
            <span class="metric-icon">💧</span>
            <small>습도</small>
            <strong>{{ currentWeather.humidity }}%</strong>
          </div>
          <div class="metric">
            <span class="metric-icon">🌧️</span>
            <small>최근 강수량</small>
            <strong>{{ currentWeather.precipitationVolume }}mm</strong>
          </div>
          <div class="metric">
            <span class="metric-icon">☁️</span>
            <small>구름</small>
            <strong>
              {{ currentWeather.cloudiness ?? '-'
              }}{{ currentWeather.cloudiness === null ? '' : '%' }}
            </strong>
          </div>
          <div class="metric">
            <span class="metric-icon">💨</span>
            <small>풍속</small>
            <strong>{{ currentWeather.windSpeed }}m/s</strong>
          </div>
          <div class="metric">
            <span class="metric-icon">◴</span>
            <small>기압</small>
            <strong>
              {{ currentWeather.pressure ?? '-'
              }}{{ currentWeather.pressure === null ? '' : 'hPa' }}
            </strong>
          </div>
          <div class="metric">
            <span class="metric-icon">👁️</span>
            <small>가시거리</small>
            <strong>
              {{ currentWeather.visibilityKm ?? '-'
              }}{{ currentWeather.visibilityKm === null ? '' : 'km' }}
            </strong>
          </div>
        </div>

        <div class="weather-reason">
          <span class="reason-icon">✦</span>
          <div>
            <small>이 곡을 고른 이유</small>
            <strong>{{ musicProfile.title }}</strong>
            <p>{{ musicProfile.description }}</p>
          </div>
        </div>

        <div class="playlist-dots" aria-label="추천 곡 목록">
          <button
            v-for="(track, index) in recommendedTracks"
            :key="track.id"
            type="button"
            :class="{ active: index === activeTrackIndex }"
            :aria-label="`${track.title} 선택`"
            :aria-pressed="index === activeTrackIndex"
            @click="activeTrackIndex = index"
          ></button>
          <span>{{ activeTrackIndex + 1 }} / {{ recommendedTracks.length }}</span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.music-hero {
  position: relative;
  isolation: isolate;
  min-height: 570px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
  overflow: hidden;
  border-radius: 32px;
  color: #f8f6ef;
  background:
    linear-gradient(125deg, rgba(4, 7, 18, 0.98) 0%, rgba(14, 20, 37, 0.96) 54%, rgba(26, 35, 48, 0.94) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 80px rgba(4, 10, 22, 0.3);
}

.hero-glow {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.72;
}

.hero-glow-one {
  width: 420px;
  height: 420px;
  left: -170px;
  top: -150px;
  background: rgba(133, 86, 255, 0.28);
}

.hero-glow-two {
  width: 360px;
  height: 360px;
  right: -100px;
  bottom: -170px;
  background: rgba(50, 210, 172, 0.2);
}

.music-side,
.weather-side {
  min-width: 0;
  padding: 42px 46px;
}

.music-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid rgba(255, 255, 255, 0.09);
}

.hero-kicker {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff4d78;
  box-shadow: 0 0 0 5px rgba(255, 77, 120, 0.14);
  animation: live-pulse 1.8s ease-out infinite;
}

.vinyl-stage {
  position: relative;
  width: min(330px, 88%);
  aspect-ratio: 1;
  margin: 22px auto 10px;
}

.vinyl-shadow {
  position: absolute;
  inset: 16% 3% 2% 12%;
  border-radius: 50%;
  background: #000;
  filter: blur(24px);
  opacity: 0.58;
  transform: translateY(24px);
}

.vinyl-record {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle, transparent 0 4px, rgba(255, 255, 255, 0.045) 5px 6px),
    radial-gradient(circle at 45% 42%, #313440 0%, #101116 35%, #050506 75%);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.07),
    inset 0 0 45px rgba(255, 255, 255, 0.05);
  animation: vinyl-spin 14s linear infinite;
}

.vinyl-record img {
  width: 42%;
  height: 42%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 0 0 5px #08090c;
}

.vinyl-ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.ring-one { inset: 12%; }
.ring-two { inset: 23%; }

.vinyl-hole {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f4f1e8;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.72);
}

.tonearm {
  position: absolute;
  width: 42%;
  height: 72%;
  right: -10%;
  top: -1%;
  transform: rotate(4deg);
  transform-origin: 82% 12%;
}

.tonearm-pivot {
  position: absolute;
  right: 0;
  top: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(145deg, #e8e5dc, #777b84);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.45);
}

.tonearm-bar {
  position: absolute;
  right: 18px;
  top: 24px;
  width: 8px;
  height: 74%;
  border-radius: 999px;
  background: linear-gradient(90deg, #777c84, #e9e7e1 48%, #737780);
  transform: rotate(24deg);
  transform-origin: top;
}

.tonearm-needle {
  position: absolute;
  left: 28px;
  bottom: 2px;
  width: 28px;
  height: 18px;
  border-radius: 5px 10px 4px 4px;
  background: #d1d2d4;
  transform: rotate(24deg);
}

.track-meta {
  width: 100%;
}

.recommendation-label,
.weather-caption {
  color: #67ddba;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.track-meta h1 {
  margin: 6px 0 3px;
  max-width: 520px;
  overflow: hidden;
  color: #fff;
  font-size: clamp(1.55rem, 3vw, 2.4rem);
  line-height: 1.12;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-meta > p {
  margin: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.88rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.track-actions audio {
  width: min(260px, 100%);
  height: 36px;
  filter: invert(0.88) hue-rotate(180deg);
}

.track-actions :deep(.p-button) {
  color: #fff;
}

.weather-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.weather-topline,
.city-weather,
.temperature-row,
.playlist-dots {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.weather-topline {
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.weather-topline strong {
  display: block;
  margin-top: 5px;
  font-size: 0.92rem;
}

.weather-topline :deep(.p-tag) {
  background: rgba(103, 221, 186, 0.13);
  color: #8aebce;
}

.city-weather {
  margin-top: 28px;
}

.city-name {
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  font-weight: 800;
}

.city-weather p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.84rem;
}

.weather-symbol {
  font-size: 4.4rem;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.28));
}

.temperature-row {
  justify-content: flex-start;
  margin: 5px 0 26px;
}

.temperature-row > strong {
  font-size: clamp(3.8rem, 7vw, 5.8rem);
  font-weight: 300;
  letter-spacing: -0.08em;
  line-height: 1;
}

.temperature-row > strong small {
  margin-left: 4px;
  color: #67ddba;
  font-size: 1.45rem;
  font-weight: 700;
  vertical-align: top;
  letter-spacing: 0;
}

.temperature-row > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 18px;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
}

.temperature-row span { font-weight: 800; }
.temperature-row small { color: rgba(255, 255, 255, 0.5); }

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.metric {
  min-width: 0;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.065);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-align: center;
}

.metric-icon { font-size: 1.05rem; }
.metric small { color: rgba(255, 255, 255, 0.48); font-size: 0.64rem; }
.metric strong { font-size: 0.78rem; white-space: nowrap; }

.weather-reason {
  display: flex;
  gap: 13px;
  margin-top: 18px;
  padding: 15px 17px;
  border-radius: 15px;
  background: linear-gradient(120deg, rgba(103, 221, 186, 0.12), rgba(130, 96, 255, 0.1));
}

.reason-icon {
  color: #67ddba;
  font-size: 1.25rem;
}

.weather-reason small,
.weather-reason strong {
  display: block;
}

.weather-reason small { color: rgba(255, 255, 255, 0.46); font-size: 0.65rem; }
.weather-reason strong { margin-top: 2px; font-size: 0.84rem; }
.weather-reason p { margin: 3px 0 0; color: rgba(255, 255, 255, 0.54); font-size: 0.75rem; }

.playlist-dots {
  justify-content: flex-start;
  margin-top: 19px;
}

.playlist-dots button {
  width: 20px;
  height: 4px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;
}

.playlist-dots button.active {
  width: 42px;
  background: #67ddba;
}

.playlist-dots span {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.38);
  font-size: 0.68rem;
}

.hero-state {
  grid-column: 1 / -1;
  min-height: 570px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.72);
}

.hero-state :deep(.p-progressspinner) { width: 50px; height: 50px; }
.hero-state > span { color: rgba(255, 255, 255, 0.4); font-size: 0.76rem; }
.hero-error :deep(.p-message) { max-width: 560px; }

@keyframes vinyl-spin {
  to { transform: rotate(360deg); }
}

@keyframes live-pulse {
  70% { box-shadow: 0 0 0 11px rgba(255, 77, 120, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 77, 120, 0); }
}

@media (max-width: 940px) {
  .music-hero {
    grid-template-columns: 1fr;
  }

  .music-side {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  }

  .vinyl-stage { width: min(350px, 80%); }
}

@media (max-width: 600px) {
  .music-hero { border-radius: 24px; }
  .music-side, .weather-side { padding: 30px 22px; }
  .track-actions { flex-wrap: wrap; }
  .track-actions audio { flex-basis: 100%; }
  .weather-metrics { grid-template-columns: repeat(2, 1fr); }
  .vinyl-stage { width: 88%; }
  .tonearm { right: -5%; }
}

@media (prefers-reduced-motion: reduce) {
  .vinyl-record,
  .live-dot {
    animation: none;
  }
}
</style>

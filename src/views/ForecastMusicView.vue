<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import { fetchCityForecast } from '../api/openWeatherApi'
import { getForecastMusicProfile } from '../components/exercise/weather/forecastMusic'
import { getWeatherIcon, getWeatherTheme } from '../components/exercise/weather/weatherIcons'
import { useConfigStore } from '../stores/configStore'
import { useMusicStore } from '../stores/musicStore'
import { getCityCoordinates, weatherList } from '../stores/weatherStore'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const configStore = useConfigStore()
const musicStore = useMusicStore()

const selectedCity = computed(() => {
  const found = weatherList.value.find((city) => city.id === route.params.cityId)
  return found ?? weatherList.value[0]
})

const cityGroups = computed(() => [
  {
    label: '🇰🇷 국내 도시',
    cities: weatherList.value.filter((city) => city.country === 'KR'),
  },
  {
    label: '🌍 해외 도시',
    cities: weatherList.value.filter((city) => city.country !== 'KR'),
  },
])

const selectedCityId = computed({
  get: () => selectedCity.value.id,
  set: (cityId) => router.push(`/forecast-music/${cityId}`),
})

const forecastItems = ref([])
const forecastCity = ref(null)
const selectedDayKey = ref('')
const selectedForecastId = ref('')
const isForecastLoading = ref(false)
const forecastError = ref('')

const dayOptions = computed(() => {
  const uniqueDays = new Map()
  forecastItems.value.forEach((item) => {
    if (!uniqueDays.has(item.dayKey)) uniqueDays.set(item.dayKey, item.dayLabel)
  })
  return [...uniqueDays].map(([value, label]) => ({ value, label }))
})

const dayForecasts = computed(() =>
  forecastItems.value.filter((item) => item.dayKey === selectedDayKey.value),
)

const selectedForecast = computed(
  () =>
    forecastItems.value.find((item) => item.id === selectedForecastId.value) ??
    dayForecasts.value[0] ??
    null,
)

const musicProfile = computed(() => getForecastMusicProfile(selectedForecast.value))
const pageTheme = computed(() =>
  getWeatherTheme(selectedForecast.value?.status ?? selectedCity.value.status),
)
const selectedWeatherIcon = computed(() =>
  getWeatherIcon(selectedForecast.value?.status ?? selectedCity.value.status),
)

let forecastController = null

const loadForecast = async () => {
  const coordinates = getCityCoordinates(selectedCity.value.id)
  if (!coordinates) {
    forecastError.value = '선택한 도시의 좌표를 찾지 못했어요.'
    return
  }

  forecastController?.abort()
  const controller = new AbortController()
  forecastController = controller
  isForecastLoading.value = true
  forecastError.value = ''

  try {
    const result = await fetchCityForecast(coordinates, { signal: controller.signal })
    forecastCity.value = result.city
    forecastItems.value = result.items
    selectedDayKey.value = result.items[0]?.dayKey ?? ''
    selectedForecastId.value = result.items[0]?.id ?? ''
  } catch (error) {
    if (error.code !== 'ERR_CANCELED') {
      forecastError.value = '5일 예보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
      console.error('[loadForecast] 5 Day / 3 Hour Forecast API 호출 실패:', error)
    }
  } finally {
    if (!controller.signal.aborted) isForecastLoading.value = false
  }
}

watch(
  () => selectedCity.value.id,
  () => loadForecast(),
  { immediate: true },
)

// 날짜를 바꾸면 그 날짜의 첫 3시간 예보를 자동 선택한다.
watch(selectedDayKey, () => {
  if (!dayForecasts.value.some((item) => item.id === selectedForecastId.value)) {
    selectedForecastId.value = dayForecasts.value[0]?.id ?? ''
  }
})

// 선택한 예보가 바뀔 때마다 날씨 + 현지 시간대 검색어로 iTunes를 다시 조회한다.
watch(
  () => selectedForecast.value?.id,
  () => {
    if (musicProfile.value) musicStore.searchTracks(musicProfile.value.query)
  },
)

const toggleLike = (track) => {
  const wasLiked = musicStore.isLiked(track)
  const forecast = selectedForecast.value

  musicStore.toggleLike(track, {
    status: forecast.status,
    cityId: selectedCity.value.id,
    cityName: selectedCity.value.name,
    temp: forecast.temp,
    forecastAt: forecast.localDateTime,
    timePeriod: musicProfile.value.timePeriod.label,
  })

  toast.add({
    severity: wasLiked ? 'secondary' : 'success',
    summary: wasLiked ? '좋아요 취소' : '시간대 취향 저장',
    detail: `${track.title} · ${forecast.dayLabel} ${forecast.timeLabel}`,
    life: 1800,
  })
}

onBeforeUnmount(() => forecastController?.abort())
</script>

<template>
  <div class="weather-page" :class="pageTheme">
    <main class="forecast-music-page">
      <header class="hero-banner forecast-hero">
        <div class="hero-quote-card">
          <span class="hero-label">5 DAY / 3 HOUR FORECAST</span>
          <div class="hero-icon">{{ selectedWeatherIcon }}🎧</div>
          <h1 class="hero-title">시간대별 날씨 음악</h1>
          <p class="hero-description">
            앞으로 5일의 3시간 예보를 골라 그 순간에 어울리는 음악을 들어보세요.
          </p>
        </div>
      </header>

      <section class="forecast-controls" aria-labelledby="forecast-control-title">
        <div>
          <span class="section-eyebrow">추천 지역</span>
          <h2 id="forecast-control-title">{{ selectedCity.name }}의 시간대별 예보</h2>
          <p>도시의 현지 시각을 기준으로 추천해요.</p>
        </div>

        <Select
          v-model="selectedCityId"
          :options="cityGroups"
          optionLabel="name"
          optionValue="id"
          optionGroupLabel="label"
          optionGroupChildren="cities"
          filter
          filterPlaceholder="도시 이름 검색"
          class="city-select"
          aria-label="예보를 확인할 도시 선택"
        >
          <template #value>
            <span>{{ getWeatherIcon(selectedCity.status) }} {{ selectedCity.name }}</span>
          </template>
          <template #option="slotProps">
            <div class="city-option">
              <span>{{ getWeatherIcon(slotProps.option.status) }}</span>
              <strong>{{ slotProps.option.name }}</strong>
              <small>{{ slotProps.option.country }}</small>
            </div>
          </template>
          <template #optiongroup="slotProps">
            <strong>{{ slotProps.option.label }}</strong>
          </template>
        </Select>
      </section>

      <div v-if="isForecastLoading" class="state-panel">
        <ProgressSpinner strokeWidth="5" aria-label="5일 예보 불러오는 중" />
        <p>OpenWeatherMap에서 {{ selectedCity.name }} 예보를 가져오고 있어요.</p>
      </div>

      <Message v-else-if="forecastError" severity="warn" :closable="false" class="forecast-message">
        <div class="error-content">
          <span>{{ forecastError }}</span>
          <Button label="다시 시도" icon="pi pi-refresh" size="small" @click="loadForecast" />
        </div>
      </Message>

      <template v-else-if="forecastItems.length">
        <section class="forecast-picker">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">STEP 1</span>
              <h2>날짜와 시간을 선택하세요</h2>
            </div>
            <Tag :value="`${forecastItems.length}개 예보`" severity="secondary" rounded />
          </div>

          <SelectButton
            v-model="selectedDayKey"
            :options="dayOptions"
            optionLabel="label"
            optionValue="value"
            :allowEmpty="false"
            class="day-selector"
            aria-label="예보 날짜 선택"
          />

          <div class="time-grid">
            <button
              v-for="forecast in dayForecasts"
              :key="forecast.id"
              type="button"
              class="time-card"
              :class="{ selected: forecast.id === selectedForecast?.id }"
              :aria-pressed="forecast.id === selectedForecast?.id"
              @click="selectedForecastId = forecast.id"
            >
              <strong>{{ forecast.timeLabel }}</strong>
              <span class="time-icon">{{ getWeatherIcon(forecast.status) }}</span>
              <span class="time-temp">
                {{ configStore.toDisplayTemp(forecast.temp) }}{{ configStore.unitSymbol }}
              </span>
              <small>{{ forecast.status }} · 강수 {{ forecast.precipitationProbability }}%</small>
            </button>
          </div>
        </section>

        <section v-if="selectedForecast && musicProfile" class="recommendation-panel">
          <div
            class="forecast-summary"
            :style="{ '--forecast-accent': musicProfile.accentColor }"
          >
            <div class="summary-weather-icon">{{ getWeatherIcon(selectedForecast.status) }}</div>
            <div class="summary-copy">
              <span class="section-eyebrow">STEP 2 · 선택한 예보</span>
              <h2>
                {{ selectedCity.name }} · {{ selectedForecast.dayLabel }}
                {{ selectedForecast.timeLabel }}
              </h2>
              <p>{{ selectedForecast.description }} · 체감 {{ configStore.toDisplayTemp(selectedForecast.feelsLike) }}{{ configStore.unitSymbol }}</p>
              <div class="weather-metrics">
                <span>🌡️ {{ configStore.toDisplayTemp(selectedForecast.temp) }}{{ configStore.unitSymbol }}</span>
                <span>💧 습도 {{ selectedForecast.humidity }}%</span>
                <span>☔ 강수 {{ selectedForecast.precipitationProbability }}%</span>
                <span>💨 {{ selectedForecast.windSpeed }}m/s</span>
              </div>
            </div>
            <div class="time-mood">
              <span>{{ musicProfile.timePeriod.icon }}</span>
              <strong>{{ musicProfile.timePeriod.label }}</strong>
            </div>
          </div>

          <div class="music-result-card">
            <div class="section-heading music-heading">
              <div>
                <span class="section-eyebrow">STEP 3 · iTunes 추천</span>
                <h2>{{ musicProfile.title }}</h2>
                <p>{{ musicProfile.description }}</p>
              </div>
              <Tag :value="musicProfile.query" icon="pi pi-sparkles" severity="success" rounded />
            </div>

            <div v-if="musicStore.isLoading" class="state-panel compact">
              <ProgressSpinner strokeWidth="5" aria-label="추천 음악 검색 중" />
              <p>iTunes에서 시간대에 맞는 음악을 찾고 있어요.</p>
            </div>

            <Message
              v-else-if="musicStore.errorMessage"
              severity="warn"
              :closable="false"
              class="forecast-message"
            >
              {{ musicStore.errorMessage }}
            </Message>

            <ol v-else class="forecast-track-list">
              <li v-for="(track, index) in musicStore.tracks" :key="track.id" class="forecast-track">
                <span class="track-number">{{ String(index + 1).padStart(2, '0') }}</span>
                <img :src="track.artworkUrl" :alt="`${track.album} 앨범 표지`" />
                <div class="track-copy">
                  <strong>{{ track.title }}</strong>
                  <span>{{ track.artist }} · {{ track.genre }}</span>
                </div>
                <audio v-if="track.previewUrl" :src="track.previewUrl" controls preload="none"></audio>
                <span v-else class="no-preview">미리듣기 없음</span>
                <button
                  type="button"
                  class="like-button"
                  :class="{ liked: musicStore.isLiked(track) }"
                  :aria-label="`${track.title} 좋아요`"
                  @click="toggleLike(track)"
                >
                  {{ musicStore.isLiked(track) ? '♥' : '♡' }}
                </button>
              </li>
            </ol>

            <p class="api-credit">
              날씨·시간은 OpenWeatherMap, 음악과 미리듣기는 iTunes에서 제공됩니다.
            </p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.forecast-music-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.forecast-hero {
  padding-bottom: 28px;
}

.hero-description {
  max-width: 470px;
  margin: 0 auto;
  color: #5f6b76;
  line-height: 1.7;
}

.forecast-controls,
.forecast-picker,
.forecast-summary,
.music-result-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.94);
  border-radius: 22px;
  box-shadow: 0 12px 34px rgba(34, 51, 67, 0.09);
}

.forecast-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 24px 28px;
  margin-bottom: 18px;
}

.forecast-controls h2,
.section-heading h2,
.summary-copy h2 {
  margin: 4px 0 6px;
  color: #1f2d38;
  font-size: 1.22rem;
}

.forecast-controls p,
.section-heading p,
.summary-copy p {
  margin: 0;
  color: #74808b;
  font-size: 0.88rem;
}

.section-eyebrow {
  color: #1a7f4f;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.city-select {
  width: min(100%, 310px);
}

.city-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.city-option small {
  margin-left: auto;
  color: #98a1aa;
}

.state-panel {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #66727d;
}

.state-panel.compact {
  min-height: 180px;
}

.state-panel :deep(.p-progressspinner) {
  width: 44px;
  height: 44px;
}

.forecast-message {
  margin: 18px 0;
}

.error-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.forecast-picker {
  padding: 28px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.day-selector {
  display: flex;
  width: 100%;
  margin-bottom: 22px;
}

.day-selector :deep(.p-togglebutton) {
  flex: 1;
  min-width: 90px;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.time-card {
  appearance: none;
  border: 1px solid #dfe5e9;
  border-radius: 16px;
  background: #f8fafb;
  color: #35424d;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: 0.18s ease;
}

.time-card:hover {
  transform: translateY(-2px);
  border-color: #78c5a2;
}

.time-card.selected {
  color: #11613c;
  background: #e9f8f0;
  border-color: #42b883;
  box-shadow: 0 6px 16px rgba(26, 127, 79, 0.13);
}

.time-icon {
  font-size: 1.75rem;
}

.time-temp {
  font-size: 1.08rem;
  font-weight: 800;
}

.time-card small {
  font-size: 0.72rem;
  color: #7b8791;
}

.recommendation-panel {
  margin-top: 18px;
  display: grid;
  gap: 18px;
}

.forecast-summary {
  position: relative;
  overflow: hidden;
  padding: 28px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 22px;
}

.forecast-summary::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--forecast-accent);
}

.summary-weather-icon {
  font-size: 3.2rem;
}

.weather-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.weather-metrics span {
  padding: 6px 10px;
  background: #f1f4f6;
  border-radius: 999px;
  color: #53606b;
  font-size: 0.76rem;
  font-weight: 600;
}

.time-mood {
  width: 82px;
  height: 82px;
  border-radius: 20px;
  background: #f6f8f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time-mood span {
  font-size: 1.75rem;
}

.time-mood strong {
  font-size: 0.82rem;
}

.music-result-card {
  padding: 28px;
}

.music-heading :deep(.p-tag) {
  max-width: 330px;
  white-space: normal;
  text-align: right;
}

.forecast-track-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #edf0f2;
}

.forecast-track {
  display: grid;
  grid-template-columns: 34px 52px minmax(160px, 1fr) minmax(210px, 280px) 44px;
  align-items: center;
  gap: 14px;
  padding: 13px 4px;
  border-bottom: 1px solid #edf0f2;
}

.forecast-track img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
}

.track-number {
  color: #a0a8af;
  font-size: 0.76rem;
  font-weight: 700;
}

.track-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-copy strong,
.track-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-copy strong {
  color: #27333d;
  font-size: 0.9rem;
}

.track-copy span,
.no-preview {
  color: #84909a;
  font-size: 0.75rem;
}

.forecast-track audio {
  width: 100%;
  height: 34px;
}

.like-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: #f1f3f5;
  color: #69737d;
  font-size: 1.25rem;
  cursor: pointer;
}

.like-button.liked {
  color: #e64980;
  background: #fff0f6;
}

.api-credit {
  margin: 18px 0 0;
  text-align: right;
  color: #9aa2a9;
  font-size: 0.72rem;
}

@media (max-width: 800px) {
  .forecast-controls,
  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .city-select {
    width: 100%;
  }

  .day-selector {
    overflow-x: auto;
    justify-content: flex-start;
  }

  .day-selector :deep(.p-togglebutton) {
    flex: 0 0 auto;
  }

  .forecast-summary {
    grid-template-columns: auto 1fr;
  }

  .time-mood {
    grid-column: 1 / -1;
    width: 100%;
    height: auto;
    padding: 10px;
    flex-direction: row;
  }

  .forecast-track {
    grid-template-columns: 28px 48px 1fr 40px;
  }

  .forecast-track audio,
  .forecast-track .no-preview {
    grid-column: 2 / -1;
    grid-row: 2;
  }
}

@media (max-width: 520px) {
  .forecast-music-page {
    padding-inline: 14px;
  }

  .forecast-controls,
  .forecast-picker,
  .forecast-summary,
  .music-result-card {
    padding: 20px;
    border-radius: 18px;
  }

  .time-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .forecast-summary {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .weather-metrics {
    justify-content: center;
  }

  .forecast-track {
    grid-template-columns: 44px 1fr 38px;
  }

  .track-number {
    display: none;
  }

  .forecast-track audio,
  .forecast-track .no-preview {
    grid-column: 1 / -1;
  }
}
</style>

<script setup>
// 요구사항과 별개로 추가한 "오늘 날씨에 어울리는 음악 추천" 페이지.
// 날씨별 분위기/디자인은 musicPlaylists에서, 실제 곡 목록은 iTunes Search API에서 가져온다.
// 상세 페이지(WeatherDetailView)처럼 라우트 파라미터로 "지금 어떤 도시 기준인지"를 받는다.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { weatherList } from '../stores/weatherStore'
import { useConfigStore } from '../stores/configStore'
import { useMusicStore } from '../stores/musicStore'
import { getPlaylistFor } from '../components/exercise/weather/musicPlaylists'
import { getWeatherIcon, getWeatherTheme } from '../components/exercise/weather/weatherIcons'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const musicStore = useMusicStore()
const toast = useToast()

// URL에 :cityId가 있으면 그 도시, 없으면 목록의 첫 번째 도시를 기본값으로 사용한다.
const selectedCity = computed(() => {
  const found = weatherList.value.find((item) => item.id === route.params.cityId)
  return found ?? weatherList.value[0]
})

const icon = computed(() => getWeatherIcon(selectedCity.value.status))
const pageTheme = computed(() => getWeatherTheme(selectedCity.value.status))
const playlist = computed(() => getPlaylistFor(selectedCity.value))

// 24개 도시를 긴 가로 목록 대신 국내/해외 그룹으로 나눈다.
// PrimeVue Select의 filter 옵션으로 도시 이름을 바로 검색할 수도 있다.
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
  set: (cityId) => router.push(`/music/${cityId}`),
})

// 날씨 상태를 iTunes 검색어로 바꾸는 프런트엔드 규칙.
// API가 날씨를 이해하는 것은 아니며, 우리 앱이 분위기에 맞는 키워드를 만들어 전달한다.
const WEATHER_SEARCH_TERMS = {
  맑음: 'summer happy pop',
  비: 'rain acoustic',
  구름: 'chill pop',
  눈: 'winter ballad',
  흐림: 'indie chill',
}

const searchQuery = ref('')
const recommendedQuery = computed(
  () => WEATHER_SEARCH_TERMS[selectedCity.value.status] ?? 'chill pop',
)

const searchMusic = () => {
  musicStore.searchTracks(searchQuery.value)
}

// 첫 진입/도시 변경뿐 아니라, 목 날씨가 실제 API 날씨로 교체될 때도 추천어를 갱신한다.
watch(
  () => [selectedCity.value.id, selectedCity.value.status],
  () => {
    searchQuery.value = recommendedQuery.value
    musicStore.searchTracks(searchQuery.value)
  },
  { immediate: true },
)

// 좋아요는 musicStore(전역 store)에 저장한다 — 도시를 옮겨다녀도 유지되고,
// 누른 당시 도시의 날씨 문맥도 함께 기록해서 취향 계산의 근거로 사용한다.
const toggleLike = (track) => {
  const wasLiked = musicStore.isLiked(track)
  musicStore.toggleLike(track, {
    status: selectedCity.value.status,
    cityId: selectedCity.value.id,
    cityName: selectedCity.value.name,
    temp: selectedCity.value.temp,
  })
  toast.add({
    severity: wasLiked ? 'secondary' : 'success',
    summary: wasLiked ? '좋아요 취소' : '♥ 좋아요',
    detail: `${track.title} · ${track.artist}`,
    life: 1800,
  })
}

</script>

<template>
  <div class="weather-page" :class="pageTheme">
    <div class="music-page-body">
      <header class="hero-banner">
        <div class="hero-quote-card">
          <span class="hero-label">🎵 오늘의 날씨 플레이리스트</span>
          <div class="hero-icon">{{ icon }}</div>
          <h1 class="hero-title">
            {{ selectedCity.name }}, {{ configStore.toDisplayTemp(selectedCity.temp) }}{{ configStore.unitSymbol }}
          </h1>
          <p class="hero-sub">{{ playlist.mood }}</p>
        </div>
      </header>

      <!-- 검색 가능한 단일 도시 선택기: 긴 가로 스크롤 대신 국내/해외 그룹을 사용한다. -->
      <section class="city-selector-card">
        <div class="city-selector-copy">
          <span class="selector-eyebrow">추천 기준 지역</span>
          <strong>{{ icon }} {{ selectedCity.name }}</strong>
          <p>
            현재 {{ selectedCity.status }} ·
            {{ configStore.toDisplayTemp(selectedCity.temp) }}{{ configStore.unitSymbol }}
          </p>
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
          aria-label="음악 추천 도시 선택"
        >
          <template #value="slotProps">
            <span v-if="slotProps.value" class="selected-city-value">
              {{ getWeatherIcon(selectedCity.status) }} {{ selectedCity.name }}
            </span>
            <span v-else>도시를 선택하세요</span>
          </template>
          <template #option="slotProps">
            <div class="city-option">
              <span>{{ getWeatherIcon(slotProps.option.status) }}</span>
              <strong>{{ slotProps.option.name }}</strong>
              <small>{{ slotProps.option.status }} · {{ slotProps.option.temp }}°C</small>
            </div>
          </template>
          <template #optiongroup="slotProps">
            <strong class="city-group-label">{{ slotProps.option.label }}</strong>
          </template>
        </Select>
      </section>

      <!-- Axios 흐름의 출발점: submit -> store action -> api 함수 -> iTunes 응답 -> 화면 갱신 -->
      <form class="music-search" @submit.prevent="searchMusic">
        <div>
          <label for="music-query">곡 또는 가수 검색</label>
          <p>날씨 추천어를 그대로 쓰거나 원하는 검색어로 바꿔보세요.</p>
        </div>
        <div class="music-search-controls">
          <InputText
            id="music-query"
            v-model.trim="searchQuery"
            type="search"
            placeholder="예: 아이유, jazz, rainy day"
            class="music-query-input"
            fluid
          />
          <Button
            type="submit"
            label="iTunes 검색"
            icon="pi pi-search"
            :loading="musicStore.isLoading"
            :disabled="!searchQuery"
            class="music-search-button"
          />
        </div>
      </form>

      <div class="player-layout">
        <!-- 왼쪽: 턴테이블처럼 생긴 앨범 카드 -->
        <div class="vinyl-card" :style="{ background: playlist.gradient }">
          <div class="turntable">
            <div class="vinyl-disc">
              <div class="vinyl-groove"></div>
              <div class="vinyl-groove vinyl-groove-2"></div>
              <div class="vinyl-label">
                <span>{{ icon }}</span>
              </div>
            </div>
            <div class="tonearm">
              <div class="tonearm-head"></div>
            </div>
          </div>

          <div class="genre-tags">
            <span v-for="g in playlist.genreTags" :key="g" class="genre-chip">{{ g }}</span>
            <span class="genre-chip energy-chip">{{ playlist.energyTag }}</span>
          </div>
        </div>

        <!-- 오른쪽: Axios로 받은 실제 iTunes 트랙 목록 -->
        <div class="tracklist-card">
          <h3>🎧 {{ selectedCity.name }}에 어울리는 트랙</h3>

          <div v-if="musicStore.isLoading" class="request-state loading-state">
            <ProgressSpinner
              class="music-spinner"
              strokeWidth="5"
              animationDuration="0.8s"
              aria-label="음악 검색 중"
            />
            <p>iTunes에서 <strong>{{ musicStore.lastQuery }}</strong> 검색 중...</p>
          </div>

          <div v-else-if="musicStore.errorMessage" class="request-state error-state">
            <Message severity="warn" :closable="false" class="music-error-message">
              {{ musicStore.errorMessage }}
            </Message>
            <Button
              type="button"
              label="다시 시도"
              icon="pi pi-refresh"
              severity="secondary"
              size="small"
              @click="searchMusic"
            />
          </div>

          <ol v-else class="tracklist">
            <li
              v-for="(track, index) in musicStore.tracks"
              :key="track.id"
              class="track-row"
            >
              <span class="track-index">{{ index + 1 }}</span>

              <img :src="track.artworkUrl" :alt="`${track.album} 앨범 표지`" class="track-artwork" />

              <div class="track-info">
                <p class="track-title">{{ track.title }}</p>
                <p class="track-artist">{{ track.artist }} · {{ track.album }}</p>
                <span class="track-genre">{{ track.genre }}</span>
              </div>

              <audio v-if="track.previewUrl" :src="track.previewUrl" controls preload="none"></audio>
              <span v-else class="no-preview">미리듣기 없음</span>

              <span class="track-duration">{{ track.duration }}</span>

              <button
                class="btn-like"
                :class="{ liked: musicStore.isLiked(track) }"
                :aria-label="`${track.title} 좋아요`"
                @click="toggleLike(track)"
              >
                {{ musicStore.isLiked(track) ? '♥' : '♡' }}
              </button>

              <a
                :href="track.storeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="itunes-link"
              >
                iTunes에서 보기 ↗
              </a>
            </li>
          </ol>

          <p class="itunes-credit">앨범 이미지와 미리듣기는 iTunes에서 제공됩니다.</p>
        </div>
      </div>

      <section class="taste-link-card">
        <div>
          <span>MY WEATHER MUSIC DNA</span>
          <h3>좋아요한 음악을 지역과 날씨별로 모아보세요</h3>
          <p>세계지도와 지역별 플레이리스트에서 나의 음악 취향을 확인할 수 있어요.</p>
        </div>
        <Button
          as="router-link"
          to="/music-taste"
          label="나의 음악 취향 보기"
          icon="pi pi-map"
          rounded
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.music-page-body {
  max-width: 980px;
  margin: 0 auto;
  padding: 8px 24px 60px;
}

.taste-link-card {
  margin-top: 18px;
  padding: 23px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(126, 89, 238, 0.16);
  border-radius: 20px;
  background:
    radial-gradient(circle at 84% 30%, rgba(103, 221, 186, 0.15), transparent 28%),
    linear-gradient(120deg, #fff, #f3efff);
  box-shadow: 0 10px 30px rgba(45, 36, 81, 0.07);
}

.taste-link-card span {
  color: #7357e8;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.taste-link-card h3 {
  margin: 5px 0 3px;
  color: #242630;
  font-size: 1.05rem;
}

.taste-link-card p {
  margin: 0;
  color: #858790;
  font-size: 0.74rem;
}

@media (max-width: 650px) {
  .taste-link-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* 도시 선택: 24개 칩 대신 검색 가능한 그룹형 Select를 사용한다. */
.city-selector-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 4px 0 16px;
  padding: 17px 20px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.07);
}

.city-selector-copy {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  align-items: center;
}

.selector-eyebrow {
  grid-column: 1 / -1;
  margin-bottom: 3px;
  color: #868e96;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.city-selector-copy strong {
  color: #1a252f;
  font-size: 1rem;
}

.city-selector-copy p {
  margin: 0;
  color: #6c757d;
  font-size: 0.8rem;
}

.city-select {
  width: 280px;
}

.city-select:deep(.p-select-label) {
  padding-block: 0.65rem;
}

.selected-city-value {
  color: #26333e;
  font-weight: 700;
}

.city-option {
  min-width: 240px;
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 7px;
}

.city-option small {
  color: #8a949e;
  font-size: 0.72rem;
}

.city-group-label {
  color: #52606d;
  font-size: 0.78rem;
}

/* 검색 폼: 사용자의 submit 이벤트가 Axios 요청 흐름을 시작하는 지점 */
.music-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.07);
}

.music-search label {
  display: block;
  color: #1a252f;
  font-size: 0.94rem;
  font-weight: 800;
}

.music-search p {
  margin: 3px 0 0;
  color: #868e96;
  font-size: 0.78rem;
}

.music-search-controls {
  display: flex;
  gap: 8px;
  min-width: 420px;
}

.music-query-input {
  min-width: 0;
  flex: 1;
}

.music-search-button {
  flex: 0 0 auto;
  white-space: nowrap;
}

/* 본문: 왼쪽 턴테이블 카드 + 오른쪽 트랙리스트 카드 */
.player-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 22px;
  align-items: start;
}

.vinyl-card {
  border-radius: 24px;
  padding: 34px 22px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16px 36px rgba(26, 37, 47, 0.18);
  position: sticky;
  top: 78px;
}

.turntable {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
}

/* 레코드판: 검은 원반 위에 홈(groove) 두 겹을 두고, 가운데 라벨에 오늘 날씨 아이콘을 넣는다 */
.vinyl-disc {
  width: 176px;
  height: 176px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #2b2b2b 0%, #111111 70%, #050505 100%);
  position: relative;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  animation: spin 6s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.vinyl-groove {
  position: absolute;
  inset: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.vinyl-groove-2 {
  inset: 30px;
}

.vinyl-label {
  position: absolute;
  inset: 62px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.06);
}

/* 톤암: 오른쪽 위에서 레코드판 가장자리로 살짝 걸쳐 있는 막대 */
.tonearm {
  position: absolute;
  top: -6px;
  right: 18px;
  width: 8px;
  height: 96px;
  background: linear-gradient(180deg, #d9d9d9 0%, #9a9a9a 100%);
  border-radius: 6px;
  transform-origin: top center;
  transform: rotate(24deg);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tonearm-head {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 12px;
  background: #4a4a4a;
  border-radius: 3px;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.genre-chip {
  font-size: 0.74rem;
  font-weight: 700;
  color: #1a252f;
  background: rgba(255, 255, 255, 0.85);
  padding: 4px 12px;
  border-radius: 999px;
}

.energy-chip {
  background: rgba(26, 37, 47, 0.85);
  color: #ffffff;
}

/* 트랙리스트 카드 */
.tracklist-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  padding: 24px 26px 12px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.08);
}

.tracklist-card h3 {
  margin: 0 0 14px;
  font-size: 1.05rem;
  color: #1a252f;
}

.tracklist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.track-row {
  display: grid;
  grid-template-columns: 22px 52px minmax(120px, 1fr) 170px 32px;
  grid-template-areas:
    'index artwork info player like'
    '. artwork store duration .';
  align-items: center;
  column-gap: 10px;
  row-gap: 5px;
  padding: 12px 6px;
  border-radius: 12px;
  transition: background-color 0.15s ease;
}

.track-row:not(:last-child) {
  border-bottom: 1px solid #f1f3f5;
}

.track-index {
  grid-area: index;
  font-size: 0.85rem;
  font-weight: 700;
  color: #adb5bd;
  text-align: center;
}

.track-artwork {
  grid-area: artwork;
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  background: #f1f3f5;
}

.track-info {
  grid-area: info;
  min-width: 0;
}

.track-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #1a252f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-artist {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #868e96;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-genre {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 7px;
  color: #1a7f4f;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
}

.track-row audio {
  grid-area: player;
  width: 170px;
  height: 32px;
}

.no-preview {
  grid-area: player;
  color: #adb5bd;
  font-size: 0.74rem;
  text-align: center;
}

.track-duration {
  grid-area: duration;
  font-size: 0.78rem;
  color: #868e96;
  text-align: right;
}

.btn-like {
  grid-area: like;
  border: none;
  background: transparent;
  font-size: 17px;
  color: #ced4da;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}

.itunes-link {
  grid-area: store;
  width: fit-content;
  color: #5f6b76;
  font-size: 0.7rem;
  text-decoration: none;
}

.itunes-link:hover {
  color: #1a7f4f;
  text-decoration: underline;
}

.itunes-credit {
  margin: 12px 4px 4px;
  color: #adb5bd;
  font-size: 0.7rem;
  text-align: right;
}

.request-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #66717c;
  text-align: center;
}

.request-state p {
  margin: 0;
}

.music-spinner {
  width: 38px;
  height: 38px;
}

.music-error-message {
  width: min(100%, 410px);
}

.btn-like:hover {
  transform: scale(1.15);
}

.btn-like.liked {
  color: #e8590c;
}

/* 나의 날씨 취향 카드 */
.taste-card {
  margin-top: 22px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  padding: 24px 26px 22px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.08);
}

.taste-card h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #1a252f;
}

.taste-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.taste-heading p {
  margin: 4px 0 0;
  color: #868e96;
  font-size: 0.78rem;
}

.taste-rule {
  flex: 0 0 auto;
  padding: 4px 10px;
  color: #1a7f4f;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.taste-empty {
  margin: 0;
  font-size: 0.88rem;
  color: #868e96;
}

.taste-summary {
  display: flex;
  align-items: center;
  gap: 13px;
  margin: 0 0 20px;
  padding: 14px 16px;
  color: #33404b;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.12), rgba(66, 184, 131, 0.04));
  border: 1px solid rgba(66, 184, 131, 0.18);
  border-radius: 14px;
}

.taste-summary strong {
  display: block;
  color: #1a7f4f;
  font-size: 0.92rem;
}

.taste-summary p {
  margin: 3px 0 0;
  color: #63707c;
  font-size: 0.78rem;
}

.summary-icon {
  font-size: 1.8rem;
}

.taste-bars {
  display: grid;
  gap: 12px;
}

.taste-bar-row {
  padding: 13px 15px;
  background: rgba(247, 249, 251, 0.76);
  border: 1px solid #edf0f2;
  border-radius: 13px;
}

.taste-bar-main {
  display: grid;
  grid-template-columns: 78px 1fr 44px;
  align-items: center;
  gap: 12px;
}

.taste-bar-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.taste-bar-track {
  height: 10px;
  background: #f1f3f5;
  border-radius: 999px;
  overflow: hidden;
}

.taste-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883 0%, #2f9e6f 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.taste-bar-count {
  font-size: 0.8rem;
  color: #868e96;
  text-align: right;
}

.taste-detail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0 90px;
}

.taste-detail > span {
  padding: 3px 8px;
  color: #64717d;
  background: #fff;
  border: 1px solid #e8ecef;
  border-radius: 999px;
  font-size: 0.68rem;
}

.liked-track-list {
  flex-basis: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.liked-track-chip {
  padding: 4px 8px;
  color: #33404b;
  background: rgba(66, 184, 131, 0.08);
  border-radius: 7px;
  font-size: 0.72rem;
}

.liked-track-chip small {
  color: #77838e;
}

.taste-no-data {
  margin: 8px 0 0 90px;
  color: #adb5bd;
  font-size: 0.72rem;
}

@media (max-width: 760px) {
  .city-selector-card {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .city-select {
    width: 100%;
  }

  .music-search {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .music-search-controls {
    min-width: 0;
  }

  .player-layout {
    grid-template-columns: 1fr;
  }

  .vinyl-card {
    position: static;
  }

  .track-row {
    grid-template-columns: 22px 48px minmax(0, 1fr) 32px;
    grid-template-areas:
      'index artwork info like'
      '. artwork store duration'
      '. player player player';
  }

  .track-row audio {
    width: 100%;
    margin-top: 6px;
  }

  .taste-bar-main {
    grid-template-columns: 70px 1fr 38px;
    gap: 8px;
  }

  .taste-detail,
  .taste-no-data {
    margin-left: 0;
  }

  .taste-heading {
    flex-direction: column;
  }
}
</style>

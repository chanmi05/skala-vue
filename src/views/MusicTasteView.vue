<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import LikedPlaylistPanel from '../components/exercise/weather/LikedPlaylistPanel.vue'
import MusicTasteMap from '../components/exercise/weather/MusicTasteMap.vue'
import TasteSummaryBanner from '../components/exercise/weather/TasteSummaryBanner.vue'
import { useMusicStore } from '../stores/musicStore'
import { weatherList } from '../stores/weatherStore'

const musicStore = useMusicStore()
const toast = useToast()

const preferredInitialCityId =
  musicStore.likedTracks.find((track) => track.weather?.cityId)?.weather?.cityId ?? 'city_01'
const selectedCityId = ref(preferredInitialCityId)

const getTopEntry = (counts) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

// 현재 앱에 등록된 모든 도시를 좋아요 기록과 합친다.
// 지도 컴포넌트는 이 배열만 받아서 마커 밝기와 개수를 표시하므로 Store 구조를 알 필요가 없다.
const cityStats = computed(() =>
  weatherList.value.map((city) => {
    const tracks = musicStore.likedTracks.filter((track) => track.weather?.cityId === city.id)
    const genreCounts = {}
    const weatherCounts = {}

    tracks.forEach((track) => {
      const genre = track.genre || '기타'
      const status = track.weather?.status || track.status || '날씨 정보 없음'
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1
      weatherCounts[status] = (weatherCounts[status] ?? 0) + 1
    })

    return {
      ...city,
      tracks,
      likeCount: tracks.length,
      topGenre: getTopEntry(genreCounts),
      topWeather: getTopEntry(weatherCounts),
    }
  }),
)

const selectedCity = computed(
  () => cityStats.value.find((city) => city.id === selectedCityId.value) ?? cityStats.value[0],
)
const selectedTracks = computed(() => selectedCity.value?.tracks ?? [])
const listenedCityCount = computed(() => cityStats.value.filter((city) => city.likeCount > 0).length)

// 최다 날씨의 최다 장르 개수는 원본 집계표(genreCounts)에서 직접 읽는다.
// 개발 중 HMR로 이미 생성된 Store 객체에 topGenreCount가 없더라도 0으로 잘못 표시되지 않는다.
const favoriteWeatherGenreLikeCount = computed(() => {
  const preference = musicStore.favoriteWeatherPreference
  if (!preference?.topGenre) return 0
  return preference.genreCounts?.[preference.topGenre] ?? 0
})

const selectCity = (city) => {
  selectedCityId.value = city.id
}

const removeTrack = (track) => {
  musicStore.removeLikedTrack(track)
  toast.add({
    severity: 'secondary',
    summary: '좋아요 취소',
    detail: `${track.title}을(를) 취향 지도에서 제거했어요.`,
    life: 1800,
  })
}
</script>

<template>
  <div class="taste-page">
    <main class="taste-page-body">
      <header class="page-heading">
        <span>MY WEATHER MUSIC ARCHIVE</span>
        <h1>날씨와 장소가 기억하는 나의 음악</h1>
        <p>좋아요를 누른 순간의 도시와 날씨를 모아 나만의 청취 지도를 만들어요.</p>
      </header>

      <TasteSummaryBanner
        :favorite-weather="musicStore.favoriteWeatherMood"
        :favorite-weather-genre="musicStore.favoriteWeatherPreference?.topGenre"
        :weather-like-count="musicStore.favoriteWeatherPreference?.count ?? 0"
        :weather-genre-like-count="favoriteWeatherGenreLikeCount"
        :total-liked="musicStore.totalLiked"
        :listened-city-count="listenedCityCount"
      />

      <section class="taste-workspace" aria-label="지역별 음악 취향 지도와 플레이리스트">
        <div class="map-section">
          <MusicTasteMap
            :cities="cityStats"
            :selected-city-id="selectedCityId"
            @select-city="selectCity"
          />
        </div>

        <LikedPlaylistPanel
          :city="selectedCity"
          :tracks="selectedTracks"
          :top-genre="selectedCity?.topGenre"
          @remove-track="removeTrack"
        />
      </section>

      <section class="how-it-works">
        <div><span>01</span><strong>음악 발견</strong><p>도시의 날씨에 맞는 음악을 찾아요.</p></div>
        <div><span>02</span><strong>좋아요 저장</strong><p>좋아요 당시 도시와 날씨를 함께 기록해요.</p></div>
        <div><span>03</span><strong>취향 지도</strong><p>지역·날씨·장르별 선택을 한눈에 분석해요.</p></div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.taste-page {
  min-height: calc(100vh - 64px);
  color: #20222a;
  background:
    radial-gradient(circle at 10% 3%, rgba(126, 89, 238, 0.12), transparent 26%),
    radial-gradient(circle at 92% 14%, rgba(103, 221, 186, 0.1), transparent 23%),
    #f4f3f0;
}

.taste-page-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 58px 24px 70px;
}

.page-heading {
  margin-bottom: 28px;
  text-align: center;
}

.page-heading > span {
  color: #7357e8;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.17em;
}

.page-heading h1 {
  margin: 9px 0 7px;
  color: #161820;
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: -0.055em;
}

.page-heading p { margin: 0; color: #7f8189; font-size: 0.88rem; }

.taste-workspace {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(310px, 3fr);
  gap: 18px;
  margin-top: 20px;
  align-items: stretch;
}

.map-section { min-width: 0; }

.how-it-works {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.how-it-works div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 12px;
  padding: 17px 20px;
  border: 1px solid rgba(20, 23, 31, 0.07);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.72);
}

.how-it-works span {
  grid-row: 1 / 3;
  color: #a991ff;
  font-size: 1.35rem;
  font-weight: 900;
}

.how-it-works strong { font-size: 0.82rem; }
.how-it-works p { margin: 0; color: #91939b; font-size: 0.68rem; }

@media (max-width: 960px) {
  .taste-workspace { grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .taste-page-body { padding: 40px 14px 55px; }
  .how-it-works { grid-template-columns: 1fr; }
}
</style>

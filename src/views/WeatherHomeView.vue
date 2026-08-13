<script setup>
// WeatherParent 역할을 하던 components/exercise/WeatherHome.vue를
// 라우팅 구조에 맞게 views/ 폴더로 옮겨온 파일.
// 달라진 점 2가지만 기억하면 됨:
//  1) nav 바와 코디 추천(OutfitBoard) 섹션은 이 파일에서 빠졌다.
//     - nav는 App.vue로 올라가서 모든 페이지가 공유하고,
//     - 코디 추천은 도시 상세 페이지(WeatherDetailView)로 옮겨갔다.
//  2) "상세보기"를 눌렀을 때 모달을 띄우는 대신 router.push로 실제 URL(/weather/:id)로 이동한다.
import { computed, watch, watchEffect, ref } from 'vue'
import { useRouter } from 'vue-router'
import Message from 'primevue/message'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import WeatherCard from '../components/exercise/weather/WeatherCard.vue'
import WeatherStats from '../components/exercise/weather/WeatherStats.vue'
import BaseDashboardCard from '../components/exercise/weather/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/weather/SearchBar.vue'
import FilterBox from '../components/exercise/weather/FilterBox.vue'
import { getWeatherTheme } from '../components/exercise/weather/weatherIcons'
import { getChosung } from '../components/exercise/weather/chosung'
import CurrentWeatherMusicHero from '../components/exercise/weather/CurrentWeatherMusicHero.vue'
import {
  weatherList,
  favoriteIds,
  toggleFavorite,
  hottestCity,
  coldestCity,
  isWeatherLoading,
  weatherFetchError,
} from '../stores/weatherStore'

const router = useRouter()
const toast = useToast()

const searchQuery = ref('')
const selectedCityInfo = ref('서울의 날씨에 어울리는 음악을 추천하고 있어요.')
const selectedId = ref('city_01')
const sortOrder = ref('none') // 'none' | 'asc' | 'desc'

// PrimeVue Hands on: 버튼을 계속 눌러서 순서를 "추측"해야 했던 정렬을,
// 지금 어떤 옵션들이 있는지 한눈에 보이는 드롭다운(Select)으로 바꿨다.
const sortOptions = [
  { label: '🌡️ 기본순', value: 'none' },
  { label: '🔺 기온 높은순', value: 'desc' },
  { label: '🔻 기온 낮은순', value: 'asc' },
]

// 국내/해외 범위 필터. weatherStore의 각 도시가 가진 country(KR/JP/US/...)를 기준으로 나눈다.
const scopeFilter = ref('all') // 'all' | 'domestic' | 'international'
const scopeOptions = [
  { label: '🌍 전체 (해외 포함)', value: 'all' },
  { label: '🇰🇷 국내만', value: 'domestic' },
  { label: '✈️ 해외만', value: 'international' },
]

// 다중 필터: 체크된 날씨 상태만 표시(빈 배열이면 전체), 즐겨찾기만 보기
const selectedStatuses = ref([])
const favoritesOnly = ref(false)
const minTemp = ref(null)

const availableStatuses = computed(() => [...new Set(weatherList.value.map((item) => item.status))])

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatuses.value = []
  favoritesOnly.value = false
  minTemp.value = null
}

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  const hasMinTemp = minTemp.value !== null && minTemp.value !== '' && minTemp.value !== undefined

  const base = weatherList.value.filter((item) => {
    const nameMatch =
      !query || item.name.includes(query) || getChosung(item.name).includes(query)
    const statusMatch =
      selectedStatuses.value.length === 0 || selectedStatuses.value.includes(item.status)
    const favoriteMatch = !favoritesOnly.value || favoriteIds.value.includes(item.id)
    const tempMatch = !hasMinTemp || item.temp >= minTemp.value
    const scopeMatch =
      scopeFilter.value === 'all' ||
      (scopeFilter.value === 'domestic' ? item.country === 'KR' : item.country !== 'KR')
    return nameMatch && statusMatch && favoriteMatch && tempMatch && scopeMatch
  })

  if (sortOrder.value === 'asc') return [...base].sort((a, b) => a.temp - b.temp)
  if (sortOrder.value === 'desc') return [...base].sort((a, b) => b.temp - a.temp)
  return base
})

// selectedCityInfo(상태 바 문구)가 바뀔 때마다 콘솔에 기록한다.
watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

// searchQuery는 타이핑할 때마다 바뀌는 값이라 watchEffect로 감시한다.
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

const selectCity = (item) => {
  selectedId.value = item.id
  selectedCityInfo.value = `${item.name}이(가) 선택되었습니다.`
}

// 예전엔 여기서 detailCity.value = item으로 모달을 띄웠지만,
// 이제 "상세보기"는 실제 주소가 있는 별도 페이지(/weather/:cityId)라서
// router.push로 그 경로로 진짜 이동(programmatic navigation)한다.
const goToDetail = (item) => {
  router.push(`/weather/${item.id}`)
}

// 즐겨찾기 토글 + Toast 알림을 한 번에 처리하는 핸들러.
// toggleFavorite 자체는 weatherStore의 순수 상태 변경 함수라 UI 피드백(Toast)을 모른다 —
// "찜했다는 걸 눈에 보이게 알려주는" 역할은 화면(View) 쪽 책임으로 여기서 얹는다.
const handleToggleFavorite = (id) => {
  toggleFavorite(id)
  const item = weatherList.value.find((w) => w.id === id)
  if (!item) return
  const nowFavorite = favoriteIds.value.includes(id)
  toast.add({
    severity: nowFavorite ? 'success' : 'secondary',
    summary: nowFavorite ? '⭐ 즐겨찾기 추가' : '즐겨찾기 해제',
    detail: `${item.name}을(를) ${nowFavorite ? '즐겨찾기에 추가했어요' : '즐겨찾기에서 제거했어요'}`,
    life: 2000,
  })
}

// 선택된 도시(=카드를 고른 도시) "한 곳"의 상태만 히어로 영역과 페이지 배경 테마에 반영된다.
const selectedCityItem = computed(
  () => weatherList.value.find((item) => item.id === selectedId.value) ?? weatherList.value[0],
)

const pageTheme = computed(() => getWeatherTheme(selectedCityItem.value?.status))
</script>

<template>
  <div class="weather-page" :class="pageTheme">
    <header id="hero" class="music-first-hero">
      <div class="brand-intro">
        <span>WEATHER-DRIVEN MUSIC DISCOVERY</span>
        <h1>날씨를 듣는 새로운 방법</h1>
        <p>지금 하늘의 온도와 결을 한 곡의 음악으로 바꿔드려요.</p>
      </div>
      <CurrentWeatherMusicHero :city="selectedCityItem" :weather-loading="isWeatherLoading" />
    </header>

    <!-- Axios로 실제 날씨를 불러오는 동안/실패했을 때 보여주는 상태 배너.
         weatherList 자체는 항상 값이 차 있어서(로딩 중엔 목데이터) 이 배너가 없어도 화면은
         안 깨지지만, "지금 API를 부르고 있다"는 걸 눈으로 보여주기 위해 추가했다.
         PrimeVue Hands on: 직접 만든 <p> 배너 대신 Message 컴포넌트로 교체 —
         severity에 따라 아이콘/색이 자동으로 붙어서 상태 표현이 더 명확해진다. -->
    <div v-if="isWeatherLoading || weatherFetchError" class="api-status-wrap">
      <Message v-if="isWeatherLoading" severity="info" :closable="false" size="small">
        🌐 실시간 날씨 데이터를 불러오는 중...
      </Message>
      <Message v-else-if="weatherFetchError" severity="warn" :closable="false" size="small">
        ⚠️ {{ weatherFetchError }}
      </Message>
    </div>

    <div class="page-body">
      <aside class="sidebar">
        <BaseDashboardCard title="🔍 도시 검색">
          <SearchBar :query="searchQuery" @update-query="searchQuery = $event" />
        </BaseDashboardCard>

        <BaseDashboardCard title="🧰 다중 필터">
          <template #actions>
            <Button label="초기화" size="small" severity="secondary" rounded text @click="resetFilters" />
          </template>

          <FilterBox
            :available-statuses="availableStatuses"
            :selected-statuses="selectedStatuses"
            :favorites-only="favoritesOnly"
            :min-temp="minTemp"
            @update-selected-statuses="selectedStatuses = $event"
            @update-favorites-only="favoritesOnly = $event"
            @update-min-temp="minTemp = $event"
          />
        </BaseDashboardCard>
      </aside>

      <main class="content">
        <div class="dashboard-heading">
          <div>
            <span>EXPLORE THE WEATHER</span>
            <h2>다른 도시의 하늘도 들어보세요</h2>
          </div>
          <p>도시 카드를 선택하면 위 음악과 날씨가 함께 바뀝니다.</p>
        </div>

        <div id="stats">
          <WeatherStats :list="filteredWeatherList" />
        </div>

        <BaseDashboardCard id="cities" class="list-box" title="🏙️ 지역별 날씨 현황">
          <template #actions>
            <div class="list-actions">
              <!-- 국내/해외 범위 선택: country 필드를 기준으로 카드 목록 자체를 걸러낸다 -->
              <Select
                v-model="scopeFilter"
                :options="scopeOptions"
                optionLabel="label"
                optionValue="value"
                size="small"
                class="scope-select"
                aria-label="국내/해외 범위 선택"
              />
              <!-- 정렬: 이제 버튼을 여러 번 눌러 순서를 추측할 필요 없이, 드롭다운을 열면
                   3가지 옵션이 바로 보이고 원하는 걸 한 번에 고를 수 있다 -->
              <Select
                v-model="sortOrder"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                size="small"
                class="sort-select"
                aria-label="정렬 기준 선택"
              />
            </div>
          </template>

          <!-- PrimeVue Hands on: 데이터를 불러오는 짧은 순간에도 "빈 화면"이 아니라
               카드 모양의 반짝이는 자리표시자를 보여준다. Skeleton은 각 도형을
               height/width/borderRadius만 지정하면 알아서 shimmer 애니메이션을 넣어준다. -->
          <div class="weather-grid" v-if="isWeatherLoading">
            <div v-for="n in 8" :key="n" class="skeleton-card">
              <Skeleton height="112px" border-radius="16px 16px 0 0" />
              <div class="skeleton-card-body">
                <Skeleton width="55%" height="1.1rem" class="skeleton-row" />
                <Skeleton width="80%" height="0.8rem" class="skeleton-row" />
                <Skeleton width="45%" height="1.7rem" border-radius="999px" />
              </div>
            </div>
          </div>
          <div class="weather-grid" v-else-if="filteredWeatherList.length">
            <WeatherCard
              v-for="item in filteredWeatherList"
              :key="item.id"
              :item="item"
              :is-favorite="favoriteIds.includes(item.id)"
              :is-selected="selectedId === item.id"
              :is-hottest="item.id === hottestCity.id"
              :is-coldest="item.id === coldestCity.id"
              @select-card="selectCity"
              @click-detail="goToDetail"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
          <p v-else class="empty-message">😭 검색 결과와 일치하는 도시가 없습니다.</p>
        </BaseDashboardCard>

        <div class="status-bar">{{ selectedCityInfo }}</div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.weather-page {
  padding-bottom: 36px;
  background:
    radial-gradient(circle at 12% 0%, rgba(120, 92, 255, 0.12), transparent 28%),
    radial-gradient(circle at 90% 18%, rgba(54, 208, 170, 0.1), transparent 25%),
    #f4f3f0;
}

.music-first-hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px 40px;
}

.brand-intro {
  margin-bottom: 26px;
  text-align: center;
}

.brand-intro span,
.dashboard-heading span {
  color: #7357e8;
  font-size: 0.69rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.brand-intro h1 {
  margin: 9px 0 7px;
  color: #12151d;
  font-size: clamp(2rem, 5vw, 3.65rem);
  font-weight: 850;
  letter-spacing: -0.055em;
}

.brand-intro p {
  margin: 0;
  color: #72737b;
  font-size: 0.96rem;
}

.page-body {
  max-width: 1200px;
  padding-top: 28px;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 22px;
}

.dashboard-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin: 0 0 18px;
}

.dashboard-heading h2 {
  margin: 5px 0 0;
  color: #171a21;
  font-size: clamp(1.4rem, 3vw, 2rem);
  letter-spacing: -0.035em;
}

.dashboard-heading p {
  margin: 0 0 3px;
  color: #84858b;
  font-size: 0.78rem;
}

.sidebar {
  top: 88px;
}

.sidebar :deep(.dashboard-card),
.list-box:deep(.dashboard-card) {
  border-color: rgba(20, 23, 31, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 35px rgba(26, 26, 38, 0.06);
}

.sidebar :deep(.dashboard-card-header h3),
.list-box:deep(.dashboard-card-header h3) {
  color: #20232b;
  font-size: 0.98rem;
}

.list-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scope-select {
  min-width: 150px;
}

.sort-select {
  min-width: 132px;
}

/* Skeleton 로딩 카드: 실제 WeatherCard와 같은 비율(위쪽 무대 112px + 아래 본문)로
   맞춰서, 데이터가 도착했을 때 카드 자리가 갑자기 커지거나 작아지지 않게 한다. */
.skeleton-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(26, 37, 47, 0.06);
}

.skeleton-card-body {
  padding: 14px 16px 16px;
}

.skeleton-row {
  margin-bottom: 10px;
}

.status-bar {
  color: #5f49c7;
  background: rgba(238, 234, 255, 0.9);
  border-color: #d9d0ff;
}

@media (max-width: 900px) {
  .music-first-hero {
    padding-top: 42px;
  }

  .page-body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .music-first-hero {
    padding: 36px 14px 26px;
  }

  .page-body {
    padding-inline: 14px;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }

  .dashboard-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .list-actions {
    width: 100%;
  }

  .scope-select,
  .sort-select {
    flex: 1;
    min-width: 130px;
  }
}
</style>

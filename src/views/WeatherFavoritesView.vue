<script setup>
// 요구사항 6번(본인이 추가로 정의하는 view)으로 만든 페이지.
// 홈 화면과 완전히 같은 weatherStore(favoriteIds)를 공유하기 때문에,
// 홈에서 별을 눌러 즐겨찾기한 도시가 여기에도 바로 반영된다 — 이게 이 페이지가
// "따로 데이터를 안 들고 있어도" 동작하는 이유(모듈 공유 상태).
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import WeatherCard from '../components/exercise/weather/WeatherCard.vue'
import { weatherList, favoriteIds, toggleFavorite, hottestCity, coldestCity } from '../stores/weatherStore'

const router = useRouter()
const toast = useToast()

const favoriteList = computed(() =>
  weatherList.value.filter((item) => favoriteIds.value.includes(item.id)),
)

// 즐겨찾기 목록에서는 카드를 클릭하거나 "상세보기"를 누르면 바로 상세 페이지로 이동한다.
const goToDetail = (item) => {
  router.push(`/weather/${item.id}`)
}

// 이 화면의 카드는 전부 즐겨찾기 상태(is-favorite: true)라서, 여기서 별을 누르는 건
// 항상 "제거"다 — 홈 화면과 달리 추가/제거 분기가 필요 없다.
const handleRemoveFavorite = (id) => {
  const item = weatherList.value.find((w) => w.id === id)
  toggleFavorite(id)
  toast.add({
    severity: 'secondary',
    summary: '즐겨찾기 해제',
    detail: item ? `${item.name}을(를) 즐겨찾기에서 제거했어요` : '',
    life: 2000,
  })
}
</script>

<template>
  <div class="weather-page weather-neutral">
    <div class="favorites-page-body">
      <header class="hero-banner">
        <div class="hero-quote-card">
          <span class="hero-label">⭐ 즐겨찾기 모아보기</span>
          <div class="hero-icon">⭐</div>
          <h1 class="hero-title">내가 즐겨찾기한 도시들</h1>
          <p class="hero-sub">{{ favoriteList.length }}개 도시를 즐겨찾기했어요</p>
        </div>
      </header>

      <div class="weather-grid" v-if="favoriteList.length">
        <WeatherCard
          v-for="item in favoriteList"
          :key="item.id"
          :item="item"
          :is-favorite="true"
          :is-selected="false"
          :is-hottest="item.id === hottestCity.id"
          :is-coldest="item.id === coldestCity.id"
          @select-card="goToDetail"
          @click-detail="goToDetail"
          @toggle-favorite="handleRemoveFavorite"
        />
      </div>
      <div v-else class="empty-favorites">
        <p>☆ 아직 즐겨찾기한 도시가 없어요.</p>
        <RouterLink to="/" class="btn-back">← 홈에서 도시 즐겨찾기하러 가기</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 24px 60px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.empty-favorites {
  text-align: center;
  padding: 60px 24px;
  color: #868e96;
}

.btn-back {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a7f4f;
  text-decoration: none;
}

.btn-back:hover {
  text-decoration: underline;
}
</style>

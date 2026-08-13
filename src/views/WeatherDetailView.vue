<script setup>
// 이번 라우터 작업에서 새로 만든 페이지. WeatherHome.vue 안에서 모달로 띄우던
// "상세보기"를 실제 주소(/weather/:cityId)를 가진 하나의 화면으로 승격시킨 것이다.
// + 사용자 요청에 따라, 원래 홈 화면 상단에 있던 "코디 추천(OutfitBoard)"도
//   이 페이지로 옮겨와서 "이 도시"의 데이터를 기준으로 보여준다.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findCityById } from '../stores/weatherStore'
import { useConfigStore } from '../stores/configStore'
import { getWeatherIcon, getWeatherTheme } from '../components/exercise/weather/weatherIcons'
import OutfitBoard from '../components/exercise/weather/OutfitBoard.vue'

const route = useRoute()
const configStore = useConfigStore()

// route.params.cityId는 URL 경로(/weather/:cityId)에서 그대로 추출된 값이다.
// props로 부모가 내려준 게 아니라 "이 라우트에 매칭됐다"는 사실 자체에서 얻는 값이라는 점에서,
// props/emits와는 또 다른 방식의 "라우터 → 화면" 데이터 전달이라고 볼 수 있다.
const city = computed(() => findCityById(route.params.cityId))

const icon = computed(() => (city.value ? getWeatherIcon(city.value.status) : ''))
const pageTheme = computed(() => (city.value ? getWeatherTheme(city.value.status) : 'weather-neutral'))

// WeatherDetailPanel.vue(예전 모달)에 있던 로직을 그대로 옮겨왔다.
// 날씨 상태·기온·풍속을 보고 오늘 챙기면 좋을 물건을 추천한다.
const recommendedItems = computed(() => {
  if (!city.value) return []
  const { status, temp, windSpeed } = city.value
  const items = []

  if (status === '비') {
    items.push({ icon: '☂️', text: '우산' })
  }
  if (status === '눈') {
    items.push({ icon: '🧤', text: '장갑' })
    items.push({ icon: '🧣', text: '목도리' })
  }

  if (temp >= 33) {
    items.push({ icon: '🌂', text: '양산' })
    items.push({ icon: '🌀', text: '휴대용 손풍기' })
    items.push({ icon: '🧊', text: '얼음물' })
  } else if (temp >= 28) {
    items.push({ icon: '🕶️', text: '선글라스' })
    items.push({ icon: '🧴', text: '자외선 차단제' })
  } else if (temp <= 5) {
    items.push({ icon: '🧥', text: '두꺼운 외투' })
  }

  if (windSpeed >= 4) {
    items.push({ icon: '🧢', text: '바람막이' })
  }

  return items
})
</script>

<template>
  <div class="weather-page" :class="pageTheme">
    <div v-if="city" class="detail-page-body">
      <RouterLink to="/" class="btn-back">← 목록으로</RouterLink>

      <header class="hero-banner">
        <div class="hero-quote-card">
          <span class="hero-label">📍 상세 정보</span>
          <div class="hero-icon">{{ icon }}</div>
          <h1 class="hero-title">{{ city.name }} · {{ city.status }}</h1>
          <p class="hero-sub">{{ configStore.toDisplayTemp(city.temp) }}{{ configStore.unitSymbol }} 기준</p>
        </div>
      </header>

      <section class="detail-info-card">
        <ul class="detail-meta">
          <li>💧 습도 <strong>{{ city.humidity }}%</strong></li>
          <li>🍃 풍속 <strong>{{ city.windSpeed }}m/s</strong></li>
        </ul>

        <div v-if="recommendedItems.length" class="recommend-box">
          <h4>🎒 오늘 챙기면 좋은 것</h4>
          <div class="recommend-list">
            <span v-for="ri in recommendedItems" :key="ri.text" class="recommend-chip">
              {{ ri.icon }} {{ ri.text }}
            </span>
          </div>
        </div>
      </section>

      <!-- 홈 화면에 있던 코디 추천을 이 페이지로 그대로 옮겨왔다. city prop만 넘겨주면
           옷 데이터·기온 구간 계산은 전부 OutfitBoard.vue 내부 책임이라 여기선 신경 쓸 게 없다. -->
      <section class="outfit-section">
        <OutfitBoard :city="city" />
      </section>

      <RouterLink :to="`/music/${city.id}`" class="music-link">
        🎵 {{ city.name }} 날씨에 어울리는 음악 추천 보러가기 →
      </RouterLink>
    </div>

    <div v-else class="detail-page-body detail-not-found">
      <p>😥 해당 도시 정보를 찾을 수 없어요.</p>
      <RouterLink to="/" class="btn-back">← 홈으로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.detail-page-body {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.btn-back {
  display: inline-block;
  margin-bottom: 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a7f4f;
  text-decoration: none;
}

.btn-back:hover {
  text-decoration: underline;
}

.music-link {
  display: block;
  margin-top: 20px;
  padding: 16px 20px;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a252f;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  text-decoration: none;
  transition: transform 0.15s ease;
}

.music-link:hover {
  transform: translateY(-2px);
}

.detail-info-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px 28px;
  margin: 24px 0;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.07);
}

.detail-meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 20px;
  font-size: 0.92rem;
  color: #495057;
}

.recommend-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f3f5;
}

.recommend-box h4 {
  margin: 0 0 10px;
  font-size: 0.88rem;
  color: #2c3e50;
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.recommend-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1a7f4f;
  background: #eafaf3;
  border: 1px solid #c3ecdb;
  border-radius: 999px;
  padding: 4px 10px;
}

.outfit-section {
  margin-top: 8px;
}

.detail-not-found {
  text-align: center;
  padding: 80px 24px;
  color: #868e96;
}
</style>

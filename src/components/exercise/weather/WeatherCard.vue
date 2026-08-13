<script setup>
import { computed } from 'vue'
import { getWeatherIcon, getWeatherTheme } from './weatherIcons'
import { useConfigStore } from '../../../stores/configStore'

// configStore도 구조분해하지 않고 인스턴스 그대로 template에서 configStore.xxx로 사용한다.
const configStore = useConfigStore()

const props = defineProps({
  item: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  isHottest: { type: Boolean, default: false },
  isColdest: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const icon = computed(() => getWeatherIcon(props.item.status))
const isHot = computed(() => props.item.temp >= 25)

// 해외 도시(country !== 'KR')에는 국기 이모지를 이름 옆에 붙여서 국내 도시와 구분해준다.
const COUNTRY_FLAGS = {
  JP: '🇯🇵',
  US: '🇺🇸',
  FR: '🇫🇷',
  EG: '🇪🇬',
  BR: '🇧🇷',
  AU: '🇦🇺',
}
const countryFlag = computed(() => COUNTRY_FLAGS[props.item.country] ?? null)
// 날씨 상태(맑음/비/구름/눈/흐림)에 따라 카드 배경 테마를 결정한다.
const theme = computed(() => getWeatherTheme(props.item.status))

// 테마별 배경 그라데이션을 인라인 style로 직접 지정한다(:style 바인딩).
// 예전에는 ".weather-sunny .weather-bg" 같은 클래스 선택자로 배경을 입혔는데,
// 이 프로젝트가 쓰는 최신 Vue/Vite 개발 서버 조합에서 카드를 하나 클릭할 때마다
// v-for로 나열된 다른 형제 카드들의 배경까지 같이 재계산되어 버리는(선택한 카드의
// 색으로 전부 덮어써지는) 렌더링 버그가 있었다. :style 인라인 바인딩은 CSS 선택자
// 매칭을 거치지 않고 그 엘리먼트에만 직접 적용되기 때문에 이 문제에서 자유롭다.
const THEME_GRADIENTS = {
  'weather-sunny': 'linear-gradient(180deg, #6fb8f2 0%, #bfe1fb 60%, #eaf6ff 100%)',
  'weather-rainy': 'linear-gradient(180deg, #3f5876 0%, #6a86a6 100%)',
  'weather-snowy': 'linear-gradient(180deg, #bcd9f0 0%, #eaf5fc 100%)',
  'weather-cloudy': 'linear-gradient(180deg, #9aa5b1 0%, #d6dce1 100%)',
  'weather-misty': 'linear-gradient(180deg, #9aa5b1 0%, #d6dce1 100%)',
}
const bgGradient = computed(() => THEME_GRADIENTS[theme.value] ?? '#e9ecef')

// 같은 이유로, 구름/빗줄기/눈/안개 장식도 클래스 조건부 CSS 선택자 대신
// v-if로 아예 다른 엘리먼트를 렌더링하도록 바꿨다 — 테마 판단을 CSS가 아니라
// Vue 쪽에서 하게 되어 카드마다 완전히 독립적으로 렌더링된다.
const feelsBadges = computed(() => {
  const { temp, humidity, windSpeed } = props.item
  const badges = []
  if (humidity >= 70) badges.push({ icon: '💦', text: '후덥지근해요' })
  if (windSpeed >= 4) badges.push({ icon: '🌬️', text: '바람이 강해요' })
  if (temp <= 5) badges.push({ icon: '🥶', text: '많이 쌀쌀해요' })
  if (humidity <= 40) badges.push({ icon: '🍂', text: '건조해요' })
  return badges
})
</script>

<template>
  <div
    class="weather-card"
    :class="[theme, { selected: isSelected }]"
    @click="emit('select-card', item)"
  >
    <!-- 날씨 무대: 배경색은 :style로 직접 지정, 장식은 v-if로 테마별 엘리먼트를 다르게 렌더링 -->
    <div class="card-stage">
      <div class="weather-bg" :style="{ background: bgGradient }" aria-hidden="true">
        <template v-if="theme === 'weather-sunny'">
          <div class="deco-cloud deco-cloud-1"></div>
          <div class="deco-cloud deco-cloud-2"></div>
        </template>
        <template v-else-if="theme === 'weather-rainy'">
          <div class="deco-rain-lines"></div>
          <div class="deco-rain-sheen"></div>
        </template>
        <div v-else-if="theme === 'weather-snowy'" class="deco-snow"></div>
        <div v-else-if="theme === 'weather-cloudy' || theme === 'weather-misty'" class="deco-fog"></div>
      </div>

      <span v-if="isHottest" class="ribbon ribbon-hot">🏆 오늘 가장 더움</span>
      <span v-else-if="isColdest" class="ribbon ribbon-cold">🥶 오늘 가장 추움</span>

      <button
        class="btn-favorite"
        :class="{ active: isFavorite }"
        @click.stop="emit('toggle-favorite', item.id)"
      >
        {{ isFavorite ? '★' : '☆' }}
      </button>

      <div class="stage-icon">{{ icon }}</div>
      <div class="stage-temp">{{ configStore.toDisplayTemp(item.temp) }}{{ configStore.unitSymbol }}</div>
    </div>

    <div class="card-body">
      <h4>
        <span v-if="countryFlag" class="flag">{{ countryFlag }}</span>
        {{ item.name }} <span class="status-text">({{ item.status }})</span>
      </h4>
      <p class="meta">💧 습도 {{ item.humidity }}% · 🍃 풍속 {{ item.windSpeed }}m/s</p>

      <div class="feels-row" v-if="feelsBadges.length">
        <span v-for="b in feelsBadges" :key="b.text" class="feels-chip">{{ b.icon }} {{ b.text }}</span>
      </div>

      <span v-if="isHot" class="badge hot">🔥 더움 (25도 이상)</span>
      <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

      <button class="btn-detail" @click.stop="emit('click-detail', item)">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(26, 37, 47, 0.06);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.weather-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(44, 62, 80, 0.14);
}

.weather-card.selected {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.22);
}

/* 카드 상단의 날씨 무대 */
.card-stage {
  position: relative;
  height: 112px;
  overflow: hidden;
}

.weather-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* ☀️ 맑음: 구름 두 덩이가 좌우로 천천히 떠다님 */
.deco-cloud {
  position: absolute;
  width: 46px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50px;
  box-shadow: 12px 4px 0 -2px rgba(255, 255, 255, 0.85);
  animation: cloud-float 10s ease-in-out infinite;
}
.deco-cloud-1 {
  top: 44px;
  left: 30%;
}
.deco-cloud-2 {
  top: 70px;
  left: 58%;
  opacity: 0.75;
  transform: scale(0.7);
  animation-duration: 13s;
  animation-delay: -4s;
}
@keyframes cloud-float {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(18px);
  }
}

/* 🌧️ 비: 얇은 세로줄(고정) + 위→아래로 흐르는 밝은 띠(애니메이션)로 낙하감을 준다.
   가로 움직임은 전혀 쓰지 않는다. */
.deco-rain-lines {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.55) 0px,
    rgba(255, 255, 255, 0.55) 1.5px,
    transparent 1.5px,
    transparent 10px
  );
}
.deco-rain-sheen {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 255, 255, 0.55) 45%,
    transparent 90%
  );
  background-size: 100% 300%;
  background-repeat: no-repeat;
  animation: rain-fall 0.9s linear infinite;
}
@keyframes rain-fall {
  0% {
    background-position: 0 -100%;
  }
  100% {
    background-position: 0 200%;
  }
}

/* ❄️ 눈: 작은 눈송이가 천천히 떨어짐 */
.deco-snow {
  position: absolute;
  inset: -30px;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.8px, transparent 2px),
    radial-gradient(circle, rgba(255, 255, 255, 0.75) 1.2px, transparent 1.4px);
  background-size:
    32px 32px,
    20px 20px;
  background-position:
    0 0,
    10px 14px;
  animation: snow-fall 4.5s linear infinite;
}
@keyframes snow-fall {
  0% {
    transform: translateY(-32px);
  }
  100% {
    transform: translateY(0);
  }
}

/* ☁️ 구름 / 🌫️ 흐림: 안개 띠가 좌우로 은은하게 흐름 */
.deco-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 25%, rgba(255, 255, 255, 0.65) 50%, transparent 75%);
  background-size: 220% 100%;
  animation: fog-drift 7s ease-in-out infinite;
}
@keyframes fog-drift {
  0%,
  100% {
    background-position: 0% 0;
  }
  50% {
    background-position: 100% 0;
  }
}

.ribbon {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  color: #ffffff;
  backdrop-filter: blur(2px);
}

.ribbon-hot {
  background: rgba(232, 89, 12, 0.88);
}

.ribbon-cold {
  background: rgba(28, 126, 214, 0.88);
}

.btn-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  background: rgba(26, 37, 47, 0.28);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  color: #ffffff;
}

.btn-favorite.active {
  color: #ffd43b;
  background: rgba(26, 37, 47, 0.4);
}

.stage-icon {
  position: absolute;
  z-index: 1;
  left: 14px;
  bottom: 10px;
  font-size: 34px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

.stage-temp {
  position: absolute;
  z-index: 1;
  right: 14px;
  bottom: 10px;
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.card-body {
  padding: 14px 16px 16px;
}

.weather-card h4 {
  margin: 0 0 4px;
  font-size: 1.05rem;
  color: #1a252f;
}

.status-text {
  color: #868e96;
  font-weight: 400;
  font-size: 0.9rem;
}

.flag {
  font-size: 0.9em;
  margin-right: 2px;
}

.meta {
  font-size: 0.82rem;
  color: #868e96;
  margin: 0 0 8px;
}

.feels-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.feels-chip {
  font-size: 0.72rem;
  font-weight: 600;
  color: #495057;
  background: #f1f3f5;
  border-radius: 999px;
  padding: 3px 8px;
}

.badge {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.badge.hot {
  background: #fff1ec;
  color: #e8590c;
}

.badge.cool {
  background: #e7f5ff;
  color: #1c7ed6;
}

.btn-detail {
  display: block;
  width: 100%;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: #42b883;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-detail:hover {
  background: #33a06f;
}
</style>

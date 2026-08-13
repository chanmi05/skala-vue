<script setup>
import { computed } from 'vue'
import { getWeatherIcon } from './weatherIcons'

const props = defineProps({
  favoriteWeather: { type: String, default: '' },
  favoriteWeatherGenre: { type: String, default: '' },
  weatherLikeCount: { type: Number, default: 0 },
  weatherGenreLikeCount: { type: Number, default: 0 },
  totalLiked: { type: Number, default: 0 },
  listenedCityCount: { type: Number, default: 0 },
})

const WEATHER_PHRASES = {
  맑음: '맑은 날',
  비: '비 오는 날',
  구름: '구름 낀 날',
  눈: '눈 오는 날',
  흐림: '흐린 날',
}

const favoriteWeatherPhrase = computed(
  () => WEATHER_PHRASES[props.favoriteWeather] ?? `${props.favoriteWeather} 날씨`,
)
</script>

<template>
  <section class="taste-summary-banner">
    <div class="summary-disc" aria-hidden="true">
      <span></span>
    </div>
    <div class="summary-message">
      <span>YOUR WEATHER MUSIC DNA</span>
      <h1 v-if="favoriteWeather && favoriteWeatherGenre">
        {{ getWeatherIcon(favoriteWeather) }} {{ favoriteWeatherPhrase }}에는
        {{ favoriteWeatherGenre }} 장르를 가장 많이 좋아하셨군요!
      </h1>
      <h1 v-else>좋아하는 음악을 저장하면 날씨 취향을 분석해드려요.</h1>
      <p v-if="totalLiked">
        지역과 관계없이 전체 {{ totalLiked }}곡을 분석했어요. {{ favoriteWeatherPhrase }}의
        좋아요는 {{ weatherLikeCount }}곡이고, 그중 {{ favoriteWeatherGenre }} 장르가
        {{ weatherGenreLikeCount }}곡으로 가장 많아요.
      </p>
      <p v-else>음악 탐색에서 하트를 누르면 이곳에 나만의 취향 지도가 만들어집니다.</p>
    </div>
    <div class="summary-numbers">
      <div><strong>{{ totalLiked }}</strong><span>LIKED TRACKS</span></div>
      <div><strong>{{ weatherLikeCount }}</strong><span>WEATHER LIKES</span></div>
      <div><strong>{{ listenedCityCount }}</strong><span>CITIES</span></div>
    </div>
  </section>
</template>

<style scoped>
.taste-summary-banner {
  position: relative;
  overflow: hidden;
  min-height: 150px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 25px;
  padding: 24px 31px;
  border: 1px solid rgba(126, 89, 238, 0.13);
  border-radius: 24px;
  background:
    radial-gradient(circle at 75% 40%, rgba(103, 221, 186, 0.13), transparent 23%),
    linear-gradient(115deg, #ffffff, #f5f1ff 54%, #eefaf6);
  box-shadow: 0 14px 42px rgba(32, 29, 55, 0.08);
}

.summary-disc {
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: repeating-radial-gradient(circle, #303340 0 3px, #11131a 4px 7px);
  box-shadow: 0 10px 24px rgba(12, 13, 18, 0.28);
  animation: summary-spin 12s linear infinite;
}

.summary-disc span {
  width: 26px;
  height: 26px;
  border: 7px solid #a991ff;
  border-radius: 50%;
  background: #67ddba;
}

.summary-message span {
  color: #7357e8;
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.15em;
}

.summary-message h1 {
  margin: 6px 0 4px;
  color: #191b23;
  font-size: clamp(1.2rem, 3vw, 1.85rem);
  letter-spacing: -0.035em;
}

.summary-message p {
  margin: 0;
  color: #777982;
  font-size: 0.8rem;
}

.summary-numbers {
  display: flex;
  gap: 22px;
}

.summary-numbers div {
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-numbers strong {
  color: #20222a;
  font-size: 1.75rem;
}

.summary-numbers span {
  color: #9a9ca4;
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

@keyframes summary-spin { to { transform: rotate(360deg); } }

@media (max-width: 700px) {
  .taste-summary-banner { grid-template-columns: auto 1fr; padding: 21px; }
  .summary-disc { width: 62px; height: 62px; }
  .summary-numbers { grid-column: 1 / -1; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .summary-disc { animation: none; }
}
</style>

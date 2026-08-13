<script setup>
import { computed } from 'vue'

// 이 컴포넌트는 "선택된 도시 객체" 하나만 props로 받는다(WeatherDetailPanel.vue와 동일한 패턴).
// 옷 데이터·기온 구간 계산 로직을 전부 이 안으로 옮겨왔기 때문에,
// 부모(WeatherHome.vue)는 이제 OUTFIT_GUIDE가 뭔지, 어떻게 계산하는지 전혀 몰라도 된다.
const props = defineProps({
  city: { type: Object, default: null },
})

// 기온별 코디 추천표(보기용 데이터 리스트). 상의 7단계 · 하의 5단계 · 겉옷 4단계를
// 각각 임의로 온도 구간에 배치했다. 값이 바뀌지 않으므로 ref가 아닌 일반 상수로 둔다.
const OUTFIT_GUIDE = [
  {
    range: '32°C 이상',
    minTemp: 32,
    top: { icon: '🎽', label: '민소매' },
    bottom: { icon: '🩳', label: '반바지' },
    outer: { icon: '☀️', label: '필요 없어요' },
  },
  {
    range: '28~31°C',
    minTemp: 28,
    top: { icon: '👕', label: '반팔티' },
    bottom: { icon: '👗', label: '얇은 스커트' },
    outer: { icon: '☀️', label: '필요 없어요' },
  },
  {
    range: '23~27°C',
    minTemp: 23,
    top: { icon: '👔', label: '긴팔티' },
    bottom: { icon: '👖', label: '린넨 바지' },
    outer: { icon: '🍂', label: '얇은 린넨 자켓' },
  },
  {
    range: '18~22°C',
    minTemp: 18,
    top: { icon: '🧶', label: '니트' },
    bottom: { icon: '🏃', label: '얇은 트레이닝 바지' },
    outer: { icon: '👚', label: '셔츠 자켓' },
  },
  {
    range: '12~17°C',
    minTemp: 12,
    top: { icon: '🧥', label: '얇은 겉옷' },
    bottom: { icon: '👖', label: '얇은 슬랙스' },
    outer: { icon: '🧣', label: '얇은 가디건' },
  },
  {
    range: '5~11°C',
    minTemp: 5,
    top: { icon: '🥼', label: '두툼한 겉옷' },
    bottom: { icon: '👖', label: '얇은 슬랙스' },
    outer: { icon: '🌬️', label: '바람막이' },
  },
  {
    range: '5°C 미만',
    minTemp: -Infinity,
    top: { icon: '⛄', label: '패딩' },
    bottom: { icon: '👖', label: '얇은 슬랙스' },
    outer: { icon: '🌬️', label: '바람막이' },
  },
]

// city.temp가 OUTFIT_GUIDE의 어느 구간에 해당하는지 찾는다.
// minTemp가 큰 순서로 정렬되어 있으므로, 기온 이상인 첫 번째 구간이 정답이다.
const todayOutfit = computed(() => {
  if (!props.city) return null
  return OUTFIT_GUIDE.find((row) => props.city.temp >= row.minTemp) ?? null
})
</script>

<template>
  <div v-if="city && todayOutfit" class="outfit-board">
    <div class="outfit-board-header">
      <h2>👕 {{ city.name }}의 오늘 코디 추천</h2>
      <p>{{ city.temp }}°C · {{ todayOutfit.range }} 구간에 어울리는 옷차림이에요</p>
    </div>

    <div class="outfit-pieces">
      <div class="outfit-piece piece-outer">
        <span class="piece-tag">겉옷</span>
        <div class="piece-illustration">{{ todayOutfit.outer.icon }}</div>
        <p class="piece-label">{{ todayOutfit.outer.label }}</p>
      </div>
      <div class="outfit-piece piece-top">
        <span class="piece-tag">상의</span>
        <div class="piece-illustration">{{ todayOutfit.top.icon }}</div>
        <p class="piece-label">{{ todayOutfit.top.label }}</p>
      </div>
      <div class="outfit-piece piece-bottom">
        <span class="piece-tag">하의</span>
        <div class="piece-illustration">{{ todayOutfit.bottom.icon }}</div>
        <p class="piece-label">{{ todayOutfit.bottom.label }}</p>
      </div>
    </div>
  </div>

  <div v-else class="outfit-board outfit-board-empty">
    <p>🧭 아래에서 도시 카드를 선택하면 그 지역 기온에 맞는 오늘의 코디를 보여드려요.</p>
  </div>
</template>

<style scoped>
.outfit-board {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 28px 28px 32px;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.07);
  text-align: center;
}

.outfit-board-empty {
  padding: 26px 24px;
  color: #868e96;
  font-size: 0.9rem;
}

.outfit-board-header h2 {
  margin: 0 0 4px;
  font-size: 1.25rem;
  color: #1a252f;
}

.outfit-board-header p {
  margin: 0 0 24px;
  font-size: 0.85rem;
  color: #868e96;
}

/* 옷 3벌을 나란히 배치 — 겉옷 → 상의 → 하의 순서로, 실제로 옷을 입는 순서를 왼쪽부터 보여준다 */
.outfit-pieces {
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.outfit-piece {
  width: 150px;
  padding: 20px 12px 18px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 옷 종류별로 카드 색을 다르게 주어 "일러스트 보드"처럼 구분되게 한다 */
.piece-outer {
  background: radial-gradient(circle at 50% 20%, #fdf1e6 0%, #fbe6cf 100%);
}

.piece-top {
  background: radial-gradient(circle at 50% 20%, #e7f5ff 0%, #d3ebff 100%);
}

.piece-bottom {
  background: radial-gradient(circle at 50% 20%, #eafaf3 0%, #d3f3e4 100%);
}

.piece-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #495057;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  padding: 3px 12px;
}

.piece-illustration {
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(44, 62, 80, 0.12));
}

.piece-label {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #1a252f;
}

@media (max-width: 560px) {
  .outfit-piece {
    width: 42%;
  }
}
</style>

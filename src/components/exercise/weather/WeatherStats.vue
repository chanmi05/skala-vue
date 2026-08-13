<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'
import { useConfigStore } from '../../../stores/configStore'

const configStore = useConfigStore()

const props = defineProps({
  list: { type: Array, required: true },
})

const avgTemp = computed(() => {
  if (!props.list.length) return '-'
  const sum = props.list.reduce((acc, item) => acc + item.temp, 0)
  return Math.round((sum / props.list.length) * 10) / 10
})

const hottest = computed(() =>
  props.list.length ? props.list.reduce((a, b) => (b.temp > a.temp ? b : a)) : null,
)

const coolest = computed(() =>
  props.list.length ? props.list.reduce((a, b) => (b.temp < a.temp ? b : a)) : null,
)

// PrimeVue Hands on: Chart.js를 직접 붙이려면 캔버스 세팅/리사이즈/데이터 갱신을
// 다 손으로 관리해야 하는데, PrimeVue의 Chart 컴포넌트는 data/options만 넘겨주면
// 나머지(마운트, 리사이즈, 반응형 갱신)를 알아서 처리해준다.
// 기온이 높은 순으로 정렬해서, 막대 길이만 봐도 "어디가 제일 더운지" 바로 보이게 했다.
const chartData = computed(() => {
  const sorted = [...props.list].sort((a, b) => b.temp - a.temp)
  return {
    labels: sorted.map((item) => item.name),
    datasets: [
      {
        label: `기온(${configStore.unitSymbol})`,
        data: sorted.map((item) => configStore.toDisplayTemp(item.temp)),
        backgroundColor: sorted.map((item) =>
          item.temp >= 25 ? 'rgba(125, 89, 238, 0.82)' : 'rgba(54, 194, 158, 0.82)',
        ),
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0, 0, 0, 0.06)' },
      ticks: { callback: (value) => `${value}${configStore.unitSymbol}` },
    },
  },
}))
</script>

<template>
  <section class="stats-bar">
    <div class="stat">
      <span class="stat-icon">🌡️</span>
      <span class="stat-label">평균 기온</span>
      <span class="stat-value">
        {{ avgTemp === '-' ? '-' : `${configStore.toDisplayTemp(avgTemp)}${configStore.unitSymbol}` }}
      </span>
    </div>
    <div class="stat stat-hot">
      <span class="stat-icon">🔥</span>
      <span class="stat-label">최고</span>
      <span class="stat-value">
        {{ hottest ? `${hottest.name} ${configStore.toDisplayTemp(hottest.temp)}${configStore.unitSymbol}` : '-' }}
      </span>
    </div>
    <div class="stat stat-cold">
      <span class="stat-icon">❄️</span>
      <span class="stat-label">최저</span>
      <span class="stat-value">
        {{ coolest ? `${coolest.name} ${configStore.toDisplayTemp(coolest.temp)}${configStore.unitSymbol}` : '-' }}
      </span>
    </div>
    <div class="stat">
      <span class="stat-icon">🏙️</span>
      <span class="stat-label">도시 수</span>
      <span class="stat-value">{{ list.length }}개</span>
    </div>
  </section>

  <!-- PrimeVue Chart: 4개 숫자 요약만으로는 안 보이던 "도시별 편차"를 막대그래프로 한눈에 -->
  <section v-if="list.length" class="chart-card">
    <h4 class="chart-title">🌡️ 도시별 기온 비교</h4>
    <Chart type="bar" :data="chartData" :options="chartOptions" class="temp-chart" />
  </section>
</template>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0 0 12px;
}

.stat {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  padding: 14px 8px 12px;
  text-align: center;
  border-color: rgba(20, 23, 31, 0.07);
  box-shadow: 0 10px 28px rgba(26, 26, 38, 0.055);
}

.stat-icon {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.stat-hot .stat-value {
  color: #7357e8;
}

.stat-cold .stat-value {
  color: #22a681;
}

.stat-label {
  display: block;
  font-size: 0.78rem;
  color: #868e96;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a252f;
}

@media (max-width: 640px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

.chart-card {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 16px 18px 12px;
  margin-bottom: 14px;
  border-color: rgba(20, 23, 31, 0.07);
  box-shadow: 0 10px 28px rgba(26, 26, 38, 0.055);
}

.chart-title {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #1a252f;
}

.temp-chart {
  height: 220px;
}
</style>

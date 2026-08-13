<script setup>
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import ToggleSwitch from 'primevue/toggleswitch'
import InputNumber from 'primevue/inputnumber'
import { getWeatherIcon } from './weatherIcons'

// 다중 필터 3종(날씨 상태 체크박스, 즐겨찾기만 보기, 최소 기온)의 "진짜 값"은
// 전부 부모(WeatherHome.vue)가 들고 있다. 이 컴포넌트는 그 값을 props로 받아 화면에 그리고,
// 사용자가 조작하면 각각 다른 이름의 이벤트로 부모에게 "이렇게 바꿔주세요"라고 알린다.
const props = defineProps({
  availableStatuses: { type: Array, default: () => [] },
  selectedStatuses: { type: Array, default: () => [] },
  favoritesOnly: { type: Boolean, default: false },
  minTemp: { default: null },
})

const emit = defineEmits(['update-selected-statuses', 'update-favorites-only', 'update-min-temp'])

// SearchBar.vue와 똑같은 패턴 — 쓰기 가능한 computed 3개로 감싸서,
// 템플릿에서는 원래 WeatherHome.vue에 있던 것과 동일하게 v-model을 그대로 쓸 수 있게 한다.
const localSelectedStatuses = computed({
  get: () => props.selectedStatuses,
  set: (value) => emit('update-selected-statuses', value),
})

const localFavoritesOnly = computed({
  get: () => props.favoritesOnly,
  set: (value) => emit('update-favorites-only', value),
})

const localMinTemp = computed({
  get: () => props.minTemp,
  set: (value) => emit('update-min-temp', value),
})
</script>

<template>
  <div class="filter-box-body">
    <div class="filter-row">
      <label
        v-for="status in availableStatuses"
        :key="status"
        :for="`weather-status-${status}`"
        class="filter-chip"
        :class="{ selected: localSelectedStatuses.includes(status) }"
      >
        <Checkbox
          v-model="localSelectedStatuses"
          :inputId="`weather-status-${status}`"
          name="weather-status"
          :value="status"
        />
        <span>{{ getWeatherIcon(status) }} {{ status }}</span>
      </label>
    </div>

    <div class="filter-favorite">
      <div>
        <label for="favoritesOnly">⭐ 즐겨찾기만 보기</label>
        <small>저장한 도시만 빠르게 모아봅니다.</small>
      </div>
      <ToggleSwitch v-model="localFavoritesOnly" inputId="favoritesOnly" />
    </div>

    <div class="filter-temp">
      <label for="minTemp">🌡️ 최소 기온</label>
      <InputNumber
        v-model="localMinTemp"
        inputId="minTemp"
        :min="-50"
        :max="60"
        suffix=" °C"
        placeholder="예: 20"
        class="filter-temp-input"
      />
      <span v-if="minTemp !== null && minTemp !== ''" class="filter-temp-hint">
        {{ minTemp }}°C 이상만 보기
      </span>
    </div>
  </div>
</template>

<style scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 12px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  color: #495057;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.filter-chip.selected {
  background: #eafaf3;
  border-color: #42b883;
  color: #1a7f4f;
  font-weight: 600;
}

.filter-chip :deep(.p-checkbox) {
  width: 17px;
  height: 17px;
}

.filter-chip :deep(.p-checkbox-box) {
  width: 17px;
  height: 17px;
}

.filter-favorite {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  font-size: 0.85rem;
  color: #495057;
  background: #fffaf0;
  border: 1px solid #ffecb5;
  border-radius: 10px;
}

.filter-favorite label {
  display: block;
  font-weight: 700;
  cursor: pointer;
}

.filter-favorite small {
  display: block;
  margin-top: 2px;
  color: #8a7a56;
  font-size: 0.7rem;
}

.filter-temp {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f3f5;
}

.filter-temp label {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
  white-space: nowrap;
}

.filter-temp-input {
  width: 112px;
}

.filter-temp-input :deep(.p-inputnumber-input) {
  width: 100%;
  padding-block: 0.48rem;
  font-size: 0.82rem;
}

.filter-temp-hint {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1a7f4f;
  background: #eafaf3;
  padding: 3px 10px;
  border-radius: 999px;
}
</style>

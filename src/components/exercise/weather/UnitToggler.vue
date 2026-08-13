<script setup>
// PrimeVue Hands on: 커스텀 버튼이었던 단위 토글을 PrimeVue의 SelectButton으로 교체.
// SelectButton은 "여러 옵션 중 하나를 고르는 세그먼트 토글" UI를 접근성(키보드 이동, ARIA)까지
// 갖춰서 제공해준다 — 우리가 button + 조건부 텍스트로 직접 흉내내던 것과 동일한 역할.
import SelectButton from 'primevue/selectbutton'
import { useConfigStore } from '../../../stores/configStore'

// 여기서 const { unit } = configStore 처럼 구조분해하지 않는다.
// state/getters는 구조분해하는 순간 그 시점의 "값 스냅샷"이 복사되어 반응형이 끊어지므로,
// 항상 configStore.unit / configStore.unitSymbol처럼 store 인스턴스를 거쳐서 읽는다.
const configStore = useConfigStore()

const unitOptions = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
]

// SelectButton 자체가 현재 선택된 단위를 바로 보여주므로 별도 알림은 띄우지 않는다.
const onUnitChange = (val) => {
  if (!val) return
  configStore.setUnit(val)
}
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">날씨단위</span>
    <SelectButton
      :modelValue="configStore.unit"
      @update:modelValue="onUnitChange"
      :options="unitOptions"
      optionLabel="label"
      optionValue="value"
      :allowEmpty="false"
      size="small"
      aria-label="온도 단위 선택"
    />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit-label {
  font-size: 0.8rem;
  color: #495057;
  white-space: nowrap;
}
</style>

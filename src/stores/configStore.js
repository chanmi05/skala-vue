// 슬라이드의 Hands on 과제: 날씨 단위(섭씨/화씨)를 저장하는 Pinia store.
// counter.js와 같은 "setup store" 문법(ref/computed를 그대로 써서 state/getters/actions를
// 구성하고 return 하는 방식)을 그대로 따랐다.
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // state — 단위를 저장하는 변수 (초기값: celsius)
  const unit = ref('celsius') // 'celsius' | 'fahrenheit'

  // getters — 현재 단위 상태에 맞는 기호(°C / °F)
  const unitSymbol = computed(() => (unit.value === 'fahrenheit' ? '°F' : '°C'))

  // getters — 파라미터가 있는 getter는 computed가 "함수"를 반환하도록 만든다.
  // 이렇게 하면 toDisplayTemp(섭씨값)을 호출할 때마다 그 시점의 unit.value를 기준으로
  // 다시 계산해주고, WeatherCard/WeatherStats/WeatherDetailView 등 여러 화면에서
  // 같은 변환 공식을 각자 중복해서 쓰지 않아도 된다.
  const toDisplayTemp = computed(() => (celsius) => {
    if (unit.value === 'fahrenheit') {
      return Math.round((celsius * 9) / 5 + 32)
    }
    return celsius
  })

  // actions — 값을 직접 지정하는 setter.
  // PrimeVue SelectButton처럼 "두 옵션 중 하나를 직접 고르는" UI에서는
  // toggle(반전)이 아니라 "이 값으로 바꿔줘"가 필요해서 별도로 뺐다.
  const setUnit = (newUnit) => {
    unit.value = newUnit
  }

  // actions — 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수.
  // 내부적으로 setUnit을 재사용 — 로직이 두 군데로 나뉘지 않게.
  const toggleUnit = () => {
    setUnit(unit.value === 'celsius' ? 'fahrenheit' : 'celsius')
  }

  return { unit, unitSymbol, toDisplayTemp, toggleUnit, setUnit }
})

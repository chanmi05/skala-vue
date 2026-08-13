// PrimeVue v5부터는 무료 이용에도 "PrimeUI 커뮤니티 라이선스 키" 등록을 요구하기 시작해서
// (키가 없으면 화면에 빨간 경고 배너가 뜬다), 등록 없이 완전 무료(MIT)로 쓸 수 있는
// PrimeVue v4 + @primevue/themes 조합을 사용한다. 기능 차이는 없다.
//
// PrimeVue의 기본 Aura 테마는 그림자/간격/다크모드 로직까지 다 갖춘 완성형 테마지만,
// primary(포인트) 색상이 우리 앱이 원래 쓰던 브랜드 그린(#42b883 / #1a7f4f)과는 다르다.
// definePreset으로 Aura를 그대로 "확장"해서 primary 색상 토큰만 우리 색으로 덮어쓴다.
// → Aura가 기본 제공하는 그림자/간격/포커스링/다크모드 등은 그대로 유지하면서 색만 우리 톤에 맞춘다.
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

export const WeatherPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eafaf3',
      100: '#d0f2e3',
      200: '#a3e4c8',
      300: '#72d3aa',
      400: '#4ec798',
      500: '#42b883', // App.vue의 hero-label 등에 이미 쓰이던 기본 포인트 그린
      600: '#359a6d',
      700: '#1a7f4f', // nav 링크 hover/active 등에 쓰이던 진한 그린
      800: '#17603e',
      900: '#144e33',
      950: '#0a2e1d',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
    },
  },
})

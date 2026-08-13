import './assets/main.css'
import 'primeicons/primeicons.css' // PrimeVue 컴포넌트들이 쓰는 아이콘 폰트(pi pi-*)

import { createApp } from 'vue' // createApp이 중요! -> 인스턴스를 생성해주는 역할을 한다.
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'
import { WeatherPreset } from './theme/weatherPreset'

const app = createApp(App) // 애플리케이션 시작점 되는 최상위 컴포넌트 인자로 전달받기

app.use(createPinia())
app.use(router)
// PrimeVue: 기본 Aura 테마를 우리 브랜드 그린으로 커스터마이즈한 WeatherPreset을 등록.
// 이 프로젝트는 다크모드를 아예 안 쓰기 때문에 darkModeSelector를 'none'으로 꺼서,
// 사용자 OS가 다크모드여도 컴포넌트가 갑자기 어두워지지 않게 한다.
app.use(PrimeVue, {
  theme: {
    preset: WeatherPreset,
    options: { darkModeSelector: 'none' },
  },
})
// ToastService: 어느 컴포넌트에서든 useToast()로 화면 구석에 알림을 띄울 수 있게 해주는 전역 서비스.
// 실제 알림 UI(<Toast />)는 App.vue에 딱 한 번만 두면 된다(포탈처럼 화면 최상단에 렌더링됨).
app.use(ToastService)

app.mount('#app') // mount = 화면에 붙인다.

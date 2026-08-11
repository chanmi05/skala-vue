import './assets/main.css'

import { createApp } from 'vue' // createApp이 중요! -> 인스턴스를 생성해주는 역할을 한다.
import { createPinia } from 'pinia'

import App from './App2.vue'
import router from './router'

const app = createApp(App) // 애플리케이션 시작점 되는 최상위 컴포넌트 인자로 전달받기

app.use(createPinia())
app.use(router)

app.mount('#app') // mount = 화면에 붙인다.

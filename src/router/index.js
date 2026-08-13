import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // WeatherParent 역할이던 components/exercise/WeatherHome.vue를 views/로 옮긴 것.
      component: () => import('../views/WeatherHomeView.vue'),
    },
    {
      // :cityId는 동적 라우트 파라미터. /weather/city_08 처럼 접속하면
      // WeatherDetailView.vue 안에서 useRoute().params.cityId로 'city_08'을 읽을 수 있다.
      path: '/weather/:cityId',
      name: 'weather-detail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      // 두 번째 OpenWeatherMap API(5 Day / 3 Hour Forecast)를 활용한 추가 view.
      // 선택한 도시의 현지 시간대별 날씨를 iTunes 음악 추천과 연결한다.
      path: '/forecast-music/:cityId?',
      name: 'forecast-music',
      component: () => import('../views/ForecastMusicView.vue'),
    },
    {
      // 추가로 만든 페이지: 오늘 날씨에 어울리는 음악 추천.
      // cityId가 없는 /music과, 특정 도시를 지정하는 /music/:cityId 두 경로 모두
      // 같은 컴포넌트를 보여준다(컴포넌트 안에서 파라미터 유무를 직접 분기).
      path: '/music',
      name: 'music',
      component: () => import('../views/WeatherMusicView.vue'),
    },
    {
      path: '/music/:cityId',
      name: 'music-city',
      component: () => import('../views/WeatherMusicView.vue'),
    },
    {
      // 좋아요 당시의 도시·날씨·장르를 SVG 지도와 지역별 플레이리스트로 분석한다.
      path: '/music-taste',
      name: 'music-taste',
      component: () => import('../views/MusicTasteView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting: 이 라우트를 방문할 때만 별도 청크로 lazy-load된다.
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      // catch-all: 위 어떤 경로와도 매칭되지 않으면 404 페이지로 보낸다.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router

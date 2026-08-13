<script setup>
// RouterLink/RouterView는 main.js에서 app.use(router)를 호출하는 순간
// 전역 컴포넌트로 자동 등록되기 때문에 여기서 따로 import하지 않아도 된다.
import { onMounted } from 'vue'
import Toast from 'primevue/toast'
import UnitToggler from './components/exercise/weather/UnitToggler.vue'
import { fetchWeatherData } from './stores/weatherStore'

// nav에 표시할 오늘 날짜. 예전엔 WeatherHome.vue 안에서만 쓰였지만,
// 이제 nav 자체가 모든 라우트가 공유하는 "앱 셸(App shell)"로 올라왔기 때문에
// 여기서 한 번만 계산해서 모든 화면이 같이 쓴다.
const todayLabel = new Date().toLocaleDateString('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

// 앱이 처음 켜질 때 딱 한 번만 실제 날씨 데이터를 불러온다.
// 여기서 한 번만 호출해두면 weatherStore의 weatherList가 공유 상태이기 때문에
// 홈/상세/예보 음악/음악 화면 어디를 먼저 들어가도 같은 최신 데이터를 보게 된다.
onMounted(() => {
  fetchWeatherData()
})
</script>

<template>
  <!-- PrimeVue Toast: 화면 어디서든 useToast()로 띄우는 알림이 실제로 그려지는 자리.
       포탈처럼 항상 화면 우상단에 떠서, 여기 위치 자체는 레이아웃에 영향 없다. -->
  <Toast position="top-right" />

  <!-- 상단 고정 내비게이션: 페이지(view)가 바뀌어도 사라지지 않는 공통 영역이라
       RouterView 바깥, App.vue에 딱 한 번만 둔다. -->
  <nav class="site-nav">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand">
        <span class="brand-disc">◉</span>
        <span>WeatherNow <b>FM</b></span>
      </RouterLink>
      <ul class="nav-links">
        <li><RouterLink to="/">홈</RouterLink></li>
        <li><RouterLink to="/forecast-music">시간대별 믹스</RouterLink></li>
        <li><RouterLink to="/music">음악 탐색</RouterLink></li>
        <li><RouterLink to="/music-taste">나의 음악 취향</RouterLink></li>
        <li><RouterLink to="/about">소개</RouterLink></li>
      </ul>
      <!-- 날씨 단위(섭씨/화씨) 토글: nav 바 옆에 배치해서 항상 접근 가능하게 둔다 -->
      <UnitToggler />
      <span class="nav-date">{{ todayLabel }}</span>
    </div>
  </nav>

  <!-- 현재 URL과 매칭되는 라우트의 컴포넌트가 여기에 그려진다 -->
  <RouterView />

  <footer class="site-footer">
    <p>◉ WeatherNow FM · Weather-driven music discovery</p>
  </footer>
</template>

<style>
#app {
  display: block;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

body {
  display: block;
}

/* 아래는 원래 WeatherHome.vue 한 파일 안에만 있던 스타일 중,
   이제 여러 화면(view)이 공통으로 재사용해야 하는 것들을 App.vue 전역 스타일로 옮긴 것이다.
   <style scoped>는 "그 컴포넌트 안에서 정의한 규칙"만 그 컴포넌트로 한정할 뿐이므로,
   여기(App.vue)에 scoped 없이 적어두면 하위의 모든 라우트 화면에서 그대로 재사용할 수 있다. */

.weather-page {
  min-height: calc(100vh - 64px);
  width: 100%;
  transition: background 0.7s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.weather-page.weather-neutral {
  background: linear-gradient(180deg, #eef2f7 0%, #f7f9fb 100%);
}

.weather-page.weather-sunny {
  background: linear-gradient(180deg, #d8ecfb 0%, #eef8ff 55%, #f8fcff 100%);
}

.weather-page.weather-rainy {
  background: linear-gradient(180deg, #c3ceda 0%, #dbe3ea 55%, #f2f5f8 100%);
}

.weather-page.weather-snowy {
  background: linear-gradient(180deg, #dcedf9 0%, #eef7fc 55%, #fbfeff 100%);
}

.weather-page.weather-cloudy,
.weather-page.weather-misty {
  background: linear-gradient(180deg, #d6dade 0%, #e6e9ec 55%, #f4f5f6 100%);
}

.site-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(9, 11, 17, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 800;
  font-size: 1.05rem;
  color: #f7f5ef;
  text-decoration: none;
  white-space: nowrap;
}

.nav-brand b {
  color: #67ddba;
  font-size: 0.72em;
}

.brand-disc {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  color: #67ddba;
  background: repeating-radial-gradient(circle, #252833 0 2px, #0b0d12 3px 5px);
  box-shadow: 0 0 0 1px rgba(103, 221, 186, 0.28);
  animation: nav-disc-spin 9s linear infinite;
}

.nav-links {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.nav-links a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.15s ease;
}

.nav-links a:hover {
  color: #ffffff;
}

/* vue-router가 현재 경로와 일치하는 RouterLink에 자동으로 붙여주는 클래스.
   "지금 어느 페이지인지"를 직접 계산하지 않아도 라우터가 대신 표시해준다. */
.nav-links a.router-link-active {
  color: #67ddba;
}

.nav-date {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.site-nav .unit-label {
  color: rgba(255, 255, 255, 0.48);
}

.site-nav .p-togglebutton {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
}

.site-nav .p-togglebutton.p-togglebutton-checked {
  border-color: rgba(103, 221, 186, 0.5);
  background: rgba(103, 221, 186, 0.14);
  color: #82e7ca;
}

@keyframes nav-disc-spin {
  to { transform: rotate(360deg); }
}

.hero-banner {
  scroll-margin-top: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 24px 40px;
  text-align: center;
}

.hero-quote-card {
  max-width: 620px;
  margin: 0 auto;
  padding: 34px 32px 30px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  box-shadow: 0 10px 32px rgba(44, 62, 80, 0.09);
}

.hero-label {
  display: inline-block;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #1a7f4f;
  background: rgba(66, 184, 131, 0.14);
  border: 1px solid rgba(66, 184, 131, 0.32);
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}

.hero-icon {
  font-size: 52px;
  margin-bottom: 12px;
}

.hero-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #1a252f;
  margin: 0 0 10px;
  line-height: 1.35;
}

.hero-sub {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a7f4f;
  background: rgba(66, 184, 131, 0.1);
  padding: 4px 12px;
  border-radius: 999px;
  margin: 0;
}

.api-status {
  max-width: 1200px;
  margin: -8px auto 14px;
  padding: 0 24px;
  text-align: center;
  font-size: 0.82rem;
  color: #868e96;
}

.api-status-error {
  color: #e8590c;
  font-weight: 600;
}

/* PrimeVue Message로 교체한 로딩/에러 배너의 바깥 여백 —
   기존 .api-status와 같은 폭/여백으로 맞춰서 레이아웃이 튀지 않게 한다. */
.api-status-wrap {
  max-width: 1200px;
  margin: -8px auto 14px;
  padding: 0 24px;
}

.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 78px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.content {
  min-width: 0;
}

.list-box {
  scroll-margin-top: 78px;
  margin-bottom: 14px;
}

#stats {
  scroll-margin-top: 78px;
  margin-bottom: 14px;
}

.btn-reset {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #868e96;
  background: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-reset:hover {
  background: #e9ecef;
}

.btn-sort {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  background: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-sort:hover {
  background: #e9ecef;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 14px;
}

.empty-message {
  text-align: center;
  color: #e74c3c;
  padding: 24px 0;
}

.status-bar {
  margin-top: 16px;
  padding: 14px 18px;
  background: rgba(234, 250, 243, 0.9);
  border: 1px solid #c3ecdb;
  color: #1a7f4f;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  transition: all 0.15s ease;
}

.site-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px 24px 28px;
  text-align: center;
  background: #0b0d13;
}

.site-footer p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.42);
}

@media (max-width: 900px) {
  .page-body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .nav-links {
    gap: 12px;
  }

  .nav-date {
    display: none;
  }

  .unit-label {
    display: none;
  }
}
</style>

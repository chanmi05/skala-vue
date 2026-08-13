<script setup>
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const features = [
  {
    number: '01',
    icon: '◉',
    title: '지금 날씨를 한 곡으로',
    description:
      '선택한 도시의 현재 온도와 날씨, 시간대를 분석해 그 순간과 어울리는 음악을 추천합니다.',
  },
  {
    number: '02',
    icon: '◷',
    title: '앞으로의 하늘을 미리 듣기',
    description:
      '5일 동안의 3시간 단위 예보를 선택하고 미래의 아침, 낮, 저녁, 밤을 위한 믹스를 발견합니다.',
  },
  {
    number: '03',
    icon: '♫',
    title: '날씨로 시작하는 음악 탐색',
    description:
      '날씨가 만든 추천 검색어뿐 아니라 원하는 곡과 아티스트를 직접 검색하고 미리 들어볼 수 있습니다.',
  },
  {
    number: '04',
    icon: '⌖',
    title: '장소가 기억하는 음악 취향',
    description:
      '좋아요를 누른 도시와 날씨, 장르를 기록해 세계지도와 지역별 플레이리스트로 나만의 취향을 보여줍니다.',
  },
]

const technologies = [
  'Vue 3',
  'Composition API',
  'Vue Router',
  'Pinia',
  'PrimeVue',
  'Axios',
  'OpenWeatherMap',
  'iTunes Search API',
]
</script>

<template>
  <div class="about-page">
    <main class="about-page-body">
      <header class="about-hero">
        <div class="hero-copy">
          <span class="eyebrow">ABOUT WEATHERNow FM</span>
          <h1>날씨가 <em>음악이 되는</em><br />순간.</h1>
          <p>
            WeatherNow FM은 도시의 실제 날씨와 시간의 분위기를 음악으로 연결하는
            날씨 기반 음악 발견 서비스입니다. 오늘의 하늘을 확인하는 데서 멈추지 않고,
            지금 이 순간에 어울리는 한 곡을 만날 수 있도록 만들었습니다.
          </p>
          <div class="hero-actions">
            <Button as="router-link" to="/" label="오늘의 음악 듣기" icon="pi pi-play" rounded />
            <Button
              as="router-link"
              to="/music-taste"
              label="나의 취향 지도"
              icon="pi pi-map"
              severity="secondary"
              rounded
              outlined
            />
          </div>
        </div>

        <div class="about-turntable" aria-hidden="true">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="about-vinyl">
            <div class="vinyl-label"><span>W</span><small>NOW FM</small></div>
          </div>
          <div class="weather-notes">
            <span class="note note-sun">☀️</span>
            <span class="note note-rain">🌧️</span>
            <span class="note note-music">♫</span>
          </div>
        </div>
      </header>

      <section class="service-section">
        <div class="section-heading">
          <span>WHAT YOU CAN DO</span>
          <h2>하늘에서 시작되는 네 가지 음악 경험</h2>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.number" class="feature-card">
            <span class="feature-number">{{ feature.number }}</span>
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>

      <section class="data-story">
        <div class="story-copy">
          <span>HOW IT WORKS</span>
          <h2>두 개의 API가 하나의 플레이리스트가 되는 과정</h2>
          <p>
            OpenWeatherMap에서 받은 실제 기상 관측과 예보를 날씨·기온·현지 시간대별
            음악 검색 문맥으로 바꾼 뒤, iTunes Search API에서 앨범 이미지와 미리듣기가
            제공되는 곡을 찾아 보여줍니다.
          </p>
        </div>

        <div class="data-flow" aria-label="날씨 음악 추천 데이터 흐름">
          <div class="flow-node">
            <strong>OpenWeatherMap</strong>
            <span>현재 날씨 · 5일/3시간 예보</span>
          </div>
          <i class="pi pi-arrow-right"></i>
          <div class="flow-node flow-center">
            <strong>WeatherNow FM</strong>
            <span>날씨 + 도시 + 시간대 분석</span>
          </div>
          <i class="pi pi-arrow-right"></i>
          <div class="flow-node">
            <strong>iTunes Search</strong>
            <span>추천곡 · 앨범 · 미리듣기</span>
          </div>
        </div>
      </section>

      <section class="technology-section">
        <div>
          <span class="eyebrow">BUILT WITH</span>
          <h2>Vue로 연결한 날씨와 음악</h2>
          <p>
            반응형 상태, 컴포넌트 통신, 라우팅, 전역 Store와 Axios 비동기 요청을
            하나의 사용자 경험으로 구성한 Vue 학습 프로젝트입니다.
          </p>
        </div>
        <div class="technology-tags">
          <Tag v-for="technology in technologies" :key="technology" :value="technology" rounded />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 64px);
  color: #20222a;
  background:
    radial-gradient(circle at 8% 0%, rgba(126, 89, 238, 0.14), transparent 27%),
    radial-gradient(circle at 94% 13%, rgba(103, 221, 186, 0.11), transparent 25%),
    #f4f3f0;
}

.about-page-body {
  max-width: 1180px;
  margin: 0 auto;
  padding: 68px 24px 75px;
}

.about-hero {
  min-height: 500px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  align-items: center;
  gap: 50px;
}

.eyebrow,
.section-heading > span,
.story-copy > span {
  color: #7357e8;
  font-size: 0.67rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.hero-copy h1 {
  margin: 14px 0 20px;
  color: #14171e;
  font-size: clamp(2.6rem, 6vw, 4.8rem);
  line-height: 1.07;
  letter-spacing: -0.065em;
  word-break: keep-all;
}

.hero-copy h1 em {
  color: #7357e8;
  font-style: normal;
}

.hero-copy > p {
  max-width: 620px;
  margin: 0;
  color: #74767e;
  font-size: 0.94rem;
  line-height: 1.85;
  word-break: keep-all;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.about-turntable {
  position: relative;
  min-height: 440px;
  display: grid;
  place-items: center;
}

.about-vinyl {
  position: relative;
  z-index: 2;
  width: min(350px, 82vw);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle, transparent 0 4px, rgba(255, 255, 255, 0.05) 5px 6px),
    radial-gradient(circle at 40% 35%, #444755, #13151b 48%, #050607 78%);
  box-shadow: 0 35px 55px rgba(11, 12, 17, 0.3);
  animation: vinyl-spin 15s linear infinite;
}

.vinyl-label {
  width: 39%;
  height: 39%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 7px solid #0b0c10;
  border-radius: 50%;
  color: #1a1c24;
  background: linear-gradient(145deg, #a991ff, #67ddba);
}

.vinyl-label span { font-size: 2.4rem; font-weight: 900; }
.vinyl-label small { font-size: 0.55rem; font-weight: 900; letter-spacing: 0.15em; }

.orbit {
  position: absolute;
  border: 1px dashed rgba(115, 87, 232, 0.22);
  border-radius: 50%;
}

.orbit-one { width: 420px; height: 420px; }
.orbit-two { width: 490px; height: 490px; }
.weather-notes span { position: absolute; z-index: 3; display: grid; place-items: center; border-radius: 50%; background: #fff; box-shadow: 0 10px 25px rgba(30, 30, 42, 0.13); }
.note-sun { top: 47px; right: 49px; width: 54px; height: 54px; }
.note-rain { bottom: 38px; left: 38px; width: 58px; height: 58px; }
.note-music { right: 17px; bottom: 112px; width: 43px; height: 43px; color: #7357e8; font-size: 1.3rem; }

.service-section { padding-top: 75px; }
.section-heading { text-align: center; }
.section-heading h2,
.story-copy h2,
.technology-section h2 { margin: 7px 0 0; color: #171920; font-size: clamp(1.7rem, 4vw, 2.6rem); letter-spacing: -0.045em; }

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px;
  margin-top: 29px;
}

.feature-card {
  position: relative;
  min-height: 245px;
  padding: 24px 22px;
  overflow: hidden;
  border: 1px solid rgba(22, 24, 32, 0.07);
  border-radius: 21px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 35px rgba(35, 34, 50, 0.055);
}

.feature-number { position: absolute; top: 20px; right: 20px; color: #d7d1ee; font-size: 0.7rem; font-weight: 900; }
.feature-icon { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 15px; color: #fff; background: linear-gradient(135deg, #7357e8, #5acba9); font-size: 1.25rem; }
.feature-card h3 { margin: 22px 0 8px; color: #292b34; font-size: 1rem; }
.feature-card p { margin: 0; color: #858790; font-size: 0.77rem; line-height: 1.7; word-break: keep-all; }

.data-story {
  margin-top: 72px;
  padding: 37px;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  align-items: center;
  gap: 40px;
  border-radius: 27px;
  color: #f6f6f8;
  background:
    radial-gradient(circle at 75% 40%, rgba(103, 221, 186, 0.12), transparent 30%),
    #11141d;
}

.story-copy h2 { color: #fff; }
.story-copy p { margin: 14px 0 0; color: rgba(255, 255, 255, 0.56); font-size: 0.78rem; line-height: 1.8; word-break: keep-all; }

.data-flow { display: flex; align-items: center; justify-content: center; gap: 10px; }
.data-flow > i { color: rgba(103, 221, 186, 0.55); }
.flow-node { min-width: 145px; padding: 17px 13px; display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 15px; background: rgba(255, 255, 255, 0.055); text-align: center; }
.flow-node strong { font-size: 0.76rem; }
.flow-node span { color: rgba(255, 255, 255, 0.42); font-size: 0.61rem; }
.flow-center { border-color: rgba(103, 221, 186, 0.28); background: rgba(103, 221, 186, 0.09); }

.technology-section {
  margin-top: 20px;
  padding: 29px 33px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 35px;
  border: 1px solid rgba(22, 24, 32, 0.07);
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.72);
}

.technology-section h2 { font-size: 1.5rem; }
.technology-section p { margin: 8px 0 0; color: #898b93; font-size: 0.75rem; line-height: 1.7; }
.technology-tags { display: flex; flex-wrap: wrap; gap: 7px; justify-content: flex-end; }
.technology-tags :deep(.p-tag) { color: #6048bf; background: #eeeaff; }

@keyframes vinyl-spin { to { transform: rotate(360deg); } }

@media (max-width: 930px) {
  .about-hero { grid-template-columns: 1fr; text-align: center; }
  .hero-copy > p { margin-inline: auto; }
  .hero-actions { justify-content: center; }
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
  .data-story { grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .about-page-body { padding: 45px 14px 60px; }
  .about-turntable { min-height: 360px; }
  .orbit-one { width: 330px; height: 330px; }
  .orbit-two { width: 365px; height: 365px; }
  .feature-grid { grid-template-columns: 1fr; }
  .data-story { padding: 27px 20px; }
  .data-flow { align-items: stretch; flex-direction: column; }
  .data-flow > i { transform: rotate(90deg); align-self: center; }
  .technology-section { grid-template-columns: 1fr; padding: 24px; }
  .technology-tags { justify-content: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .about-vinyl { animation: none; }
}
</style>

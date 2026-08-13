<script setup>
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { getWeatherIcon } from './weatherIcons'

defineProps({
  city: { type: Object, default: null },
  tracks: { type: Array, default: () => [] },
  topGenre: { type: String, default: '' },
})

const emit = defineEmits(['remove-track'])
</script>

<template>
  <aside class="playlist-panel">
    <header class="playlist-header">
      <div>
        <span>REGIONAL PLAYLIST</span>
        <h2>{{ city?.name ?? '지역을 선택하세요' }}</h2>
        <p v-if="city">{{ tracks.length }}곡 · {{ topGenre || '아직 취향 분석 전' }}</p>
      </div>
      <Tag v-if="city" :value="`${getWeatherIcon(city.status)} ${city.status}`" rounded />
    </header>

    <div v-if="tracks.length" class="liked-playlist">
      <article v-for="(track, index) in tracks" :key="track.id ?? track.title" class="liked-track">
        <span class="track-index">{{ String(index + 1).padStart(2, '0') }}</span>
        <img :src="track.artworkUrl" :alt="`${track.album} 앨범 표지`" />
        <div class="track-copy">
          <strong>{{ track.title }}</strong>
          <span>{{ track.artist }}</span>
          <small>
            {{ getWeatherIcon(track.weather?.status) }} {{ track.weather?.status }} ·
            {{ track.genre || '기타' }}
          </small>
        </div>
        <Button
          icon="pi pi-heart-fill"
          severity="danger"
          text
          rounded
          size="small"
          :aria-label="`${track.title} 좋아요 취소`"
          @click="emit('remove-track', track)"
        />
        <audio v-if="track.previewUrl" :src="track.previewUrl" controls preload="none"></audio>
      </article>
    </div>

    <div v-else class="empty-playlist">
      <span>♡</span>
      <strong>{{ city ? `${city.name}에서 저장한 곡이 없어요` : '지도에서 도시를 골라보세요' }}</strong>
      <p>음악 탐색에서 좋아요를 누르면 지역별 목록에 쌓입니다.</p>
      <Button as="router-link" to="/music" label="음악 탐색하기" icon="pi pi-headphones" rounded />
    </div>
  </aside>
</template>

<style scoped>
.playlist-panel {
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(20, 23, 31, 0.08);
  border-radius: 25px;
  background: #fff;
  box-shadow: 0 14px 38px rgba(25, 27, 38, 0.07);
}

.playlist-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 24px 23px 19px;
  border-bottom: 1px solid #eef0f3;
}

.playlist-header > div > span {
  color: #7357e8;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.playlist-header h2 { margin: 5px 0 2px; color: #1f222b; font-size: 1.35rem; }
.playlist-header p { margin: 0; color: #92949c; font-size: 0.72rem; }
.playlist-header :deep(.p-tag) { background: #f0edff; color: #684dc9; }

.liked-playlist {
  max-height: 490px;
  overflow-y: auto;
  padding: 5px 16px 16px;
}

.liked-track {
  display: grid;
  grid-template-columns: 25px 52px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  padding: 13px 4px;
  border-bottom: 1px solid #f0f1f3;
}

.liked-track img { width: 52px; height: 52px; border-radius: 11px; object-fit: cover; }
.track-index { color: #b0b2b8; font-size: 0.65rem; font-weight: 800; }
.track-copy { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.track-copy strong,
.track-copy span,
.track-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track-copy strong { color: #292c34; font-size: 0.8rem; }
.track-copy span { color: #858890; font-size: 0.68rem; }
.track-copy small { color: #7357e8; font-size: 0.61rem; }
.liked-track audio { grid-column: 2 / -1; width: 100%; height: 30px; }

.empty-playlist {
  min-height: 420px;
  padding: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-playlist > span { color: #d6cfff; font-size: 3.5rem; }
.empty-playlist strong { margin-top: 7px; color: #42454e; }
.empty-playlist p { margin: 7px 0 18px; color: #9698a0; font-size: 0.74rem; line-height: 1.6; }
</style>

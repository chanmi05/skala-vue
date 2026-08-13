// "본인만의 추가 Store" 요구사항으로 만든 store.
// WeatherMusicView.vue에서 하트(좋아요)를 누른 트랙들을 여기에 모아두고,
// "어떤 날씨의 곡을 가장 많이 좋아했는지"를 집계해서 보여주는 데 쓴다.
// 좋아요는 특정 도시 하나가 아니라 앱 전체에서 공유되는 취향 데이터라서
// weatherStore와 마찬가지로 store로 분리해두는 게 자연스럽다.
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { searchITunesTracks } from '../api/iTunesApi'

const LIKED_TRACKS_STORAGE_KEY = 'weathernow-fm-liked-tracks'

const loadLikedTracks = () => {
  if (typeof localStorage === 'undefined') return []

  try {
    const savedTracks = JSON.parse(localStorage.getItem(LIKED_TRACKS_STORAGE_KEY) ?? '[]')
    return Array.isArray(savedTracks) ? savedTracks : []
  } catch (error) {
    console.warn('[musicStore] 저장된 좋아요 데이터를 읽지 못했습니다:', error)
    return []
  }
}

export const useMusicStore = defineStore('music', () => {
  // Axios 요청 결과와 요청 상태. 화면은 이 값만 보고 로딩/성공/실패 UI를 그린다.
  const tracks = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const lastQuery = ref('')

  // state — 좋아요한 트랙 목록. iTunes trackId(목데이터는 title)를 기준으로 중복을 막는다.
  const likedTracks = ref(loadLikedTracks()) // { id, title, artist, status, ... }[]

  // 새로고침 뒤에도 지도와 취향 분석이 유지되도록 좋아요 목록만 localStorage에 저장한다.
  watch(
    likedTracks,
    (tracksToSave) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(LIKED_TRACKS_STORAGE_KEY, JSON.stringify(tracksToSave))
    },
    { deep: true },
  )

  // getters
  // 특정 곡이 좋아요 상태인지 확인하는 파라미터형 getter.
  const getTrackKey = (trackOrKey) =>
    typeof trackOrKey === 'object' ? (trackOrKey.id ?? trackOrKey.title) : trackOrKey

  const isLiked = computed(
    () => (trackOrKey) =>
      likedTracks.value.some((track) => getTrackKey(track) === getTrackKey(trackOrKey)),
  )

  // 이전 데이터(status만 있던 형태)와 새 데이터(weather 문맥이 있는 형태)를 모두 읽는다.
  const getWeatherStatus = (track) => track.weather?.status ?? track.status

  // 단순 개수뿐 아니라, 각 날씨에서 좋아요한 곡/장르/도시까지 함께 집계한다.
  // 따라서 "맑음의 곡"처럼 곡을 날씨로 분류하는 대신
  // "맑은 날 어떤 곡을 좋아했는지"라는 사용자 행동 문맥을 설명할 수 있다.
  const weatherPreferences = computed(() => {
    const preferences = {}

    likedTracks.value.forEach((track) => {
      const status = getWeatherStatus(track)
      if (!status) return

      if (!preferences[status]) {
        preferences[status] = {
          status,
          count: 0,
          tracks: [],
          genreCounts: {},
          cityCounts: {},
          topGenre: null,
          topGenreCount: 0,
          topCity: null,
        }
      }

      const preference = preferences[status]
      const genre = track.genre || '기타'
      const city = track.weather?.cityName || '도시 정보 없음'

      preference.count += 1
      preference.tracks.push(track)
      preference.genreCounts[genre] = (preference.genreCounts[genre] ?? 0) + 1
      preference.cityCounts[city] = (preference.cityCounts[city] ?? 0) + 1
    })

    Object.values(preferences).forEach((preference) => {
      const topGenreEntry = Object.entries(preference.genreCounts).sort((a, b) => b[1] - a[1])[0]
      preference.topGenre = topGenreEntry?.[0] ?? null
      preference.topGenreCount = topGenreEntry?.[1] ?? 0
      preference.topCity =
        Object.entries(preference.cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    })

    return preferences
  })

  const likeCountByStatus = computed(() =>
    Object.fromEntries(
      Object.entries(weatherPreferences.value).map(([status, preference]) => [
        status,
        preference.count,
      ]),
    ),
  )

  // 좋아요가 가장 많은 날씨 상태(하나도 없으면 null)
  const favoriteWeatherMood = computed(() => {
    const entries = Object.entries(likeCountByStatus.value)
    if (!entries.length) return null
    return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0]
  })

  const favoriteWeatherPreference = computed(
    () => weatherPreferences.value[favoriteWeatherMood.value] ?? null,
  )

  const totalLiked = computed(() => likedTracks.value.length)

  const genrePreferences = computed(() => {
    const counts = {}
    likedTracks.value.forEach((track) => {
      const genre = track.genre || '기타'
      counts[genre] = (counts[genre] ?? 0) + 1
    })
    return counts
  })

  const favoriteGenre = computed(() => {
    const entries = Object.entries(genrePreferences.value)
    if (!entries.length) return null
    return entries.reduce((best, current) => (current[1] > best[1] ? current : best))[0]
  })

  // actions
  const toggleLike = (track, weatherContext) => {
    const key = getTrackKey(track)
    const exists = likedTracks.value.some((item) => getTrackKey(item) === key)
    const weather =
      typeof weatherContext === 'string' ? { status: weatherContext } : { ...weatherContext }

    likedTracks.value = exists
      ? likedTracks.value.filter((item) => getTrackKey(item) !== key)
      : [
          ...likedTracks.value,
          {
            ...track,
            // status는 기존 getter/실습 코드를 위한 호환 필드이고,
            // weather에는 좋아요를 누른 당시의 자세한 상황을 보관한다.
            status: weather.status,
            weather,
            likedAt: new Date().toISOString(),
          },
        ]
  }

  const removeLikedTrack = (trackOrKey) => {
    const key = getTrackKey(trackOrKey)
    likedTracks.value = likedTracks.value.filter((item) => getTrackKey(item) !== key)
  }

  // 도시를 빠르게 바꿨을 때 이전 요청을 취소해, 늦게 도착한 응답이 최신 화면을 덮지 않게 한다.
  let activeController = null

  const searchTracks = async (query) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    activeController?.abort()
    const controller = new AbortController()
    activeController = controller

    isLoading.value = true
    errorMessage.value = ''
    lastQuery.value = trimmedQuery

    try {
      tracks.value = await searchITunesTracks(trimmedQuery, {
        limit: 8,
        signal: controller.signal,
      })

      if (tracks.value.length === 0) {
        errorMessage.value = '검색 결과가 없어요. 다른 검색어를 입력해 보세요.'
      }
    } catch (error) {
      // 새 검색 때문에 취소된 요청은 사용자에게 오류로 보여주지 않는다.
      if (error.code !== 'ERR_CANCELED') {
        errorMessage.value = '음악 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
        console.error('[searchTracks] iTunes API 호출 실패:', error)
      }
    } finally {
      // 현재 진행 중인 요청일 때만 로딩을 끝낸다.
      if (!controller.signal.aborted) isLoading.value = false
    }
  }

  return {
    tracks,
    isLoading,
    errorMessage,
    lastQuery,
    likedTracks,
    isLiked,
    likeCountByStatus,
    favoriteWeatherMood,
    favoriteWeatherPreference,
    weatherPreferences,
    genrePreferences,
    favoriteGenre,
    totalLiked,
    toggleLike,
    removeLikedTrack,
    searchTracks,
  }
})

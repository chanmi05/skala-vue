// Pinia 없이도 여러 화면(view)이 "같은" 날씨 데이터를 공유할 수 있도록,
// 이 모듈 최상단에서 반응형 값(ref)을 딱 한 번만 만들고 export한다.
// 이 파일을 import하는 모든 컴포넌트는 서로 다른 복사본이 아니라
// 정확히 같은 ref 인스턴스를 참조하게 되므로, 한쪽(WeatherHomeView)에서
// 즐겨찾기를 누르면 다른 쪽(WeatherFavoritesView)에도 즉시 반영된다.
// 실제 프로젝트라면 이 역할을 Pinia store가 대신하는 경우가 많다(이번엔 의도적으로 생략).
import { ref, computed } from 'vue'
import { fetchCityWeather } from '../api/openWeatherApi'

// 앱이 켜지자마자 화면에 뭔가는 바로 보여주기 위한 초기값(fallback).
// fetchWeatherData()가 성공하면 이 배열이 실제 API 응답으로 통째로 교체된다.
// id/name을 그대로 유지했기 때문에 즐겨찾기(favoriteIds)나 라우터(/weather/:cityId)는
// 실제 데이터로 바뀌어도 전혀 영향을 받지 않는다.
//
// 국내는 17개 광역시·도(도청 소재지 기준)를 전부 커버하고, 해외는 대륙별 대표 도시를
// 하나씩 추가했다 — country가 'KR'이 아니면 WeatherCard에 국기 배지가 붙는다.
export const weatherList = ref([
  // --- 국내: 광역시 ---
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 55, windSpeed: 2.1, country: 'KR' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 62, windSpeed: 4.0, country: 'KR' },
  { id: 'city_04', name: '인천', temp: 27, status: '맑음', humidity: 58, windSpeed: 2.8, country: 'KR' },
  { id: 'city_05', name: '대구', temp: 30, status: '흐림', humidity: 45, windSpeed: 1.5, country: 'KR' },
  { id: 'city_08', name: '대전', temp: 38, status: '맑음', humidity: 28, windSpeed: 1.1, country: 'KR' }, // 폭염 시나리오 데모용
  { id: 'city_09', name: '광주', temp: 27, status: '맑음', humidity: 60, windSpeed: 2.3, country: 'KR' },
  { id: 'city_10', name: '울산', temp: 26, status: '구름', humidity: 58, windSpeed: 3.0, country: 'KR' },
  { id: 'city_11', name: '세종', temp: 27, status: '맑음', humidity: 52, windSpeed: 1.8, country: 'KR' },
  // --- 국내: 도청 소재지 ---
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, windSpeed: 3.4, country: 'KR' }, // 경기도청
  { id: 'city_06', name: '강릉', temp: 3, status: '눈', humidity: 70, windSpeed: 5.2, country: 'KR' }, // 강원 동해안(관광 대표도시)
  { id: 'city_12', name: '춘천', temp: 25, status: '맑음', humidity: 50, windSpeed: 1.6, country: 'KR' }, // 강원도청
  { id: 'city_13', name: '청주', temp: 28, status: '맑음', humidity: 55, windSpeed: 1.9, country: 'KR' }, // 충북도청
  { id: 'city_14', name: '홍성', temp: 26, status: '흐림', humidity: 63, windSpeed: 2.2, country: 'KR' }, // 충남도청(내포신도시)
  { id: 'city_15', name: '전주', temp: 27, status: '구름', humidity: 61, windSpeed: 2.0, country: 'KR' }, // 전북도청
  { id: 'city_16', name: '무안', temp: 27, status: '비', humidity: 78, windSpeed: 3.6, country: 'KR' }, // 전남도청(남악신도시)
  { id: 'city_17', name: '안동', temp: 24, status: '맑음', humidity: 48, windSpeed: 1.7, country: 'KR' }, // 경북도청 신도시
  { id: 'city_18', name: '창원', temp: 28, status: '맑음', humidity: 57, windSpeed: 2.5, country: 'KR' }, // 경남도청
  { id: 'city_07', name: '제주', temp: 29, status: '맑음', humidity: 66, windSpeed: 3.9, country: 'KR' }, // 제주도청
  // --- 해외: 대륙별 대표 도시 ---
  { id: 'city_19', name: '도쿄', temp: 30, status: '맑음', humidity: 65, windSpeed: 2.8, country: 'JP' }, // 아시아
  { id: 'city_20', name: '뉴욕', temp: 25, status: '구름', humidity: 55, windSpeed: 3.5, country: 'US' }, // 북아메리카
  { id: 'city_21', name: '파리', temp: 22, status: '흐림', humidity: 68, windSpeed: 3.0, country: 'FR' }, // 유럽
  { id: 'city_22', name: '카이로', temp: 36, status: '맑음', humidity: 25, windSpeed: 2.0, country: 'EG' }, // 아프리카
  { id: 'city_23', name: '상파울루', temp: 19, status: '비', humidity: 75, windSpeed: 2.9, country: 'BR' }, // 남아메리카
  { id: 'city_24', name: '시드니', temp: 15, status: '맑음', humidity: 60, windSpeed: 4.2, country: 'AU' }, // 오세아니아(8월=겨울)
])

// Axios로 실제 날씨를 가져올 도시 목록(위도/경도). 위 목데이터와 id/name/country를 그대로 맞춰뒀다.
const CITY_COORDS = [
  { id: 'city_01', name: '서울', lat: 37.5665, lon: 126.978, country: 'KR' },
  { id: 'city_02', name: '수원', lat: 37.2636, lon: 127.0286, country: 'KR' },
  { id: 'city_03', name: '부산', lat: 35.1796, lon: 129.0756, country: 'KR' },
  { id: 'city_04', name: '인천', lat: 37.4563, lon: 126.7052, country: 'KR' },
  { id: 'city_05', name: '대구', lat: 35.8714, lon: 128.6014, country: 'KR' },
  { id: 'city_06', name: '강릉', lat: 37.7519, lon: 128.8761, country: 'KR' },
  { id: 'city_07', name: '제주', lat: 33.4996, lon: 126.5312, country: 'KR' },
  { id: 'city_08', name: '대전', lat: 36.3504, lon: 127.3845, country: 'KR' },
  { id: 'city_09', name: '광주', lat: 35.1595, lon: 126.8526, country: 'KR' },
  { id: 'city_10', name: '울산', lat: 35.5384, lon: 129.3114, country: 'KR' },
  { id: 'city_11', name: '세종', lat: 36.4801, lon: 127.289, country: 'KR' },
  { id: 'city_12', name: '춘천', lat: 37.8813, lon: 127.7298, country: 'KR' },
  { id: 'city_13', name: '청주', lat: 36.6424, lon: 127.489, country: 'KR' },
  { id: 'city_14', name: '홍성', lat: 36.6011, lon: 126.6608, country: 'KR' },
  { id: 'city_15', name: '전주', lat: 35.8242, lon: 127.148, country: 'KR' },
  { id: 'city_16', name: '무안', lat: 34.9903, lon: 126.4818, country: 'KR' },
  { id: 'city_17', name: '안동', lat: 36.5684, lon: 128.7294, country: 'KR' },
  { id: 'city_18', name: '창원', lat: 35.2281, lon: 128.6811, country: 'KR' },
  { id: 'city_19', name: '도쿄', lat: 35.6762, lon: 139.6503, country: 'JP' },
  { id: 'city_20', name: '뉴욕', lat: 40.7128, lon: -74.006, country: 'US' },
  { id: 'city_21', name: '파리', lat: 48.8566, lon: 2.3522, country: 'FR' },
  { id: 'city_22', name: '카이로', lat: 30.0444, lon: 31.2357, country: 'EG' },
  { id: 'city_23', name: '상파울루', lat: -23.5505, lon: -46.6333, country: 'BR' },
  { id: 'city_24', name: '시드니', lat: -33.8688, lon: 151.2093, country: 'AU' },
]

// 예보 페이지가 현재 날씨와 동일한 도시 좌표를 재사용할 수 있게 제공한다.
// 배열 자체는 외부에서 수정하지 못하게 하고, 필요한 도시 한 건만 복사해서 돌려준다.
export const getCityCoordinates = (cityId) => {
  const city = CITY_COORDS.find((item) => item.id === cityId)
  return city ? { ...city } : null
}

export const isWeatherLoading = ref(false)
export const weatherFetchError = ref(null)

// 24개 도시(국내 18 + 해외 6)의 실제 날씨를 한 번에 불러와서 weatherList를 통째로 교체한다.
// App.vue가 처음 켜질 때 한 번만 호출한다(여러 화면이 각자 부르면 API를 중복 호출하게 됨).
export const fetchWeatherData = async () => {
  isWeatherLoading.value = true
  weatherFetchError.value = null
  try {
    const results = await Promise.all(CITY_COORDS.map(fetchCityWeather))
    weatherList.value = results
  } catch (err) {
    // 실패해도 위의 목데이터가 그대로 남아있어서 화면이 비지는 않는다.
    weatherFetchError.value = '실시간 날씨 데이터를 불러오지 못했어요. 예시 데이터를 표시하고 있어요.'
    console.error('[fetchWeatherData] 날씨 API 호출 실패:', err)
  } finally {
    isWeatherLoading.value = false
  }
}

export const favoriteIds = ref([])

export const toggleFavorite = (id) => {
  favoriteIds.value = favoriteIds.value.includes(id)
    ? favoriteIds.value.filter((fid) => fid !== id)
    : [...favoriteIds.value, id]
}

// WeatherDetailView가 라우트 파라미터(:cityId)만 가지고 실제 도시 데이터를 찾아올 때 쓴다.
export const findCityById = (cityId) =>
  weatherList.value.find((item) => item.id === cityId) ?? null

// 오늘 전체 도시 중 가장 더운/추운 곳 — 홈 화면과 즐겨찾기 화면이 동일한 기준을 공유한다.
export const hottestCity = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp > a.temp ? b : a), weatherList.value[0]),
)
export const coldestCity = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp < a.temp ? b : a), weatherList.value[0]),
)

// OpenWeatherMap "Current Weather Data" API를 axios로 호출하는 부분만 따로 모아둔 파일.
// store(weatherStore.js)는 "데이터를 어디서 가져오는지"는 몰라도 되고,
// 그냥 이 함수가 돌려주는 결과만 받아서 weatherList에 넣으면 되도록 책임을 나눴다.
import axios from 'axios'

const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

// Vite는 VITE_로 시작하는 환경변수만 클라이언트 코드(import.meta.env)에 노출해준다.
// 실제 키 값은 .env.local 파일에 넣어두고(이 파일은 .gitignore의 *.local 패턴에
// 이미 걸려있어서 git에는 절대 올라가지 않는다), 여기서는 그 값을 읽기만 한다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// OpenWeatherMap이 주는 날씨 대분류(weather[0].main)는 영어 고정값(Clear/Rain/Snow/...)이다.
// 이 프로젝트 전체(getWeatherIcon, getWeatherTheme, OutfitBoard, musicPlaylists 등)는
// '맑음'/'비'/'구름'/'눈'/'흐림' 5개 한글 문자열만 알고 있으면 되도록 만들어져 있어서,
// API 응답을 이 5개 중 하나로 변환해주는 역할을 이 함수 하나가 전담한다.
// → 덕분에 나머지 컴포넌트/스토어는 데이터가 목데이터인지 실제 API 응답인지 전혀 몰라도 된다.
const STATUS_MAP = {
  Clear: '맑음',
  Clouds: '구름',
  Rain: '비',
  Drizzle: '비',
  Thunderstorm: '비',
  Snow: '눈',
}
const DEFAULT_STATUS = '흐림' // Mist/Fog/Haze/Dust 등 나머지는 전부 '흐림'으로 취급

const toKoreanStatus = (main) => STATUS_MAP[main] ?? DEFAULT_STATUS

const weatherDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  weekday: 'short',
})

const weatherTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

// 위도/경도 기준으로 한 도시의 현재 날씨를 가져와서, 이 프로젝트가 원래 쓰던 목데이터와
// 기존 도시 필드에 상세 관측값(체감온도, 기압, 가시거리, 강수량, 현지 관측시각)을 더해 돌려준다.
// 기본 필드 모양은 유지하므로 WeatherCard/OutfitBoard/WeatherStats도 그대로 사용할 수 있다.
// country는 API 응답이 아니라 CITY_COORDS에 이미 알고 있는 값을 그대로 넘겨준다
// (weatherStore.js가 국내/해외 도시를 구분해서 관리하기 위한 정적 정보라 API가 몰라도 됨).
export const fetchCityWeather = async ({ id, name, lat, lon, country }) => {
  const { data } = await axios.get(CURRENT_WEATHER_URL, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric', // 섭씨로 바로 받는다 (기존 데이터도 전부 섭씨 기준이었음)
      lang: 'kr',
    },
  })

  const timezoneOffset = data.timezone ?? 0
  const cityLocalDate = new Date((data.dt + timezoneOffset) * 1000)

  return {
    id,
    name,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    status: toKoreanStatus(data.weather[0].main),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    cloudiness: data.clouds?.all ?? 0,
    visibilityKm: Math.round(((data.visibility ?? 0) / 1000) * 10) / 10,
    precipitationVolume:
      data.rain?.['1h'] ?? data.snow?.['1h'] ?? data.rain?.['3h'] ?? data.snow?.['3h'] ?? 0,
    observedAt: data.dt * 1000,
    localDateTime: cityLocalDate.toISOString(),
    dayLabel: weatherDateFormatter.format(cityLocalDate),
    timeLabel: weatherTimeFormatter.format(cityLocalDate),
    localHour: cityLocalDate.getUTCHours(),
    timezoneOffset,
    country,
  }
}

// OpenWeatherMap의 5 Day / 3 Hour Forecast 응답은 UTC 시각(dt)과 도시의
// UTC 오프셋(city.timezone)을 따로 준다. 두 값을 더한 뒤 UTC 포매터를 사용하면
// 사용자의 브라우저 시간대와 상관없이 선택한 도시의 현지 날짜/시간을 표시할 수 있다.
const normalizeForecastItem = (item, timezoneOffset) => {
  const cityLocalDate = new Date((item.dt + timezoneOffset) * 1000)

  return {
    id: String(item.dt),
    timestamp: item.dt * 1000,
    localDateTime: cityLocalDate.toISOString(),
    dayKey: cityLocalDate.toISOString().slice(0, 10),
    dayLabel: weatherDateFormatter.format(cityLocalDate),
    timeLabel: weatherTimeFormatter.format(cityLocalDate),
    localHour: cityLocalDate.getUTCHours(),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    tempMin: Math.round(item.main.temp_min),
    tempMax: Math.round(item.main.temp_max),
    humidity: item.main.humidity,
    windSpeed: item.wind.speed,
    precipitationProbability: Math.round((item.pop ?? 0) * 100),
    precipitationVolume: item.rain?.['3h'] ?? item.snow?.['3h'] ?? 0,
    status: toKoreanStatus(item.weather[0].main),
    description: item.weather[0].description,
  }
}

// 두 번째 OpenWeatherMap API: 앞으로 5일 동안의 예보를 3시간 간격으로 가져온다.
// 화면에서는 이 배열 중 한 시간대를 선택하고, 날씨 + 현지 시간대를 iTunes 검색어로 바꾼다.
export const fetchCityForecast = async ({ lat, lon }, { signal } = {}) => {
  const { data } = await axios.get(FORECAST_URL, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
    signal,
  })

  const timezoneOffset = data.city.timezone ?? 0

  return {
    city: {
      name: data.city.name,
      country: data.city.country,
      timezoneOffset,
    },
    items: data.list.map((item) => normalizeForecastItem(item, timezoneOffset)),
  }
}

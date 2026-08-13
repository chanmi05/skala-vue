// 3시간 예보의 도시 현지 시각을 음악 추천에 쓰기 위한 규칙.
// OpenWeatherMap은 날씨를, iTunes는 음악을 제공할 뿐 두 API가 서로를 알지는 못한다.
// 이 파일이 두 데이터 사이에서 "비 오는 저녁 -> rainy sunset acoustic" 같은 문맥을 만든다.
const TIME_PERIODS = [
  {
    key: 'morning',
    label: '아침',
    icon: '🌅',
    matches: (hour) => hour >= 5 && hour < 11,
    searchTerm: 'morning coffee',
    description: '천천히 하루를 깨우는 산뜻한 음악',
  },
  {
    key: 'afternoon',
    label: '낮',
    icon: '☀️',
    matches: (hour) => hour >= 11 && hour < 17,
    searchTerm: 'daytime energy',
    description: '일과 이동에 리듬을 더해주는 음악',
  },
  {
    key: 'evening',
    label: '저녁',
    icon: '🌆',
    matches: (hour) => hour >= 17 && hour < 22,
    searchTerm: 'sunset drive',
    description: '하루의 속도를 부드럽게 낮추는 음악',
  },
  {
    key: 'night',
    label: '밤',
    icon: '🌙',
    matches: () => true,
    searchTerm: 'late night',
    description: '조용한 밤에 오래 듣기 좋은 음악',
  },
]

const WEATHER_PROFILES = {
  맑음: { searchTerm: 'bright happy pop', color: '#f59f00' },
  비: { searchTerm: 'rainy acoustic rnb', color: '#4c6ef5' },
  구름: { searchTerm: 'chill indie pop', color: '#748ffc' },
  눈: { searchTerm: 'winter piano ballad', color: '#339af0' },
  흐림: { searchTerm: 'mellow soul chill', color: '#6c757d' },
}

const DEFAULT_WEATHER_PROFILE = WEATHER_PROFILES['흐림']

export const getTimePeriod = (hour) =>
  TIME_PERIODS.find((period) => period.matches(hour)) ?? TIME_PERIODS.at(-1)

export const getForecastMusicProfile = (forecast) => {
  if (!forecast) return null

  const timePeriod = getTimePeriod(forecast.localHour)
  const weatherProfile = WEATHER_PROFILES[forecast.status] ?? DEFAULT_WEATHER_PROFILE

  return {
    timePeriod,
    query: `${weatherProfile.searchTerm} ${timePeriod.searchTerm}`,
    accentColor: weatherProfile.color,
    title: `${forecast.status} ${timePeriod.label} 플레이리스트`,
    description: timePeriod.description,
  }
}

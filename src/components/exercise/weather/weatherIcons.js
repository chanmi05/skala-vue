const WEATHER_ICONS = {
  맑음: '☀️',
  비: '🌧️',
  구름: '☁️',
  눈: '❄️',
  흐림: '🌫️',
}

// 날씨 상태별로 카드 배경 애니메이션에 사용할 CSS 클래스 이름
const WEATHER_THEME = {
  맑음: 'weather-sunny',
  비: 'weather-rainy',
  구름: 'weather-cloudy',
  눈: 'weather-snowy',
  흐림: 'weather-misty',
}

export function getWeatherIcon(status) {
  return WEATHER_ICONS[status] ?? '🌈'
}

export function getWeatherTheme(status) {
  return WEATHER_THEME[status] ?? 'weather-default'
}

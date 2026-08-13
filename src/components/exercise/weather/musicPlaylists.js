// 날씨 상태(status)에 따라 어울리는 무드/장르/트랙 목데이터를 매핑해둔다.
// OutfitBoard.vue가 "기온 → 옷"을 계산하는 것과 같은 패턴으로,
// 이 파일은 "날씨 상태 + 기온 → 플레이리스트"를 계산하는 책임만 가진다.
const MUSIC_LIBRARY = {
  맑음: {
    mood: '화창하고 상쾌한 기분, 어디든 나가고 싶은 날이에요',
    gradient: 'linear-gradient(135deg, #ffd93b 0%, #ff9a3c 100%)',
    genreTags: ['Pop', 'Indie', 'City Pop'],
    tracks: [
      { title: 'Sunny Side Up', artist: 'The Morning Beat', duration: '3:24' },
      { title: '오늘은 산책', artist: '햇살무드', duration: '2:58' },
      { title: 'Blue Sky Drive', artist: 'Coastal Kids', duration: '3:41' },
      { title: '기분 좋은 날', artist: '소풍', duration: '3:10' },
      { title: 'Golden Hour', artist: 'Yellow Bloom', duration: '3:05' },
    ],
  },
  비: {
    mood: '창밖에 비 오는 소리, 감성 충만해지는 날이에요',
    gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    genreTags: ['Lo-fi', 'R&B', 'Jazz'],
    tracks: [
      { title: 'Rainy Window', artist: 'Late Night Cafe', duration: '4:02' },
      { title: '빗소리 재즈', artist: '우산과 재즈', duration: '3:33' },
      { title: 'Puddle Reflections', artist: 'Soft Static', duration: '3:15' },
      { title: '오늘은 집에서', artist: '창가에서', duration: '2:47' },
      { title: 'Slow Drizzle', artist: 'Grey Hour', duration: '3:52' },
    ],
  },
  구름: {
    mood: '흐릿하지만 편안한, 무난하게 흘러가는 하루예요',
    gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
    genreTags: ['Chill', 'Dream Pop', 'Acoustic'],
    tracks: [
      { title: 'Cloudy Afternoon', artist: 'Pale Blue', duration: '3:20' },
      { title: '구름 위 산책', artist: '몽글', duration: '3:05' },
      { title: 'Soft Focus', artist: 'Gray Room', duration: '3:48' },
      { title: '무던한 하루', artist: '잔잔바리', duration: '2:55' },
      { title: 'Drift', artist: 'Napcore', duration: '3:12' },
    ],
  },
  눈: {
    mood: '포근하고 낭만적인, 눈 오는 겨울날이에요',
    gradient: 'linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)',
    genreTags: ['Ballad', 'Piano', 'Winter Pop'],
    tracks: [
      { title: 'First Snow', artist: 'Winter Notes', duration: '4:10' },
      { title: '첫눈처럼', artist: '겨울편지', duration: '3:52' },
      { title: 'Snowflake Waltz', artist: 'Piano Diary', duration: '3:30' },
      { title: '눈 오는 밤', artist: '온기', duration: '3:18' },
      { title: 'Frost Light', artist: 'Quiet Room', duration: '3:44' },
    ],
  },
  흐림: {
    mood: '살짝 우중충해도 잔잔하게 흘러가는 하루예요',
    gradient: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
    genreTags: ['Neo Soul', 'Chillhop', 'Indie'],
    tracks: [
      { title: 'Grey Tone', artist: 'Muted Voice', duration: '3:36' },
      { title: '흐린 날의 산책', artist: '담담히', duration: '3:02' },
      { title: 'Slow Motion', artist: 'Quiet Hours', duration: '3:44' },
      { title: '괜찮은 하루', artist: '잔잔', duration: '2:50' },
      { title: 'Overcast', artist: 'Dust Bloom', duration: '3:28' },
    ],
  },
}

const DEFAULT_MOOD = MUSIC_LIBRARY['맑음']

// city 객체(status/temp)를 받아서 무드/장르/트랙 + 기온 기반 에너지 태그를 계산해 돌려준다.
export const getPlaylistFor = (city) => {
  if (!city) return null
  const base = MUSIC_LIBRARY[city.status] ?? DEFAULT_MOOD
  const energyTag = city.temp >= 30 ? '🔥 에너제틱' : city.temp <= 5 ? '🧣 포근함' : '🌿 편안함'
  return { ...base, energyTag }
}

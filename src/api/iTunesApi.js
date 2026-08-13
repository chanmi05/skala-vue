// iTunes Search API 통신만 담당하는 파일.
// View는 URL이나 응답 필드명을 몰라도 되고, store는 이 함수가 돌려주는 트랙 배열만 사용한다.
import axios from 'axios'

// 브라우저에서 iTunes 서버로 직접 요청하면 CORS에 막힐 수 있으므로 항상 같은 출처의
// /itunes-api를 사용한다. 개발·preview는 Vite, Vercel 배포는 vercel.json이 Apple로 전달한다.
const iTunesClient = axios.create({
  baseURL: '/itunes-api',
  timeout: 8000,
})

const formatDuration = (milliseconds = 0) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// Apple 응답을 우리 화면이 쓰기 편한 형태로 변환한다.
// API 제공자가 필드명을 바꾸더라도 이 파일만 수정하면 View와 store는 영향을 덜 받는다.
const normalizeTrack = (item) => ({
  id: item.trackId,
  title: item.trackName,
  artist: item.artistName,
  album: item.collectionName,
  duration: formatDuration(item.trackTimeMillis),
  artworkUrl: item.artworkUrl100?.replace('100x100bb', '300x300bb') ?? '',
  previewUrl: item.previewUrl ?? '',
  storeUrl: item.trackViewUrl ?? '',
  genre: item.primaryGenreName ?? 'Music',
})

export const searchITunesTracks = async (term, { limit = 8, signal } = {}) => {
  const { data } = await iTunesClient.get('/search', {
    params: {
      term,
      country: 'KR',
      media: 'music',
      entity: 'song',
      limit,
      explicit: 'No',
    },
    signal,
  })

  return data.results.map(normalizeTrack)
}

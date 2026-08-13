// 한글 초성 검색 유틸리티
// '가'(0xAC00) ~ '힣'(0xD7A3) 사이의 완성형 한글 음절은
// (초성 인덱스 * 21 + 중성 인덱스) * 28 + 종성 인덱스 + 0xAC00 공식으로 만들어져 있다.
// 즉 음절 하나에서 초성 인덱스만 뽑아내려면 (code - 0xAC00) / (21 * 28) = (code - 0xAC00) / 588 을 내림하면 된다.
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

/**
 * 문자열을 초성 문자열로 변환한다. 한글 완성형 음절이 아닌 문자(자모, 영문, 숫자 등)는 그대로 둔다.
 * getChosung('부산') === 'ㅂㅅ'
 * getChosung('Busan') === 'Busan'
 */
export function getChosung(str) {
  let result = ''
  for (const char of str) {
    const code = char.charCodeAt(0) - 0xac00
    if (code >= 0 && code <= 11171) {
      result += CHOSUNG_LIST[Math.floor(code / 588)]
    } else {
      result += char
    }
  }
  return result
}

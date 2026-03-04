/** 국기 이미지 URL. 로컬 public/flags에 파일이 있으면 사용, 없으면 flagcdn CDN 사용. */
export function getFlagUrl(code: string, _width?: 80 | 160 | 320): string {
  if (!code) return '';
  const c = code.toLowerCase();
  return `/flags/${c}.png`;
}

/** CDN 국기 URL. img onError fallback 또는 로컬 파일 없을 때 사용. */
export function getFlagCdnUrl(code: string, width: 80 | 160 | 320 = 320): string {
  if (!code) return '';
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

/** 국기 찾기 옵션 텍스트(나라 이름) → ISO 코드 */
export const NAME_TO_FLAG_CODE: Record<string, string> = {
  프랑스: 'fr',
  독일: 'de',
  이탈리아: 'it',
  스위스: 'ch',
  오스트리아: 'at',
  덴마크: 'dk',
  스페인: 'es',
  멕시코: 'mx',
  그리스: 'gr',
  핀란드: 'fi',
  아르헨티나: 'ar',
  영국: 'gb',
  미국: 'us',
  호주: 'au',
  한국: 'kr',
  일본: 'jp',
  중국: 'cn',
  아일랜드: 'ie',
  태국: 'th',
};

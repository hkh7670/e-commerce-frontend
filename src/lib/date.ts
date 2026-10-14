export function todayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 서버가 타임존 없는 로컬 시각 문자열을 내려주므로 Date로 변환하지 않고 날짜 부분만 잘라 쓴다
export function formatDateDot(isoLocalDateTime: string): string {
  return isoLocalDateTime.slice(0, 10).replaceAll('-', '.')
}

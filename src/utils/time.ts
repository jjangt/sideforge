const KST_OFFSET = 9 * 60 * 60 * 1000;

/** 현재 시간을 KST ISO 문자열로 반환 */
export function nowKST(): string {
  return new Date(Date.now() + KST_OFFSET).toISOString().replace('Z', '+09:00');
}

/** UTC ISO 문자열을 KST 표시용 문자열로 변환 */
export function toKSTDisplay(utcStr: string): string {
  const date = new Date(utcStr);
  const kst = new Date(date.getTime() + KST_OFFSET);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  const h = String(kst.getUTCHours()).padStart(2, '0');
  const min = String(kst.getUTCMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
}

/** UTC ISO 문자열을 KST 날짜만 반환 (YYYY.MM.DD) */
export function toKSTDate(utcStr: string): string {
  return toKSTDisplay(utcStr).split(' ')[0];
}

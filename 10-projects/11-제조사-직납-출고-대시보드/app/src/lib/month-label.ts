export interface YearMonth {
  year: number;
  month: number;
}

// 조회 기간이 여러 해에 걸치면 "N월"만으로는 어느 해인지 구분이 안 된다(예: 25년 1월과 26년 1월이 같은 라벨로 겹침).
// 그런 경우에만 "YY.N월"처럼 연도를 붙이고, 한 해 안에서 끝나는 조회는 기존 그대로 "N월"만 표시한다.
export function monthLabelsFor(entries: YearMonth[]): string[] {
  const showYear = new Set(entries.map((e) => e.year)).size > 1;
  return entries.map((e) => (showYear ? `${String(e.year).slice(2)}.${e.month}월` : `${e.month}월`));
}

// 서로 다른 소스(예: 매출 기반 절감액 vs 엑셀 밀크런 절감액)의 월별 배열을 합칠 때, 실제 연/월이 아니라
// 배열 순서(index)만 믿고 더하면 두 소스의 보유 기간이 다를 때 서로 다른 달의 값이 섞인다 — 이 키로 정렬해서 맞춘다.
export function monthKeyOf(e: YearMonth): string {
  return `${e.year}-${String(e.month).padStart(2, "0")}`;
}

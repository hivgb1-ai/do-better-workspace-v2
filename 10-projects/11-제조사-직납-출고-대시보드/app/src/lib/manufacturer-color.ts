// 제조사 표시 순서·색상 배정 규칙 — 출고량 차트와 절감액 차트가 같은 제조사에 같은 색을 쓰도록 공유한다.
const KNOWN_ORDER = ["튤립", "오케이에프", "건강한사람들"];
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function orderManufacturers(seen: Iterable<string>): string[] {
  const seenSet = new Set(seen);
  return [
    ...KNOWN_ORDER.filter((m) => seenSet.has(m)),
    ...[...seenSet].filter((m) => !KNOWN_ORDER.includes(m)).sort(),
  ];
}

export function assignManufacturerColors(manufacturers: string[]): Record<string, string> {
  const color: Record<string, string> = {};
  manufacturers.forEach((m, i) => {
    color[m] = CHART_COLORS[i % CHART_COLORS.length];
  });
  return color;
}

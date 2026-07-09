export interface ResolvedPeriod {
  months: number;
  offsetMonths: number;
  headlineMonths: number; // 상단 요약(총 출고량·매출액·절감비율)을 집계할 개월 수
  endYear?: number;
  endMonth?: number;
}

export interface PeriodSearchParams {
  p?: string;
  from?: string; // YYYY-MM
  to?: string; // YYYY-MM
}

// months: 차트에 보여줄 개월 수 / headlineMonths: 상단 요약을 집계할 개월 수 (당월·전월은 1개월, 3개월·6개월은 그 기간 전체)
const PRESETS: Record<string, { months: number; offsetMonths: number; headlineMonths: number }> = {
  prev: { months: 6, offsetMonths: 1, headlineMonths: 1 },
  today: { months: 6, offsetMonths: 0, headlineMonths: 1 },
  "3m": { months: 3, offsetMonths: 0, headlineMonths: 3 },
  "6m": { months: 6, offsetMonths: 0, headlineMonths: 6 },
};

const MAX_CUSTOM_MONTHS = 24;

// "당월/전월"은 리포트 기준월을 바꾸고, "3개월/6개월"은 차트에 보여줄 개월 수를 바꾼다.
// "기간 지정"은 두 축을 from~to로 한 번에 지정한다.
export function resolvePeriod(sp: PeriodSearchParams, fallbackPreset: string): ResolvedPeriod {
  if (sp.p === "custom" && sp.from && sp.to) {
    const [fromYear, fromMonth] = sp.from.split("-").map(Number);
    const [toYear, toMonth] = sp.to.split("-").map(Number);
    if (fromYear && fromMonth && toYear && toMonth) {
      const span = Math.min(MAX_CUSTOM_MONTHS, Math.max(1, (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1));
      return {
        months: span,
        offsetMonths: 0,
        headlineMonths: span,
        endYear: toYear,
        endMonth: toMonth,
      };
    }
  }

  const preset: { months: number; offsetMonths: number; headlineMonths: number } =
    (sp.p ? PRESETS[sp.p] : undefined) ?? PRESETS[fallbackPreset] ?? PRESETS["6m"];
  return { ...preset };
}

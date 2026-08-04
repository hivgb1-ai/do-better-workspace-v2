export interface ResolvedPeriod {
  months: number;
  headlineMonths: number; // 상단 요약(총 출고량·매출액·절감비율)을 집계할 개월 수
  endYear: number;
  endMonth: number;
}

export interface PeriodSearchParams {
  p?: string;
  from?: string; // YYYY-MM
  to?: string; // YYYY-MM
}

// months: 차트에 보여줄 개월 수 / headlineMonths: 상단 요약을 집계할 개월 수
// monthOffset: 실제 달력 기준 오늘로부터 몇 달 전을 리포트 기준월(endYear/endMonth)로 삼을지
// 모든 프리셋에서 차트는 선택한 기간만큼만 보여준다 (당월/전월=1개월, 3개월/6개월=해당 기간).
const PRESETS: Record<string, { months: number; monthOffset: number; headlineMonths: number }> = {
  prev: { months: 1, monthOffset: 1, headlineMonths: 1 },
  today: { months: 1, monthOffset: 0, headlineMonths: 1 },
  "3m": { months: 3, monthOffset: 0, headlineMonths: 3 },
  "6m": { months: 6, monthOffset: 0, headlineMonths: 6 },
};

const MAX_CUSTOM_MONTHS = 24;

function shiftMonth(year: number, month: number, monthsBack: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) - monthsBack;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

// "당월/전월"은 리포트 기준월을 바꾸고, "3개월/6개월"은 차트에 보여줄 개월 수를 바꾼다.
// "기간 지정"은 두 축을 from~to로 한 번에 지정한다.
// 기준월(endYear/endMonth)은 항상 실제 달력의 "오늘"에서 계산한다 — 데이터 소스(매출조정 입력 여부 등)에
// 따라 마지막으로 채워진 달이 서로 달라도, "당월/전월"이 가리키는 실제 월은 모든 소스에서 동일하게 유지된다.
export function resolvePeriod(sp: PeriodSearchParams, fallbackPreset: string, now: Date = new Date()): ResolvedPeriod {
  if (sp.p === "custom" && sp.from && sp.to) {
    const [fromYear, fromMonth] = sp.from.split("-").map(Number);
    const [toYear, toMonth] = sp.to.split("-").map(Number);
    if (fromYear && fromMonth && toYear && toMonth) {
      const span = Math.min(MAX_CUSTOM_MONTHS, Math.max(1, (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1));
      return {
        months: span,
        headlineMonths: span,
        endYear: toYear,
        endMonth: toMonth,
      };
    }
  }

  const preset = (sp.p ? PRESETS[sp.p] : undefined) ?? PRESETS[fallbackPreset] ?? PRESETS["6m"];
  const { year: endYear, month: endMonth } = shiftMonth(now.getFullYear(), now.getMonth() + 1, preset.monthOffset);
  return { months: preset.months, headlineMonths: preset.headlineMonths, endYear, endMonth };
}

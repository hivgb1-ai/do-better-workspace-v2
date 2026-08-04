import { fetchMonthlySavings } from "./savings-source";
import { orderManufacturers, assignManufacturerColors } from "./manufacturer-color";
import { monthLabelsFor, monthKeyOf } from "./month-label";
import type { ResolvedPeriod } from "./period";

// 절감비율 목표 — 2026-07부터 1.6% → 1.3%로 변경(사용자 확정). 그 이전 달 조회 시엔 과거 목표(1.6%)를 그대로 적용.
function savingsRatioTargetFor(year: number, month: number): number {
  return year > 2026 || (year === 2026 && month >= 7) ? 1.3 : 1.6;
}

export interface SavingsDashboardData {
  months: string[];
  monthKeys: string[]; // months와 같은 순서의 "YYYY-MM" — 다른 소스와 실제 연/월 기준으로 맞춰야 할 때 씀
  savingsRatioByMonth: number[];
  savingsRatioTargetByMonth: number[];
  savingsTotalByMonth: number[];
  directCostByMonth: number[];
  milkrunCostByMonth: number[];
  manufacturers: string[];
  manufacturerColor: Record<string, string>;
  savingsByManufacturerMonth: Record<string, number[]>;
  // 제조사별 절감액 전용 월 라벨 — 출고 데이터 기준(실시간)이라 매출조정 미입력 상태의 당월도 포함될 수 있어 months와 길이가 다를 수 있다
  manufacturerMonths: string[];
}

function filterByPeriod<T extends { year: number; month: number }>(all: T[], period: ResolvedPeriod): T[] {
  const pool = all.filter(
    (m) => m.year < period.endYear || (m.year === period.endYear && m.month <= period.endMonth)
  );
  return pool.slice(-period.months);
}

export async function fetchSavingsDashboardData(period: ResolvedPeriod): Promise<SavingsDashboardData> {
  const { monthly: all, manufacturerMonthly: allManufacturer } = await fetchMonthlySavings(); // 단일 엑셀 파일(한 해) 범위 — §3 선행 작업 이관 전 제약

  const recent = filterByPeriod(all, period);
  const manuRecent = filterByPeriod(allManufacturer, period);

  const manufacturers = orderManufacturers(manuRecent.flatMap((m) => Object.keys(m.savingsByManufacturer)));
  const manufacturerColor = assignManufacturerColors(manufacturers);
  const savingsByManufacturerMonth: Record<string, number[]> = {};
  manufacturers.forEach((mfr) => {
    savingsByManufacturerMonth[mfr] = manuRecent.map((m) => m.savingsByManufacturer[mfr] ?? 0);
  });

  return {
    months: monthLabelsFor(recent),
    monthKeys: recent.map(monthKeyOf),
    savingsRatioByMonth: recent.map((m) => m.ratio),
    savingsRatioTargetByMonth: recent.map((m) => savingsRatioTargetFor(m.year, m.month)),
    savingsTotalByMonth: recent.map((m) => m.savingsTotal),
    directCostByMonth: recent.map((m) => m.directCost),
    milkrunCostByMonth: recent.map((m) => m.milkrunCost),
    manufacturers,
    manufacturerColor,
    savingsByManufacturerMonth,
    manufacturerMonths: monthLabelsFor(manuRecent),
  };
}

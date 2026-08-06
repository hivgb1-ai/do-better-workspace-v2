import { fetchMilkrunMonthly } from "./milkrun-source";
import { monthLabelsFor, monthKeyOf } from "./month-label";
import type { ResolvedPeriod } from "./period";

// 밀크런/쉽먼트 이원화 절감비율 목표 — 2026-07부터 25% → 35%로 변경(사용자 확정). 그 이전 달 조회 시엔 과거 목표(25%)를 그대로 적용.
function milkrunSavingsRatioTargetFor(year: number, month: number): number {
  return year > 2026 || (year === 2026 && month >= 7) ? 35 : 25;
}

export interface MilkrunDashboardData {
  months: string[];
  monthKeys: string[]; // months와 같은 순서의 "YYYY-MM" — 다른 소스와 실제 연/월 기준으로 맞춰야 할 때 씀
  rocketRevenueByMonth: number[];
  rocketMilkrunCostByMonth: number[];
  rocketRatioByMonth: number[];
  freshRevenueByMonth: number[];
  freshMilkrunCostByMonth: number[];
  freshRatioByMonth: number[];
  milkrunSavingsByMonth: number[];
  milkrunSavingsRatioByMonth: number[];
  milkrunSavingsRatioTargetByMonth: number[];
}

export async function fetchMilkrunDashboardData(period: ResolvedPeriod): Promise<MilkrunDashboardData> {
  const all = await fetchMilkrunMonthly();

  const pool = all.filter(
    (m) => m.year < period.endYear || (m.year === period.endYear && m.month <= period.endMonth)
  );

  const recent = pool.slice(-period.months);

  return {
    months: monthLabelsFor(recent),
    monthKeys: recent.map(monthKeyOf),
    rocketRevenueByMonth: recent.map((m) => m.rocketRevenue),
    rocketMilkrunCostByMonth: recent.map((m) => m.rocketMilkrunCost),
    rocketRatioByMonth: recent.map((m) => m.rocketRatio),
    freshRevenueByMonth: recent.map((m) => m.freshRevenue),
    freshMilkrunCostByMonth: recent.map((m) => m.freshMilkrunCost),
    freshRatioByMonth: recent.map((m) => m.freshRatio),
    milkrunSavingsByMonth: recent.map((m) => m.milkrunSavings),
    milkrunSavingsRatioByMonth: recent.map((m) => m.milkrunSavingsRatio),
    milkrunSavingsRatioTargetByMonth: recent.map((m) => milkrunSavingsRatioTargetFor(m.year, m.month)),
  };
}

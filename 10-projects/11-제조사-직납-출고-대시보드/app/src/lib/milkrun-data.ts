import { fetchMilkrunMonthly } from "./milkrun-source";
import { monthLabelsFor, monthKeyOf } from "./month-label";
import type { ResolvedPeriod } from "./period";

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
  };
}

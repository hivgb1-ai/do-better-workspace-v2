import { fetchMilkrunMonthly } from "./milkrun-source";
import type { ResolvedPeriod } from "./period";

export interface MilkrunDashboardData {
  months: string[];
  rocketRevenueByMonth: number[];
  rocketMilkrunCostByMonth: number[];
  rocketRatioByMonth: number[];
  freshRevenueByMonth: number[];
  freshMilkrunCostByMonth: number[];
  freshRatioByMonth: number[];
  milkrunSavingsByMonth: number[];
}

export async function fetchMilkrunDashboardData(period: ResolvedPeriod): Promise<MilkrunDashboardData> {
  const all = await fetchMilkrunMonthly();

  let pool = all;
  if (period.endYear && period.endMonth) {
    pool = all.filter(
      (m) => m.year < period.endYear! || (m.year === period.endYear && m.month <= period.endMonth!)
    );
  } else if (period.offsetMonths > 0) {
    pool = period.offsetMonths < all.length ? all.slice(0, all.length - period.offsetMonths) : [];
  }

  const recent = pool.slice(-period.months);

  return {
    months: recent.map((m) => `${m.month}월`),
    rocketRevenueByMonth: recent.map((m) => m.rocketRevenue),
    rocketMilkrunCostByMonth: recent.map((m) => m.rocketMilkrunCost),
    rocketRatioByMonth: recent.map((m) => m.rocketRatio),
    freshRevenueByMonth: recent.map((m) => m.freshRevenue),
    freshMilkrunCostByMonth: recent.map((m) => m.freshMilkrunCost),
    freshRatioByMonth: recent.map((m) => m.freshRatio),
    milkrunSavingsByMonth: recent.map((m) => m.milkrunSavings),
  };
}

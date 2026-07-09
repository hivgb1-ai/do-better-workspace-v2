import { fetchMonthlySavings } from "./savings-source";
import type { ResolvedPeriod } from "./period";

export const SAVINGS_RATIO_TARGET = 1.6;

export interface SavingsDashboardData {
  months: string[];
  savingsRatioByMonth: number[];
  savingsRatioTarget: number;
  savingsTotalByMonth: number[];
  directCostByMonth: number[];
  milkrunCostByMonth: number[];
}

export async function fetchSavingsDashboardData(period: ResolvedPeriod): Promise<SavingsDashboardData> {
  const all = await fetchMonthlySavings(); // 단일 엑셀 파일(한 해) 범위 — §3 선행 작업 이관 전 제약

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
    savingsRatioByMonth: recent.map((m) => m.ratio),
    savingsRatioTarget: SAVINGS_RATIO_TARGET,
    savingsTotalByMonth: recent.map((m) => m.savingsTotal),
    directCostByMonth: recent.map((m) => m.directCost),
    milkrunCostByMonth: recent.map((m) => m.milkrunCost),
  };
}

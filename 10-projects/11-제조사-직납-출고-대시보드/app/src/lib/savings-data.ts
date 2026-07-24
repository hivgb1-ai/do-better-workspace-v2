import { fetchMonthlySavings } from "./savings-source";
import { orderManufacturers, assignManufacturerColors } from "./manufacturer-color";
import type { ResolvedPeriod } from "./period";

export const SAVINGS_RATIO_TARGET = 1.6;

export interface SavingsDashboardData {
  months: string[];
  savingsRatioByMonth: number[];
  savingsRatioTarget: number;
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
  let pool = all;
  if (period.endYear && period.endMonth) {
    pool = all.filter(
      (m) => m.year < period.endYear! || (m.year === period.endYear && m.month <= period.endMonth!)
    );
  } else if (period.offsetMonths > 0) {
    pool = period.offsetMonths < all.length ? all.slice(0, all.length - period.offsetMonths) : [];
  }
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
    months: recent.map((m) => `${m.month}월`),
    savingsRatioByMonth: recent.map((m) => m.ratio),
    savingsRatioTarget: SAVINGS_RATIO_TARGET,
    savingsTotalByMonth: recent.map((m) => m.savingsTotal),
    directCostByMonth: recent.map((m) => m.directCost),
    milkrunCostByMonth: recent.map((m) => m.milkrunCost),
    manufacturers,
    manufacturerColor,
    savingsByManufacturerMonth,
    manufacturerMonths: manuRecent.map((m) => `${m.month}월`),
  };
}

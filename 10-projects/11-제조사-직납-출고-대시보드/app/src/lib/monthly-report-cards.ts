import { fetchSavingsDashboardData, type SavingsDashboardData } from "./savings-data";
import { fetchMilkrunDashboardData, type MilkrunDashboardData } from "./milkrun-data";
import { monthLabelsFor } from "./month-label";
import type { ResolvedPeriod } from "./period";

export interface ReportRow {
  label: string;
  values: number[];
  unit: "won" | "percent";
}

// id: 화면의 카드 DOM id와 동일(캡처용으로 쓰던 값 재사용). sheet: 엑셀 시트명.
export interface ReportCard {
  id: string;
  sheet: string;
  title: string;
  months: string[];
  rows: ReportRow[];
}

export interface MonthlyReportBundle {
  rangeLabel: string;
  savings: SavingsDashboardData;
  milkrun: MilkrunDashboardData;
  cards: ReportCard[];
}

// 월말 보고 화면(page.tsx)과 엑셀 다운로드(export/route.ts)가 같은 데이터·같은 계산을 쓰도록 여기 한 곳에
// 모았다 — 특히 "TOTAL 절감액"은 두 소스(구글시트 매출조정 vs 로컬 밀크런 엑셀)를 연/월 키로 맞춰 합치는
// 로직이 있어서, 화면과 엑셀이 각자 다시 계산하면 언젠가 둘이 미묘하게 어긋날 위험이 있다.
export async function buildMonthlyReport(period: ResolvedPeriod): Promise<MonthlyReportBundle> {
  const [savings, milkrun] = await Promise.all([
    fetchSavingsDashboardData(period),
    fetchMilkrunDashboardData(period),
  ]);

  const rangeLabel =
    savings.months.length <= 1 ? (savings.months[0] ?? "당월") : `${savings.months[0]} ~ ${savings.months.at(-1)}`;

  const directShareByMonth = savings.directCostByMonth.map((direct, i) => {
    const total = direct + (savings.milkrunCostByMonth[i] ?? 0);
    return total ? (direct / total) * 100 : 0;
  });
  const milkrunShareByMonth = directShareByMonth.map((share) => 100 - share);

  // 직납 절감액(구글시트 "직납 매출조정")과 밀크런 절감액(로컬 엑셀)은 소스가 달라 실제로 채워진 기간이
  // 다를 수 있다 — 배열 순서(index)만 믿고 더하면 서로 다른 달의 값이 섞이므로, 실제 연/월(key)로 맞춘다.
  const totalMonthKeys = [...new Set([...savings.monthKeys, ...milkrun.monthKeys])].sort();
  const totalMonths = monthLabelsFor(
    totalMonthKeys.map((k) => {
      const [year, month] = k.split("-").map(Number);
      return { year, month };
    })
  );
  const savingsTotalByKey = new Map(savings.monthKeys.map((k, i) => [k, savings.savingsTotalByMonth[i]]));
  const milkrunSavingsByKey = new Map(milkrun.monthKeys.map((k, i) => [k, milkrun.milkrunSavingsByMonth[i]]));
  const milkrunSavingsRatioByKey = new Map(
    milkrun.monthKeys.map((k, i) => [k, milkrun.milkrunSavingsRatioByMonth[i]])
  );
  const totalDirectSavings = totalMonthKeys.map((k) => savingsTotalByKey.get(k) ?? 0);
  const totalMilkrunSavings = totalMonthKeys.map((k) => milkrunSavingsByKey.get(k) ?? 0);
  const totalMilkrunSavingsRatio = totalMonthKeys.map((k) => milkrunSavingsRatioByKey.get(k) ?? 0);
  const totalSavingsByMonth = totalDirectSavings.map((d, i) => d + totalMilkrunSavings[i]);

  const cards: ReportCard[] = [
    {
      id: "card-direct-ratio",
      sheet: "직납비율",
      title: "쿠팡로켓 직납비율 (직납 vs 밀크런&쉽먼트 매출 비중)",
      months: savings.months,
      rows: [
        { label: "직납", values: savings.directCostByMonth, unit: "won" },
        { label: "밀크런&쉽먼트", values: savings.milkrunCostByMonth, unit: "won" },
        { label: "직납 비중", values: directShareByMonth, unit: "percent" },
        { label: "밀크런&쉽먼트 비중", values: milkrunShareByMonth, unit: "percent" },
      ],
    },
    {
      id: "card-savings-ratio",
      sheet: "직납 절감액",
      title: "쿠팡로켓 직납 절감액",
      months: savings.months,
      rows: [
        { label: "절감액", values: savings.savingsTotalByMonth, unit: "won" },
        { label: "절감비율", values: savings.savingsRatioByMonth, unit: "percent" },
      ],
    },
    {
      id: "card-manufacturer-savings",
      sheet: "제조사별 절감액",
      title: "쿠팡로켓 직납 절감액 (제조사별)",
      months: savings.manufacturerMonths,
      rows: savings.manufacturers.map((mfr) => ({
        label: mfr,
        values: savings.savingsByManufacturerMonth[mfr],
        unit: "won" as const,
      })),
    },
    {
      id: "card-rocket-milkrun",
      sheet: "로켓 밀크런",
      title: "쿠팡 로켓 밀크런",
      months: milkrun.months,
      rows: [
        { label: "총매출", values: milkrun.rocketRevenueByMonth, unit: "won" },
        { label: "밀크런", values: milkrun.rocketMilkrunCostByMonth, unit: "won" },
        { label: "물류비율", values: milkrun.rocketRatioByMonth, unit: "percent" },
      ],
    },
    {
      id: "card-fresh-milkrun",
      sheet: "프레시 밀크런",
      title: "쿠팡 프레시 밀크런",
      months: milkrun.months,
      rows: [
        { label: "총매출", values: milkrun.freshRevenueByMonth, unit: "won" },
        { label: "밀크런", values: milkrun.freshMilkrunCostByMonth, unit: "won" },
        { label: "물류비율", values: milkrun.freshRatioByMonth, unit: "percent" },
      ],
    },
    {
      id: "card-total-savings",
      sheet: "TOTAL 절감액",
      title: "TOTAL 절감액 (직납 + 밀크런/쉽먼트 이원화)",
      months: totalMonths,
      rows: [
        { label: "직납 절감액", values: totalDirectSavings, unit: "won" },
        { label: "밀크런 절감액", values: totalMilkrunSavings, unit: "won" },
        { label: "TTL", values: totalSavingsByMonth, unit: "won" },
        { label: "밀크런 절감비율", values: totalMilkrunSavingsRatio, unit: "percent" },
      ],
    },
  ];

  return { rangeLabel, savings, milkrun, cards };
}

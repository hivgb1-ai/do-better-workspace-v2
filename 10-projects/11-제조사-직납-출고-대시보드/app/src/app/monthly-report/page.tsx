import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { SavingsByManufacturerChart } from "@/components/dashboard/savings-by-manufacturer-chart";
import { MilkrunChannelChart } from "@/components/dashboard/milkrun-channel-chart";
import { TotalSavingsChart } from "@/components/dashboard/total-savings-chart";
import { MonthlyDataTable } from "@/components/dashboard/monthly-data-table";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { fetchMilkrunDashboardData } from "@/lib/milkrun-data";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";
import { monthLabelsFor } from "@/lib/month-label";
import { TABLE_RIGHT_GUTTER } from "@/lib/chart-layout";

export const revalidate = 0;

const PERIOD_OPTIONS = [
  { value: "prev", label: "전월" },
  { value: "today", label: "당월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "1y", label: "1년" },
  { value: "custom", label: "기간 지정" },
];

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const sp = await searchParams;
  const period = resolvePeriod(sp, "today");

  const exportQuery = new URLSearchParams();
  if (sp.p) exportQuery.set("p", sp.p);
  if (sp.from) exportQuery.set("from", sp.from);
  if (sp.to) exportQuery.set("to", sp.to);
  const exportHref = `/api/monthly-report/export?${exportQuery.toString()}`;

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

  // 직납 절감액(구글시트 "직납 매출조정" 기준)과 밀크런 절감액(로컬 엑셀 기준)은 소스가 달라 실제로 채워진 기간이
  // 서로 다를 수 있다 — 배열 순서(index)만 믿고 더하면 서로 다른 달의 값이 섞이므로, 실제 연/월(key)로 맞춘다.
  const totalMonthKeys = [...new Set([...savings.monthKeys, ...milkrun.monthKeys])].sort();
  const totalMonths = monthLabelsFor(
    totalMonthKeys.map((k) => {
      const [year, month] = k.split("-").map(Number);
      return { year, month };
    })
  );
  const savingsTotalByKey = new Map(savings.monthKeys.map((k, i) => [k, savings.savingsTotalByMonth[i]]));
  const milkrunSavingsByKey = new Map(milkrun.monthKeys.map((k, i) => [k, milkrun.milkrunSavingsByMonth[i]]));
  const totalDirectSavings = totalMonthKeys.map((k) => savingsTotalByKey.get(k) ?? 0);
  const totalMilkrunSavings = totalMonthKeys.map((k) => milkrunSavingsByKey.get(k) ?? 0);
  const totalSavingsByMonth = totalDirectSavings.map((d, i) => d + totalMilkrunSavings[i]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{rangeLabel} 월말 보고</h2>
          <p className="text-sm text-muted-foreground">쿠팡 물류비용절감 KPI — 직납비율 · 직납/밀크런 절감액</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={exportHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
            엑셀 다운로드
          </a>
          <PeriodFilter options={PERIOD_OPTIONS} defaultValue="today" />
        </div>
      </div>

      <Card id="card-direct-ratio">
        <CardHeader>
          <CardTitle className="text-sm">쿠팡로켓 직납비율 (직납 vs 밀크런&쉽먼트 매출 비중)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CostCompositionChart
            months={savings.months}
            directCosts={savings.directCostByMonth}
            milkrunCosts={savings.milkrunCostByMonth}
          />
          <MonthlyDataTable
            months={savings.months}
            rows={[
              { label: "직납", values: savings.directCostByMonth, unit: "won" },
              { label: "밀크런&쉽먼트", values: savings.milkrunCostByMonth, unit: "won" },
              { label: "직납 비중", values: directShareByMonth, unit: "percent" },
              { label: "밀크런&쉽먼트 비중", values: milkrunShareByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>

      <Card id="card-savings-ratio">
        <CardHeader>
          <CardTitle className="text-sm">쿠팡로켓 직납 절감액</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SavingsRatioChart
            months={savings.months}
            ratios={savings.savingsRatioByMonth}
            savingsTotals={savings.savingsTotalByMonth}
            targets={savings.savingsRatioTargetByMonth}
          />
          <MonthlyDataTable
            months={savings.months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={[
              { label: "절감액", values: savings.savingsTotalByMonth, unit: "won" },
              { label: "절감비율", values: savings.savingsRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>

      <Card id="card-manufacturer-savings">
        <CardHeader>
          <CardTitle className="text-sm">쿠팡로켓 직납 절감액 (제조사별)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SavingsByManufacturerChart
            manufacturers={savings.manufacturers}
            months={savings.manufacturerMonths}
            savingsByManufacturerMonth={savings.savingsByManufacturerMonth}
            manufacturerColor={savings.manufacturerColor}
          />
          <MonthlyDataTable
            months={savings.manufacturerMonths}
            rows={savings.manufacturers.map((mfr) => ({
              label: mfr,
              values: savings.savingsByManufacturerMonth[mfr],
              unit: "won",
            }))}
          />
        </CardContent>
      </Card>

      <Card id="card-rocket-milkrun">
        <CardHeader>
          <CardTitle className="text-sm">쿠팡 로켓 밀크런</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <MilkrunChannelChart
            months={milkrun.months}
            revenue={milkrun.rocketRevenueByMonth}
            milkrunCost={milkrun.rocketMilkrunCostByMonth}
            ratio={milkrun.rocketRatioByMonth}
          />
          <MonthlyDataTable
            months={milkrun.months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={[
              { label: "총매출", values: milkrun.rocketRevenueByMonth, unit: "won" },
              { label: "밀크런", values: milkrun.rocketMilkrunCostByMonth, unit: "won" },
              { label: "물류비율", values: milkrun.rocketRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>
      <Card id="card-fresh-milkrun">
        <CardHeader>
          <CardTitle className="text-sm">쿠팡 프레시 밀크런</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <MilkrunChannelChart
            months={milkrun.months}
            revenue={milkrun.freshRevenueByMonth}
            milkrunCost={milkrun.freshMilkrunCostByMonth}
            ratio={milkrun.freshRatioByMonth}
          />
          <MonthlyDataTable
            months={milkrun.months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={[
              { label: "총매출", values: milkrun.freshRevenueByMonth, unit: "won" },
              { label: "밀크런", values: milkrun.freshMilkrunCostByMonth, unit: "won" },
              { label: "물류비율", values: milkrun.freshRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>

      <Card id="card-total-savings">
        <CardHeader>
          <CardTitle className="text-sm">TOTAL 절감액 (직납 + 밀크런/쉽먼트 이원화)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TotalSavingsChart months={totalMonths} directSavings={totalDirectSavings} milkrunSavings={totalMilkrunSavings} />
          <MonthlyDataTable
            months={totalMonths}
            rows={[
              { label: "직납 절감액", values: totalDirectSavings, unit: "won" },
              { label: "밀크런 절감액", values: totalMilkrunSavings, unit: "won" },
              { label: "TTL", values: totalSavingsByMonth, unit: "won" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

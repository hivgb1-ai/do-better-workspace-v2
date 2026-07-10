import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { MilkrunChannelChart } from "@/components/dashboard/milkrun-channel-chart";
import { TotalSavingsChart } from "@/components/dashboard/total-savings-chart";
import { MonthlyDataTable } from "@/components/dashboard/monthly-data-table";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { fetchMilkrunDashboardData } from "@/lib/milkrun-data";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";

export const revalidate = 0;

const PERIOD_OPTIONS = [
  { value: "prev", label: "전월" },
  { value: "today", label: "당월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "custom", label: "기간 지정" },
];

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const period = resolvePeriod(await searchParams, "today");

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

  const totalSavingsByMonth = savings.savingsTotalByMonth.map((direct, i) => direct + (milkrun.milkrunSavingsByMonth[i] ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{rangeLabel} 월말 보고</h2>
          <p className="text-sm text-muted-foreground">쿠팡 물류비용절감 KPI — 직납비율 · 직납/밀크런 절감액</p>
        </div>
        <PeriodFilter options={PERIOD_OPTIONS} defaultValue="today" />
      </div>

      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">쿠팡로켓 직납 절감액</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SavingsRatioChart
            months={savings.months}
            ratios={savings.savingsRatioByMonth}
            savingsTotals={savings.savingsTotalByMonth}
            target={savings.savingsRatioTarget}
          />
          <MonthlyDataTable
            months={savings.months}
            rows={[
              { label: "절감액", values: savings.savingsTotalByMonth, unit: "won" },
              { label: "절감비율", values: savings.savingsRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
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
            rows={[
              { label: "총매출", values: milkrun.rocketRevenueByMonth, unit: "won" },
              { label: "밀크런", values: milkrun.rocketMilkrunCostByMonth, unit: "won" },
              { label: "물류비율", values: milkrun.rocketRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
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
            rows={[
              { label: "총매출", values: milkrun.freshRevenueByMonth, unit: "won" },
              { label: "밀크런", values: milkrun.freshMilkrunCostByMonth, unit: "won" },
              { label: "물류비율", values: milkrun.freshRatioByMonth, unit: "percent" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">TOTAL 절감액 (직납 + 밀크런/쉽먼트 이원화)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TotalSavingsChart
            months={savings.months}
            directSavings={savings.savingsTotalByMonth}
            milkrunSavings={milkrun.milkrunSavingsByMonth}
          />
          <MonthlyDataTable
            months={savings.months}
            rows={[
              { label: "직납 절감액", values: savings.savingsTotalByMonth, unit: "won" },
              { label: "밀크런 절감액", values: milkrun.milkrunSavingsByMonth, unit: "won" },
              { label: "TTL", values: totalSavingsByMonth, unit: "won" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

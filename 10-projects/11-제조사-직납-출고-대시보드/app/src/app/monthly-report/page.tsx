import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { MilkrunChannelChart } from "@/components/dashboard/milkrun-channel-chart";
import { TotalSavingsChart } from "@/components/dashboard/total-savings-chart";
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
        <CardContent>
          <CostCompositionChart
            months={savings.months}
            directCosts={savings.directCostByMonth}
            milkrunCosts={savings.milkrunCostByMonth}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">쿠팡로켓 직납 절감액</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsRatioChart
            months={savings.months}
            ratios={savings.savingsRatioByMonth}
            savingsTotals={savings.savingsTotalByMonth}
            target={savings.savingsRatioTarget}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">쿠팡 로켓 밀크런</CardTitle>
          </CardHeader>
          <CardContent>
            <MilkrunChannelChart
              months={milkrun.months}
              revenue={milkrun.rocketRevenueByMonth}
              milkrunCost={milkrun.rocketMilkrunCostByMonth}
              ratio={milkrun.rocketRatioByMonth}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">쿠팡 프레시 밀크런</CardTitle>
          </CardHeader>
          <CardContent>
            <MilkrunChannelChart
              months={milkrun.months}
              revenue={milkrun.freshRevenueByMonth}
              milkrunCost={milkrun.freshMilkrunCostByMonth}
              ratio={milkrun.freshRatioByMonth}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">TOTAL 절감액 (직납 + 밀크런/쉽먼트 이원화)</CardTitle>
        </CardHeader>
        <CardContent>
          <TotalSavingsChart
            months={savings.months}
            directSavings={savings.savingsTotalByMonth}
            milkrunSavings={milkrun.milkrunSavingsByMonth}
          />
        </CardContent>
      </Card>
    </div>
  );
}

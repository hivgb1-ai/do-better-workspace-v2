import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MonthlyShipmentChart } from "@/components/dashboard/monthly-shipment-chart";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { TopMoversTable } from "@/components/dashboard/top-movers-table";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { fetchShipmentDashboardData } from "@/lib/shipment-data";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";

export const revalidate = 0;

const PERIOD_OPTIONS = [
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "custom", label: "기간 지정" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const period = resolvePeriod(await searchParams, "6m");

  const [shipment, savings] = await Promise.all([
    fetchShipmentDashboardData({ ...period, months: period.months * 2 }),
    fetchSavingsDashboardData(period),
  ]);

  const periodTotal = shipment.manufacturers.reduce(
    (sum, m) => sum + shipment.shipmentByMonth[m].slice(-period.months).reduce((a, b) => a + b, 0),
    0
  );
  const prevPeriodTotal = shipment.manufacturers.reduce(
    (sum, m) =>
      sum +
      shipment.shipmentByMonth[m].slice(-period.months * 2, -period.months).reduce((a, b) => a + b, 0),
    0
  );
  const periodGrowth = prevPeriodTotal === 0 ? 0 : (periodTotal - prevPeriodTotal) / prevPeriodTotal;

  const avgRatio = savings.savingsRatioByMonth.length
    ? savings.savingsRatioByMonth.reduce((a, b) => a + b, 0) / savings.savingsRatioByMonth.length
    : 0;

  const displayMonths = shipment.months.slice(-period.months);
  const displayShipmentByMonth = Object.fromEntries(
    shipment.manufacturers.map((m) => [m, shipment.shipmentByMonth[m].slice(-period.months)])
  );

  const topMover = shipment.topMovers[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">기간별 히스토리 조회</h2>
          <p className="text-sm text-muted-foreground">
            선택한 기간 동안의 출고량·절감비율 누적 증감을 직전 동일 기간과 비교합니다
          </p>
        </div>
        <PeriodFilter options={PERIOD_OPTIONS} defaultValue="6m" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="선택 기간 누적 출고량"
          value={periodTotal.toLocaleString()}
          delta={{
            text: `${periodGrowth >= 0 ? "▲" : "▼"} ${(Math.abs(periodGrowth) * 100).toFixed(1)}% 직전 동기간 대비`,
            tone: periodGrowth >= 0 ? "good" : "critical",
          }}
        />
        <KpiCard
          label="선택 기간 평균 절감비율"
          value={`${avgRatio.toFixed(2)}%`}
          delta={{
            text: avgRatio >= savings.savingsRatioTarget ? "목표 평균 달성" : "목표 평균 미달",
            tone: avgRatio >= savings.savingsRatioTarget ? "good" : "critical",
          }}
        />
        <KpiCard
          label="비중 변화 최대 품목"
          value={topMover?.name ?? "-"}
          delta={
            topMover
              ? {
                  text: `${topMover.currShare - topMover.prevShare >= 0 ? "+" : ""}${(topMover.currShare - topMover.prevShare).toFixed(1)}%p (${topMover.manufacturer})`,
                  tone: topMover.currShare - topMover.prevShare >= 0 ? "good" : "critical",
                }
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">선택 기간 제조사별 출고량 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyShipmentChart
              manufacturers={shipment.manufacturers}
              months={displayMonths}
              shipmentByMonth={displayShipmentByMonth}
              manufacturerColor={shipment.manufacturerColor}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">선택 기간 절감비율 추이 (목표선 포함)</CardTitle>
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">기간 시작 대비 종료 시점 품목별 비중 변화 순위</CardTitle>
          </CardHeader>
          <CardContent>
            <TopMoversTable movers={shipment.topMovers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">선택 기간 비용 구성 (직납 vs 밀크런&쉽먼트)</CardTitle>
          </CardHeader>
          <CardContent>
            <CostCompositionChart
              months={savings.months}
              directCosts={savings.directCostByMonth}
              milkrunCosts={savings.milkrunCostByMonth}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

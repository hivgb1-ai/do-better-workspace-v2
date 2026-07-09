import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { GoalRing } from "@/components/dashboard/goal-ring";
import { MonthlyShipmentChart } from "@/components/dashboard/monthly-shipment-chart";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { TopMoversTable } from "@/components/dashboard/top-movers-table";
import { CrossTable } from "@/components/dashboard/cross-table";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { fetchShipmentDashboardData } from "@/lib/shipment-data";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { fetchEstimatedRevenueByMonth } from "@/lib/revenue-source";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";

export const revalidate = 0;

const PERIOD_OPTIONS = [
  { value: "prev", label: "전월" },
  { value: "today", label: "당월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "custom", label: "기간 지정" },
];

function sumTail(values: number[], count: number) {
  return values.slice(-count).reduce((a, b) => a + b, 0);
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<PeriodSearchParams>;
}) {
  const period = resolvePeriod(await searchParams, "today");
  const headlineMonths = period.headlineMonths;

  // 헤드라인 집계(현재 vs 직전 동기간)를 계산하려면 최소 headlineMonths*2개월치 출고 데이터가 필요하다.
  const [shipment, savings, estimatedRevenueByMonth] = await Promise.all([
    fetchShipmentDashboardData({ ...period, months: Math.max(period.months, headlineMonths * 2) }),
    fetchSavingsDashboardData(period),
    fetchEstimatedRevenueByMonth(),
  ]);

  const headlineMonthLabels = shipment.months.slice(-headlineMonths);
  const rangeLabel =
    headlineMonthLabels.length <= 1 ? (headlineMonthLabels[0] ?? "당월") : `${headlineMonthLabels[0]} ~ ${headlineMonthLabels.at(-1)}`;
  const momLabel = headlineMonths === 1 ? "전월대비" : "직전 동기간 대비";

  // 차트에는 원래 기간 폭(period.months)만 보여준다 — 위에서 headlineMonths*2를 위해 더 넓게 fetch했을 수 있어 잘라낸다.
  const displayMonths = shipment.months.slice(-period.months);
  const displayShipmentByMonth = Object.fromEntries(
    shipment.manufacturers.map((m) => [m, shipment.shipmentByMonth[m].slice(-period.months)])
  );

  const periodShipmentTotal = shipment.manufacturers.reduce(
    (sum, m) => sum + sumTail(shipment.shipmentByMonth[m], headlineMonths),
    0
  );
  const prevPeriodShipmentTotal = shipment.manufacturers.reduce(
    (sum, m) => sum + sumTail(shipment.shipmentByMonth[m].slice(0, -headlineMonths), headlineMonths),
    0
  );
  const shipmentMoM =
    prevPeriodShipmentTotal === 0 ? 0 : (periodShipmentTotal - prevPeriodShipmentTotal) / prevPeriodShipmentTotal;

  const savingsHeadlineSlice = savings.savingsRatioByMonth.slice(-headlineMonths);
  const currentRatio = savingsHeadlineSlice.length
    ? savingsHeadlineSlice.reduce((a, b) => a + b, 0) / savingsHeadlineSlice.length
    : 0;

  const estimatedRevenueForPeriod = headlineMonthLabels.reduce(
    (sum, label) => sum + (estimatedRevenueByMonth.get(Number.parseInt(label, 10)) ?? 0),
    0
  );

  const shareForPeriod = shipment.manufacturers
    .map((m) => ({ name: m, qty: sumTail(shipment.shipmentByMonth[m], headlineMonths) }))
    .sort((a, b) => b.qty - a.qty);
  const topManufacturer = shareForPeriod[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{rangeLabel} 개요</h2>
          <p className="text-sm text-muted-foreground">선택한 기간의 출고량·비중 변화와 절감비율 목표 진행 상황</p>
        </div>
        <PeriodFilter options={PERIOD_OPTIONS} defaultValue="today" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="절감비율 (목표 1.6%)"
          value={`${currentRatio.toFixed(2)}%`}
          delta={{
            text: currentRatio >= savings.savingsRatioTarget ? "목표 달성" : "목표 미달",
            tone: currentRatio >= savings.savingsRatioTarget ? "good" : "critical",
          }}
        />
        <KpiCard
          label={`${rangeLabel} 총 출고량`}
          value={periodShipmentTotal.toLocaleString()}
          delta={{
            text: `${shipmentMoM >= 0 ? "▲" : "▼"} ${(Math.abs(shipmentMoM) * 100).toFixed(1)}% ${momLabel}`,
            tone: shipmentMoM >= 0 ? "good" : "critical",
          }}
        />
        <KpiCard
          label="제조사 비중 최고"
          value={topManufacturer?.name ?? "-"}
          delta={{ text: `${(topManufacturer?.qty ?? 0).toLocaleString()} EA`, tone: "neutral" }}
        />
        <KpiCard
          label="집계 제외 건수"
          value={`${shipment.excludedRowCount}건`}
          delta={{ text: "데이터 오류 행", tone: "critical" }}
        />
        <KpiCard
          label={`${rangeLabel} 추정 매출액 (직납)`}
          value={`${estimatedRevenueForPeriod.toLocaleString()}원`}
          delta={{ text: "PLT×단가 추정치", tone: "neutral" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">제조사별 월별 출고량 추이</CardTitle>
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
            <CardTitle className="text-sm">{rangeLabel} 절감비율 진행률</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 pb-6">
            <GoalRing current={currentRatio} target={savings.savingsRatioTarget} label="절감액 ÷ 매출액" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">전월 대비 비중 급등·급감 품목 TOP</CardTitle>
          </CardHeader>
          <CardContent>
            <TopMoversTable movers={shipment.topMovers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">품목 × 제조사 ({rangeLabel} 출고량)</CardTitle>
          </CardHeader>
          <CardContent>
            <CrossTable rows={shipment.crossTable} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">월별 절감비율 추이</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">월별 비용 구성 (직납 vs 밀크런&쉽먼트)</CardTitle>
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

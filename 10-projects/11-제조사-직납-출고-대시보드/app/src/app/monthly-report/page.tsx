import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SavingsRatioChart } from "@/components/dashboard/savings-ratio-chart";
import { CostCompositionChart } from "@/components/dashboard/cost-composition-chart";
import { SavingsByManufacturerChart } from "@/components/dashboard/savings-by-manufacturer-chart";
import { MilkrunChannelChart } from "@/components/dashboard/milkrun-channel-chart";
import { MilkrunSavingsChart } from "@/components/dashboard/milkrun-savings-chart";
import { TotalSavingsChart } from "@/components/dashboard/total-savings-chart";
import { MonthlyDataTable } from "@/components/dashboard/monthly-data-table";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { resolvePeriod, type PeriodSearchParams } from "@/lib/period";
import { TABLE_RIGHT_GUTTER, TABLE_RIGHT_GUTTER_SINGLE } from "@/lib/chart-layout";
import { buildMonthlyReport, type ReportCard } from "@/lib/monthly-report-cards";

function cardById(cards: ReportCard[], id: string): ReportCard {
  const card = cards.find((c) => c.id === id);
  if (!card) throw new Error(`알 수 없는 카드 id: ${id}`);
  return card;
}

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

  const { rangeLabel, savings, milkrun, cards } = await buildMonthlyReport(period);

  const totalCard = cardById(cards, "card-total-savings");
  const [totalDirectSavings, totalMilkrunSavings] = totalCard.rows.map((r) => r.values);

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
            months={cardById(cards, "card-direct-ratio").months}
            rightGutter={TABLE_RIGHT_GUTTER_SINGLE}
            rows={cardById(cards, "card-direct-ratio").rows}
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
            months={cardById(cards, "card-savings-ratio").months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={cardById(cards, "card-savings-ratio").rows}
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
            months={cardById(cards, "card-manufacturer-savings").months}
            rightGutter={TABLE_RIGHT_GUTTER_SINGLE}
            rows={cardById(cards, "card-manufacturer-savings").rows}
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
            months={cardById(cards, "card-rocket-milkrun").months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={cardById(cards, "card-rocket-milkrun").rows}
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
            months={cardById(cards, "card-fresh-milkrun").months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={cardById(cards, "card-fresh-milkrun").rows}
          />
        </CardContent>
      </Card>

      <Card id="card-milkrun-savings">
        <CardHeader>
          <CardTitle className="text-sm">밀크런/쉽먼트 이원화 비용절감 (ONLY 밀크런 대비)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <MilkrunSavingsChart
            months={milkrun.months}
            savings={milkrun.milkrunSavingsByMonth}
            ratios={milkrun.milkrunSavingsRatioByMonth}
            targets={milkrun.milkrunSavingsRatioTargetByMonth}
          />
          <MonthlyDataTable
            months={cardById(cards, "card-milkrun-savings").months}
            rightGutter={TABLE_RIGHT_GUTTER}
            rows={cardById(cards, "card-milkrun-savings").rows}
          />
        </CardContent>
      </Card>

      <Card id="card-total-savings">
        <CardHeader>
          <CardTitle className="text-sm">TOTAL 절감액 (직납 + 밀크런/쉽먼트 이원화)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TotalSavingsChart months={totalCard.months} directSavings={totalDirectSavings} milkrunSavings={totalMilkrunSavings} />
          <MonthlyDataTable
            months={totalCard.months}
            rightGutter={TABLE_RIGHT_GUTTER_SINGLE}
            rows={totalCard.rows}
          />
        </CardContent>
      </Card>
    </div>
  );
}

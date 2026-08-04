import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { fetchMilkrunDashboardData } from "@/lib/milkrun-data";
import { resolvePeriod } from "@/lib/period";

export const runtime = "nodejs";

function sheetFromRows(header: string[], rows: (string | number)[][]) {
  return XLSX.utils.aoa_to_sheet([header, ...rows]);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const period = resolvePeriod(
    { p: sp.get("p") ?? undefined, from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined },
    "today"
  );

  const [savings, milkrun] = await Promise.all([
    fetchSavingsDashboardData(period),
    fetchMilkrunDashboardData(period),
  ]);

  // page.tsx와 동일한 파생값 계산 — 화면에 보이는 표를 그대로 시트로 옮긴다
  const directShareByMonth = savings.directCostByMonth.map((direct, i) => {
    const total = direct + (savings.milkrunCostByMonth[i] ?? 0);
    return total ? (direct / total) * 100 : 0;
  });
  const milkrunShareByMonth = directShareByMonth.map((share) => 100 - share);
  const totalSavingsByMonth = savings.savingsTotalByMonth.map(
    (direct, i) => direct + (milkrun.milkrunSavingsByMonth[i] ?? 0)
  );

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(["구분", ...savings.months], [
      ["직납", ...savings.directCostByMonth.map(Math.round)],
      ["밀크런&쉽먼트", ...savings.milkrunCostByMonth.map(Math.round)],
      ["직납 비중(%)", ...directShareByMonth],
      ["밀크런&쉽먼트 비중(%)", ...milkrunShareByMonth],
    ]),
    "직납비율"
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(["구분", ...savings.months], [
      ["절감액", ...savings.savingsTotalByMonth.map(Math.round)],
      ["절감비율(%)", ...savings.savingsRatioByMonth],
      ["목표(%)", ...savings.savingsRatioTargetByMonth],
    ]),
    "직납 절감액"
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(
      ["구분", ...savings.manufacturerMonths],
      savings.manufacturers.map((mfr) => [mfr, ...savings.savingsByManufacturerMonth[mfr].map(Math.round)])
    ),
    "제조사별 절감액"
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(["구분", ...milkrun.months], [
      ["총매출", ...milkrun.rocketRevenueByMonth.map(Math.round)],
      ["밀크런", ...milkrun.rocketMilkrunCostByMonth.map(Math.round)],
      ["물류비율(%)", ...milkrun.rocketRatioByMonth],
    ]),
    "로켓 밀크런"
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(["구분", ...milkrun.months], [
      ["총매출", ...milkrun.freshRevenueByMonth.map(Math.round)],
      ["밀크런", ...milkrun.freshMilkrunCostByMonth.map(Math.round)],
      ["물류비율(%)", ...milkrun.freshRatioByMonth],
    ]),
    "프레시 밀크런"
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(["구분", ...savings.months], [
      ["직납 절감액", ...savings.savingsTotalByMonth.map(Math.round)],
      ["밀크런 절감액", ...milkrun.milkrunSavingsByMonth.map(Math.round)],
      ["TTL", ...totalSavingsByMonth.map(Math.round)],
    ]),
    "TOTAL 절감액"
  );

  const buffer: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const rangeLabel =
    savings.months.length <= 1 ? (savings.months[0] ?? "당월") : `${savings.months[0]}~${savings.months.at(-1)}`;
  const filename = `쿠팡_월말보고_${rangeLabel}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="monthly-report.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}

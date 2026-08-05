import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { resolvePeriod } from "@/lib/period";
import { buildMonthlyReport, type ReportCard, type ReportRow } from "@/lib/monthly-report-cards";
import { buildBarChartXml, buildLineChartXml, colLetter, type ChartSeries } from "@/lib/xlsx-native-chart";
import { injectNativeCharts, type SheetChartSpec } from "@/lib/xlsx-inject-charts";

export const runtime = "nodejs";
export const maxDuration = 30;

const HEADER_ROW = 2;
const FIRST_DATA_ROW = 3;

const PALETTE = { blue: "2A78D6", orange: "EB6834", aqua: "1BAF7A", yellow: "EDA100", magenta: "E87BA4" };
const PALETTE_LIST = [PALETTE.blue, PALETTE.orange, PALETTE.aqua, PALETTE.yellow, PALETTE.magenta];

interface ChartPlanEntry {
  type: "bar" | "line";
  title: string;
  rowIdxs: number[]; // card.rows 안에서 이 차트에 넣을 행 인덱스
  stacked?: boolean;
  colors: string[]; // rowIdxs와 같은 순서
}

// 카드별로 어떤 행을 어떤 형태(막대/꺾은선)의 네이티브 차트로 만들지 — 웹 대시보드의 이원축(막대+% 보조축)
// 조합은 엑셀 네이티브 차트로 그대로 재현하기 리스크가 커서, 금액은 막대로 · 비율은 별도의 단순 꺾은선으로 나눔.
const CHART_PLANS: Record<string, (card: ReportCard) => ChartPlanEntry[]> = {
  "card-direct-ratio": (c) => [{ type: "bar", title: c.title, rowIdxs: [0, 1], stacked: true, colors: [PALETTE.blue, PALETTE.aqua] }],
  "card-savings-ratio": (c) => [
    { type: "bar", title: `${c.sheet} - 절감액`, rowIdxs: [0], colors: [PALETTE.blue] },
    { type: "line", title: `${c.sheet} - 절감비율`, rowIdxs: [1], colors: [PALETTE.yellow] },
  ],
  "card-manufacturer-savings": (c) => [
    {
      type: "bar",
      title: c.title,
      rowIdxs: c.rows.map((_, i) => i),
      stacked: true,
      colors: c.rows.map((_, i) => PALETTE_LIST[i % PALETTE_LIST.length]),
    },
  ],
  "card-rocket-milkrun": (c) => [
    { type: "bar", title: `${c.sheet} - 총매출/밀크런`, rowIdxs: [0, 1], colors: [PALETTE.blue, PALETTE.aqua] },
    { type: "line", title: `${c.sheet} - 물류비율`, rowIdxs: [2], colors: [PALETTE.yellow] },
  ],
  "card-fresh-milkrun": (c) => [
    { type: "bar", title: `${c.sheet} - 총매출/밀크런`, rowIdxs: [0, 1], colors: [PALETTE.blue, PALETTE.aqua] },
    { type: "line", title: `${c.sheet} - 물류비율`, rowIdxs: [2], colors: [PALETTE.yellow] },
  ],
  "card-total-savings": (c) => [{ type: "bar", title: c.title, rowIdxs: [0, 1], stacked: true, colors: [PALETTE.blue, PALETTE.aqua] }],
};

// 표시 단위: 화면(대시보드)은 스캔하기 편하게 천원 단위로 줄이지만, 엑셀은 실제 기록·분석용이라
// 원 단위 그대로 넣는다. 비율(percent)은 엑셀 표준 퍼센트 서식(0~1 값 + "0.00%").
function cellValueAndFormat(row: ReportRow, v: number): { value: number; numFmt: string } {
  if (row.unit === "percent") return { value: v / 100, numFmt: "0.00%" };
  return { value: Math.round(v), numFmt: "#,##0" };
}

function writeCardSheet(workbook: ExcelJS.Workbook, card: ReportCard): SheetChartSpec["charts"] {
  const sheet = workbook.addWorksheet(card.sheet);
  const lastCol = 1 + card.months.length;
  const lastColLetter = colLetter(lastCol);

  sheet.getCell(1, 1).value = card.title;
  sheet.getCell(1, 1).font = { bold: true, size: 13 };
  sheet.mergeCells(1, 1, 1, lastCol);

  sheet.getCell(HEADER_ROW, 1).value = "구분";
  card.months.forEach((m, i) => {
    sheet.getCell(HEADER_ROW, 2 + i).value = m;
  });
  sheet.getRow(HEADER_ROW).font = { bold: true };

  card.rows.forEach((row, i) => {
    const excelRow = FIRST_DATA_ROW + i;
    sheet.getCell(excelRow, 1).value = row.label;
    row.values.forEach((v, j) => {
      const { value, numFmt } = cellValueAndFormat(row, v);
      const cell = sheet.getCell(excelRow, 2 + j);
      cell.value = value;
      cell.numFmt = numFmt;
    });
  });

  sheet.getColumn(1).width = 20;
  for (let c = 2; c <= lastCol; c++) sheet.getColumn(c).width = 12;

  const lastDataRow = FIRST_DATA_ROW + card.rows.length - 1;
  const catRef = `'${card.sheet}'!$B$${HEADER_ROW}:$${lastColLetter}$${HEADER_ROW}`;

  const seriesForRowIdx = (rowIdx: number, colorHex: string): ChartSeries => {
    const row = card.rows[rowIdx];
    const excelRow = FIRST_DATA_ROW + rowIdx;
    const numFmt = row.unit === "percent" ? "0.00%" : "#,##0";
    const values = row.values.map((v) => cellValueAndFormat(row, v).value);
    return {
      name: row.label,
      nameRef: `'${card.sheet}'!$A$${excelRow}`,
      values,
      valRef: `'${card.sheet}'!$B$${excelRow}:$${lastColLetter}$${excelRow}`,
      colorHex,
      formatCode: numFmt,
    };
  };

  const plan = (CHART_PLANS[card.id]?.(card) ?? []).filter((entry) => entry.rowIdxs.every((idx) => card.rows[idx]));
  const charts: SheetChartSpec["charts"] = [];
  const chartWidthCols = plan.length > 1 ? 9 : 11;
  const chartHeightRows = 16;
  const anchorFromRow0 = lastDataRow + 1; // 데이터 아래 한 줄 띄우고 시작 (0-based)

  plan.forEach((entry, planIdx) => {
    const series = entry.rowIdxs.map((idx, i) => seriesForRowIdx(idx, entry.colors[i] ?? PALETTE.blue));
    const xml =
      entry.type === "bar"
        ? buildBarChartXml({ title: entry.title, catRef, categories: card.months, series, stacked: !!entry.stacked })
        : buildLineChartXml({ title: entry.title, catRef, categories: card.months, series });
    const fromCol = 1 + planIdx * chartWidthCols;
    charts.push({
      xml,
      name: entry.title,
      anchor: { fromCol, fromRow: anchorFromRow0, toCol: fromCol + chartWidthCols, toRow: anchorFromRow0 + chartHeightRows },
    });
  });

  return charts;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const period = resolvePeriod(
    { p: sp.get("p") ?? undefined, from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined },
    "today"
  );

  const { rangeLabel, cards } = await buildMonthlyReport(period);

  const workbook = new ExcelJS.Workbook();
  const chartSpecs: SheetChartSpec[] = cards.map((card, i) => ({
    sheetIndex: i + 1,
    charts: writeCardSheet(workbook, card),
  }));

  const baseBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const finalBuffer = await injectNativeCharts(baseBuffer, chartSpecs);

  const filename = `쿠팡_월말보고_${rangeLabel}.xlsx`;

  return new Response(new Uint8Array(finalBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="monthly-report.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}

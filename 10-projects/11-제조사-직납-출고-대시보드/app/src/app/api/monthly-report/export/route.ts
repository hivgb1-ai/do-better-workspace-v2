import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { fetchMilkrunDashboardData } from "@/lib/milkrun-data";
import { resolvePeriod } from "@/lib/period";

export const runtime = "nodejs";
export const maxDuration = 60;

interface DataRow {
  label: string;
  values: number[];
  unit: "won" | "percent";
}

const WON_FORMAT = '#,##0"원"';
const PERCENT_FORMAT = "0.00\"%\"";

// 화면(monthly-report)의 차트 6개 — 캡처할 DOM id와, 대응하는 엑셀 시트/표를 한 곳에서 정의
const CHART_IDS = [
  "chart-direct-ratio",
  "chart-savings-ratio",
  "chart-manufacturer-savings",
  "chart-rocket-milkrun",
  "chart-fresh-milkrun",
  "chart-total-savings",
] as const;

// @sparticuz/chromium은 Open Sans만 내장하고 있어 한글은 기본적으로 렌더링되지 않는다(글자 자체가
// 빈 칸으로 사라짐, 네모 대체문자조차 안 뜸). 번들에 포함한 Noto Sans KR을 /tmp/fonts에 풀어
// fontconfig가 인식하는 기본 검색 경로 중 하나로 등록한다(패키지 문서에 명시된 경로).
function ensureKoreanFontAvailable() {
  const destDir = "/tmp/fonts";
  const destPath = path.join(destDir, "NotoSansKR-Regular.ttf");
  if (fs.existsSync(destPath)) return; // 같은 인스턴스로 재사용되는 warm invocation에서는 복사 생략
  fs.mkdirSync(destDir, { recursive: true });
  const srcPath = path.join(process.cwd(), "assets", "fonts", "NotoSansKR-Regular.ttf");
  fs.copyFileSync(srcPath, destPath);
}

async function captureChartImages(pageUrl: string) {
  const images = new Map<string, { buffer: Buffer; width: number; height: number }>();

  let browser: Browser | undefined;
  try {
    ensureKoreanFontAvailable();
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      defaultViewport: { width: 1100, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 45000 });

    for (const id of CHART_IDS) {
      try {
        await page.waitForSelector(`#${id} svg`, { timeout: 15000 });
        const el = await page.$(`#${id}`);
        if (!el) continue;
        const box = await el.boundingBox();
        const buffer = Buffer.from(await el.screenshot({ type: "png" }));
        if (box) images.set(id, { buffer, width: Math.round(box.width), height: Math.round(box.height) });
      } catch {
        // 차트 하나가 실패해도 나머지 시트/캡처는 계속 진행 — 실패한 차트는 이미지 없이 표만 남는다
      }
    }
  } finally {
    await browser?.close();
  }

  return images;
}

function addDataSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  months: string[],
  rows: DataRow[],
  chartImage?: { buffer: Buffer; width: number; height: number }
) {
  const sheet = workbook.addWorksheet(sheetName);

  if (chartImage) {
    // exceljs가 자체 .d.ts에서 전역 Buffer를 "extends ArrayBuffer"로 재선언해 최신 @types/node의
    // Buffer(resizable 등 ArrayBuffer 신규 멤버 포함)와 구조적으로 어긋나는 타입 오류 — 런타임 값은
    // 정상 Node Buffer라 전체 인자를 통째로 우회 캐스팅
    const imageId = workbook.addImage({ buffer: chartImage.buffer, extension: "png" } as unknown as ExcelJS.Image);
    sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: chartImage.width, height: chartImage.height } });
    const spacerRows = Math.ceil(chartImage.height / 20) + 2;
    for (let i = 0; i < spacerRows; i += 1) sheet.addRow([]);
  }

  const header = sheet.addRow(["구분", ...months]);
  header.font = { bold: true };

  for (const row of rows) {
    const excelRow = sheet.addRow([row.label, ...row.values.map((v) => (row.unit === "won" ? Math.round(v) : v))]);
    const format = row.unit === "won" ? WON_FORMAT : PERCENT_FORMAT;
    for (let col = 2; col <= months.length + 1; col += 1) {
      excelRow.getCell(col).numFmt = format;
    }
  }

  sheet.columns.forEach((col) => {
    col.width = 16;
  });
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

  const pageUrl = `${request.nextUrl.origin}/monthly-report?${sp.toString()}`;
  const images = await captureChartImages(pageUrl);

  const workbook = new ExcelJS.Workbook();

  addDataSheet(
    workbook,
    "직납비율",
    savings.months,
    [
      { label: "직납", values: savings.directCostByMonth, unit: "won" },
      { label: "밀크런&쉽먼트", values: savings.milkrunCostByMonth, unit: "won" },
      { label: "직납 비중", values: directShareByMonth, unit: "percent" },
      { label: "밀크런&쉽먼트 비중", values: milkrunShareByMonth, unit: "percent" },
    ],
    images.get("chart-direct-ratio")
  );

  addDataSheet(
    workbook,
    "직납 절감액",
    savings.months,
    [
      { label: "절감액", values: savings.savingsTotalByMonth, unit: "won" },
      { label: "절감비율", values: savings.savingsRatioByMonth, unit: "percent" },
      { label: "목표", values: savings.savingsRatioTargetByMonth, unit: "percent" },
    ],
    images.get("chart-savings-ratio")
  );

  addDataSheet(
    workbook,
    "제조사별 절감액",
    savings.manufacturerMonths,
    savings.manufacturers.map((mfr) => ({
      label: mfr,
      values: savings.savingsByManufacturerMonth[mfr],
      unit: "won" as const,
    })),
    images.get("chart-manufacturer-savings")
  );

  addDataSheet(
    workbook,
    "로켓 밀크런",
    milkrun.months,
    [
      { label: "총매출", values: milkrun.rocketRevenueByMonth, unit: "won" },
      { label: "밀크런", values: milkrun.rocketMilkrunCostByMonth, unit: "won" },
      { label: "물류비율", values: milkrun.rocketRatioByMonth, unit: "percent" },
    ],
    images.get("chart-rocket-milkrun")
  );

  addDataSheet(
    workbook,
    "프레시 밀크런",
    milkrun.months,
    [
      { label: "총매출", values: milkrun.freshRevenueByMonth, unit: "won" },
      { label: "밀크런", values: milkrun.freshMilkrunCostByMonth, unit: "won" },
      { label: "물류비율", values: milkrun.freshRatioByMonth, unit: "percent" },
    ],
    images.get("chart-fresh-milkrun")
  );

  addDataSheet(
    workbook,
    "TOTAL 절감액",
    savings.months,
    [
      { label: "직납 절감액", values: savings.savingsTotalByMonth, unit: "won" },
      { label: "밀크런 절감액", values: milkrun.milkrunSavingsByMonth, unit: "won" },
      { label: "TTL", values: totalSavingsByMonth, unit: "won" },
    ],
    images.get("chart-total-savings")
  );

  const buffer = await workbook.xlsx.writeBuffer();

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

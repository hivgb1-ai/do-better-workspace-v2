import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";
import { fetchSavingsDashboardData } from "@/lib/savings-data";
import { resolvePeriod } from "@/lib/period";

export const runtime = "nodejs";
export const maxDuration = 60;

// 화면(monthly-report)의 카드 6개 — 캡처할 DOM id와 대응하는 엑셀 시트명을 한 곳에서 정의.
// 카드 전체(제목+차트+월별 표)를 그대로 캡처해 화면에 보이는 모습 그대로 시트에 넣는다.
const CARDS = [
  { id: "card-direct-ratio", sheet: "직납비율" },
  { id: "card-savings-ratio", sheet: "직납 절감액" },
  { id: "card-manufacturer-savings", sheet: "제조사별 절감액" },
  { id: "card-rocket-milkrun", sheet: "로켓 밀크런" },
  { id: "card-fresh-milkrun", sheet: "프레시 밀크런" },
  { id: "card-total-savings", sheet: "TOTAL 절감액" },
] as const;

async function captureCardImages(pageUrl: string) {
  const images = new Map<string, { buffer: Buffer; width: number; height: number }>();

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      defaultViewport: { width: 1100, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
    const page = await browser.newPage();
    // 대시보드 화면 그대로(다크 테마 배경 포함) 캡처
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 45000 });
    // @sparticuz/chromium은 한글 시스템 폰트가 없어, globals.css의 Noto Sans KR 웹폰트
    // (@font-face)가 실제로 로드 완료될 때까지 기다린다 — 안 그러면 한글이 빈 칸으로 캡처된다.
    await page.evaluate(() => document.fonts.ready);

    for (const { id } of CARDS) {
      try {
        await page.waitForSelector(`#${id} svg`, { timeout: 15000 });
        const el = await page.$(`#${id}`);
        if (!el) continue;
        const box = await el.boundingBox();
        const buffer = Buffer.from(await el.screenshot({ type: "png" }));
        if (box) images.set(id, { buffer, width: Math.round(box.width), height: Math.round(box.height) });
      } catch {
        // 카드 하나가 실패해도 나머지 캡처는 계속 진행 — 실패한 카드는 빈 시트로 남는다
      }
    }
  } finally {
    await browser?.close();
  }

  return images;
}

function addImageSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  image?: { buffer: Buffer; width: number; height: number }
) {
  const sheet = workbook.addWorksheet(sheetName);
  if (!image) return;

  // exceljs가 자체 .d.ts에서 전역 Buffer를 "extends ArrayBuffer"로 재선언해 최신 @types/node의
  // Buffer(resizable 등 ArrayBuffer 신규 멤버 포함)와 구조적으로 어긋나는 타입 오류 — 런타임 값은
  // 정상 Node Buffer라 전체 인자를 통째로 우회 캐스팅
  const imageId = workbook.addImage({ buffer: image.buffer, extension: "png" } as unknown as ExcelJS.Image);
  sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: image.width, height: image.height } });
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const period = resolvePeriod(
    { p: sp.get("p") ?? undefined, from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined },
    "today"
  );

  // 파일명(기간 라벨) 계산에만 필요 — 셀 데이터는 더 이상 만들지 않고 화면 캡처 이미지만 담는다
  const savings = await fetchSavingsDashboardData(period);

  const pageUrl = `${request.nextUrl.origin}/monthly-report?${sp.toString()}`;
  const images = await captureCardImages(pageUrl);

  const workbook = new ExcelJS.Workbook();
  for (const { id, sheet } of CARDS) {
    addImageSheet(workbook, sheet, images.get(id));
  }

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

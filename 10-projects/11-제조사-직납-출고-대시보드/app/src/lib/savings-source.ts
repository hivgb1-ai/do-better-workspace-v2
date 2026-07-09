import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { fetchShipmentSource } from "./shipment-source";

const COST_SHEET = "절감액V2";
const RATIO_SHEET = "직납비율";
const FILENAME_RE = /^애사비소다 제조사 직납 비용절감_(\d{2})월.*\.xlsx$/;

// 절감액V2 요율표의 "제조사" 라벨과 출고내역 시트의 "보내는창고" 표기가 다른 경우
const MANUFACTURER_ALIAS: Record<string, string> = { OKF: "오케이에프" };
function normalizeManufacturer(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, "");
  return MANUFACTURER_ALIAS[trimmed] ?? trimmed;
}

// 보관비 절감액 = PLT수량 × 700원 × 4일 (절감액V2 "단가" 컬럼 표기와 동일, 전 품목 공통)
const STORAGE_SAVINGS_PER_PLT = 2800;

export interface MonthlySavings {
  year: number;
  month: number; // 1-12
  savingsTotal: number;
  revenueTotal: number;
  ratio: number; // %
  directCost: number; // 직납
  milkrunCost: number; // 밀크런&쉽먼트
}

// 원본 위치: G:\공유 드라이브\HQ_Team_SCM\SCM_공용\★성과측정지표(KPI)\<year>년\물류운영\쿠팡 비용 절감\제조사 직납
// Vercel 배포 환경은 이 로컬 공유 드라이브에 접근할 수 없어(§3 선행 작업: Google Sheets 이관 전 임시 조치)
// 매달 최신 파일을 이 폴더로 직접 복사해 저장소에 함께 배포한다.
function baseDir() {
  return path.join(process.cwd(), "data", "savings-source");
}

// 매달 새 파일이 생성되는 방식(§3 선행 작업: Google Sheets 이관 전)이라 디렉터리에서 가장 최근 월의 xlsx를 직접 찾는다.
function findLatestFile(): string | null {
  const dir = baseDir();
  if (!fs.existsSync(dir)) return null;

  const candidates = fs
    .readdirSync(dir)
    .map((name) => {
      const match = name.match(FILENAME_RE);
      return match ? { name, month: Number(match[1]) } : null;
    })
    .filter((c): c is { name: string; month: number } => c !== null);

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.month - a.month);
  return path.join(dir, candidates[0].name);
}

function parseNum(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function sheetToRows(wb: XLSX.WorkBook, sheetName: string): string[][] {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: "" });
}

interface SavingsRate {
  coef4: number; // 운송비 절감계수 (EA당)
  coef5: number; // 작업비 절감계수 (EA당)
  coef6: number; // 작업비 절감계수 (PLT당)
}

// 절감액V2의 "제조사"(B열)는 세로 병합 셀로 관리된다 — 병합 범위를 그대로 반영해야
// 병합이 끊긴 빈 칸을 엉뚱한 윗쪽 제조사로 잘못 이어붙이지 않는다.
function resolveManufacturerByRow(ws: XLSX.WorkSheet, rows: string[][]): Map<number, string> {
  const manuByRow = new Map<number, string>();
  for (const merge of ws["!merges"] ?? []) {
    if (merge.s.c !== 1 || merge.e.c !== 1) continue;
    const anchor = ws[XLSX.utils.encode_cell({ r: merge.s.r, c: 1 })];
    const value = anchor?.v ? String(anchor.v).trim().replace(/\s+/g, "") : "";
    for (let r = merge.s.r; r <= merge.e.r; r += 1) manuByRow.set(r, value);
  }
  rows.forEach((row, r) => {
    if (row[1]?.trim() && !manuByRow.has(r)) manuByRow.set(r, row[1].trim().replace(/\s+/g, ""));
  });
  return manuByRow;
}

// 품목별 요율표: (ERP코드+제조사)를 키로 하는 절감계수 — 같은 ERP코드도 제조사별로 계수가 다를 수 있다(사용자 확정 규칙).
function parseSavingsRateTable(wb: XLSX.WorkBook): Map<string, SavingsRate> {
  const ws = wb.Sheets[COST_SHEET];
  if (!ws) throw new Error(`시트를 찾을 수 없습니다: ${COST_SHEET}`);
  const rows = sheetToRows(wb, COST_SHEET);
  const manuByRow = resolveManufacturerByRow(ws, rows);

  const rateByKey = new Map<string, SavingsRate>();
  rows.forEach((row, r) => {
    const erp = row[0]?.trim();
    const product = row[2]?.trim();
    if (!erp || !product) return;
    const coef4 = parseNum(row[4]);
    const coef5 = parseNum(row[5]);
    const coef6 = parseNum(row[6]);
    if (coef4 === null || coef5 === null || coef6 === null) return;
    const manufacturer = normalizeManufacturer(manuByRow.get(r) ?? "");
    rateByKey.set(`${erp}|${manufacturer}`, { coef4, coef5, coef6 });
  });
  return rateByKey;
}

// "추가 물류비" 등 특정 SKU에 속하지 않는 수동 조정액 — 출고 데이터로는 계산할 수 없어 엑셀 값을 그대로 더한다.
function parseManualAdjustmentByMonth(wb: XLSX.WorkBook): Map<number, number> {
  const rows = sheetToRows(wb, COST_SHEET);
  const headerRowIndex = rows.findIndex((r) => r[1] === "제조사");
  if (headerRowIndex < 1) throw new Error(`${COST_SHEET}: 헤더 행("제조사")을 찾을 수 없습니다`);
  const header = rows[headerRowIndex];

  const jan = header.indexOf("1월");
  const feb = header.indexOf("2월");
  if (jan < 0 || feb < 0) throw new Error(`${COST_SHEET}: 월별 블록 헤더를 찾을 수 없습니다`);
  const blockWidth = feb - jan;
  const ttlOffset = blockWidth - 1;

  const adjustmentRow = rows.find((r) => r[2]?.trim() === "추가 물류비");
  const result = new Map<number, number>();
  if (!adjustmentRow) return result;

  for (let month = 1; month <= 12; month += 1) {
    const col = jan + (month - 1) * blockWidth + ttlOffset;
    const value = parseNum(adjustmentRow[col]);
    if (value !== null) result.set(month, value);
  }
  return result;
}

// ERP코드+제조사+월 단위로 출고내역의 EA/PLT를 집계해 절감액을 계산한다.
// 요율표에 없는 (ERP코드+제조사) 조합은 계산에서 제외된다 — 절감액V2에 요율이 채워지는 대로 자동 반영됨.
async function computeSkuSavingsByMonth(rateByKey: Map<string, SavingsRate>): Promise<Map<number, number>> {
  const { rows } = await fetchShipmentSource();

  const qtyByKey = new Map<string, { ea: number; plt: number }>();
  for (const row of rows) {
    if (!row.erpCode || row.erpCode.startsWith("#")) continue; // #N/A, #REF! 등 오류 코드 제외
    const month = row.date.getMonth() + 1;
    const key = `${row.erpCode}|${normalizeManufacturer(row.manufacturer)}|${month}`;
    const entry = qtyByKey.get(key) ?? { ea: 0, plt: 0 };
    entry.ea += row.qty;
    entry.plt += row.pltQty;
    qtyByKey.set(key, entry);
  }

  const savingsByMonth = new Map<number, number>();
  for (const [key, { ea, plt }] of qtyByKey) {
    const [erp, manufacturer, monthStr] = key.split("|");
    const rate = rateByKey.get(`${erp}|${manufacturer}`);
    if (!rate) continue; // 요율 미등록 — 절감액V2에 (ERP코드+제조사) 행을 추가하면 다음 조회부터 반영됨
    const month = Number(monthStr);
    const savings = plt * STORAGE_SAVINGS_PER_PLT + ea * rate.coef4 + ea * rate.coef5 + plt * rate.coef6;
    savingsByMonth.set(month, (savingsByMonth.get(month) ?? 0) + savings);
  }
  return savingsByMonth;
}

function parseRevenueByMonth(wb: XLSX.WorkBook): { year: number; byMonth: Map<number, number> } {
  const rows = sheetToRows(wb, RATIO_SHEET);
  const headerRowIndex = rows.findIndex((r) => r[1] === "1월");
  if (headerRowIndex < 1) throw new Error(`${RATIO_SHEET}: 월 헤더 행을 찾을 수 없습니다`);

  const yearLabel = rows[headerRowIndex - 1]?.[1] ?? "";
  const year = Number(yearLabel.replace(/[^\d]/g, "")) || new Date().getFullYear();

  const header = rows[headerRowIndex];
  const ttlRow = rows.find((r) => r[0]?.trim() === "TTL");
  if (!ttlRow) throw new Error(`${RATIO_SHEET}: 매출액 TTL 행을 찾을 수 없습니다`);

  const byMonth = new Map<number, number>();
  for (let month = 1; month <= 12; month += 1) {
    const col = header.indexOf(`${month}월`);
    if (col < 0) continue;
    const value = parseNum(ttlRow[col]);
    if (value !== null) byMonth.set(month, value);
  }
  return { year, byMonth };
}

// "직납비율" 시트의 "직납"/"밀크런&쉽먼트" 행에서 월별 비용을 추출한다.
// TTL = 직납 + 밀크런&쉽먼트 (같은 헤더 행을 parseRevenueByMonth와 공유).
function parseCostBreakdownByMonth(wb: XLSX.WorkBook): {
  directByMonth: Map<number, number>;
  milkrunByMonth: Map<number, number>;
} {
  const rows = sheetToRows(wb, RATIO_SHEET);
  const headerRowIndex = rows.findIndex((r) => r[1] === "1월");
  if (headerRowIndex < 1) throw new Error(`${RATIO_SHEET}: 월 헤더 행을 찾을 수 없습니다`);
  const header = rows[headerRowIndex];

  const directRow = rows.find((r) => r[0]?.trim() === "직납");
  const milkrunRow = rows.find((r) => r[0]?.trim() === "밀크런&쉽먼트");
  if (!directRow) throw new Error(`${RATIO_SHEET}: "직납" 행을 찾을 수 없습니다`);
  if (!milkrunRow) throw new Error(`${RATIO_SHEET}: "밀크런&쉽먼트" 행을 찾을 수 없습니다`);

  const directByMonth = new Map<number, number>();
  const milkrunByMonth = new Map<number, number>();
  for (let month = 1; month <= 12; month += 1) {
    const col = header.indexOf(`${month}월`);
    if (col < 0) continue;
    const direct = parseNum(directRow[col]);
    if (direct !== null) directByMonth.set(month, direct);
    const milkrun = parseNum(milkrunRow[col]);
    if (milkrun !== null) milkrunByMonth.set(month, milkrun);
  }
  return { directByMonth, milkrunByMonth };
}

export async function fetchMonthlySavings(): Promise<MonthlySavings[]> {
  const filePath = findLatestFile();
  if (!filePath) return [];

  let revenueYear: number;
  let revenueByMonth: Map<number, number>;
  let directByMonth: Map<number, number>;
  let milkrunByMonth: Map<number, number>;
  let rateByKey: Map<string, SavingsRate>;
  let adjustmentByMonth: Map<number, number>;
  try {
    // XLSX.readFile()이 Turbopack 서버 런타임에서 fs를 감지하지 못해 "Cannot access file" 오류를 던짐 —
    // 직접 읽은 버퍼를 XLSX.read()에 넘겨 우회
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: "buffer" });
    ({ year: revenueYear, byMonth: revenueByMonth } = parseRevenueByMonth(wb));
    ({ directByMonth, milkrunByMonth } = parseCostBreakdownByMonth(wb));
    rateByKey = parseSavingsRateTable(wb);
    adjustmentByMonth = parseManualAdjustmentByMonth(wb);
  } catch (e) {
    throw new Error(`비용절감 엑셀 파싱 실패 (${filePath}): ${e instanceof Error ? e.message : String(e)}`);
  }

  const skuSavingsByMonth = await computeSkuSavingsByMonth(rateByKey);

  const result: MonthlySavings[] = [];
  for (const [month, revenueTotal] of revenueByMonth) {
    const savingsTotal = (skuSavingsByMonth.get(month) ?? 0) + (adjustmentByMonth.get(month) ?? 0);
    result.push({
      year: revenueYear,
      month,
      savingsTotal,
      revenueTotal,
      ratio: (savingsTotal / revenueTotal) * 100,
      directCost: directByMonth.get(month) ?? 0,
      milkrunCost: milkrunByMonth.get(month) ?? 0,
    });
  }

  result.sort((a, b) => a.month - b.month);
  return result;
}

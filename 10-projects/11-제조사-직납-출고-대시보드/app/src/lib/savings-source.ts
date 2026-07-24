import { getGoogleSheetsAccessToken } from "./google-sheets";
import { fetchShipmentSource } from "./shipment-source";

const RATE_TAB = "직납 요율표";
const REVENUE_TAB = "직납 매출조정";

// 보관비 절감액 = PLT수량 × 700원 × 4일, 전 품목 공통 (직납 요율표에는 없음)
const STORAGE_SAVINGS_PER_PLT = 2800;

export interface MonthlySavings {
  year: number;
  month: number; // 1-12
  savingsTotal: number;
  revenueTotal: number;
  ratio: number; // %
  directCost: number; // 직납
  milkrunCost: number; // 밀크런&쉽먼트
  // SKU 기반 절감액만의 제조사별 분해 — "추가물류비조정"(수동 조정액)은 특정 제조사에 귀속되지 않아 제외됨
  savingsByManufacturer: Record<string, number>;
}

interface SavingsRate {
  transportPerEa: number; // 운송비 절감계수 (EA당)
  laborPerEa: number; // 작업비 절감계수 (EA당)
  laborPerPlt: number; // 작업비 절감계수 (PLT당)
}

// 직납 요율표의 "제조사"와 출고내역 시트의 "보내는창고" 표기를 동일 기준으로 맞추기 위한 정규화
function normalizeManufacturer(name: string): string {
  return name.trim().replace(/\s+/g, "");
}

function parseNum(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function fetchSheetValues(tab: string): Promise<string[][]> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID 환경변수가 없습니다");

  const token = await getGoogleSheetsAccessToken();
  const range = encodeURIComponent(`'${tab}'!A1:Z`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`${tab} 시트 조회 실패 (${res.status}): ${await res.text()}`);

  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

// 품목별 요율표: (ERP코드+제조사)를 키로 하는 절감계수 — 같은 ERP코드도 제조사별로 계수가 다를 수 있다(사용자 확정 규칙).
async function fetchRateByKey(): Promise<Map<string, SavingsRate>> {
  const values = await fetchSheetValues(RATE_TAB);
  const header = values[0] ?? [];
  const erpCol = header.indexOf("ERP코드");
  const manuCol = header.indexOf("제조사");
  const transportCol = header.indexOf("운송비단가_EA");
  const laborEaCol = header.indexOf("작업비단가_EA");
  const laborPltCol = header.indexOf("작업비단가_PLT");
  if ([erpCol, manuCol, transportCol, laborEaCol, laborPltCol].some((c) => c < 0)) {
    throw new Error(`${RATE_TAB}: 필수 헤더(ERP코드/제조사/운송비단가_EA/작업비단가_EA/작업비단가_PLT)를 찾을 수 없습니다`);
  }

  const rateByKey = new Map<string, SavingsRate>();
  for (const row of values.slice(1)) {
    const erp = row[erpCol]?.trim();
    if (!erp) continue;
    const manufacturer = normalizeManufacturer(row[manuCol] ?? "");
    const transportPerEa = parseNum(row[transportCol]);
    const laborPerEa = parseNum(row[laborEaCol]);
    const laborPerPlt = parseNum(row[laborPltCol]);
    if (transportPerEa === null || laborPerEa === null || laborPerPlt === null) continue;
    rateByKey.set(`${erp}|${manufacturer}`, { transportPerEa, laborPerEa, laborPerPlt });
  }
  return rateByKey;
}

interface RevenueRow {
  year: number;
  month: number;
  direct: number;
  milkrun: number;
  adjustment: number; // "추가 물류비" 등 SKU에 속하지 않는 수동 조정액
}

// 이 달이 결과에 포함되는 기준: 매출 행이 입력됐는가 — 담당자가 매달 이 탭에 한 줄 추가하는 방식
async function fetchRevenueRows(): Promise<RevenueRow[]> {
  const values = await fetchSheetValues(REVENUE_TAB);
  const header = values[0] ?? [];
  const yearCol = header.indexOf("연도");
  const monthCol = header.indexOf("월");
  const directCol = header.indexOf("직납매출");
  const milkrunCol = header.indexOf("밀크런쉽먼트매출");
  const adjCol = header.indexOf("추가물류비조정");
  if ([yearCol, monthCol, directCol, milkrunCol, adjCol].some((c) => c < 0)) {
    throw new Error(`${REVENUE_TAB}: 필수 헤더(연도/월/직납매출/밀크런쉽먼트매출/추가물류비조정)를 찾을 수 없습니다`);
  }

  const rows: RevenueRow[] = [];
  for (const row of values.slice(1)) {
    const year = parseNum(row[yearCol]);
    const month = parseNum(row[monthCol]);
    if (year === null || month === null) continue;
    rows.push({
      year,
      month,
      direct: parseNum(row[directCol]) ?? 0,
      milkrun: parseNum(row[milkrunCol]) ?? 0,
      adjustment: parseNum(row[adjCol]) ?? 0,
    });
  }
  return rows;
}

interface SkuSavings {
  byYearMonth: Map<string, number>;
  byManufacturerYearMonth: Map<string, number>; // key: `${제조사}|${연월}`
}

// ERP코드+제조사+연월 단위로 출고내역의 EA/PLT를 집계해 절감액을 계산한다.
// 요율표에 없는 (ERP코드+제조사) 조합은 계산에서 제외된다 — 직납 요율표에 요율이 채워지는 대로 자동 반영됨.
async function computeSkuSavingsByYearMonth(rateByKey: Map<string, SavingsRate>): Promise<SkuSavings> {
  const { rows } = await fetchShipmentSource();

  const qtyByKey = new Map<string, { ea: number; plt: number }>();
  for (const row of rows) {
    if (!row.erpCode || row.erpCode.startsWith("#")) continue; // #N/A, #REF! 등 오류 코드 제외
    const manufacturer = normalizeManufacturer(row.manufacturer);
    const yearMonth = `${row.date.getFullYear()}-${row.date.getMonth() + 1}`;
    const key = `${row.erpCode}|${manufacturer}|${yearMonth}`;
    const entry = qtyByKey.get(key) ?? { ea: 0, plt: 0 };
    entry.ea += row.qty;
    entry.plt += row.pltQty;
    qtyByKey.set(key, entry);
  }

  const byYearMonth = new Map<string, number>();
  const byManufacturerYearMonth = new Map<string, number>();
  for (const [key, { ea, plt }] of qtyByKey) {
    const [erp, manufacturer, yearMonth] = key.split("|");
    const rate = rateByKey.get(`${erp}|${manufacturer}`);
    if (!rate) continue; // 요율 미등록 — 직납 요율표에 (ERP코드+제조사) 행을 추가하면 다음 조회부터 반영됨
    const savings =
      plt * STORAGE_SAVINGS_PER_PLT + ea * rate.transportPerEa + ea * rate.laborPerEa + plt * rate.laborPerPlt;
    byYearMonth.set(yearMonth, (byYearMonth.get(yearMonth) ?? 0) + savings);
    const manuKey = `${manufacturer}|${yearMonth}`;
    byManufacturerYearMonth.set(manuKey, (byManufacturerYearMonth.get(manuKey) ?? 0) + savings);
  }
  return { byYearMonth, byManufacturerYearMonth };
}

export interface ManufacturerSavingsMonth {
  year: number;
  month: number;
  savingsByManufacturer: Record<string, number>;
}

export interface MonthlySavingsResult {
  monthly: MonthlySavings[]; // 매출조정 시트에 행이 입력된 달만 (절감비율·비용구성은 매출액 필요)
  // 출고내역만으로 계산되는 SKU 기반 절감액 — 매출행 여부와 무관하게 출고 데이터가 있는 모든 달 포함 (실시간)
  manufacturerMonthly: ManufacturerSavingsMonth[];
}

export async function fetchMonthlySavings(): Promise<MonthlySavingsResult> {
  const [rateByKey, revenueRows] = await Promise.all([fetchRateByKey(), fetchRevenueRows()]);
  const { byYearMonth, byManufacturerYearMonth } = await computeSkuSavingsByYearMonth(rateByKey);

  const manufacturers = [...new Set([...rateByKey.keys()].map((k) => k.split("|")[1]))];

  const monthly: MonthlySavings[] = revenueRows.map((r) => {
    const yearMonth = `${r.year}-${r.month}`;
    const savingsTotal = (byYearMonth.get(yearMonth) ?? 0) + r.adjustment;
    const revenueTotal = r.direct + r.milkrun;
    const savingsByManufacturer: Record<string, number> = {};
    for (const m of manufacturers) {
      savingsByManufacturer[m] = byManufacturerYearMonth.get(`${m}|${yearMonth}`) ?? 0;
    }
    return {
      year: r.year,
      month: r.month,
      savingsTotal,
      revenueTotal,
      ratio: revenueTotal ? (savingsTotal / revenueTotal) * 100 : 0,
      directCost: r.direct,
      milkrunCost: r.milkrun,
      savingsByManufacturer,
    };
  });
  monthly.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

  const manufacturerMonthly: ManufacturerSavingsMonth[] = [...byYearMonth.keys()].map((yearMonth) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const savingsByManufacturer: Record<string, number> = {};
    for (const m of manufacturers) {
      savingsByManufacturer[m] = byManufacturerYearMonth.get(`${m}|${yearMonth}`) ?? 0;
    }
    return { year, month, savingsByManufacturer };
  });
  manufacturerMonthly.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

  return { monthly, manufacturerMonthly };
}

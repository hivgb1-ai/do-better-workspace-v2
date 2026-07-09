import { getGoogleSheetsAccessToken } from "./google-sheets";
import { fetchShipmentSource } from "./shipment-source";

const PRICE_TAB = "판매단가 마스터";

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

// 판매단가는 판매처(쿠팡) 기준으로 제조사와 무관하게 ERP코드 하나로 결정된다(사용자 확정 규칙).
async function fetchPriceByErpCode(): Promise<Map<string, number>> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID 환경변수가 없습니다");

  const token = await getGoogleSheetsAccessToken();
  const range = encodeURIComponent(`'${PRICE_TAB}'!A1:D`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`판매단가 마스터 시트 조회 실패 (${res.status}): ${await res.text()}`);

  const json = (await res.json()) as { values?: string[][] };
  const values = json.values ?? [];

  const headerRowIndex = values.findIndex((row) => row.includes("ERP코드"));
  if (headerRowIndex < 0) throw new Error(`${PRICE_TAB}: "ERP코드" 헤더 행을 찾을 수 없습니다`);
  const header = values[headerRowIndex];
  const erpCol = header.indexOf("ERP코드");
  const priceCol = header.indexOf("판매단가");
  if (erpCol < 0 || priceCol < 0) throw new Error(`${PRICE_TAB}: "ERP코드"/"판매단가" 헤더를 찾을 수 없습니다`);

  const priceByErp = new Map<string, number>();
  for (const row of values.slice(headerRowIndex + 1)) {
    const erp = row[erpCol]?.trim();
    if (!erp) continue;
    const price = parsePrice(row[priceCol]);
    if (price !== null) priceByErp.set(erp, price);
  }
  return priceByErp;
}

// 추정 매출액 = PLT수량 × 1PLT당 판매단가. 실제 쿠팡 정산액이 아닌 출고량 기반 추정치.
export async function fetchEstimatedRevenueByMonth(): Promise<Map<number, number>> {
  const [priceByErp, { rows }] = await Promise.all([fetchPriceByErpCode(), fetchShipmentSource()]);

  const revenueByMonth = new Map<number, number>();
  for (const row of rows) {
    if (!row.erpCode || row.erpCode.startsWith("#")) continue;
    const price = priceByErp.get(row.erpCode);
    if (price === undefined) continue; // 판매단가 미등록 — 마스터에 채워지는 대로 반영됨

    const month = row.date.getMonth() + 1;
    const revenue = row.pltQty * price;
    revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + revenue);
  }
  return revenueByMonth;
}

import { cache } from "react";
import { getGoogleSheetsAccessToken } from "./google-sheets";

// 시트가 연도별로 분리된 탭으로 운영된다 (예: "26년 음료 제조사 직납 출고내역").
// 새 연도가 시작되면 이 목록에 탭을 추가한다. 여기 없는 연도는 1년 조회(1y) 등에서 데이터가 비어 보인다.
const SHEET_TABS: { name: string; year: number }[] = [
  { name: "25년 음료 제조사 직납 출고내역", year: 2025 },
  { name: "26년 음료 제조사 직납 출고내역", year: 2026 },
];

export interface ShipmentRow {
  date: Date;
  manufacturer: string;
  erpCode: string;
  productName: string;
  qty: number;
  pltQty: number;
}

export interface ShipmentSource {
  rows: ShipmentRow[];
  excludedRowCount: number;
}

function parseTabRows(values: string[][], year: number): { rows: ShipmentRow[]; excludedRowCount: number } {
  if (values.length === 0) return { rows: [], excludedRowCount: 0 };

  let header = values[0];
  // 25년 탭은 머리글은 26년과 같지만 데이터에 빈 E열·"고객사상품코드" 열이 없다(머리글은 시트 보호로 못 고침).
  // 데이터 F열(인덱스 5)에 ERP 코드가 주로 있으면 그 두 칸을 머리글에서 빼서 데이터와 맞춘다.
  const dataRows = values.slice(1).filter((r) => r[1]?.trim());
  const erpAt5 = dataRows.filter((r) => /^[A-Z]{2,}\d{3,}/.test(r[5]?.trim() ?? "")).length;
  if (header[4] === "" && header[7] === "고객사상품코드" && dataRows.length > 0 && erpAt5 > dataRows.length / 2) {
    header = header.filter((_, i) => i !== 4 && i !== 7);
  }
  const dateCol = header.indexOf("날짜");
  const warehouseCol = header.indexOf("보내는창고");
  const productCol = header.indexOf("상품명");
  const erpCol = header.indexOf("ERP 코드");
  const qtyCol = header.findIndex((c) => c && c.includes("요청") && !c.includes("PLT") && !c.includes("BOX"));
  const pltCol = header.findIndex((c) => c && c.includes("PLT"));

  const rows: ShipmentRow[] = [];
  let excludedRowCount = 0;

  for (const row of values.slice(1)) {
    const dateStr = row[dateCol]?.trim();
    if (!dateStr) continue; // 미입력 템플릿 행 (집계 제외 대상 아님)

    const manufacturer = row[warehouseCol]?.trim();
    const erpCode = row[erpCol]?.trim() ?? "";
    const qtyStr = row[qtyCol]?.trim() ?? "";
    const qtyIsClean = /^[\d,]+$/.test(qtyStr);

    // 사용자 확정 규칙: #REF! 오류 행과 "미출고" 등 숫자가 아닌 요청수량 행은 집계에서 완전히 제외
    if (!manufacturer || erpCode.includes("#REF") || !qtyIsClean) {
      excludedRowCount += 1;
      continue;
    }

    // "4/21"과 "12-31" 두 형식 모두 허용 (25년 탭은 하이픈 형식)
    const [month, day] = dateStr.split(/[/-]/).map(Number);
    if (!month || !day) {
      excludedRowCount += 1;
      continue;
    }

    const pltStr = row[pltCol]?.trim() ?? "";
    const pltIsClean = /^[\d,]+$/.test(pltStr);

    rows.push({
      date: new Date(year, month - 1, day),
      manufacturer,
      erpCode,
      productName: row[productCol]?.trim() ?? "",
      qty: Number(qtyStr.replace(/,/g, "")),
      pltQty: pltIsClean ? Number(pltStr.replace(/,/g, "")) : 0,
    });
  }

  return { rows, excludedRowCount };
}

// savings-source.ts도 같은 요청 안에서 이 함수를 호출하므로, cache()로 중복 API 호출을 막는다.
export const fetchShipmentSource = cache(async (): Promise<ShipmentSource> => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID 환경변수가 없습니다");

  let valueRanges: { values?: string[][] }[];
  let tabs: typeof SHEET_TABS;
  try {
    const token = await getGoogleSheetsAccessToken();
    // 탭 하나가 지워지거나 이름이 바뀌어도 대시보드 전체가 500으로 죽지 않게, 실제 있는 탭만 조회한다.
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!metaRes.ok) throw new Error(`Sheets API 오류 (${metaRes.status}): ${await metaRes.text()}`);
    const meta = (await metaRes.json()) as { sheets?: { properties?: { title?: string } }[] };
    const existing = new Set((meta.sheets ?? []).map((s) => s.properties?.title));
    tabs = SHEET_TABS.filter((t) => existing.has(t.name));
    const missing = SHEET_TABS.filter((t) => !existing.has(t.name)).map((t) => t.name);
    if (missing.length) console.warn(`출고내역 탭 없음(건너뜀): ${missing.join(", ")}`);
    if (!tabs.length) throw new Error(`출고내역 탭을 하나도 찾지 못했습니다: ${SHEET_TABS.map((t) => t.name).join(", ")}`);
    const params = new URLSearchParams();
    for (const tab of tabs) params.append("ranges", `'${tab.name}'!A1:W`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Sheets API 오류 (${res.status}): ${await res.text()}`);
    const json = (await res.json()) as { valueRanges?: { values?: string[][] }[] };
    valueRanges = json.valueRanges ?? [];
  } catch (e) {
    throw new Error(`출고내역 시트 조회 실패: ${e instanceof Error ? e.message : String(e)}`);
  }

  let rows: ShipmentRow[] = [];
  let excludedRowCount = 0;
  tabs.forEach((tab, i) => {
    const parsed = parseTabRows(valueRanges[i]?.values ?? [], tab.year);
    rows = rows.concat(parsed.rows);
    excludedRowCount += parsed.excludedRowCount;
  });

  return { rows, excludedRowCount };
});

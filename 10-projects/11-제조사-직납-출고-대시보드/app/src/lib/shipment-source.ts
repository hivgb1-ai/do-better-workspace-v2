import { cache } from "react";
import { getGoogleSheetsAccessToken } from "./google-sheets";

// 시트가 연도별로 분리된 탭으로 운영된다 (예: "26년 음료 제조사 직납 출고내역").
// "25년 음료 제조사 직납 출고내역"은 더 이상 사용하지 않는 탭 — 새 연도가 시작되면 이 목록에 탭을 추가한다.
const SHEET_TABS: { name: string; year: number }[] = [
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

  const header = values[0];
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

    const [month, day] = dateStr.split("/").map(Number);
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
  try {
    const token = await getGoogleSheetsAccessToken();
    const params = new URLSearchParams();
    for (const tab of SHEET_TABS) params.append("ranges", `'${tab.name}'!A1:W`);
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
  SHEET_TABS.forEach((tab, i) => {
    const parsed = parseTabRows(valueRanges[i]?.values ?? [], tab.year);
    rows = rows.concat(parsed.rows);
    excludedRowCount += parsed.excludedRowCount;
  });

  return { rows, excludedRowCount };
});

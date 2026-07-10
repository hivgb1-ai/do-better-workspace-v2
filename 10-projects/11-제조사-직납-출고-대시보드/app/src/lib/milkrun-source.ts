import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

// 원본 위치: G:\공유 드라이브\HQ_Team_SCM\SCM_공용\★성과측정지표(KPI)\<year>년\물류운영\쿠팡 비용 절감\밀크런&쉽먼트
// 매달 새 파일이 아니라 같은 파일에 월 컬럼이 채워지는 방식 — savings-source.ts와 달리 파일명 고정, 최신본으로 덮어쓰기만 하면 됨.
const SHEET_NAME = "2026년"; // 이 시트 하나에 2025년·2026년 데이터가 나란히 들어있다
const SECTION1_TITLE = "1. 쿠팡 밀크런 비용현황";
const SECTION2_TITLE = "2. 밀크런/쉽먼트 이원화 비용절감";

export interface MilkrunMonthly {
  year: number;
  month: number;
  rocketRevenue: number;
  rocketMilkrunCost: number;
  rocketRatio: number; // %
  freshRevenue: number;
  freshMilkrunCost: number;
  freshRatio: number; // %
  milkrunSavings: number; // 밀크런/쉽먼트 이원화로 절감된 금액(양수)
}

function baseDir() {
  return path.join(process.cwd(), "data", "milkrun-source");
}

function findFile(): string | null {
  const dir = baseDir();
  if (!fs.existsSync(dir)) return null;
  const candidates = fs.readdirSync(dir).filter((n) => n.endsWith(".xlsx") && !n.startsWith("~$"));
  if (candidates.length === 0) return null;
  return path.join(dir, candidates[0]);
}

function parseNum(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parsePercent(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim().replace(/%/g, "");
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function sheetToRows(wb: XLSX.WorkBook): string[][] {
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) throw new Error(`시트를 찾을 수 없습니다: ${SHEET_NAME}`);
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: "" });
}

function findSectionStart(rows: string[][], title: string): number {
  const idx = rows.findIndex((r) => r[0]?.trim() === title);
  if (idx < 0) throw new Error(`${SHEET_NAME}: "${title}" 섹션을 찾을 수 없습니다`);
  return idx;
}

// "구분 | 2025년 | 2026년" 행에서 "YYYY년" 라벨이 있는 컬럼(연도 블록 시작 위치)을 찾는다
function findYearBlocks(row: string[]): { year: number; startCol: number }[] {
  const blocks: { year: number; startCol: number }[] = [];
  row.forEach((cell, idx) => {
    const m = cell?.trim().match(/^(\d{4})년$/);
    if (m) blocks.push({ year: Number(m[1]), startCol: idx });
  });
  return blocks;
}

// 연도 블록 구간 안에서 "N월" 라벨 컬럼을 찾는다
function findMonthColumns(monthRow: string[], startCol: number, endCol: number): Map<number, number> {
  const map = new Map<number, number>();
  for (let c = startCol; c < endCol; c += 1) {
    const m = monthRow[c]?.trim().match(/^(\d{1,2})월$/);
    if (m) map.set(Number(m[1]), c);
  }
  return map;
}

export async function fetchMilkrunMonthly(): Promise<MilkrunMonthly[]> {
  const filePath = findFile();
  if (!filePath) return [];

  const rows = ((): string[][] => {
    try {
      // XLSX.readFile()이 Turbopack 서버 런타임에서 fs를 감지하지 못해 "Cannot access file" 오류를 던짐 —
      // 직접 읽은 버퍼를 XLSX.read()에 넘겨 우회 (savings-source.ts와 동일한 우회)
      const buffer = fs.readFileSync(filePath);
      const wb = XLSX.read(buffer, { type: "buffer" });
      return sheetToRows(wb);
    } catch (e) {
      throw new Error(`밀크런 절감액 엑셀 파싱 실패 (${filePath}): ${e instanceof Error ? e.message : String(e)}`);
    }
  })();

  const section1Start = findSectionStart(rows, SECTION1_TITLE);
  const section2Start = findSectionStart(rows, SECTION2_TITLE);

  const yearRow = rows[section1Start + 2];
  const monthRow = rows[section1Start + 3];
  const yearBlocks = findYearBlocks(yearRow);
  if (yearBlocks.length === 0) throw new Error(`${SHEET_NAME}: 연도 블록("YYYY년")을 찾을 수 없습니다`);

  const rocketRevenueRow = rows[section1Start + 4];
  const rocketMilkrunRow = rows[section1Start + 5];
  const rocketRatioRow = rows[section1Start + 6];
  const freshRevenueRow = rows[section1Start + 7];
  const freshMilkrunRow = rows[section1Start + 8];
  const freshRatioRow = rows[section1Start + 9];
  const savingsRow = rows[section2Start + 18]; // "TTL 절감액" 행 (섹션 시작 기준 상대 위치)
  if (savingsRow[1]?.trim() !== "절감액") {
    throw new Error(`${SHEET_NAME}: TTL 절감액 행 위치가 예상과 다릅니다 (구조 변경 확인 필요)`);
  }

  const result: MilkrunMonthly[] = [];
  yearBlocks.forEach(({ year, startCol }, i) => {
    const endCol = i + 1 < yearBlocks.length ? yearBlocks[i + 1].startCol : monthRow.length;
    const monthCols = findMonthColumns(monthRow, startCol, endCol);
    for (const [month, col] of monthCols) {
      const rocketRevenue = parseNum(rocketRevenueRow[col]);
      const freshRevenue = parseNum(freshRevenueRow[col]);
      if (rocketRevenue === null && freshRevenue === null) continue; // 아직 데이터가 채워지지 않은 미래 월

      result.push({
        year,
        month,
        rocketRevenue: rocketRevenue ?? 0,
        rocketMilkrunCost: parseNum(rocketMilkrunRow[col]) ?? 0,
        rocketRatio: parsePercent(rocketRatioRow[col]) ?? 0,
        freshRevenue: freshRevenue ?? 0,
        freshMilkrunCost: parseNum(freshMilkrunRow[col]) ?? 0,
        freshRatio: parsePercent(freshRatioRow[col]) ?? 0,
        milkrunSavings: Math.abs(parseNum(savingsRow[col]) ?? 0),
      });
    }
  });

  result.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));
  return result;
}

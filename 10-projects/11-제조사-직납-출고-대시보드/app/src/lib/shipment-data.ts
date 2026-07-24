import { fetchShipmentSource } from "./shipment-source";
import { orderManufacturers, assignManufacturerColors } from "./manufacturer-color";
import type { ResolvedPeriod } from "./period";

export interface MoverItem {
  name: string;
  manufacturer: string;
  prevShare: number;
  currShare: number;
}

export interface CrossRow {
  item: string;
  manufacturer: string;
  qty: number;
}

export interface ShipmentDashboardData {
  manufacturers: string[];
  months: string[];
  shipmentByMonth: Record<string, number[]>;
  totalShipmentThisMonth: number;
  totalShipmentLastMonth: number;
  shipmentMoM: number;
  topMovers: MoverItem[];
  crossTable: CrossRow[];
  excludedRowCount: number;
  manufacturerColor: Record<string, string>;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyResult(excludedRowCount: number): ShipmentDashboardData {
  return {
    manufacturers: [],
    months: [],
    shipmentByMonth: {},
    totalShipmentThisMonth: 0,
    totalShipmentLastMonth: 0,
    shipmentMoM: 0,
    topMovers: [],
    crossTable: [],
    excludedRowCount,
    manufacturerColor: {},
  };
}

function aggregateByItem(rows: Awaited<ReturnType<typeof fetchShipmentSource>>["rows"], keys: string[]) {
  const keySet = new Set(keys);
  const map = new Map<string, { manufacturer: string; name: string; qty: number }>();
  for (const r of rows) {
    if (!keySet.has(monthKey(r.date))) continue;
    // ERP 코드가 "#N/A" 등 수식 오류값이면(모두 "#"로 시작) 서로 다른 상품이 같은 코드로 묶이므로 상품명으로 대체
    const id = r.erpCode && !r.erpCode.startsWith("#") ? r.erpCode : r.productName;
    const existing = map.get(id);
    if (existing) {
      existing.qty += r.qty;
    } else {
      map.set(id, { manufacturer: r.manufacturer, name: r.productName || id, qty: r.qty });
    }
  }
  return map;
}

export async function fetchShipmentDashboardData(period: ResolvedPeriod): Promise<ShipmentDashboardData> {
  const { rows, excludedRowCount } = await fetchShipmentSource();
  if (rows.length === 0) return emptyResult(excludedRowCount);

  const latestDate = rows.reduce((max, r) => (r.date > max ? r.date : max), rows[0].date);
  const currentMonthStart =
    period.endYear && period.endMonth
      ? new Date(period.endYear, period.endMonth - 1, 1)
      : new Date(latestDate.getFullYear(), latestDate.getMonth() - period.offsetMonths, 1);

  const monthsWindow = period.months;
  const monthStarts = Array.from(
    { length: monthsWindow },
    (_, i) => new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - (monthsWindow - 1 - i), 1)
  );
  const months = monthStarts.map((d) => `${d.getMonth() + 1}월`);
  const monthKeys = monthStarts.map(monthKey);

  const manufacturers = orderManufacturers(rows.map((r) => r.manufacturer));
  const manufacturerColor = assignManufacturerColors(manufacturers);

  const shipmentByMonth: Record<string, number[]> = {};
  manufacturers.forEach((m) => {
    shipmentByMonth[m] = monthKeys.map((key) =>
      rows.filter((r) => r.manufacturer === m && monthKey(r.date) === key).reduce((sum, r) => sum + r.qty, 0)
    );
  });

  const lastIdx = monthKeys.length - 1;
  const totalShipmentThisMonth = manufacturers.reduce((sum, m) => sum + shipmentByMonth[m][lastIdx], 0);
  const totalShipmentLastMonth = manufacturers.reduce((sum, m) => sum + shipmentByMonth[m][lastIdx - 1], 0);
  const shipmentMoM =
    totalShipmentLastMonth === 0 ? 0 : (totalShipmentThisMonth - totalShipmentLastMonth) / totalShipmentLastMonth;

  // 급등·급감 TOP은 "전월 대비"이므로 항상 단일 최신월 vs 단일 직전월로 비교한다.
  const currentItems = aggregateByItem(rows, [monthKeys[lastIdx]]);
  const prevItems = aggregateByItem(rows, [monthKeys[lastIdx - 1]]);
  const currentTotal = [...currentItems.values()].reduce((s, v) => s + v.qty, 0) || 1;
  const prevTotal = [...prevItems.values()].reduce((s, v) => s + v.qty, 0) || 1;

  const allIds = new Set([...currentItems.keys(), ...prevItems.keys()]);
  const topMovers: MoverItem[] = [...allIds]
    .map((id) => {
      const curr = currentItems.get(id);
      const prev = prevItems.get(id);
      const currShare = curr ? (curr.qty / currentTotal) * 100 : 0;
      const prevShare = prev ? (prev.qty / prevTotal) * 100 : 0;
      const source = curr ?? prev!;
      return { name: source.name, manufacturer: source.manufacturer, prevShare, currShare };
    })
    .sort((a, b) => Math.abs(b.currShare - b.prevShare) - Math.abs(a.currShare - a.prevShare))
    .slice(0, 4);

  // 품목 × 제조사 표는 선택한 기간(헤드라인 개월 수) 전체를 집계한다 — 3개월/6개월 선택 시 그 기간만큼 합산.
  const headlineMonths = Math.min(period.headlineMonths, monthKeys.length);
  const periodMonthKeys = monthKeys.slice(-headlineMonths);
  const periodItems = aggregateByItem(rows, periodMonthKeys);

  const crossTable: CrossRow[] = [...periodItems.values()]
    .map((v) => ({ item: v.name, manufacturer: v.manufacturer, qty: v.qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  return {
    manufacturers,
    months,
    shipmentByMonth,
    totalShipmentThisMonth,
    totalShipmentLastMonth,
    shipmentMoM,
    topMovers,
    crossTable,
    excludedRowCount,
    manufacturerColor,
  };
}

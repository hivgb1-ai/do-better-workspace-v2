import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TABLE_LABEL_COL_WIDTH } from "@/lib/chart-layout";

export interface MonthlyDataRow {
  label: string;
  values: number[];
  unit?: "won" | "percent";
}

interface MonthlyDataTableProps {
  months: string[];
  rows: MonthlyDataRow[];
}

function formatValue(v: number, unit: MonthlyDataRow["unit"]) {
  if (unit === "percent") return `${v.toFixed(2)}%`;
  return Math.round(v).toLocaleString();
}

export function MonthlyDataTable({ months, rows }: MonthlyDataTableProps) {
  return (
    // table-layout: fixed + colgroup로 월 컬럼을 모두 같은 폭으로 강제 — 안 그러면 값의 자릿수(예: "795,520" vs
    // "1,375,506,374")에 따라 컬럼 폭이 제각각이라 위 차트의 막대 위치와 어긋나 보인다(달 수가 많을수록 더 심해짐).
    // 첫 컬럼("구분") 폭은 차트의 Y축 폭(TABLE_LABEL_COL_WIDTH)과 똑같이 고정 — 그래야 표의 월 컬럼이
    // 차트의 플롯 영역과 같은 x좌표에서 시작해서, 달마다 표 값이 그 위 막대와 나란히 놓인다.
    <Table style={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: TABLE_LABEL_COL_WIDTH }} />
        {months.map((m) => (
          <col key={m} />
        ))}
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>구분</TableHead>
          {months.map((m) => (
            <TableHead key={m} className="overflow-hidden text-right text-ellipsis">
              {m}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="overflow-hidden text-ellipsis text-muted-foreground">{row.label}</TableCell>
            {row.values.map((v, i) => (
              <TableCell key={i} className="overflow-hidden text-right text-ellipsis tabular-nums">
                {formatValue(v, row.unit)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

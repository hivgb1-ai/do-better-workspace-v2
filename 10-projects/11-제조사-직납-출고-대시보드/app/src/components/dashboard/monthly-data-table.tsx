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
  // 위 차트에 오른쪽 보조 축(물류비율 등 %)이 있어서 플롯 영역이 그만큼 좁을 때, 표에도 똑같은 폭의
  // 빈 여백 컬럼을 붙여 월 컬럼들의 x좌표를 차트와 맞춘다. TABLE_RIGHT_GUTTER를 넘긴다.
  rightGutter?: number;
}

// 원 단위 그대로면 자릿수가 많아 읽기 부담스러워 천원 단위로 줄여 표시한다(퍼센트는 그대로).
function formatValue(v: number, unit: MonthlyDataRow["unit"]) {
  if (unit === "percent") return `${v.toFixed(2)}%`;
  return Math.round(v / 1000).toLocaleString();
}

export function MonthlyDataTable({ months, rows, rightGutter }: MonthlyDataTableProps) {
  const hasWon = rows.some((r) => r.unit !== "percent");
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
        {rightGutter ? <col style={{ width: rightGutter }} /> : null}
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead>{hasWon ? "구분 (천원)" : "구분"}</TableHead>
          {months.map((m) => (
            <TableHead key={m} className="overflow-hidden text-center text-ellipsis">
              {m}
            </TableHead>
          ))}
          {rightGutter ? <TableHead aria-hidden /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="overflow-hidden text-ellipsis text-muted-foreground">{row.label}</TableCell>
            {row.values.map((v, i) => (
              <TableCell key={i} className="overflow-hidden text-center text-ellipsis tabular-nums">
                {formatValue(v, row.unit)}
              </TableCell>
            ))}
            {rightGutter ? <TableCell aria-hidden /> : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>구분</TableHead>
          {months.map((m) => (
            <TableHead key={m} className="text-right">
              {m}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="text-muted-foreground">{row.label}</TableCell>
            {row.values.map((v, i) => (
              <TableCell key={i} className="text-right tabular-nums">
                {formatValue(v, row.unit)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

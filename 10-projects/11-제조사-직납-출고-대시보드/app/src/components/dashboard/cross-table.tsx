import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CrossRow } from "@/lib/shipment-data";

export function CrossTable({ rows }: { rows: CrossRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>품목</TableHead>
          <TableHead>제조사</TableHead>
          <TableHead className="text-right">수량(EA)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.item}-${row.manufacturer}`}>
            <TableCell>{row.item}</TableCell>
            <TableCell className="text-muted-foreground">{row.manufacturer}</TableCell>
            <TableCell className="text-right tabular-nums">{row.qty.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
